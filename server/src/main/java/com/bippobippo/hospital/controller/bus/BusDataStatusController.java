package com.bippobippo.hospital.controller.bus;

import com.bippobippo.hospital.service.bus.BusRouteService;
import com.bippobippo.hospital.service.bus.BusStationService;
import com.bippobippo.hospital.service.bus.BusRouteStationService;
import com.bippobippo.hospital.service.bus.BusLocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/bus/data-status")
@RequiredArgsConstructor
public class BusDataStatusController {
    
    private final BusRouteService busRouteService;
    private final BusStationService busStationService;
    private final BusRouteStationService busRouteStationService;
    private final BusLocationService busLocationService;
    
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getDataStatusSummary() {
        Map<String, Object> status = new HashMap<>();
        
        try {
            // 각 테이블의 데이터 개수
            long routeCount = busRouteService.getRouteCount();
            long stationCount = busStationService.getStationCount();
            long routeStationCount = busRouteStationService.getRouteStationCount();
            long locationCount = busLocationService.getLocationCount();
            
            status.put("routes", routeCount);
            status.put("stations", stationCount);
            status.put("routeStations", routeStationCount);
            status.put("locations", locationCount);
            
            // 데이터 품질 지표
            double routeStationRatio = routeCount > 0 ? (double) routeStationCount / routeCount : 0;
            status.put("routeStationRatio", Math.round(routeStationRatio * 100.0) / 100.0);
            
            // 상태 평가
            String overallStatus = "GOOD";
            if (routeCount == 0) {
                overallStatus = "NO_ROUTES";
            } else if (routeStationCount == 0) {
                overallStatus = "NO_ROUTE_STATIONS";
            } else if (routeStationRatio < 5.0) {
                overallStatus = "LOW_ROUTE_STATION_RATIO";
            } else if (locationCount == 0) {
                overallStatus = "NO_LOCATIONS";
            }
            
            status.put("overallStatus", overallStatus);
            status.put("message", getStatusMessage(overallStatus));
            
            log.info("데이터 상태 조회: {}", status);
            
            return ResponseEntity.ok(status);
            
        } catch (Exception e) {
            log.error("데이터 상태 조회 실패", e);
            status.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(status);
        }
    }
    
    private String getStatusMessage(String status) {
        switch (status) {
            case "GOOD":
                return "모든 데이터가 정상적으로 수집되었습니다.";
            case "NO_ROUTES":
                return "버스 노선 데이터가 없습니다. BusRouteCollector를 실행해주세요.";
            case "NO_ROUTE_STATIONS":
                return "노선별 정류장 데이터가 없습니다. BusRouteStationCollector를 실행해주세요.";
            case "LOW_ROUTE_STATION_RATIO":
                return "노선별 정류장 데이터가 부족합니다. BusRouteStationCollector를 다시 실행해주세요.";
            case "NO_LOCATIONS":
                return "실시간 버스 위치 데이터가 없습니다. BusLocationScheduler가 실행 중인지 확인해주세요.";
            default:
                return "알 수 없는 상태입니다.";
        }
    }
} 