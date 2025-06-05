package com.bippobippo.hospital.impl.news;

import com.bippobippo.hospital.dto.request.news.NewsCategoryRequest;
import com.bippobippo.hospital.dto.response.news.NewsCategoryResponse;
import com.bippobippo.hospital.entity.news.NewsCategory;
import com.bippobippo.hospital.repository.news.NewsCategoryRepository;
import com.bippobippo.hospital.service.news.NewsCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NewsCategoryServiceImpl implements NewsCategoryService {

    private final NewsCategoryRepository newsCategoryRepository;

    @Override
    public List<NewsCategoryResponse> getAllCategories() {
        return newsCategoryRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public NewsCategoryResponse createCategory(NewsCategoryRequest request) {
        NewsCategory category = new NewsCategory();
        category.setName(request.getName());
        return convertToResponse(newsCategoryRepository.save(category));
    }

    @Override
    @Transactional
    public NewsCategoryResponse updateCategory(Long id, NewsCategoryRequest request) {
        NewsCategory category = newsCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(request.getName());
        return convertToResponse(newsCategoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        newsCategoryRepository.deleteById(id);
    }

    private NewsCategoryResponse convertToResponse(NewsCategory category) {
        NewsCategoryResponse response = new NewsCategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        return response;
    }
} 