package com.bippobippo.hospital.dto.response.admin;

import lombok.Data;

@Data
public class GeoJsonUploadResponse {
    private String message;
    private Integer insertedCount;
    private Integer errorCount;
    private Integer successCount;
    private Integer totalCount;
} 