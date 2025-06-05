package com.bippobippo.hospital.impl.news;

import com.bippobippo.hospital.dto.request.news.NewsRequest;
import com.bippobippo.hospital.dto.response.news.NewsResponse;
import com.bippobippo.hospital.entity.news.News;
import com.bippobippo.hospital.entity.news.NewsCategory;
import com.bippobippo.hospital.repository.news.NewsRepository;
import com.bippobippo.hospital.repository.news.NewsCategoryRepository;
import com.bippobippo.hospital.service.news.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NewsServiceImpl implements NewsService {

    private final NewsRepository newsRepository;
    private final NewsCategoryRepository newsCategoryRepository;

    @Override
    public Page<NewsResponse> getNews(int page, int size, Long categoryId) {
        PageRequest pageRequest = PageRequest.of(page, size);
        if (categoryId != null) {
            return newsRepository.findByCategoryId(categoryId, pageRequest)
                    .map(this::convertToResponse);
        }
        return newsRepository.findAll(pageRequest)
                .map(this::convertToResponse);
    }

    @Override
    @Transactional
    public NewsResponse getNewsById(Long id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("News not found"));
        news.setViewCount(news.getViewCount() + 1);
        return convertToResponse(news);
    }

    @Override
    @Transactional
    public NewsResponse createNews(NewsRequest request) {
        NewsCategory category = newsCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        News news = new News();
        news.setTitle(request.getTitle());
        news.setSummary(request.getSummary());
        news.setContent(request.getContent());
        news.setCategory(category);

        return convertToResponse(newsRepository.save(news));
    }

    @Override
    @Transactional
    public NewsResponse updateNews(Long id, NewsRequest request) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("News not found"));
        NewsCategory category = newsCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        news.setTitle(request.getTitle());
        news.setSummary(request.getSummary());
        news.setContent(request.getContent());
        news.setCategory(category);

        return convertToResponse(newsRepository.save(news));
    }

    @Override
    @Transactional
    public void deleteNews(Long id) {
        newsRepository.deleteById(id);
    }

    private NewsResponse convertToResponse(News news) {
        NewsResponse response = new NewsResponse();
        response.setId(news.getId());
        response.setTitle(news.getTitle());
        response.setSummary(news.getSummary());
        response.setContent(news.getContent());
        response.setCategoryId(news.getCategory().getId());
        response.setCategoryName(news.getCategory().getName());
        response.setViewCount(news.getViewCount());
        response.setCreatedAt(news.getCreatedAt());
        response.setUpdatedAt(news.getUpdatedAt());
        return response;
    }
} 