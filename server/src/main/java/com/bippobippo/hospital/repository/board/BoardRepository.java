package com.bippobippo.hospital.repository.board;

import com.bippobippo.hospital.entity.board.Board;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<Board, Integer> {
    @Query("SELECT DISTINCT b FROM Board b " +
           "LEFT JOIN FETCH b.category " +
           "LEFT JOIN FETCH b.user " +
           "LEFT JOIN FETCH b.boardDetail " +
           "WHERE b.id = :id")
    Board findByIdWithDetails(@Param("id") Integer id);

    @Query("SELECT DISTINCT b FROM Board b " +
           "LEFT JOIN FETCH b.tags " +
           "WHERE b.id = :id")
    Board findByIdWithTags(@Param("id") Integer id);

    @Query("SELECT b FROM Board b " +
           "LEFT JOIN FETCH b.attachments " +
           "WHERE b.id = :id")
    Board findByIdWithAttachments(@Param("id") Integer id);

    @Query("SELECT b FROM Board b LEFT JOIN FETCH b.category LEFT JOIN FETCH b.user WHERE b.category.id = :categoryId")
    List<Board> findByCategoryId(@Param("categoryId") Integer categoryId);

    @Query("SELECT COUNT(b) FROM Board b WHERE b.category.id = :categoryId")
    Integer countByCategoryId(@Param("categoryId") Integer categoryId);

    @Query(value = "SELECT b FROM Board b LEFT JOIN FETCH b.category LEFT JOIN FETCH b.user WHERE b.category.id = :categoryId AND b.status = 'published'",
           countQuery = "SELECT COUNT(b) FROM Board b WHERE b.category.id = :categoryId AND b.status = 'published'")
    Page<Board> findByCategoryIdAndStatus(@Param("categoryId") Integer categoryId, Pageable pageable);

    @Query(value = "SELECT b FROM Board b LEFT JOIN FETCH b.category LEFT JOIN FETCH b.user WHERE b.status = 'published'",
           countQuery = "SELECT COUNT(b) FROM Board b WHERE b.status = 'published'")
    Page<Board> findByStatus(Pageable pageable);

    Page<Board> findByUserId(Integer userId, Pageable pageable);
    Page<Board> findByTitleContainingOrSummaryContaining(String title, String summary, Pageable pageable);

    @Query(value = "SELECT b FROM Board b " +
           "LEFT JOIN FETCH b.category " +
           "LEFT JOIN FETCH b.user " +
           "LEFT JOIN FETCH b.boardDetail " +
           "WHERE b.category.id = :categoryId AND b.id != :boardId AND b.status = 'published'",
           countQuery = "SELECT COUNT(b) FROM Board b WHERE b.category.id = :categoryId AND b.id != :boardId AND b.status = 'published'")
    Page<Board> findRelatedBoards(@Param("categoryId") Integer categoryId, @Param("boardId") Integer boardId, Pageable pageable);
} 