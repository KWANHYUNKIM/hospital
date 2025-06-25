package com.bippobippo.hospital.controller.bus;

import com.bippobippo.hospital.model.bus.BusArrivalPrediction;
import com.bippobippo.hospital.service.bus.BusArrivalPredictionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@RestController
@RequestMapping("/api/bus/predictions")
@RequiredArgsConstructor
public class BusArrivalPredictionController {
    
    private final BusArrivalPredictionService predictionService;
    
    // 정류장별 버스 도착 예측
    @GetMapping("/station/{stationId}")
    public Map<String, Object> getArrivalPredictionsForStation(@PathVariable String stationId) {
        try {
            List<BusArrivalPrediction> predictions = predictionService.predictArrivalsForStation(stationId);
            
            return Map.of(
                "stationId", stationId,
                "predictions", predictions,
                "totalBuses", predictions.size(),
                "message", String.format("정류장 %s에 %d개 버스가 도착 예정입니다.", stationId, predictions.size())
            );
            
        } catch (Exception e) {
            log.error("정류장 도착 예측 API 오류: {}", e.getMessage(), e);
            return Map.of(
                "error", "도착 예측 중 오류가 발생했습니다: " + e.getMessage(),
                "stationId", stationId
            );
        }
    }
    
    // 노선별 버스 도착 예측
    @GetMapping("/route/{routeId}")
    public Map<String, Object> getArrivalPredictionsForRoute(@PathVariable String routeId) {
        try {
            List<BusArrivalPrediction> predictions = predictionService.predictArrivalsForRoute(routeId);
            
            return Map.of(
                "routeId", routeId,
                "predictions", predictions,
                "totalBuses", predictions.size(),
                "message", String.format("노선 %s에 %d개 버스가 운행 중입니다.", routeId, predictions.size())
            );
            
        } catch (Exception e) {
            log.error("노선 도착 예측 API 오류: {}", e.getMessage(), e);
            return Map.of(
                "error", "도착 예측 중 오류가 발생했습니다: " + e.getMessage(),
                "routeId", routeId
            );
        }
    }
    
    // 정류장별 실시간 도착 정보 (간단한 버전)
    @GetMapping("/station/{stationId}/simple")
    public Map<String, Object> getSimpleArrivalInfo(@PathVariable String stationId) {
        try {
            List<BusArrivalPrediction> predictions = predictionService.predictArrivalsForStation(stationId);
            
            // 간단한 정보만 반환 (5개까지만)
            List<Map<String, Object>> simplePredictions = predictions.stream()
                .limit(5)
                .map(pred -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("routeNm", pred.getRouteNm());
                    map.put("vehicleNo", pred.getVehicleNo());
                    map.put("estimatedArrivalMinutes", pred.getEstimatedArrivalMinutes());
                    map.put("distanceKm", Math.round(pred.getDistanceKm() * 100.0) / 100.0);
                    map.put("trafficCondition", pred.getTrafficCondition());
                    map.put("confidence", Math.round(pred.getConfidence() * 100.0) / 100.0);
                    return map;
                })
                .toList();
            
            return Map.of(
                "stationId", stationId,
                "arrivals", simplePredictions,
                "totalBuses", predictions.size(),
                "message", String.format("정류장 %s에 %d개 버스가 도착 예정입니다.", stationId, predictions.size())
            );
            
        } catch (Exception e) {
            log.error("간단한 도착 정보 API 오류: {}", e.getMessage(), e);
            return Map.of(
                "error", "도착 정보 조회 중 오류가 발생했습니다: " + e.getMessage(),
                "stationId", stationId
            );
        }
    }
} 