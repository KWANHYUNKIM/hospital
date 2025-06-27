package com.bippobippo.hospital.controller.bus;

import com.bippobippo.hospital.model.bus.BusRouteStation;
import com.bippobippo.hospital.service.bus.BusRouteStationService;
import com.bippobippo.hospital.scheduler.bus.BusRouteStationCollector;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@RestController
@RequestMapping("/api/bus/route-station")
@RequiredArgsConstructor
public class BusRouteStationController {
    private final BusRouteStationCollector busRouteStationCollector;
    private final BusRouteStationService busRouteStationService;

    @GetMapping("/route/{routeId}")
    public List<BusRouteStation> getStationsByRoute(@PathVariable String routeId) {
        return busRouteStationService.getStationsByRoute(routeId);
    }

    @GetMapping("/station/{stationId}")
    public List<BusRouteStation> getRoutesByStation(@PathVariable String stationId) {
        return busRouteStationService.getRoutesByStation(stationId);
    }

    @GetMapping("/city/{cityCode}")
    public List<BusRouteStation> getStationsByCity(@PathVariable String cityCode) {
        return busRouteStationService.getStationsByCity(cityCode);
    }

    @PostMapping("/collect")
    public ResponseEntity<Map<String, Object>> collectRouteStations(
            @RequestParam(defaultValue = "100") int maxRoutes,
            @RequestParam(defaultValue = "false") boolean allCities) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("노선별 정류장 정보 수집 시작 - 최대 {}개 노선", maxRoutes);
            
            // 비동기로 실행 (백그라운드에서 처리)
            new Thread(() -> {
                try {
                    busRouteStationCollector.collectAllRouteStationsNow();
                } catch (Exception e) {
                    log.error("노선별 정류장 수집 중 오류", e);
                }
            }).start();
            
            response.put("message", "노선별 정류장 정보 수집이 시작되었습니다.");
            response.put("maxRoutes", maxRoutes);
            response.put("status", "STARTED");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("노선별 정류장 수집 요청 실패", e);
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getCollectionStatus() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 현재 수집된 노선별 정류장 개수
            long count = busRouteStationService.getCount();
            
            response.put("collectedCount", count);
            response.put("status", count > 0 ? "COMPLETED" : "NOT_STARTED");
            response.put("message", count > 0 ? 
                count + "개의 노선별 정류장 정보가 수집되었습니다." : 
                "아직 노선별 정류장 정보가 수집되지 않았습니다.");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("노선별 정류장 수집 상태 조회 실패", e);
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/count")
    public Map<String, Object> getRouteStationCount() {
        long totalRouteStations = busRouteStationService.getCount();
        return Map.of(
            "totalRouteStations", totalRouteStations,
            "message", "총 " + totalRouteStations + "개의 노선별 정류장 정보가 등록되어 있습니다."
        );
    }
} 