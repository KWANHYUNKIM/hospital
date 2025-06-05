package com.bippobippo.hospital.service.news;

import java.util.List;

import com.bippobippo.hospital.dto.request.news.NewsCategoryRequest;
import com.bippobippo.hospital.dto.response.news.NewsCategoryResponse;

public interface NewsCategoryService {
    List<NewsCategoryResponse> getAllCategories();
    NewsCategoryResponse createCategory(NewsCategoryRequest request);
    NewsCategoryResponse updateCategory(Long id, NewsCategoryRequest request);
    void deleteCategory(Long id);
} 