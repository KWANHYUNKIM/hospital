package com.bippobippo.hospital.dto.request.admin;

import lombok.Data;

@Data
public class SocialConfigRequest {
    private String provider;
    private String clientId;
    private String clientSecret;
    private String redirectUri;
    private String environment;
    private Boolean isActive;
} 