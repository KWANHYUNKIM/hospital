package com.bippobippo.hospital.controller.bus;

import com.bippobippo.hospital.model.bus.BusRouteTracking;
import com.bippobippo.hospital.service.bus.BusRouteTrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bus/tracking")
@RequiredArgsConstructor
public class BusRouteTrackingController {
    
    private final BusRouteTrackingService busRouteTrackingService;
    
    // 특정 노선의 운행 중인 버스들 조회
    @GetMapping("/route/{routeId}/active")
    public List<BusRouteTracking> getActiveTrackingsByRoute(@PathVariable String routeId) {
        return busRouteTrackingService.getActiveTrackingsByRoute(routeId);
    }
    
    // 특정 도시의 운행 중인 버스들 조회
    @GetMapping("/city/{cityCode}/active")
    public List<BusRouteTracking> getActiveTrackingsByCity(@PathVariable String cityCode) {
        return busRouteTrackingService.getActiveTrackingsByCity(cityCode);
    }
    
    // 특정 버스의 운행 기록 조회
    @GetMapping("/vehicle/{vehicleNo}")
    public List<BusRouteTracking> getTrackingsByVehicle(@PathVariable String vehicleNo) {
        return busRouteTrackingService.getTrackingsByVehicle(vehicleNo);
    }
    
    // 운행 중인 버스 수 조회
    @GetMapping("/active/count")
    public Map<String, Object> getActiveBusCount() {
        long totalCount = busRouteTrackingService.getActiveBusCount();
        return Map.of(
            "activeBusCount", totalCount,
            "message", "현재 운행 중인 버스: " + totalCount + "대"
        );
    }
    
    // 특정 노선의 운행 중인 버스 수 조회
    @GetMapping("/route/{routeId}/active/count")
    public Map<String, Object> getActiveBusCountByRoute(@PathVariable String routeId) {
        long count = busRouteTrackingService.getActiveBusCountByRoute(routeId);
        return Map.of(
            "routeId", routeId,
            "activeBusCount", count,
            "message", "노선 " + routeId + " 운행 중인 버스: " + count + "대"
        );
    }
    
    // 운행 통계 정보
    @GetMapping("/stats")
    public Map<String, Object> getTrackingStats() {
        long totalActive = busRouteTrackingService.getActiveBusCount();
        
        return Map.of(
            "totalActiveBuses", totalActive,
            "message", "전체 운행 중인 버스: " + totalActive + "대",
            "timestamp", new java.util.Date()
        );
    }
    
    // 전체 운행 중인 버스들 조회
    @GetMapping("/active/all")
    public List<BusRouteTracking> getAllActiveTrackings() {
        return busRouteTrackingService.getAllActiveTrackings();
    }
    
    // 도시별 운행 중인 버스 수 조회
    @GetMapping("/active/city-stats")
    public Map<String, Object> getActiveBusCountByCity() {
        return busRouteTrackingService.getActiveBusCountByCity();
    }
} 