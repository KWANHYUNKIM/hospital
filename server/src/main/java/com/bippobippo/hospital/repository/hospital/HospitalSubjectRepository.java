package com.bippobippo.hospital.repository.hospital;

import com.bippobippo.hospital.entity.hospital.HospitalSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HospitalSubjectRepository extends JpaRepository<HospitalSubject, Long> {
    List<HospitalSubject> findByYkiho(String ykiho);
} 