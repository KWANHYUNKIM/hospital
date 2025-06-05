package com.bippobippo.hospital.repository.news;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bippobippo.hospital.entity.news.NewsCategory;

public interface NewsCategoryRepository extends JpaRepository<NewsCategory, Long> {
} 