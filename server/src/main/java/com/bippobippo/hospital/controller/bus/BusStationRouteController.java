package com.bippobippo.hospital.controller.bus;

import com.bippobippo.hospital.model.bus.BusStationRoute;
import com.bippobippo.hospital.service.bus.BusStationRouteService;
import com.bippobippo.hospital.scheduler.bus.BusStationRouteCollector;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/bus/station-route")
@RequiredArgsConstructor
public class BusStationRouteController {
    
    private final BusStationRouteService busStationRouteService;
    private final BusStationRouteCollector busStationRouteCollector;
    
    // 정류장별 정차 버스 정보 생성
    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateStationRoutes() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("정류장별 정차 버스 정보 생성 시작");
            
            // 비동기로 실행 (백그라운드에서 처리)
            new Thread(() -> {
                try {
                    busStationRouteCollector.generateStationRoutesNow();
                } catch (Exception e) {
                    log.error("정류장별 정차 버스 정보 생성 중 오류", e);
                }
            }).start();
            
            response.put("message", "정류장별 정차 버스 정보 생성이 시작되었습니다.");
            response.put("status", "STARTED");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("정류장별 정차 버스 정보 생성 요청 실패", e);
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    // 정류장 ID로 정차 버스 정보 조회
    @GetMapping("/station/{stationId}")
    public ResponseEntity<Map<String, Object>> getStationRoutes(@PathVariable String stationId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<BusStationRoute> stationRoute = busStationRouteService.getByStationId(stationId);
            
            if (stationRoute.isPresent()) {
                response.put("station", stationRoute.get());
                response.put("message", "정류장 정보를 찾았습니다.");
            } else {
                response.put("message", "정류장 정보를 찾을 수 없습니다: " + stationId);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("정류장별 정차 버스 정보 조회 실패", e);
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    // 정류장명으로 검색
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchStations(@RequestParam String stationName) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<BusStationRoute> stations = busStationRouteService.getByStationName(stationName);
            
            response.put("stations", stations);
            response.put("count", stations.size());
            response.put("message", stationName + " 검색 결과: " + stations.size() + "개 정류장");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("정류장 검색 실패", e);
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    // 도시별 정류장 조회
    @GetMapping("/city/{cityCode}")
    public ResponseEntity<Map<String, Object>> getStationsByCity(@PathVariable String cityCode) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<BusStationRoute> stations = busStationRouteService.getByCityCode(cityCode);
            
            response.put("stations", stations);
            response.put("count", stations.size());
            response.put("cityCode", cityCode);
            response.put("message", "도시 " + cityCode + "의 정류장: " + stations.size() + "개");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("도시별 정류장 조회 실패", e);
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    // 생성 상태 조회
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getGenerationStatus() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            long count = busStationRouteService.getCount();
            
            response.put("generatedCount", count);
            response.put("status", count > 0 ? "COMPLETED" : "NOT_STARTED");
            response.put("message", count > 0 ? 
                count + "개의 정류장별 정차 버스 정보가 생성되었습니다." : 
                "아직 정류장별 정차 버스 정보가 생성되지 않았습니다.");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("정류장별 정차 버스 정보 생성 상태 조회 실패", e);
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
} 