package com.bippobippo.hospital.controller.board;

import com.bippobippo.hospital.dto.request.board.BoardCategoryRequest;
import com.bippobippo.hospital.dto.response.board.BoardCategoryResponse;
import com.bippobippo.hospital.entity.board.BoardCategory;
import com.bippobippo.hospital.service.board.BoardCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<BoardCategory> createCategory(@RequestBody BoardCategoryRequest request) {
        return ResponseEntity.ok(categoryService.createCategory(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateCategory(
            @PathVariable Integer id,
            @RequestBody BoardCategoryRequest request) {
        categoryService.updateCategory(id, request);
        return ResponseEntity.ok().build();
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