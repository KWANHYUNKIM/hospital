package com.bippobippo.hospital.repository.board;

import com.bippobippo.hospital.entity.board.BoardComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardCommentRepository extends JpaRepository<BoardComment, Integer> {
    @Query("SELECT c FROM BoardComment c WHERE c.board.id = :boardId AND c.status = 'published'")
    Page<BoardComment> findByBoardIdAndStatusPublished(@Param("boardId") Integer boardId, Pageable pageable);
    
    @Query("SELECT COUNT(c) FROM BoardComment c WHERE c.board.id = :boardId AND c.status = 'published'")
    Integer countByBoardIdAndStatusPublished(@Param("boardId") Integer boardId);

    @Query(value = "SELECT DISTINCT c FROM BoardComment c " +
           "LEFT JOIN FETCH c.user " +
           "WHERE c.board.id = :boardId AND c.status IN :statuses",
           countQuery = "SELECT COUNT(DISTINCT c) FROM BoardComment c " +
           "WHERE c.board.id = :boardId AND c.status IN :statuses")
    Page<BoardComment> findByBoardIdAndStatusIn(
            @Param("boardId") Integer boardId,
            @Param("statuses") List<String> statuses,
            Pageable pageable);
} 