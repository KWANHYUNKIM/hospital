package com.bippobippo.hospital.repository.news;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bippobippo.hospital.entity.news.News;
import java.util.Optional;

public interface NewsRepository extends JpaRepository<News, Long> {
    Page<News> findByCategoryId(Long categoryId, Pageable pageable);
    Page<News> findByCategoryIdAndStatus(Long categoryId, String status, Pageable pageable);
    Page<News> findByStatus(String status, Pageable pageable);

    // 관련 뉴스(같은 카테고리, 본인 제외, 최신순 n개)
    java.util.List<News> findByCategoryIdAndIdNotAndStatusOrderByCreatedAtDesc(Long categoryId, Long excludeId, String status, Pageable pageable);

    Page<News> findByCategoryIdAndIdNotAndStatus(Long categoryId, Long excludeId, String status, Pageable pageable);

    @Query("SELECT n FROM News n LEFT JOIN FETCH n.images WHERE n.id = :id")
    Optional<News> findByIdWithImages(@Param("id") Long id);
} 