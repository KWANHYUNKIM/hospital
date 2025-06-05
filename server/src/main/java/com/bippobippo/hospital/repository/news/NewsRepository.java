package com.bippobippo.hospital.repository.news;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.bippobippo.hospital.entity.news.News;

public interface NewsRepository extends JpaRepository<News, Long> {
    Page<News> findByCategoryId(Long categoryId, Pageable pageable);
} 