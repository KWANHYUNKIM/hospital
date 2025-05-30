package com.bippobippo.hospital.service.map;

import java.util.List;
import java.util.Map;

public interface MapService {
    List<Map<String, Object>> getMapData(String type, Double swLat, Double swLng, Double neLat, Double neLng, Integer limit);
    List<Map<String, Object>> search(String query);
    List<Map<String, Object>> getSummary();
    List<Map<String, Object>> getSidoSummary();
    List<Map<String, Object>> getSgguSummary(Double swLat, Double swLng, Double neLat, Double neLng);
    List<Map<String, Object>> getEmdongSummary(Double swLat, Double swLng, Double neLat, Double neLng);
    List<String> getRiSummary();
    List<Map<String, Object>> getClusters(Double swLat, Double swLng, Double neLat, Double neLng, Double centerLat, Double centerLng, Integer radius);
    List<Map<String, Object>> getMapCluster(Double swLat, Double swLng, Double neLat, Double neLng, Integer zoomLevel);
    Map<String, Object> getBoundaryGeometry(String boundaryType, String name);
} 