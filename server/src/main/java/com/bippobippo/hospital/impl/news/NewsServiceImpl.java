package com.bippobippo.hospital.impl.news;

import com.bippobippo.hospital.dto.request.news.NewsRequest;
import com.bippobippo.hospital.dto.response.news.NewsResponse;
import com.bippobippo.hospital.entity.news.News;
import com.bippobippo.hospital.entity.news.NewsCategory;
import com.bippobippo.hospital.entity.news.NewsImage;
import com.bippobippo.hospital.repository.news.NewsRepository;
import com.bippobippo.hospital.repository.news.NewsCategoryRepository;
import com.bippobippo.hospital.service.news.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.stream.Collectors;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class NewsServiceImpl implements NewsService {

    private final NewsRepository newsRepository;
    private final NewsCategoryRepository newsCategoryRepository;
    private static final Logger log = LoggerFactory.getLogger(NewsServiceImpl.class);

    @Override
    @Transactional(readOnly = true)
    public Page<NewsResponse> getNews(int page, int limit, Long categoryId, String status) {
        PageRequest pageRequest = PageRequest.of(page, limit);
        Page<News> newsPage;
        
        if (categoryId != null) {
            newsPage = newsRepository.findByCategoryIdAndStatus(categoryId, status, pageRequest);
        } else {
            newsPage = newsRepository.findByStatus(status, pageRequest);
        }

        // 카테고리 정보를 미리 로딩
        newsPage.getContent().forEach(news -> {
            news.getCategory().getName();
        });

        return newsPage.map(this::convertToResponse);
    }

    @Override
    @Transactional
    public NewsResponse getNewsById(Long id) {
        log.info("뉴스 상세 조회 요청 - ID: {}", id);
        
        News news = newsRepository.findByIdWithImages(id)
                .orElseThrow(() -> {
                    log.error("뉴스를 찾을 수 없음 - ID: {}", id);
                    return new RuntimeException("뉴스를 찾을 수 없습니다.");
                });
        
        log.info("조회된 뉴스 데이터: {}", news);
        
        try {
            // 조회수 증가 (null 체크 추가)
            Integer currentViewCount = news.getViewCount();
            news.setViewCount(currentViewCount == null ? 1 : currentViewCount + 1);
            
            // 카테고리 정보 로딩
            news.getCategory().getName();
            
            NewsResponse response = convertToResponse(news);
            log.info("변환된 응답 데이터: {}", response);
            return response;
        } catch (Exception e) {
            log.error("뉴스 상세 조회 중 오류 발생 - ID: {}, 오류: {}", id, e.getMessage(), e);
            throw new RuntimeException("뉴스 상세 조회 중 오류가 발생했습니다.");
        }
    }

    @Override
    @Transactional
    public NewsResponse createNews(NewsRequest request) {
        log.info("뉴스 생성 요청 데이터: {}", request);
        log.info("대표 이미지 URL (원본): {}", request.getRepresentativeImageUrl());
        
        NewsCategory category = newsCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));

        String representativeImageUrl = request.getRepresentativeImageUrl() != null && !request.getRepresentativeImageUrl().isEmpty() ? 
            request.getRepresentativeImageUrl() : null;
        log.info("대표 이미지 URL (처리 후): {}", representativeImageUrl);

        News news = News.builder()
                .title(request.getTitle())
                .summary(request.getSummary())
                .content(request.getContent())
                .category(category)
                .representativeImageUrl(representativeImageUrl)
                .authorId(request.getAuthorId())
                .status("ACTIVE")
                .build();

        log.info("생성된 뉴스 엔티티: {}", news);

        // 추가 이미지 처리
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            for (String imageUrl : request.getImages()) {
                NewsImage newsImage = new NewsImage();
                newsImage.setImageUrl(imageUrl);
                news.addImage(newsImage);
            }
        }

        news = newsRepository.save(news);
        return convertToResponse(news);
    }

    @Override
    @Transactional
    public NewsResponse updateNews(Long id, NewsRequest request) {
        log.info("뉴스 수정 요청 데이터: {}", request);
        
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("뉴스를 찾을 수 없습니다."));

        NewsCategory category = newsCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));

        news.update(
                request.getTitle(),
                request.getSummary(),
                request.getContent(),
                request.getRepresentativeImageUrl() != null && !request.getRepresentativeImageUrl().isEmpty() ? 
                    request.getRepresentativeImageUrl() : null,
                category
        );

        log.info("수정된 뉴스 엔티티: {}", news);

        if (request.getAuthorId() != null) {
            news.setAuthorId(request.getAuthorId());
        }

        // 기존 이미지 삭제
        news.getImages().clear();

        // 새로운 이미지 추가
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            for (String imageUrl : request.getImages()) {
                NewsImage newsImage = new NewsImage();
                newsImage.setImageUrl(imageUrl);
                news.addImage(newsImage);
            }
        }

        news = newsRepository.save(news);
        return convertToResponse(news);
    }

    @Override
    @Transactional
    public NewsResponse updateNewsStatus(Long id, String status) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("News not found"));
        news.updateStatus(status);
        return convertToResponse(newsRepository.save(news));
    }

    @Override
    @Transactional
    public void deleteNews(Long id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("News not found"));
        news.updateStatus("INACTIVE");
        newsRepository.save(news);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NewsResponse> getRelatedNews(Long categoryId, Long excludeId, int limit) {
        if (categoryId == null || excludeId == null) {
            return List.of();
        }
        List<News> newsList = newsRepository.findByCategoryIdAndIdNotAndStatusOrderByCreatedAtDesc(
            categoryId, excludeId, "ACTIVE", PageRequest.of(0, limit)
        );
        
        // 카테고리 정보를 미리 로딩
        newsList.forEach(news -> {
            news.getCategory().getName();
        });

        return newsList.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    private NewsResponse convertToResponse(News news) {
        log.info("뉴스 응답 변환 시작 - ID: {}", news.getId());
        log.info("원본 대표 이미지 URL: {}", news.getRepresentativeImageUrl());
        
        String representativeImageUrl = news.getRepresentativeImageUrl();
        if (representativeImageUrl != null && representativeImageUrl.isEmpty()) {
            representativeImageUrl = null;
        }
        
        NewsResponse response = NewsResponse.builder()
                .id(news.getId())
                .title(news.getTitle())
                .summary(news.getSummary())
                .content(news.getContent())
                .categoryId(news.getCategory().getId())
                .categoryName(news.getCategory().getName())
                .representativeImageUrl(representativeImageUrl)
                .images(news.getImages().stream()
                        .map(NewsImage::getImageUrl)
                        .collect(Collectors.toList()))
                .authorId(news.getAuthorId())
                .createdAt(news.getCreatedAt())
                .updatedAt(news.getUpdatedAt())
                .viewCount(news.getViewCount() != null ? news.getViewCount() : 0)
                .build();
                
        log.info("변환된 응답 데이터: {}", response);
        return response;
    }
} 