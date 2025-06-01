package com.bippobippo.hospital.repository.common;

import com.bippobippo.hospital.entity.common.SocialConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SocialConfigRepository extends JpaRepository<SocialConfig, Long> {
    Optional<SocialConfig> findByProvider(String provider);
    Optional<SocialConfig> findByProviderAndIsActive(String provider, Boolean isActive);
} 