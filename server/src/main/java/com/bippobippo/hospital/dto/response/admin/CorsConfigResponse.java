package com.bippobippo.hospital.dto.response.admin;

import lombok.Data;
import java.util.List;

@Data
public class CorsConfigResponse {
    private List<CorsConfigDto> configs;
    
    @Data
    public static class CorsConfigDto {
        private Long id;
        private String origin;
        private String methods;
        private String headers;
        private Boolean credentials;
        private Integer maxAge;
    }
} 