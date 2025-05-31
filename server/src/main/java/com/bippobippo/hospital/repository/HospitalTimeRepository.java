package com.bippobippo.hospital.repository;

import com.bippobippo.hospital.entity.HospitalTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HospitalTimeRepository extends JpaRepository<HospitalTime, Long> {
    List<HospitalTime> findByYkiho(String ykiho);
} 