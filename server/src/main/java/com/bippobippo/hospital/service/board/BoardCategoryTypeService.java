package com.bippobippo.hospital.service.board;

import com.bippobippo.hospital.dto.request.board.BoardCategoryTypeRequest;
import com.bippobippo.hospital.entity.board.BoardCategoryType;
import com.bippobippo.hospital.repository.board.BoardCategoryTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BoardCategoryTypeService {
    private final BoardCategoryTypeRepository categoryTypeRepository;

    @Transactional(readOnly = true)
    public List<BoardCategoryType> getCategoryTypes() {
        return categoryTypeRepository.findAllByOrderByOrderSequenceAsc();
    }

    @Transactional
    public BoardCategoryType createCategoryType(BoardCategoryTypeRequest request) {
        // 중복 검사
        if (categoryTypeRepository.existsByTypeCode(request.getTypeCode())) {
            throw new IllegalArgumentException("이미 존재하는 타입 코드입니다: " + request.getTypeCode());
        }

        BoardCategoryType categoryType = new BoardCategoryType();
        categoryType.setTypeName(request.getTypeName());
        categoryType.setTypeCode(request.getTypeCode().toUpperCase());
        categoryType.setDescription(request.getDescription());
        categoryType.setOrderSequence(request.getOrderSequence());
        categoryType.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        
        return categoryTypeRepository.save(categoryType);
    }

    @Transactional
    public BoardCategoryType updateCategoryType(Integer id, BoardCategoryTypeRequest request) {
        BoardCategoryType categoryType = categoryTypeRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("카테고리 타입을 찾을 수 없습니다: " + id));

        // 타입 코드가 변경되었고, 새로운 타입 코드가 이미 존재하는 경우
        if (!categoryType.getTypeCode().equals(request.getTypeCode()) && 
            categoryTypeRepository.existsByTypeCode(request.getTypeCode())) {
            throw new IllegalArgumentException("이미 존재하는 타입 코드입니다: " + request.getTypeCode());
        }

        categoryType.setTypeName(request.getTypeName());
        categoryType.setTypeCode(request.getTypeCode().toUpperCase());
        categoryType.setDescription(request.getDescription());
        categoryType.setOrderSequence(request.getOrderSequence());
        categoryType.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        return categoryTypeRepository.save(categoryType);
    }

    @Transactional
    public void deleteCategoryType(Integer id) {
        BoardCategoryType categoryType = categoryTypeRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("카테고리 타입을 찾을 수 없습니다: " + id));

        // 연관된 카테고리가 있는지 확인
        if (!categoryType.getCategories().isEmpty()) {
            throw new IllegalStateException("이 카테고리 타입에 속한 카테고리가 있어 삭제할 수 없습니다.");
        }

        categoryTypeRepository.delete(categoryType);
    }
} 