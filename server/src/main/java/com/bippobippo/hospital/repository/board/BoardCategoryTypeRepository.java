package com.bippobippo.hospital.repository.board;

import com.bippobippo.hospital.entity.board.BoardCategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoardCategoryTypeRepository extends JpaRepository<BoardCategoryType, Integer> {
    Optional<BoardCategoryType> findByTypeName(String typeName);
    List<BoardCategoryType> findAllByOrderByOrderSequenceAsc();
    boolean existsByTypeName(String typeName);
} 