package com.bippobippo.hospital.scheduler.bus;

import com.bippobippo.hospital.model.bus.BusArrivalPrediction;
import com.bippobippo.hospital.service.bus.BusArrivalPredictionService;
import com.bippobippo.hospital.service.bus.BusStationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class BusArrivalPredictionScheduler {
    
    private final BusArrivalPredictionService predictionService;
    private final BusStationService busStationService;
    
    // 30초마다 정류장 도착 예측 업데이트 (실시간성 향상)
    @Scheduled(fixedRate = 30000)
    public void updateArrivalPredictions() {
        long startTime = System.currentTimeMillis();
        log.info("🚌 정류장 도착 예측 업데이트 시작 - {}", new java.util.Date());
        
        try {
            // MongoDB에서 모든 정류장 데이터 조회
            log.debug("📊 MongoDB에서 정류장 데이터 조회 시작");
            List<com.bippobippo.hospital.model.bus.BusStation> allStations = busStationService.getAllStations();
            log.info("📊 전체 정류장 {}개 조회 완료", allStations.size());
            
            // 실제 운행 중인 버스의 정류장만 필터링
            log.debug("🎯 실제 운행 중인 버스의 정류장 필터링 중...");
            List<com.bippobippo.hospital.model.bus.BusStation> activeStations = allStations.stream()
                .filter(station -> {
                    // 세종시(12) 정류장 우선 선택
                    if ("12".equals(station.getCityCode()) || "세종".equals(station.getCityName())) {
                        return true;
                    }
                    // 부산시(21) 정류장도 포함 (실제 운행 중인 버스가 있음)
                    if ("21".equals(station.getCityCode()) || "부산".equals(station.getCityName())) {
                        return true;
                    }
                    // 기타 도시는 제외 (실제 버스 운행이 없음)
                    return false;
                })
                .limit(30) // 실제 운행 중인 정류장 30개로 확장
                .toList();
            
            log.info("🎯 실제 운행 중인 정류장 필터링 완료: 전체 {}개 중 {}개 정류장 선택", 
                allStations.size(), activeStations.size());
            
            // 선택된 정류장 목록 출력
            log.info("📍 선택된 정류장 목록:");
            activeStations.forEach(station -> 
                log.info("   - {}: {} ({})", station.getStationId(), station.getStationNm(), station.getCityName())
            );
            
            int totalPredictions = 0;
            int processedStations = 0;
            
            for (com.bippobippo.hospital.model.bus.BusStation station : activeStations) {
                long stationStartTime = System.currentTimeMillis();
                processedStations++;
                
                log.debug("🔍 정류장 {} ({}) 도착 예측 처리 중... ({}/{})", 
                    station.getStationId(), station.getStationNm(), processedStations, activeStations.size());
                
                List<BusArrivalPrediction> predictions = 
                    predictionService.predictArrivalsForStation(station.getStationId());
                
                long stationEndTime = System.currentTimeMillis();
                totalPredictions += predictions.size();
                
                log.info("✅ 정류장 {} ({}) 완료: {}개 버스 예측, 처리시간: {}ms", 
                    station.getStationId(), station.getStationNm(), predictions.size(), 
                    stationEndTime - stationStartTime);
                
                // 예측 결과 상세 로그 (처음 3개만)
                if (!predictions.isEmpty()) {
                    log.info("   📋 예측 결과 (상위 3개):");
                    predictions.stream().limit(3).forEach(pred -> 
                        log.info("      - {}번 버스: {}분 후 도착 ({}km, 신뢰도: {})", 
                            pred.getRouteNm(), pred.getEstimatedArrivalMinutes(), 
                            Math.round(pred.getDistanceKm() * 100.0) / 100.0,
                            Math.round(pred.getConfidence() * 100.0) / 100.0)
                    );
                }
            }
            
            long endTime = System.currentTimeMillis();
            long totalTime = endTime - startTime;
            
            log.info("🎉 정류장 도착 예측 업데이트 완료!");
            log.info("📈 성능 요약:");
            log.info("   - 처리된 정류장: {}개", processedStations);
            log.info("   - 총 예측 수: {}개", totalPredictions);
            log.info("   - 평균 예측/정류장: {}개", activeStations.isEmpty() ? 0 : totalPredictions / activeStations.size());
            log.info("   - 총 처리시간: {}ms", totalTime);
            log.info("   - 평균 처리시간/정류장: {}ms", processedStations == 0 ? 0 : totalTime / processedStations);
            
        } catch (Exception e) {
            log.error("❌ 도착 예측 업데이트 스케줄러 오류: {}", e.getMessage(), e);
        }
    }
} 