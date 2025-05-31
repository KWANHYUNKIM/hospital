package com.bippobippo.hospital.repository.board;

import com.bippobippo.hospital.entity.board.HospitalTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HospitalTagRepository extends JpaRepository<HospitalTag, Long> {
} 