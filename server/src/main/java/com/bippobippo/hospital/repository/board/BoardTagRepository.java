package com.bippobippo.hospital.repository.board;

import com.bippobippo.hospital.entity.board.BoardTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BoardTagRepository extends JpaRepository<BoardTag, Integer> {
    Optional<BoardTag> findByName(String name);
} 