package com.bippobippo.hospital.dto.request.admin;

import lombok.Data;

@Data
public class ServerConfigRequest {
    private String keyName;
    private String value;
    private String environment;
    private String description;
    private Boolean isActive;
} 