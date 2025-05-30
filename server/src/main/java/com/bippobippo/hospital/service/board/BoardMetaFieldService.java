package com.bippobippo.hospital.service.board;

import com.bippobippo.hospital.entity.board.BoardCategoryType;
import com.bippobippo.hospital.entity.board.BoardMetaField;
import com.bippobippo.hospital.repository.board.BoardCategoryTypeRepository;
import com.bippobippo.hospital.repository.board.BoardMetaFieldRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardMetaFieldService {
    private final BoardMetaFieldRepository metaFieldRepository;
    private final BoardCategoryTypeRepository categoryTypeRepository;

    public List<BoardMetaField> getMetaFieldsByCategoryType(Integer categoryTypeId) {
        return metaFieldRepository.findByCategoryTypeIdOrderByOrderSequence(categoryTypeId);
    }

    public List<BoardMetaField> getRequiredMetaFieldsByCategoryType(Integer categoryTypeId) {
        return metaFieldRepository.findByCategoryTypeIdAndIsRequiredTrueOrderByOrderSequence(categoryTypeId);
    }

    @Transactional
    public BoardMetaField createMetaField(Integer categoryTypeId, BoardMetaField metaField) {
        BoardCategoryType categoryType = categoryTypeRepository.findById(categoryTypeId)
                .orElseThrow(() -> new RuntimeException("Category type not found"));
        
        metaField.setCategoryType(categoryType);
        return metaFieldRepository.save(metaField);
    }

    @Transactional
    public BoardMetaField updateMetaField(Integer id, BoardMetaField metaField) {
        BoardMetaField existingMetaField = metaFieldRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meta field not found"));
        
        existingMetaField.setFieldName(metaField.getFieldName());
        existingMetaField.setFieldType(metaField.getFieldType());
        existingMetaField.setFieldLabel(metaField.getFieldLabel());
        existingMetaField.setIsRequired(metaField.getIsRequired());
        existingMetaField.setFieldOptions(metaField.getFieldOptions());
        existingMetaField.setOrderSequence(metaField.getOrderSequence());
        
        return metaFieldRepository.save(existingMetaField);
    }

    @Transactional
    public void deleteMetaField(Integer id) {
        metaFieldRepository.deleteById(id);
    }
} 