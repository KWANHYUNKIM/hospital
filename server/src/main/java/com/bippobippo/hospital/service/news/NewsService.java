package com.bippobippo.hospital.service.news;

import org.springframework.data.domain.Page;
import java.util.List;

import com.bippobippo.hospital.dto.request.news.NewsRequest;
import com.bippobippo.hospital.dto.response.news.NewsResponse;

public interface NewsService {
    Page<NewsResponse> getNews(int page, int limit, Long categoryId, String status);
    NewsResponse getNewsById(Long id);
    NewsResponse createNews(NewsRequest request);
    NewsResponse updateNews(Long id, NewsRequest request);
    NewsResponse updateNewsStatus(Long id, String status);
    void deleteNews(Long id);

    // 관련 뉴스 조회
    List<NewsResponse> getRelatedNews(Long categoryId, Long excludeId, int limit);
} 