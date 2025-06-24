package com.bippobippo.hospital.controller.bus;

import com.bippobippo.hospital.model.bus.BusRoute;
import com.bippobippo.hospital.service.bus.BusRouteService;
import com.bippobippo.hospital.scheduler.bus.BusRouteCollector;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bus/routes")
@RequiredArgsConstructor
public class BusRouteController {
    private final BusRouteService busRouteService;
    private final BusRouteCollector busRouteCollector;

    @GetMapping
    public List<BusRoute> getAllRoutes() {
        return busRouteService.getAllRoutes();
    }

    @GetMapping("/city/{cityCode}")
    public List<BusRoute> getRoutesByCity(@PathVariable String cityCode) {
        return busRouteService.getRoutesByCity(cityCode);
    }

    @GetMapping("/{routeId}")
    public BusRoute getRouteByRouteId(@PathVariable String routeId) {
        return busRouteService.getRouteByRouteId(routeId);
    }

    @GetMapping("/number/{routeNo}")
    public List<BusRoute> getRoutesByRouteNo(@PathVariable String routeNo) {
        return busRouteService.getRoutesByRouteNo(routeNo);
    }

    @PostMapping("/save")
    public Map<String, Object> saveRoutes(@RequestBody List<BusRoute> routes) {
        busRouteService.saveAll(routes);
        return Map.of("message", "노선 정보 저장 완료", "count", routes.size());
    }

    @PostMapping("/sync")
    public Map<String, Object> syncRoutes(@RequestBody List<BusRoute> routes) {
        busRouteService.syncAllBusRoutes(routes);
        return Map.of("message", "노선 동기화 완료", "count", routes.size());
    }

    @DeleteMapping("/deleteAll")
    public Map<String, Object> deleteAllRoutes() {
        busRouteService.deleteAll();
        return Map.of("message", "모든 노선 정보 삭제 완료");
    }

    @PostMapping("/collect")
    public Map<String, String> collectAllRoutes() {
        try {
            busRouteCollector.collectAllBusRoutesNow();
            return Map.of("message", "전국 버스 노선 정보 수집이 시작되었습니다.");
        } catch (Exception e) {
            return Map.of("error", "노선 정보 수집 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @GetMapping("/count")
    public Map<String, Object> getRouteCount() {
        List<BusRoute> allRoutes = busRouteService.getAllRoutes();
        return Map.of(
            "totalRoutes", allRoutes.size(),
            "message", "총 " + allRoutes.size() + "개의 버스 노선이 등록되어 있습니다."
        );
    }
} 