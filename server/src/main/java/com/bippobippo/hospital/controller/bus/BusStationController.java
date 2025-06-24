package com.bippobippo.hospital.controller.bus;

import com.bippobippo.hospital.model.bus.BusStation;
import com.bippobippo.hospital.service.bus.BusStationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bus/stations")
@RequiredArgsConstructor
public class BusStationController {
    private final BusStationService busStationService;

    @GetMapping
    public List<BusStation> getAllStations() {
        return busStationService.getAllStations();
    }

    @GetMapping("/city/{cityCode}")
    public List<BusStation> getStationsByCity(@PathVariable String cityCode) {
        return busStationService.getStationsByCity(cityCode);
    }

    @GetMapping("/search")
    public List<BusStation> searchStations(@RequestParam String stationNm) {
        return busStationService.searchStationsByName(stationNm);
    }

    @GetMapping("/count")
    public Map<String, Object> getStationCount() {
        long totalStations = busStationService.getStationCount();
        return Map.of(
            "totalStations", totalStations,
            "message", "총 " + totalStations + "개의 버스 정류장이 등록되어 있습니다."
        );
    }
} 