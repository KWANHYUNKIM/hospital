package com.bippobippo.hospital.controller.map;

import com.bippobippo.hospital.service.map.MapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
public class MapController {

    private final MapService mapService;

    @GetMapping("/map-data")
    public ResponseEntity<?> getMapData(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Double swLat,
            @RequestParam(required = false) Double swLng,
            @RequestParam(required = false) Double neLat,
            @RequestParam(required = false) Double neLng,
            @RequestParam(required = false) Integer limit) {
        return ResponseEntity.ok(mapService.getMapData(type, swLat, swLng, neLat, neLng, limit));
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String query) {
        return ResponseEntity.ok(mapService.search(query));
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary() {
        return ResponseEntity.ok(mapService.getSummary());
    }

    @GetMapping("/sido-summary")
    public ResponseEntity<?> getSidoSummary() {
        return ResponseEntity.ok(mapService.getSidoSummary());
    }

    @GetMapping("/sggu-summary")
    public ResponseEntity<?> getSgguSummary(
            @RequestParam Double swLat,
            @RequestParam Double swLng,
            @RequestParam Double neLat,
            @RequestParam Double neLng) {
        return ResponseEntity.ok(mapService.getSgguSummary(swLat, swLng, neLat, neLng));
    }

    @GetMapping("/emdong-summary")
    public ResponseEntity<?> getEmdongSummary(
            @RequestParam Double swLat,
            @RequestParam Double swLng,
            @RequestParam Double neLat,
            @RequestParam Double neLng) {
        return ResponseEntity.ok(mapService.getEmdongSummary(swLat, swLng, neLat, neLng));
    }

    @GetMapping("/ri-summary")
    public ResponseEntity<?> getRiSummary() {
        return ResponseEntity.ok(mapService.getRiSummary());
    }

    @GetMapping("/map-summary/clusters")
    public ResponseEntity<List<Map<String, Object>>> getClusters(
            @RequestParam Double swLat,
            @RequestParam Double swLng,
            @RequestParam Double neLat,
            @RequestParam Double neLng,
            @RequestParam Double centerLat,
            @RequestParam Double centerLng,
            @RequestParam(defaultValue = "5") Integer radius) {
        try {
            List<Map<String, Object>> clusters = mapService.getClusters(swLat, swLng, neLat, neLng, centerLat, centerLng, radius);
            return ResponseEntity.ok(clusters);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/map-summary/mapCluster")
    public ResponseEntity<List<Map<String, Object>>> getMapCluster(
            @RequestParam Double swLat,
            @RequestParam Double swLng,
            @RequestParam Double neLat,
            @RequestParam Double neLng,
            @RequestParam(defaultValue = "8") Integer zoomLevel) {
        try {
            List<Map<String, Object>> clusters = mapService.getMapCluster(swLat, swLng, neLat, neLng, zoomLevel);
            return ResponseEntity.ok(clusters);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/map-summary/boundary-geometry")
    public ResponseEntity<Map<String, Object>> getBoundaryGeometry(
            @RequestParam String boundaryType,
            @RequestParam String name) {
        try {
            Map<String, Object> geometry = mapService.getBoundaryGeometry(boundaryType, name);
            return ResponseEntity.ok(geometry);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            if (e.getMessage().contains("찾을 수 없습니다")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.internalServerError().build();
        }
    }
} 