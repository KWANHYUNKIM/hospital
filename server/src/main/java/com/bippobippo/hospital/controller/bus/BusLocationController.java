package com.bippobippo.hospital.controller.bus;

import com.bippobippo.hospital.model.bus.BusLocation;
import com.bippobippo.hospital.service.bus.BusLocationService;
import com.bippobippo.hospital.scheduler.bus.BusLocationScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bus/locations")
@RequiredArgsConstructor
public class BusLocationController {
    private final BusLocationService busLocationService;
    private final BusLocationScheduler busLocationScheduler;

    @GetMapping
    public List<BusLocation> getAllBusLocations() {
        return busLocationService.getAllBusLocations();
    }

    @GetMapping("/route/{routeId}")
    public List<BusLocation> getBusLocationsByRoute(@PathVariable String routeId) {
        return busLocationService.getBusLocations(routeId);
    }

    @GetMapping("/city/{cityCode}")
    public List<BusLocation> getBusLocationsByCity(@PathVariable String cityCode) {
        return busLocationService.getBusLocationsByCity(cityCode);
    }

    @GetMapping("/stats")
    public Map<String, Object> getBusLocationStats() {
        List<BusLocation> allLocations = busLocationService.getAllBusLocations();
        
        return Map.of(
            "totalBuses", allLocations.size(),
            "timestamp", new java.util.Date(),
            "message", "현재 " + allLocations.size() + "대의 버스가 운행 중입니다."
        );
    }

    @GetMapping("/route-stats")
    public Map<String, Object> getRouteStats() {
        List<BusLocation> allLocations = busLocationService.getAllBusLocations();
        
        Map<String, Long> routeStats = allLocations.stream()
            .collect(java.util.stream.Collectors.groupingBy(
                BusLocation::getRouteId, 
                java.util.stream.Collectors.counting()
            ));
        
        return Map.of(
            "totalBuses", allLocations.size(),
            "routeStats", routeStats,
            "timestamp", new java.util.Date()
        );
    }

    @PostMapping("/collect")
    public Map<String, String> collectBusLocations() {
        try {
            busLocationScheduler.fetchAllBusLocationsNow();
            return Map.of("message", "버스 위치 수집이 시작되었습니다.");
        } catch (Exception e) {
            return Map.of("error", "버스 위치 수집 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
} 