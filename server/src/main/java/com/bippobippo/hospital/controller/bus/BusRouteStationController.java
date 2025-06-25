package com.bippobippo.hospital.controller.bus;

import com.bippobippo.hospital.model.bus.BusRouteStation;
import com.bippobippo.hospital.service.bus.BusRouteStationService;
import com.bippobippo.hospital.scheduler.bus.BusRouteStationCollector;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bus/route-stations")
@RequiredArgsConstructor
public class BusRouteStationController {
    private final BusRouteStationService busRouteStationService;
    private final BusRouteStationCollector busRouteStationCollector;

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
    public Map<String, String> collectAllRouteStations() {
        try {
            busRouteStationCollector.collectAllRouteStationsNow();
            return Map.of("message", "전국 노선별 정류장 정보 수집이 시작되었습니다.");
        } catch (Exception e) {
            return Map.of("error", "노선별 정류장 정보 수집 중 오류가 발생했습니다: " + e.getMessage());
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