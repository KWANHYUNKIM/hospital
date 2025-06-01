package com.bippobippo.hospital.dto.request.admin;

import lombok.Data;

@Data
public class CorsConfigRequest {
    private String origin;
    private String methods;
    private String headers;
    private Boolean credentials;
    private Integer maxAge;
} 