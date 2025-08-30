package com.bippobippo.hospital.service.bus;

import com.bippobippo.hospital.model.bus.BusLocation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusLocationProcessingService {
    
    private final BusLocationService busLocationService;
    // private final BusLocationKafkaProducer kafkaProducer;
    
    // 노선별 버스 위치 집계
    public Map<String, Object> aggregateBusLocationsByRoute(String routeId) {
        List<BusLocation> locations = busLocationService.getBusLocations(routeId);
        
        Map<String, Object> aggregation = new HashMap<>();
        aggregation.put("routeId", routeId);
        aggregation.put("totalBuses", locations.size());
        aggregation.put("timestamp", new Date());
        
        if (!locations.isEmpty()) {
            // 평균 위치 계산
            double avgLat = locations.stream()
                .mapToDouble(BusLocation::getGpsLat)
                .average()
                .orElse(0.0);
            
            double avgLong = locations.stream()
                .mapToDouble(BusLocation::getGpsLong)
                .average()
                .orElse(0.0);
            
            aggregation.put("averageLatitude", avgLat);
            aggregation.put("averageLongitude", avgLong);
            
            // 정류장별 버스 수 집계
            Map<String, Long> stationBusCount = locations.stream()
                .collect(Collectors.groupingBy(
                    loc -> loc.getNodeNm() == null ? "UNKNOWN" : loc.getNodeNm(),
                    Collectors.counting()
                ));
            aggregation.put("stationBusCount", stationBusCount);
        }
        
        return aggregation;
    }
    
    // 도시별 버스 위치 집계
    public Map<String, Object> aggregateBusLocationsByCity(String cityCode) {
        List<BusLocation> locations = busLocationService.getBusLocationsByCity(cityCode);
        
        Map<String, Object> aggregation = new HashMap<>();
        aggregation.put("cityCode", cityCode);
        aggregation.put("totalBuses", locations.size());
        aggregation.put("timestamp", new Date());
        
        if (!locations.isEmpty()) {
            // 노선별 버스 수 집계
            Map<String, Long> routeBusCount = locations.stream()
                .collect(Collectors.groupingBy(
                    BusLocation::getRouteId,
                    Collectors.counting()
                ));
            aggregation.put("routeBusCount", routeBusCount);
            
            // 전체 평균 위치 계산
            double avgLat = locations.stream()
                .mapToDouble(BusLocation::getGpsLat)
                .average()
                .orElse(0.0);
            
            double avgLong = locations.stream()
                .mapToDouble(BusLocation::getGpsLong)
                .average()
                .orElse(0.0);
            
            aggregation.put("averageLatitude", avgLat);
            aggregation.put("averageLongitude", avgLong);
        }
        
        return aggregation;
    }
    
    // 버스 도착 예측 (간단한 예측 모델)
    public Map<String, Object> predictBusArrival(String routeId, String stationId) {
        List<BusLocation> locations = busLocationService.getBusLocations(routeId);
        
        Map<String, Object> prediction = new HashMap<>();
        prediction.put("routeId", routeId);
        prediction.put("stationId", stationId);
        prediction.put("timestamp", new Date());
        
        // 해당 정류장으로 가는 버스들 필터링
        List<BusLocation> approachingBuses = locations.stream()
            .filter(loc -> loc.getNodeId().equals(stationId))
            .collect(Collectors.toList());
        
        prediction.put("approachingBuses", approachingBuses.size());
        
        if (!approachingBuses.isEmpty()) {
            // 가장 가까운 버스 찾기 (간단한 예측)
            BusLocation nearestBus = approachingBuses.stream()
                .min(Comparator.comparing(loc -> 
                    Math.abs(loc.getGpsLat()) + Math.abs(loc.getGpsLong())))
                .orElse(null);
            
            if (nearestBus != null) {
                prediction.put("nearestBusVehicleNo", nearestBus.getVehicleNo());
                prediction.put("estimatedArrivalMinutes", calculateEstimatedArrival(nearestBus));
            }
        }
        
        return prediction;
    }
    
    // 간단한 도착 시간 예측 (실제로는 더 복잡한 알고리즘 필요)
    private int calculateEstimatedArrival(BusLocation busLocation) {
        // 간단한 예측: 현재 위치와 정류장 거리에 따른 예상 시간
        // 실제로는 교통 상황, 시간대, 과거 데이터 등을 고려해야 함
        return new Random().nextInt(10) + 1; // 1-10분 랜덤
    }
    
    // 실시간 통계 생성 및 Kafka로 전송
    public void generateAndSendRealTimeStats() {
        try {
            // 전체 버스 위치 통계
            List<BusLocation> allLocations = busLocationService.getAllBusLocations();
            
            Map<String, Object> realTimeStats = new HashMap<>();
            realTimeStats.put("totalActiveBuses", allLocations.size());
            realTimeStats.put("timestamp", new Date());
            
            // 도시별 통계
            Map<String, Long> cityStats = allLocations.stream()
                .collect(Collectors.groupingBy(
                    loc -> loc.getCityCode() == null ? "UNKNOWN" : loc.getCityCode(),
                    Collectors.counting()
                ));
            realTimeStats.put("cityStats", cityStats);
            
            // Kafka로 실시간 통계 전송 - 주석처리
            // kafkaProducer.sendProcessedBusLocation(realTimeStats);
            
            log.info("실시간 통계 생성 완료: {}개 버스 (Kafka 전송 비활성화)", allLocations.size());
            
        } catch (Exception e) {
            log.error("실시간 통계 생성 실패: {}", e.getMessage(), e);
        }
    }
} 