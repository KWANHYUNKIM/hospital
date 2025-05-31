package com.bippobippo.hospital.repository.hospital;

import com.bippobippo.hospital.entity.hospital.HospitalOrigin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HospitalOriginRepository extends JpaRepository<HospitalOrigin, Integer> {
} 