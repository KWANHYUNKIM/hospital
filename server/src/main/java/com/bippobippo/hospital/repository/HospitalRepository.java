package com.bippobippo.hospital.repository;

import com.bippobippo.hospital.entity.Hospital;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, String> {
    
    @Query(value = """
        SELECT h.*, 
        (6371 * acos(cos(radians(:latitude)) * cos(radians(h.latitude)) * 
        cos(radians(h.longitude) - radians(:longitude)) + 
        sin(radians(:latitude)) * sin(radians(h.latitude)))) AS distance 
        FROM hospitals h 
        HAVING distance <= :radius 
        ORDER BY distance
        """, nativeQuery = true)
    List<Hospital> findNearbyHospitals(
        @Param("latitude") Double latitude,
        @Param("longitude") Double longitude,
        @Param("radius") Integer radius,
        Pageable pageable
    );
} 