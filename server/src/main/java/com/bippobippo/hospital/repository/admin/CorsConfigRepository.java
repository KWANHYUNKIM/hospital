package com.bippobippo.hospital.repository.admin;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bippobippo.hospital.entity.common.CorsConfig;

public interface CorsConfigRepository extends JpaRepository<CorsConfig, Long> {
} 