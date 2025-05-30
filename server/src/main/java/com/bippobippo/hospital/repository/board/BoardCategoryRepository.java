package com.bippobippo.hospital.repository.board;

import com.bippobippo.hospital.entity.board.BoardCategory;
import com.bippobippo.hospital.entity.board.BoardCategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardCategoryRepository extends JpaRepository<BoardCategory, Integer> {
    @Query("SELECT DISTINCT c FROM BoardCategory c LEFT JOIN FETCH c.children WHERE c.parent IS NULL AND c.isActive = true ORDER BY c.orderSequence")
    List<BoardCategory> findRootCategoriesWithChildren();
    
    @Query("SELECT DISTINCT c FROM BoardCategory c LEFT JOIN FETCH c.children WHERE c.parent.id = :parentId AND c.isActive = true ORDER BY c.orderSequence")
    List<BoardCategory> findCategoriesWithChildrenByParentId(@Param("parentId") Integer parentId);
    
    @Query("SELECT DISTINCT c FROM BoardCategory c LEFT JOIN FETCH c.children WHERE c.categoryType.id = :categoryTypeId AND c.isActive = true ORDER BY c.orderSequence")
    List<BoardCategory> findCategoriesWithChildrenByTypeId(@Param("categoryTypeId") Integer categoryTypeId);
    
    @Query("SELECT c FROM BoardCategory c WHERE c.id = :id AND c.isActive = true")
    BoardCategory findActiveById(@Param("id") Integer id);

    List<BoardCategory> findByCategoryType(BoardCategoryType categoryType);

    @Query("SELECT c FROM BoardCategory c WHERE c.parent.id = :parentId ORDER BY c.orderSequence")
    List<BoardCategory> findByParentIdOrderByOrderSequence(@Param("parentId") Integer parentId);

    @Query("SELECT c FROM BoardCategory c WHERE c.categoryType.id = :categoryTypeId ORDER BY c.orderSequence")
    List<BoardCategory> findByCategoryTypeIdOrderByOrderSequence(@Param("categoryTypeId") Integer categoryTypeId);
} 