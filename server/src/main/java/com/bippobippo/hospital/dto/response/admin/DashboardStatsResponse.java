package com.bippobippo.hospital.dto.response.admin;

import lombok.Data;
import java.util.Map;

@Data
public class DashboardStatsResponse {
    private Map<String, Object> collectionStats;
    private Map<String, Integer> hospitalsByType;
    private Map<String, Integer> hospitalsByRegion;
    private Object recentUpdates;
    private Map<String, Integer> emptyFields;
} 