package com.bippobippo.hospital.controller.board;

import com.bippobippo.hospital.dto.request.board.BoardCategoryTypeRequest;
import com.bippobippo.hospital.dto.response.board.BoardCategoryTypeResponse;
import com.bippobippo.hospital.entity.board.BoardCategoryType;
import com.bippobippo.hospital.service.board.BoardCategoryTypeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/boards/category-types")
@RequiredArgsConstructor
public class BoardCategoryTypeController {
    private final BoardCategoryTypeService categoryTypeService;

    @GetMapping
    public ResponseEntity<List<BoardCategoryTypeResponse>> getCategoryTypes() {
        log.info("카테고리 타입 목록 조회 요청");
        try {
            List<BoardCategoryType> categoryTypes = categoryTypeService.getCategoryTypes();
            List<BoardCategoryTypeResponse> response = categoryTypes.stream()
                .filter(BoardCategoryType::getIsActive)
                .map(BoardCategoryTypeResponse::from)
                .collect(java.util.stream.Collectors.toList());
            log.info("카테고리 타입 목록 조회 성공 - 개수: {}", response.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("카테고리 타입 목록 조회 실패: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BoardCategoryTypeResponse>> getCategoryTypesForAdmin() {
        log.info("관리자용 카테고리 타입 목록 조회 요청");
        try {
            List<BoardCategoryType> categoryTypes = categoryTypeService.getCategoryTypes();
            List<BoardCategoryTypeResponse> response = categoryTypes.stream()
                .map(BoardCategoryTypeResponse::from)
                .collect(java.util.stream.Collectors.toList());
            log.info("관리자용 카테고리 타입 목록 조회 성공 - 개수: {}", response.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("관리자용 카테고리 타입 목록 조회 실패: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BoardCategoryTypeResponse> createCategoryType(@Validated @RequestBody BoardCategoryTypeRequest request) {
        log.info("카테고리 타입 생성 요청 - 데이터: {}", request);
        try {
            BoardCategoryType categoryType = categoryTypeService.createCategoryType(request);
            log.info("카테고리 타입 생성 성공 - ID: {}", categoryType.getId());
            return ResponseEntity.ok(BoardCategoryTypeResponse.from(categoryType));
        } catch (Exception e) {
            log.error("카테고리 타입 생성 실패: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BoardCategoryTypeResponse> updateCategoryType(
            @PathVariable Integer id,
            @Validated @RequestBody BoardCategoryTypeRequest request) {
        log.info("카테고리 타입 수정 요청 - ID: {}, 데이터: {}", id, request);
        try {
            BoardCategoryType categoryType = categoryTypeService.updateCategoryType(id, request);
            log.info("카테고리 타입 수정 성공 - ID: {}", id);
            return ResponseEntity.ok(BoardCategoryTypeResponse.from(categoryType));
        } catch (Exception e) {
            log.error("카테고리 타입 수정 실패: {}", e.getMessage(), e);
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategoryType(@PathVariable Integer id) {
        log.info("카테고리 타입 삭제 요청 - ID: {}", id);
        try {
            categoryTypeService.deleteCategoryType(id);
            log.info("카테고리 타입 삭제 성공 - ID: {}", id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("카테고리 타입 삭제 실패: {}", e.getMessage(), e);
            throw e;
        }
    }
} 