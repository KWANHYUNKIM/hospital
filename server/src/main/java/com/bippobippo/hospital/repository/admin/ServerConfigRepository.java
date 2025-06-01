package com.bippobippo.hospital.repository.admin;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bippobippo.hospital.entity.common.ServerConfig;

public interface ServerConfigRepository extends JpaRepository<ServerConfig, Long> {
} 