package com.bippobippo.hospital.service.board;

import com.bippobippo.hospital.dto.request.board.BoardCategoryRequest;
import com.bippobippo.hospital.dto.response.board.BoardCategoryResponse;
import com.bippobippo.hospital.entity.board.BoardCategory;
import com.bippobippo.hospital.entity.board.BoardCategoryType;
import com.bippobippo.hospital.repository.board.BoardCategoryRepository;
import com.bippobippo.hospital.repository.board.BoardCategoryTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
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
        log.info("카테고리 생성 시작 - 요청 데이터: {}", request);
        try {
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
            category.setAllowComments(request.isAllowComments());
            category.setIsSecretDefault(request.isSecretDefault());
            category.setIsActive(request.isActive());
            category.setConfig(request.getConfig());
            
            String path = generatePath(category);
            category.setPath(path);
            log.info("생성된 카테고리 path: {}", path);

            BoardCategory savedCategory = categoryRepository.save(category);
            log.info("카테고리 생성 완료 - ID: {}", savedCategory.getId());
            return savedCategory;
        } catch (Exception e) {
            log.error("카테고리 생성 실패: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public BoardCategory updateCategory(Integer id, BoardCategoryRequest request) {
        BoardCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + id));

        // 카테고리 타입 업데이트
        if (request.getTypeId() != null) {
            BoardCategoryType type = categoryTypeRepository.findById(request.getTypeId())
                    .orElseThrow(() -> new RuntimeException("카테고리 타입을 찾을 수 없습니다: " + request.getTypeId()));
            category.setCategoryType(type);
        }

        // 부모 카테고리 업데이트
        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new IllegalArgumentException("자기 자신을 부모 카테고리로 지정할 수 없습니다.");
            }
            BoardCategory parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("부모 카테고리를 찾을 수 없습니다: " + request.getParentId()));
            
            if (isCircularReference(id, parent.getId())) {
                throw new IllegalArgumentException("순환 참조가 발생할 수 없습니다.");
            }
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        // 기본 정보 업데이트
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setOrderSequence(request.getOrderSequence());
        category.setAllowComments(request.isAllowComments());
        category.setIsSecretDefault(request.isSecretDefault());
        category.setIsActive(request.isActive());
        category.setConfig(request.getConfig());

        // path 업데이트
        category.setPath(generatePath(category));

        // children 컬렉션 초기화
        category.getChildren().size();

        return categoryRepository.save(category);
    }

    private String generatePath(BoardCategory category) {
        StringBuilder path = new StringBuilder();
        path.append(category.getName());
        
        BoardCategory parent = category.getParent();
        while (parent != null) {
            path.insert(0, parent.getName() + "/");
            parent = parent.getParent();
        }
        
        return path.toString();
    }

    private boolean isCircularReference(Integer categoryId, Integer parentId) {
        BoardCategory current = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + categoryId));
        while (current != null) {
            if (current.getId().equals(parentId)) {
                return true;
            }
            current = current.getParent();
        }
        return false;
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