package com.bippobippo.hospital.repository.user;

import com.bippobippo.hospital.entity.user.SocialConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SocialConfigRepository extends JpaRepository<SocialConfig, Long> {
    Optional<SocialConfig> findByProviderAndIsActive(String provider, boolean isActive);
} 