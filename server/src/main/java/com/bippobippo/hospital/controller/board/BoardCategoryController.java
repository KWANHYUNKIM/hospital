package com.bippobippo.hospital.controller.board;

import com.bippobippo.hospital.dto.request.board.BoardCategoryRequest;
import com.bippobippo.hospital.dto.response.board.BoardCategoryResponse;
import com.bippobippo.hospital.entity.board.BoardCategory;
import com.bippobippo.hospital.service.board.BoardCategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/boards/categories")
@RequiredArgsConstructor
public class BoardCategoryController {
    private final BoardCategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<BoardCategoryResponse>> getCategories(
            @RequestParam(required = false) Integer parent_id,
            @RequestParam(required = false) Integer type_id) {
        return ResponseEntity.ok(categoryService.getCategories(parent_id, type_id));
    }

    @GetMapping("/type/{typeName}")
    public ResponseEntity<List<BoardCategoryResponse>> getCategoriesByTypeName(
            @PathVariable String typeName) {
        return ResponseEntity.ok(categoryService.getCategoriesByTypeName(typeName));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoardCategoryResponse> getCategory(@PathVariable Integer id) {
        return ResponseEntity.ok(categoryService.getCategory(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BoardCategoryResponse> createCategory(@RequestBody BoardCategoryRequest request) {
        log.info("카테고리 생성 요청 - 데이터: {}", request);
        try {
            BoardCategory category = categoryService.createCategory(request);
            log.info("카테고리 생성 성공 - ID: {}", category.getId());
            return ResponseEntity.ok(BoardCategoryResponse.from(category));
        } catch (Exception e) {
            log.error("카테고리 생성 실패: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BoardCategoryResponse> updateCategory(
            @PathVariable Integer id,
            @RequestBody BoardCategoryRequest request) {
        log.info("카테고리 수정 요청 - ID: {}, 데이터: {}", id, request);
        try {
            BoardCategory category = categoryService.updateCategory(id, request);
            log.info("카테고리 수정 성공 - ID: {}", id);
            return ResponseEntity.ok(BoardCategoryResponse.from(category));
        } catch (Exception e) {
            log.error("카테고리 수정 실패 - ID: {}, 오류: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Integer id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/move-up")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> moveCategoryUp(@PathVariable Integer id) {
        categoryService.moveCategoryUp(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/move-down")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> moveCategoryDown(@PathVariable Integer id) {
        categoryService.moveCategoryDown(id);
        return ResponseEntity.ok().build();
    }
} 