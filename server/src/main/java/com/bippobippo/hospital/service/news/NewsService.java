package com.bippobippo.hospital.service.news;

import org.springframework.data.domain.Page;

import com.bippobippo.hospital.dto.request.news.NewsRequest;
import com.bippobippo.hospital.dto.response.news.NewsResponse;

public interface NewsService {
    Page<NewsResponse> getNews(int page, int size, Long categoryId);
    NewsResponse getNewsById(Long id);
    NewsResponse createNews(NewsRequest request);
    NewsResponse updateNews(Long id, NewsRequest request);
    void deleteNews(Long id);
} 