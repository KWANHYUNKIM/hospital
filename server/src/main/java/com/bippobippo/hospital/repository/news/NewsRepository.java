package com.bippobippo.hospital.repository.news;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.bippobippo.hospital.entity.news.News;

public interface NewsRepository extends JpaRepository<News, Long> {
    Page<News> findByCategoryId(Long categoryId, Pageable pageable);

    // 관련 뉴스(같은 카테고리, 본인 제외, 최신순 n개)
    java.util.List<News> findByCategoryIdAndIdNotOrderByCreatedAtDesc(Long categoryId, Long excludeId, Pageable pageable);
} 