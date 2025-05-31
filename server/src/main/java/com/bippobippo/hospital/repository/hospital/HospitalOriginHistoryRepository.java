package com.bippobippo.hospital.repository.hospital;

import com.bippobippo.hospital.entity.hospital.HospitalOriginHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HospitalOriginHistoryRepository extends JpaRepository<HospitalOriginHistory, Integer> {
} 