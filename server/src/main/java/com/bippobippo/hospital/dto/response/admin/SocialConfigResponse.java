package com.bippobippo.hospital.dto.response.admin;

import lombok.Data;
import java.util.List;

@Data
public class SocialConfigResponse {
    private List<SocialConfigDto> configs;
    
    @Data
    public static class SocialConfigDto {
        private String provider;
        private String clientId;
        private String clientSecret;
        private String redirectUri;
        private String environment;
        private Boolean isActive;
    }
} 