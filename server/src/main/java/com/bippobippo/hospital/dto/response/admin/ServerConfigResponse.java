package com.bippobippo.hospital.dto.response.admin;

import lombok.Data;
import java.util.List;

@Data
public class ServerConfigResponse {
    private List<ServerConfigDto> configs;
    
    @Data
    public static class ServerConfigDto {
        private Long id;
        private String keyName;
        private String value;
        private String environment;
        private String description;
        private Boolean isActive;
    }
} 