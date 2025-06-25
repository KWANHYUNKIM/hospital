package com.bippobippo.hospital.service.bus;

import com.bippobippo.hospital.model.bus.*;
import com.bippobippo.hospital.repository.bus.BusRouteTrackingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusRouteTrackingService {
    
    private final BusRouteTrackingRepository repository;
    private final BusRouteStationService busRouteStationService;
    private final BusStationService busStationService;
    
    // 새로운 버스 운행 시작
    public BusRouteTracking startNewRouteTracking(BusLocation busLocation, String routeNo) {
        try {
            // 기존 운행 중인 같은 버스가 있는지 확인
            Optional<BusRouteTracking> existingTracking = repository.findByVehicleNoAndIsActiveTrue(busLocation.getVehicleNo());
            if (existingTracking.isPresent()) {
                log.debug("버스 {}는 이미 운행 중입니다.", busLocation.getVehicleNo());
                return existingTracking.get();
            }
            
            // 새로운 운행 기록 생성
            BusRouteTracking tracking = BusRouteTracking.builder()
                .routeId(busLocation.getRouteId())
                .routeNo(routeNo)
                .vehicleNo(busLocation.getVehicleNo())
                .cityCode(busLocation.getCityCode())
                .startTime(new Date())
                .isActive(true)
                .stationVisits(new ArrayList<>())
                .predictions(new ArrayList<>())
                .createdAt(new Date())
                .updatedAt(new Date())
                .build();
            
            BusRouteTracking saved = repository.save(tracking);
            log.info("버스 {} 새로운 운행 시작: 노선 {}", busLocation.getVehicleNo(), routeNo);
            return saved;
            
        } catch (Exception e) {
            log.error("버스 운행 시작 실패: {}", e.getMessage(), e);
            return null;
        }
    }
    
    // 정류장 방문 기록 추가 (중복 방지)
    public boolean addStationVisit(String vehicleNo, String stationId, String stationNm, int stationSeq, 
                                 double gpsLat, double gpsLong) {
        try {
            Optional<BusRouteTracking> trackingOpt = repository.findByVehicleNoAndIsActiveTrue(vehicleNo);
            if (trackingOpt.isEmpty()) {
                log.warn("버스 {}의 활성 운행 기록을 찾을 수 없습니다.", vehicleNo);
                return false;
            }
            
            BusRouteTracking tracking = trackingOpt.get();
            
            // 이미 방문한 정류장인지 확인
            boolean alreadyVisited = tracking.getStationVisits().stream()
                .anyMatch(visit -> visit.getStationId().equals(stationId));
            
            if (alreadyVisited) {
                log.debug("버스 {}가 이미 정류장 {}을 방문했습니다.", vehicleNo, stationNm);
                return false;
            }
            
            // 새로운 정류장 방문 기록 추가
            BusRouteTracking.StationVisit visit = BusRouteTracking.StationVisit.builder()
                .stationId(stationId)
                .stationNm(stationNm)
                .stationSeq(stationSeq)
                .arrivalTime(new Date())
                .gpsLat(gpsLat)
                .gpsLong(gpsLong)
                .delayMinutes(0) // TODO: 실제 지연 시간 계산
                .build();
            
            tracking.getStationVisits().add(visit);
            tracking.setUpdatedAt(new Date());
            
            // 통계 정보 업데이트
            updateTrackingStatistics(tracking);
            
            repository.save(tracking);
            log.debug("버스 {} 정류장 {} 방문 기록 추가", vehicleNo, stationNm);
            return true;
            
        } catch (Exception e) {
            log.error("정류장 방문 기록 추가 실패: {}", e.getMessage(), e);
            return false;
        }
    }
    
    // 도착 예측 기록 추가 (중복 방지)
    public boolean addArrivalPrediction(String vehicleNo, BusArrivalPrediction prediction) {
        try {
            Optional<BusRouteTracking> trackingOpt = repository.findByVehicleNoAndIsActiveTrue(vehicleNo);
            if (trackingOpt.isEmpty()) {
                log.warn("버스 {}의 활성 운행 기록을 찾을 수 없습니다.", vehicleNo);
                return false;
            }
            
            BusRouteTracking tracking = trackingOpt.get();
            
            // 같은 정류장에 대한 최근 예측이 있는지 확인 (5분 이내)
            Date fiveMinutesAgo = new Date(System.currentTimeMillis() - 5 * 60 * 1000);
            boolean recentPredictionExists = tracking.getPredictions().stream()
                .anyMatch(p -> p.getStationId().equals(prediction.getStationId()) && 
                              p.getPredictedAt().after(fiveMinutesAgo));
            
            if (recentPredictionExists) {
                log.debug("버스 {} 정류장 {}에 대한 최근 예측이 이미 존재합니다.", vehicleNo, prediction.getStationNm());
                return false;
            }
            
            // 새로운 도착 예측 기록 추가
            BusRouteTracking.ArrivalPrediction newPrediction = BusRouteTracking.ArrivalPrediction.builder()
                .stationId(prediction.getStationId())
                .stationNm(prediction.getStationNm())
                .stationSeq(prediction.getStationSeq())
                .predictedAt(prediction.getPredictedAt())
                .estimatedArrival(prediction.getEstimatedArrivalTime())
                .predictedMinutes(prediction.getEstimatedArrivalMinutes())
                .confidence(prediction.getConfidence())
                .factors(String.join(",", prediction.getFactors()))
                .build();
            
            tracking.getPredictions().add(newPrediction);
            tracking.setUpdatedAt(new Date());
            
            repository.save(tracking);
            log.debug("버스 {} 정류장 {} 도착 예측 기록 추가", vehicleNo, prediction.getStationNm());
            return true;
            
        } catch (Exception e) {
            log.error("도착 예측 기록 추가 실패: {}", e.getMessage(), e);
            return false;
        }
    }
    
    // 실제 도착 시간 업데이트 (예측 정확도 계산)
    public boolean updateActualArrival(String vehicleNo, String stationId, Date actualArrivalTime) {
        try {
            Optional<BusRouteTracking> trackingOpt = repository.findByVehicleNoAndIsActiveTrue(vehicleNo);
            if (trackingOpt.isEmpty()) {
                return false;
            }
            
            BusRouteTracking tracking = trackingOpt.get();
            
            // 해당 정류장의 최근 예측 찾기
            Optional<BusRouteTracking.ArrivalPrediction> predictionOpt = tracking.getPredictions().stream()
                .filter(p -> p.getStationId().equals(stationId) && p.getActualArrival() == null)
                .max(Comparator.comparing(BusRouteTracking.ArrivalPrediction::getPredictedAt));
            
            if (predictionOpt.isPresent()) {
                BusRouteTracking.ArrivalPrediction prediction = predictionOpt.get();
                prediction.setActualArrival(actualArrivalTime);
                
                // 실제 소요 시간 계산
                long actualMinutes = (actualArrivalTime.getTime() - prediction.getPredictedAt().getTime()) / (1000 * 60);
                prediction.setActualMinutes((int) actualMinutes);
                
                // 예측 정확도 계산
                int timeDiff = Math.abs(prediction.getPredictedMinutes() - prediction.getActualMinutes());
                double accuracy = Math.max(0, 1.0 - (timeDiff / 10.0)); // 10분 차이를 0% 정확도로 설정
                prediction.setAccuracy(accuracy);
                
                tracking.setUpdatedAt(new Date());
                repository.save(tracking);
                
                log.debug("버스 {} 정류장 {} 실제 도착 시간 업데이트 (정확도: {}%)", 
                    vehicleNo, stationId, Math.round(accuracy * 100));
                return true;
            }
            
            return false;
            
        } catch (Exception e) {
            log.error("실제 도착 시간 업데이트 실패: {}", e.getMessage(), e);
            return false;
        }
    }
    
    // 운행 종료
    public boolean endRouteTracking(String vehicleNo) {
        try {
            Optional<BusRouteTracking> trackingOpt = repository.findByVehicleNoAndIsActiveTrue(vehicleNo);
            if (trackingOpt.isEmpty()) {
                log.warn("버스 {}의 활성 운행 기록을 찾을 수 없습니다.", vehicleNo);
                return false;
            }
            
            BusRouteTracking tracking = trackingOpt.get();
            tracking.setEndTime(new Date());
            tracking.setIsActive(false);
            tracking.setUpdatedAt(new Date());
            
            // 마지막 정류장 정보 설정
            if (!tracking.getStationVisits().isEmpty()) {
                BusRouteTracking.StationVisit lastVisit = tracking.getStationVisits().get(tracking.getStationVisits().size() - 1);
                tracking.setEndStationId(lastVisit.getStationId());
            }
            
            // 통계 정보 최종 업데이트
            updateTrackingStatistics(tracking);
            
            repository.save(tracking);
            log.info("버스 {} 운행 종료: 총 {}개 정류장 방문, {}km 운행", 
                vehicleNo, tracking.getTotalStations(), tracking.getTotalDistance());
            return true;
            
        } catch (Exception e) {
            log.error("운행 종료 실패: {}", e.getMessage(), e);
            return false;
        }
    }
    
    // 통계 정보 업데이트
    private void updateTrackingStatistics(BusRouteTracking tracking) {
        try {
            List<BusRouteTracking.StationVisit> visits = tracking.getStationVisits();
            
            // 총 정류장 수
            tracking.setTotalStations(visits.size());
            
            // 총 운행 거리 계산
            double totalDistance = 0.0;
            for (int i = 0; i < visits.size() - 1; i++) {
                BusRouteTracking.StationVisit current = visits.get(i);
                BusRouteTracking.StationVisit next = visits.get(i + 1);
                
                totalDistance += calculateDistance(
                    current.getGpsLat(), current.getGpsLong(),
                    next.getGpsLat(), next.getGpsLong()
                );
            }
            tracking.setTotalDistance(Math.round(totalDistance * 100.0) / 100.0);
            
            // 총 운행 시간 계산
            if (tracking.getStartTime() != null) {
                Date endTime = tracking.getEndTime() != null ? tracking.getEndTime() : new Date();
                long durationMs = endTime.getTime() - tracking.getStartTime().getTime();
                tracking.setTotalDuration((int) (durationMs / (1000 * 60))); // 분 단위
            }
            
            // 평균 속도 계산
            if (tracking.getTotalDuration() > 0) {
                double avgSpeed = (tracking.getTotalDistance() / tracking.getTotalDuration()) * 60; // km/h
                tracking.setAverageSpeed(Math.round(avgSpeed * 10.0) / 10.0);
            }
            
        } catch (Exception e) {
            log.error("통계 정보 업데이트 실패: {}", e.getMessage(), e);
        }
    }
    
    // 두 지점 간 거리 계산 (Haversine 공식)
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // 지구 반지름 (km)
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }
    
    // 특정 노선의 운행 중인 버스들 조회
    public List<BusRouteTracking> getActiveTrackingsByRoute(String routeId) {
        return repository.findByRouteIdAndIsActiveTrue(routeId);
    }
    
    // 특정 도시의 운행 중인 버스들 조회
    public List<BusRouteTracking> getActiveTrackingsByCity(String cityCode) {
        return repository.findByCityCodeAndIsActiveTrue(cityCode);
    }
    
    // 특정 버스의 운행 기록 조회
    public List<BusRouteTracking> getTrackingsByVehicle(String vehicleNo) {
        return repository.findByVehicleNoOrderByStartTimeDesc(vehicleNo);
    }
    
    // 운행 중인 버스 수 조회
    public long getActiveBusCount() {
        return repository.countByIsActiveTrue();
    }
    
    // 특정 노선의 운행 중인 버스 수 조회
    public long getActiveBusCountByRoute(String routeId) {
        return repository.countByRouteIdAndIsActiveTrue(routeId);
    }
    
    // 전체 운행 중인 버스들 조회
    public List<BusRouteTracking> getAllActiveTrackings() {
        return repository.findByIsActiveTrue();
    }
    
    // 도시별 운행 중인 버스 수 조회
    public Map<String, Object> getActiveBusCountByCity() {
        List<BusRouteTracking> allActive = repository.findByIsActiveTrue();
        
        // 도시별 버스 수 집계
        Map<String, Long> cityCounts = allActive.stream()
            .collect(Collectors.groupingBy(BusRouteTracking::getCityCode, Collectors.counting()));
        
        // 도시별 상세 통계
        Map<String, Map<String, Object>> cityStats = new HashMap<>();
        for (BusRouteTracking tracking : allActive) {
            String cityCode = tracking.getCityCode();
            cityStats.computeIfAbsent(cityCode, k -> {
                Map<String, Object> stats = new HashMap<>();
                stats.put("totalBuses", 0L);
                stats.put("totalStations", 0);
                stats.put("totalDistance", 0.0);
                stats.put("totalDuration", 0);
                return stats;
            });
            
            Map<String, Object> stats = cityStats.get(cityCode);
            stats.put("totalBuses", (Long) stats.get("totalBuses") + 1);
            stats.put("totalStations", (Integer) stats.get("totalStations") + tracking.getTotalStations());
            stats.put("totalDistance", (Double) stats.get("totalDistance") + tracking.getTotalDistance());
            stats.put("totalDuration", (Integer) stats.get("totalDuration") + tracking.getTotalDuration());
        }
        
        return Map.of(
            "totalActiveBuses", allActive.size(),
            "cityCounts", cityCounts,
            "cityStats", cityStats,
            "timestamp", new Date()
        );
    }
} 