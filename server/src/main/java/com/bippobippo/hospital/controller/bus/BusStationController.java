package com.bippobippo.hospital.controller.bus;

import com.bippobippo.hospital.model.bus.BusStation;
import com.bippobippo.hospital.service.bus.BusStationService;
import com.bippobippo.hospital.model.bus.BusRouteTracking;
import com.bippobippo.hospital.model.bus.BusArrivalPrediction;
import com.bippobippo.hospital.service.bus.BusRouteTrackingService;
import com.bippobippo.hospital.service.bus.BusArrivalPredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/bus/stations")
@RequiredArgsConstructor
public class BusStationController {
    private final BusStationService busStationService;
    private final BusRouteTrackingService busRouteTrackingService;
    private final BusArrivalPredictionService busArrivalPredictionService;

    @GetMapping
    public List<BusStation> getAllStations() {
        return busStationService.getAllStations();
    }

    @GetMapping("/{stationId}")
    public BusStation getStationById(@PathVariable String stationId) {
        return busStationService.getStationById(stationId);
    }

    @GetMapping("/city/{cityCode}")
    public List<BusStation> getStationsByCity(@PathVariable String cityCode) {
        return busStationService.getStationsByCity(cityCode);
    }

    @GetMapping("/search")
    public List<BusStation> searchStations(@RequestParam String keyword) {
        return busStationService.searchStationsByName(keyword);
    }

    @GetMapping("/stats")
    public Map<String, Object> getStationStats() {
        List<BusStation> allStations = busStationService.getAllStations();
        
        return Map.of(
            "totalStations", allStations.size(),
            "timestamp", new java.util.Date(),
            "message", "전국 " + allStations.size() + "개 정류장 정보가 있습니다."
        );
    }

    // 정류장별 버스 통과 기록 조회
    @GetMapping("/{stationId}/history")
    public Map<String, Object> getStationHistory(@PathVariable String stationId) {
        // 정류장별 추적 기록은 현재 구현되어 있지 않으므로 임시로 빈 결과 반환
        return Map.of(
            "stationId", stationId,
            "totalPassedBuses", 0,
            "recentPassedBuses", List.of(),
            "message", "정류장별 버스 통과 기록 기능은 현재 개발 중입니다."
        );
    }
    
    // 정류장별 곧 도착할 버스 조회
    @GetMapping("/{stationId}/arrivals")
    public Map<String, Object> getStationArrivals(@PathVariable String stationId) {
        List<BusArrivalPrediction> predictions = busArrivalPredictionService.predictArrivalsForStation(stationId);
        
        // 10분 이내 도착 예정 버스만 필터링
        long tenMinutesFromNow = System.currentTimeMillis() + (10 * 60 * 1000);
        List<BusArrivalPrediction> upcomingArrivals = predictions.stream()
            .filter(prediction -> prediction.getEstimatedArrivalTime() != null && 
                                prediction.getEstimatedArrivalTime().getTime() <= tenMinutesFromNow)
            .sorted((a, b) -> Long.compare(a.getEstimatedArrivalTime().getTime(), b.getEstimatedArrivalTime().getTime()))
            .collect(Collectors.toList());
        
        return Map.of(
            "stationId", stationId,
            "upcomingArrivals", upcomingArrivals.stream()
                .map(prediction -> Map.of(
                    "routeId", prediction.getRouteId(),
                    "routeNm", prediction.getRouteNm(),
                    "estimatedArrivalTime", prediction.getEstimatedArrivalTime(),
                    "estimatedMinutes", prediction.getEstimatedArrivalMinutes(),
                    "confidence", prediction.getConfidence()
                ))
                .collect(Collectors.toList()),
            "totalUpcoming", upcomingArrivals.size(),
            "message", upcomingArrivals.isEmpty() ? 
                "곧 도착할 버스가 없습니다." : 
                upcomingArrivals.size() + "대의 버스가 곧 도착합니다."
        );
    }
    
    // 정류장별 종합 정보 (통과 기록 + 도착 예정)
    @GetMapping("/{stationId}/summary")
    public Map<String, Object> getStationSummary(@PathVariable String stationId) {
        // 도착 예정 조회
        List<BusArrivalPrediction> predictions = busArrivalPredictionService.predictArrivalsForStation(stationId);
        long tenMinutesFromNow = System.currentTimeMillis() + (10 * 60 * 1000);
        List<BusArrivalPrediction> upcomingArrivals = predictions.stream()
            .filter(prediction -> prediction.getEstimatedArrivalTime() != null && 
                                prediction.getEstimatedArrivalTime().getTime() <= tenMinutesFromNow)
            .sorted((a, b) -> Long.compare(a.getEstimatedArrivalTime().getTime(), b.getEstimatedArrivalTime().getTime()))
            .collect(Collectors.toList());
        
        return Map.of(
            "stationId", stationId,
            "summary", Map.of(
                "recentPassedBuses", 0, // 현재 구현되지 않음
                "upcomingArrivals", upcomingArrivals.size(),
                "lastUpdated", new java.util.Date()
            ),
            "recentPassedBuses", List.of(), // 현재 구현되지 않음
            "upcomingArrivals", upcomingArrivals.stream()
                .map(prediction -> Map.of(
                    "routeId", prediction.getRouteId(),
                    "routeNm", prediction.getRouteNm(),
                    "estimatedArrivalTime", prediction.getEstimatedArrivalTime(),
                    "estimatedMinutes", Math.max(0, prediction.getEstimatedArrivalMinutes()),
                    "confidence", prediction.getConfidence()
                ))
                .collect(Collectors.toList()),
            "message", String.format("현재 %d대의 버스가 곧 도착합니다.", upcomingArrivals.size())
        );
    }
    
    // 모든 정류장의 요약 정보
    @GetMapping("/summary")
    public Map<String, Object> getAllStationsSummary() {
        // 여기서는 주요 정류장들의 요약 정보를 반환
        // 실제로는 데이터베이스에서 정류장 목록을 가져와야 함
        return Map.of(
            "message", "정류장별 요약 정보를 조회하려면 /api/bus/stations/{stationId}/summary를 사용하세요.",
            "exampleStations", List.of(
                "서울역", "강남역", "홍대입구역", "잠실역", "부산역"
            )
        );
    }
    
    // 도착 예정 버스가 있는 정류장만 조회
    @GetMapping("/with-arrivals")
    public Map<String, Object> getStationsWithArrivals() {
        try {
            // 모든 정류장 조회
            List<BusStation> allStations = busStationService.getAllStations();
            List<Map<String, Object>> stationsWithArrivals = new ArrayList<>();
            
            // 각 정류장별로 도착 예정 버스 확인
            for (BusStation station : allStations) {
                List<BusArrivalPrediction> predictions = busArrivalPredictionService.predictArrivalsForStation(station.getStationId());
                
                // 10분 이내 도착 예정 버스만 필터링
                long tenMinutesFromNow = System.currentTimeMillis() + (10 * 60 * 1000);
                List<BusArrivalPrediction> upcomingArrivals = predictions.stream()
                    .filter(prediction -> prediction.getEstimatedArrivalTime() != null && 
                                        prediction.getEstimatedArrivalTime().getTime() <= tenMinutesFromNow)
                    .collect(Collectors.toList());
                
                // 도착 예정 버스가 있는 경우만 추가
                if (!upcomingArrivals.isEmpty()) {
                    stationsWithArrivals.add(Map.of(
                        "stationId", station.getStationId(),
                        "stationNm", station.getStationNm(),
                        "cityCode", station.getCityCode(),
                        "gpsX", station.getGpsX(),
                        "gpsY", station.getGpsY(),
                        "upcomingArrivals", upcomingArrivals.stream()
                            .map(prediction -> Map.of(
                                "routeId", prediction.getRouteId(),
                                "routeNm", prediction.getRouteNm(),
                                "estimatedArrivalTime", prediction.getEstimatedArrivalTime(),
                                "estimatedMinutes", prediction.getEstimatedArrivalMinutes(),
                                "confidence", prediction.getConfidence()
                            ))
                            .collect(Collectors.toList()),
                        "totalUpcoming", upcomingArrivals.size()
                    ));
                }
            }
            
            return Map.of(
                "totalStationsWithArrivals", stationsWithArrivals.size(),
                "stations", stationsWithArrivals,
                "timestamp", new java.util.Date(),
                "message", String.format("도착 예정 버스가 있는 정류장 %d개를 찾았습니다.", stationsWithArrivals.size())
            );
            
        } catch (Exception e) {
            return Map.of(
                "error", "정류장 조회 중 오류가 발생했습니다: " + e.getMessage(),
                "totalStationsWithArrivals", 0,
                "stations", List.of()
            );
        }
    }
    
    // 도착 예정 버스가 있는 정류장만 조회 (간단 버전 - 성능 최적화)
    @GetMapping("/with-arrivals/simple")
    public Map<String, Object> getStationsWithArrivalsSimple() {
        try {
            // 모든 정류장 조회
            List<BusStation> allStations = busStationService.getAllStations();
            List<Map<String, Object>> stationsWithArrivals = new ArrayList<>();
            
            // 각 정류장별로 도착 예정 버스 확인 (최대 100개 정류장만 체크)
            int checkedCount = 0;
            int maxCheckCount = 100;
            
            for (BusStation station : allStations) {
                if (checkedCount >= maxCheckCount) break;
                
                List<BusArrivalPrediction> predictions = busArrivalPredictionService.predictArrivalsForStation(station.getStationId());
                
                // 10분 이내 도착 예정 버스만 필터링
                long tenMinutesFromNow = System.currentTimeMillis() + (10 * 60 * 1000);
                List<BusArrivalPrediction> upcomingArrivals = predictions.stream()
                    .filter(prediction -> prediction.getEstimatedArrivalTime() != null && 
                                        prediction.getEstimatedArrivalTime().getTime() <= tenMinutesFromNow)
                    .collect(Collectors.toList());
                
                // 도착 예정 버스가 있는 경우만 추가
                if (!upcomingArrivals.isEmpty()) {
                    stationsWithArrivals.add(Map.of(
                        "stationId", station.getStationId(),
                        "stationNm", station.getStationNm(),
                        "cityCode", station.getCityCode(),
                        "totalUpcoming", upcomingArrivals.size(),
                        "nextArrivalMinutes", upcomingArrivals.stream()
                            .mapToInt(BusArrivalPrediction::getEstimatedArrivalMinutes)
                            .min()
                            .orElse(0)
                    ));
                }
                
                checkedCount++;
            }
            
            return Map.of(
                "totalStationsWithArrivals", stationsWithArrivals.size(),
                "checkedStations", checkedCount,
                "stations", stationsWithArrivals,
                "timestamp", new java.util.Date(),
                "message", String.format("검사한 정류장 %d개 중 도착 예정 버스가 있는 정류장 %d개를 찾았습니다.", 
                    checkedCount, stationsWithArrivals.size())
            );
            
        } catch (Exception e) {
            return Map.of(
                "error", "정류장 조회 중 오류가 발생했습니다: " + e.getMessage(),
                "totalStationsWithArrivals", 0,
                "stations", List.of()
            );
        }
    }
    
    // 도시별로 도착 예정 버스가 있는 정류장 조회
    @GetMapping("/with-arrivals/city/{cityCode}")
    public Map<String, Object> getStationsWithArrivalsByCity(@PathVariable String cityCode) {
        try {
            // 해당 도시의 정류장들 조회
            List<BusStation> cityStations = busStationService.getStationsByCity(cityCode);
            List<Map<String, Object>> stationsWithArrivals = new ArrayList<>();
            
            // 각 정류장별로 도착 예정 버스 확인
            for (BusStation station : cityStations) {
                List<BusArrivalPrediction> predictions = busArrivalPredictionService.predictArrivalsForStation(station.getStationId());
                
                // 10분 이내 도착 예정 버스만 필터링
                long tenMinutesFromNow = System.currentTimeMillis() + (10 * 60 * 1000);
                List<BusArrivalPrediction> upcomingArrivals = predictions.stream()
                    .filter(prediction -> prediction.getEstimatedArrivalTime() != null && 
                                        prediction.getEstimatedArrivalTime().getTime() <= tenMinutesFromNow)
                    .collect(Collectors.toList());
                
                // 도착 예정 버스가 있는 경우만 추가
                if (!upcomingArrivals.isEmpty()) {
                    stationsWithArrivals.add(Map.of(
                        "stationId", station.getStationId(),
                        "stationNm", station.getStationNm(),
                        "gpsX", station.getGpsX(),
                        "gpsY", station.getGpsY(),
                        "upcomingArrivals", upcomingArrivals.stream()
                            .map(prediction -> Map.of(
                                "routeId", prediction.getRouteId(),
                                "routeNm", prediction.getRouteNm(),
                                "estimatedArrivalTime", prediction.getEstimatedArrivalTime(),
                                "estimatedMinutes", prediction.getEstimatedArrivalMinutes(),
                                "confidence", prediction.getConfidence()
                            ))
                            .collect(Collectors.toList()),
                        "totalUpcoming", upcomingArrivals.size()
                    ));
                }
            }
            
            return Map.of(
                "cityCode", cityCode,
                "totalStationsWithArrivals", stationsWithArrivals.size(),
                "stations", stationsWithArrivals,
                "timestamp", new java.util.Date(),
                "message", String.format("도시 %s에서 도착 예정 버스가 있는 정류장 %d개를 찾았습니다.", 
                    cityCode, stationsWithArrivals.size())
            );
            
        } catch (Exception e) {
            return Map.of(
                "error", "정류장 조회 중 오류가 발생했습니다: " + e.getMessage(),
                "cityCode", cityCode,
                "totalStationsWithArrivals", 0,
                "stations", List.of()
            );
        }
    }
} 