package com.bippobippo.hospital.dto.response.admin;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class GeoJsonListResponse {
    private List<Map<String, Object>> features;
} 