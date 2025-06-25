package com.bippobippo.hospital.controller.bus;

import com.bippobippo.hospital.model.bus.BusLocation;
import com.bippobippo.hospital.service.bus.BusLocationService;
import com.bippobippo.hospital.scheduler.bus.BusLocationScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bus")
@RequiredArgsConstructor
public class BusLocationController {
    private final BusLocationService busLocationService;
    private final BusLocationScheduler busLocationScheduler;

    @GetMapping("/locations")
    public List<BusLocation> getBusLocations(@RequestParam String routeId) {
        return busLocationService.getBusLocations(routeId);
    }

    @GetMapping("/locations/city/{cityCode}")
    public List<BusLocation> getBusLocationsByCity(@PathVariable String cityCode) {
        return busLocationService.getBusLocationsByCity(cityCode);
    }

    @GetMapping("/locations/all")
    public List<BusLocation> getAllBusLocations() {
        return busLocationService.getAllBusLocations();
    }
    
    @PostMapping("/locations/collect")
    public Map<String, String> collectBusLocations() {
        try {
            busLocationScheduler.fetchAllBusLocationsNow();
            return Map.of("message", "버스 위치 수집이 시작되었습니다.");
        } catch (Exception e) {
            return Map.of("error", "버스 위치 수집 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
} 