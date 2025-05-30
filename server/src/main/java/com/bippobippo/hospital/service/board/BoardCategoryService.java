package com.bippobippo.hospital.service.board;

import com.bippobippo.hospital.dto.request.Board.BoardCategoryRequest;
import com.bippobippo.hospital.dto.response.Board.BoardCategoryResponse;
import com.bippobippo.hospital.entity.board.BoardCategory;
import com.bippobippo.hospital.entity.board.BoardCategoryType;
import com.bippobippo.hospital.repository.board.BoardCategoryRepository;
import com.bippobippo.hospital.repository.board.BoardCategoryTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardCategoryService {
    private final BoardCategoryRepository categoryRepository;
    private final BoardCategoryTypeRepository categoryTypeRepository;

    @Transactional(readOnly = true)
    public List<BoardCategoryResponse> getCategories(Integer parent_id, Integer type_id) {
        List<BoardCategory> categories;
        if (parent_id != null) {
            categories = categoryRepository.findCategoriesWithChildrenByParentId(parent_id);
        } else if (type_id != null) {
            categories = categoryRepository.findCategoriesWithChildrenByTypeId(type_id);
        } else {
            categories = categoryRepository.findRootCategoriesWithChildren();
        }
        return categories.stream()
            .map(BoardCategoryResponse::from)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BoardCategoryResponse getCategory(Integer id) {
        BoardCategory category = categoryRepository.findActiveById(id);
        if (category == null) {
            throw new RuntimeException("카테고리를 찾을 수 없습니다.");
        }
        return BoardCategoryResponse.from(category);
    }

    @Transactional
    public BoardCategory createCategory(BoardCategoryRequest request) {
        BoardCategoryType categoryType = categoryTypeRepository.findById(request.getTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Category type not found"));

        BoardCategory parent = null;
        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent category not found"));
        }

        BoardCategory category = new BoardCategory();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setCategoryType(categoryType);
        category.setParent(parent);
        category.setOrderSequence(request.getOrderSequence());
        category.setAllowComments(request.getAllowComments());
        category.setIsSecretDefault(request.getIsSecretDefault());
        category.setIsActive(request.getIsActive());
        category.setConfig(request.getConfig());

        return categoryRepository.save(category);
    }

    @Transactional
    public void updateCategory(Integer id, BoardCategoryRequest request) {
        BoardCategory category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        if (request.getParentId() != null) {
            BoardCategory parent = categoryRepository.findById(request.getParentId())
                .orElseThrow(() -> new RuntimeException("부모 카테고리를 찾을 수 없습니다."));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }
        category.setOrderSequence(request.getOrderSequence());
        category.setAllowComments(request.getAllowComments());
        category.setIsSecretDefault(request.getIsSecretDefault());
        category.setIsActive(request.getIsActive());
        category.setConfig(request.getConfig());
    }

    @Transactional
    public void deleteCategory(Integer id) {
        BoardCategory category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));

        if (!category.getChildren().isEmpty()) {
            throw new RuntimeException("하위 카테고리가 있는 카테고리는 삭제할 수 없습니다.");
        }

        categoryRepository.delete(category);
    }

    @Transactional
    public void moveCategoryUp(Integer id) {
        BoardCategory category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));

        List<BoardCategory> siblings = categoryRepository.findByParentIdOrderByOrderSequence(
            category.getParent() != null ? category.getParent().getId() : null);
        int currentIndex = siblings.indexOf(category);

        if (currentIndex > 0) {
            BoardCategory prevCategory = siblings.get(currentIndex - 1);
            int tempOrder = category.getOrderSequence();
            category.setOrderSequence(prevCategory.getOrderSequence());
            prevCategory.setOrderSequence(tempOrder);
        }
    }

    @Transactional
    public void moveCategoryDown(Integer id) {
        BoardCategory category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));

        List<BoardCategory> siblings = categoryRepository.findByParentIdOrderByOrderSequence(
            category.getParent() != null ? category.getParent().getId() : null);
        int currentIndex = siblings.indexOf(category);

        if (currentIndex < siblings.size() - 1) {
            BoardCategory nextCategory = siblings.get(currentIndex + 1);
            int tempOrder = category.getOrderSequence();
            category.setOrderSequence(nextCategory.getOrderSequence());
            nextCategory.setOrderSequence(tempOrder);
        }
    }

    @Transactional(readOnly = true)
    public List<BoardCategoryResponse> getCategoriesByTypeName(String typeName) {
        Optional<BoardCategoryType> categoryType = categoryTypeRepository.findByTypeName(typeName);
        if (categoryType.isPresent()) {
            List<BoardCategory> categories = categoryRepository.findByCategoryTypeIdOrderByOrderSequence(categoryType.get().getId());
            return categories.stream()
                .map(BoardCategoryResponse::from)
                .collect(Collectors.toList());
        }
        return List.of();
    }
} 