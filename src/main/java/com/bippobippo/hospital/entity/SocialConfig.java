package com.bippobippo.hospital.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "hospital_social_configs")
@Getter
@Setter
public class SocialConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String provider;

    @Column(name = "client_id", nullable = false)
    private String clientId;

    @Column(name = "client_secret")
    private String clientSecret;

    @Column(name = "redirect_uri", nullable = false)
    private String redirectUri;

    @Column(name = "is_active")
    private Boolean isActive = true;
} 