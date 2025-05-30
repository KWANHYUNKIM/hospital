package com.bippobippo.hospital.repository.board;

import com.bippobippo.hospital.entity.board.BoardMetaField;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardMetaFieldRepository extends JpaRepository<BoardMetaField, Integer> {
    List<BoardMetaField> findByCategoryTypeIdOrderByOrderSequence(Integer categoryTypeId);
    
    List<BoardMetaField> findByCategoryTypeIdAndIsRequiredTrueOrderByOrderSequence(Integer categoryTypeId);
} 