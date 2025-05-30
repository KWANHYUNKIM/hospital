package com.bippobippo.hospital.repository;

import com.bippobippo.hospital.entity.HospitalTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HospitalTagRepository extends JpaRepository<HospitalTag, Long> {
} 