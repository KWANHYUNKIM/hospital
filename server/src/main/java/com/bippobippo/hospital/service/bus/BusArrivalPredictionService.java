package com.bippobippo.hospital.service.bus;

import com.bippobippo.hospital.model.bus.BusArrivalPrediction;
import com.bippobippo.hospital.model.bus.BusLocation;
import com.bippobippo.hospital.model.bus.BusStation;
import com.bippobippo.hospital.model.bus.BusRouteStation;
import com.bippobippo.hospital.model.bus.BusStationRoute;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusArrivalPredictionService {
    
    private final BusLocationService busLocationService;
    private final BusStationService busStationService;
    private final BusRouteService busRouteService;
    private final BusRouteStationService busRouteStationService;
    private final BusStationRouteService busStationRouteService;
    
    // 정류장별 버스 도착 예측
    public List<BusArrivalPrediction> predictArrivalsForStation(String stationId) {
        List<BusArrivalPrediction> predictions = new ArrayList<>();
        
        try {
            // 1. 해당 정류장 정보 조회
            BusStation station = busStationService.getStationById(stationId);
            if (station == null) {
                log.warn("정류장 정보를 찾을 수 없습니다: {}", stationId);
                return predictions;
            }
            
            log.debug("정류장 정보 조회 성공: {} ({})", station.getStationNm(), stationId);
            
            // 2. 새로운 BusStationRoute 데이터에서 정차 버스 정보 조회 (우선)
            Optional<BusStationRoute> stationRoute = busStationRouteService.getByStationId(stationId);
            
            if (stationRoute.isPresent()) {
                log.debug("BusStationRoute에서 정류장 {} 정차 버스 {}개 발견", stationId, stationRoute.get().getRoutes().size());
                
                // 3. 각 노선별로 버스 위치 조회 및 도착 예측
                for (BusStationRoute.RouteInfo routeInfo : stationRoute.get().getRoutes()) {
                    String routeId = routeInfo.getRouteId();
                    
                    // 해당 노선의 버스 위치 조회
                    List<BusLocation> routeBusLocations = busLocationService.getBusLocations(routeId);
                    
                    if (routeBusLocations.isEmpty()) {
                        log.debug("노선 {}에 운행 중인 버스가 없습니다.", routeId);
                        continue;
                    }
                    
                    log.debug("노선 {}에 {}개 버스 운행 중", routeId, routeBusLocations.size());
                    
                    // 4. 각 버스별로 도착 시간 예측
                    for (BusLocation busLocation : routeBusLocations) {
                        BusArrivalPrediction prediction = predictArrivalForBusWithRouteInfo(
                            busLocation, station, routeInfo);
                        if (prediction != null) {
                            predictions.add(prediction);
                        }
                    }
                }
                
                // 5. 도착 시간순으로 정렬
                predictions.sort(Comparator.comparing(BusArrivalPrediction::getEstimatedArrivalMinutes));
                
                log.info("정류장 {} 도착 예측 완료: {}개 버스 (BusStationRoute 기반)", 
                    stationId, predictions.size());
                
                return predictions;
            }
            
            // 3. 기존 BusRouteStation 데이터로 대체 (백업)
            log.debug("BusStationRoute 데이터가 없어 기존 BusRouteStation 데이터 사용");
            List<BusRouteStation> routeStations = busRouteStationService.getRoutesByStation(stationId);
            
            // 디버깅을 위한 상세 정보 로깅
            log.debug("정류장 {} 경유 노선 조회 결과: {}개", stationId, routeStations.size());
            
            if (routeStations.isEmpty()) {
                // 대안: 정류장명으로 검색해보기
                log.debug("정류장 {}을 경유하는 노선이 없습니다. 정류장명으로 재검색 시도...", stationId);
                
                // 정류장명으로 노선 검색 시도
                List<BusRouteStation> alternativeRouteStations = busRouteStationService.getRoutesByStationName(station.getStationNm());
                if (!alternativeRouteStations.isEmpty()) {
                    log.info("정류장명으로 {}개 노선 발견: {}", alternativeRouteStations.size(), station.getStationNm());
                    routeStations = alternativeRouteStations;
                } else {
                    log.debug("정류장명으로도 노선을 찾을 수 없습니다: {}", station.getStationNm());
                    
                    // 추가 디버깅: 전체 노선과 정류장 데이터 상태 확인
                    long totalRoutes = busRouteService.getRouteCount();
                    long totalStations = busStationService.getStationCount();
                    long totalRouteStations = busRouteStationService.getRouteStationCount();
                    
                    log.info("데이터베이스 상태 - 노선: {}개, 정류장: {}개, 노선별정류장: {}개", 
                        totalRoutes, totalStations, totalRouteStations);
                    
                    return predictions;
                }
            }
            
            log.debug("정류장 {}을 경유하는 {}개 노선 발견", stationId, routeStations.size());
            
            // 3. 각 노선별로 버스 위치 조회 및 도착 예측
            for (BusRouteStation routeStation : routeStations) {
                String routeId = routeStation.getRouteId();
                
                // 해당 노선의 버스 위치 조회
                List<BusLocation> routeBusLocations = busLocationService.getBusLocations(routeId);
                
                if (routeBusLocations.isEmpty()) {
                    log.debug("노선 {}에 운행 중인 버스가 없습니다.", routeId);
                    continue;
                }
                
                log.debug("노선 {}에 {}개 버스 운행 중", routeId, routeBusLocations.size());
                
                // 4. 각 버스별로 도착 시간 예측
                for (BusLocation busLocation : routeBusLocations) {
                    BusArrivalPrediction prediction = predictArrivalForBus(
                        busLocation, station, routeStation);
                    if (prediction != null) {
                        predictions.add(prediction);
                    }
                }
            }
            
            // 5. 도착 시간순으로 정렬
            predictions.sort(Comparator.comparing(BusArrivalPrediction::getEstimatedArrivalMinutes));
            
            log.info("정류장 {} 도착 예측 완료: {}개 버스 (기존 BusRouteStation 기반)", 
                stationId, predictions.size());
            
        } catch (Exception e) {
            log.error("정류장 도착 예측 실패: {}", e.getMessage(), e);
        }
        
        return predictions;
    }
    
    // 특정 버스의 도착 시간 예측 (BusStationRoute.RouteInfo 사용)
    private BusArrivalPrediction predictArrivalForBusWithRouteInfo(BusLocation busLocation, BusStation station, BusStationRoute.RouteInfo routeInfo) {
        try {
            // 1. 버스의 현재 위치와 목표 정류장의 순서 비교
            int busCurrentSeq = getBusCurrentStationSeq(busLocation, routeInfo.getRouteId());
            int targetStationSeq = routeInfo.getStationSeq();
            
            // 버스가 이미 목표 정류장을 지났으면 예측하지 않음
            if (busCurrentSeq >= targetStationSeq) {
                log.debug("버스 {}가 이미 정류장 {}을 지남 (현재: {}, 목표: {})", 
                    busLocation.getVehicleNo(), station.getStationNm(), busCurrentSeq, targetStationSeq);
                return null;
            }
            
            // 2. 경로상 거리 계산 (순서 기반)
            double routeDistanceKm = calculateRouteDistance(busLocation, station, routeInfo.getRouteId());
            
            // 거리가 너무 멀면 제외 (10km까지 허용 - 순서 기반이므로 더 넓게)
            if (routeDistanceKm > 10.0) {
                log.debug("버스 {}와 정류장 {} 간 거리가 너무 멀음: {}km", 
                    busLocation.getVehicleNo(), station.getStationNm(), routeDistanceKm);
                return null;
            }
            
            // 3. 정류장 간 평균 소요 시간 계산
            int estimatedMinutes = calculateEstimatedTimeByStations(busCurrentSeq, targetStationSeq, routeInfo.getRouteId());
            
            // 4. 시간대별 보정
            double timeFactor = calculateTimeFactor();
            estimatedMinutes = (int) Math.round(estimatedMinutes * timeFactor);
            
            // 5. 교통 상황 반영
            double trafficFactor = calculateTrafficFactor();
            estimatedMinutes = (int) Math.round(estimatedMinutes * trafficFactor);
            
            // 6. 예측 신뢰도 계산
            double confidence = calculateConfidenceBySequence(busCurrentSeq, targetStationSeq, routeDistanceKm);
            
            // 7. 예측 결과 생성
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.MINUTE, estimatedMinutes);
            
            return BusArrivalPrediction.builder()
                .routeId(busLocation.getRouteId())
                .routeNm(busLocation.getRouteNm())
                .stationId(station.getStationId())
                .stationNm(station.getStationNm())
                .stationSeq(routeInfo.getStationSeq())
                .vehicleNo(busLocation.getVehicleNo())
                .currentLat(busLocation.getGpsLat())
                .currentLong(busLocation.getGpsLong())
                .stationLat(Double.parseDouble(station.getGpsY()))
                .stationLong(Double.parseDouble(station.getGpsX()))
                .estimatedArrivalMinutes(estimatedMinutes)
                .distanceKm(routeDistanceKm)
                .speedKmh(calculateAverageSpeedByRoute(routeInfo.getRouteId()))
                .trafficCondition(getTrafficCondition(trafficFactor))
                .weatherCondition("맑음") // 실제로는 외부 API 연동 필요
                .dayOfWeek(cal.get(Calendar.DAY_OF_WEEK))
                .hourOfDay(cal.get(Calendar.HOUR_OF_DAY))
                .predictedAt(new Date())
                .estimatedArrivalTime(cal.getTime())
                .confidence(confidence)
                .factors(Arrays.asList("정류장순서", "경로거리", "평균소요시간", "교통상황", "시간대"))
                .build();
                
        } catch (Exception e) {
            log.error("버스 도착 예측 실패: {}", e.getMessage(), e);
            return null;
        }
    }
    
    // 특정 버스의 도착 시간 예측 (기존 BusRouteStation 사용)
    private BusArrivalPrediction predictArrivalForBus(BusLocation busLocation, BusStation station, BusRouteStation routeStation) {
        try {
            // 1. 버스의 현재 위치와 목표 정류장의 순서 비교
            int busCurrentSeq = getBusCurrentStationSeq(busLocation, routeStation.getRouteId());
            int targetStationSeq = routeStation.getStationSeq();
            
            // 버스가 이미 목표 정류장을 지났으면 예측하지 않음
            if (busCurrentSeq >= targetStationSeq) {
                log.debug("버스 {}가 이미 정류장 {}을 지남 (현재: {}, 목표: {})", 
                    busLocation.getVehicleNo(), station.getStationNm(), busCurrentSeq, targetStationSeq);
                return null;
            }
            
            // 2. 경로상 거리 계산 (순서 기반)
            double routeDistanceKm = calculateRouteDistance(busLocation, station, routeStation.getRouteId());
            
            // 거리가 너무 멀면 제외 (10km까지 허용 - 순서 기반이므로 더 넓게)
            if (routeDistanceKm > 10.0) {
                log.debug("버스 {}와 정류장 {} 간 거리가 너무 멀음: {}km", 
                    busLocation.getVehicleNo(), station.getStationNm(), routeDistanceKm);
                return null;
            }
            
            // 3. 정류장 간 평균 소요 시간 계산
            int estimatedMinutes = calculateEstimatedTimeByStations(busCurrentSeq, targetStationSeq, routeStation.getRouteId());
            
            // 4. 시간대별 보정
            double timeFactor = calculateTimeFactor();
            estimatedMinutes = (int) Math.round(estimatedMinutes * timeFactor);
            
            // 5. 교통 상황 반영
            double trafficFactor = calculateTrafficFactor();
            estimatedMinutes = (int) Math.round(estimatedMinutes * trafficFactor);
            
            // 6. 예측 신뢰도 계산
            double confidence = calculateConfidenceBySequence(busCurrentSeq, targetStationSeq, routeDistanceKm);
            
            // 7. 예측 결과 생성
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.MINUTE, estimatedMinutes);
            
            return BusArrivalPrediction.builder()
                .routeId(busLocation.getRouteId())
                .routeNm(busLocation.getRouteNm())
                .stationId(station.getStationId())
                .stationNm(station.getStationNm())
                .stationSeq(routeStation.getStationSeq())
                .vehicleNo(busLocation.getVehicleNo())
                .currentLat(busLocation.getGpsLat())
                .currentLong(busLocation.getGpsLong())
                .stationLat(Double.parseDouble(station.getGpsY()))
                .stationLong(Double.parseDouble(station.getGpsX()))
                .estimatedArrivalMinutes(estimatedMinutes)
                .distanceKm(routeDistanceKm)
                .speedKmh(calculateAverageSpeedByRoute(routeStation.getRouteId()))
                .trafficCondition(getTrafficCondition(trafficFactor))
                .weatherCondition("맑음") // 실제로는 외부 API 연동 필요
                .dayOfWeek(cal.get(Calendar.DAY_OF_WEEK))
                .hourOfDay(cal.get(Calendar.HOUR_OF_DAY))
                .predictedAt(new Date())
                .estimatedArrivalTime(cal.getTime())
                .confidence(confidence)
                .factors(Arrays.asList("정류장순서", "경로거리", "평균소요시간", "교통상황", "시간대"))
                .build();
                
        } catch (Exception e) {
            log.error("버스 도착 예측 실패: {}", e.getMessage(), e);
            return null;
        }
    }
    
    // 버스의 현재 정류장 순서 추정
    private int getBusCurrentStationSeq(BusLocation busLocation, String routeId) {
        try {
            // 해당 노선의 모든 정류장 정보 조회
            List<BusRouteStation> routeStations = busRouteStationService.getStationsByRoute(routeId);
            
            // 버스 위치와 가장 가까운 정류장 찾기
            double minDistance = Double.MAX_VALUE;
            int closestSeq = 1;
            
            for (BusRouteStation routeStation : routeStations) {
                double distance = calculateDistance(
                    busLocation.getGpsLat(), busLocation.getGpsLong(),
                    Double.parseDouble(routeStation.getGpsY()), Double.parseDouble(routeStation.getGpsX())
                );
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestSeq = routeStation.getStationSeq();
                }
            }
            
            return closestSeq;
            
        } catch (Exception e) {
            log.error("버스 현재 정류장 순서 추정 실패: {}", e.getMessage());
            return 1; // 기본값
        }
    }
    
    // 경로상 거리 계산 (정류장 순서 기반)
    private double calculateRouteDistance(BusLocation busLocation, BusStation targetStation, String routeId) {
        try {
            List<BusRouteStation> routeStations = busRouteStationService.getStationsByRoute(routeId);
            
            // 버스 현재 위치와 가장 가까운 정류장 찾기
            int busCurrentSeq = getBusCurrentStationSeq(busLocation, routeId);
            int targetStationSeq = routeStations.stream()
                .filter(rs -> rs.getStationId().equals(targetStation.getStationId()))
                .mapToInt(BusRouteStation::getStationSeq)
                .findFirst()
                .orElse(1);
            
            // 경로상 거리 계산 (정류장 간 거리 누적)
            double totalDistance = 0.0;
            for (int i = busCurrentSeq; i < targetStationSeq; i++) {
                final int currentSeq = i;
                BusRouteStation current = routeStations.stream()
                    .filter(rs -> rs.getStationSeq() == currentSeq)
                    .findFirst()
                    .orElse(null);
                    
                final int nextSeq = i + 1;
                BusRouteStation next = routeStations.stream()
                    .filter(rs -> rs.getStationSeq() == nextSeq)
                    .findFirst()
                    .orElse(null);
                    
                if (current != null && next != null) {
                    totalDistance += calculateDistance(
                        Double.parseDouble(current.getGpsY()), Double.parseDouble(current.getGpsX()),
                        Double.parseDouble(next.getGpsY()), Double.parseDouble(next.getGpsX())
                    );
                }
            }
            
            return totalDistance;
            
        } catch (Exception e) {
            log.error("경로상 거리 계산 실패: {}", e.getMessage());
            // 대체 방법: 직선 거리 계산
            return calculateDistance(
                busLocation.getGpsLat(), busLocation.getGpsLong(),
                Double.parseDouble(targetStation.getGpsY()), Double.parseDouble(targetStation.getGpsX())
            );
        }
    }
    
    // 정류장 간 평균 소요 시간 계산
    private int calculateEstimatedTimeByStations(int currentSeq, int targetSeq, String routeId) {
        try {
            // 정류장 간 평균 소요 시간 (분)
            int stationsBetween = targetSeq - currentSeq;
            
            // 기본 정류장 간 소요 시간 (평균 3분)
            int baseTimePerStation = 3;
            
            // 시간대별 조정
            Calendar cal = Calendar.getInstance();
            int hour = cal.get(Calendar.HOUR_OF_DAY);
            
            if (hour >= 7 && hour <= 9) {
                baseTimePerStation = 4; // 출근 시간 (더 오래 걸림)
            } else if (hour >= 17 && hour <= 19) {
                baseTimePerStation = 4; // 퇴근 시간 (더 오래 걸림)
            } else if (hour >= 22 || hour <= 6) {
                baseTimePerStation = 2; // 심야 시간 (빠름)
            }
            
            return stationsBetween * baseTimePerStation;
            
        } catch (Exception e) {
            log.error("정류장 간 소요 시간 계산 실패: {}", e.getMessage());
            return (targetSeq - currentSeq) * 3; // 기본값
        }
    }
    
    // 노선별 평균 속도 계산
    private double calculateAverageSpeedByRoute(String routeId) {
        // 기본 평균 속도 (시내버스 기준)
        double baseSpeed = 25.0; // km/h
        
        // 시간대별 속도 조정
        Calendar cal = Calendar.getInstance();
        int hour = cal.get(Calendar.HOUR_OF_DAY);
        
        if (hour >= 7 && hour <= 9) {
            baseSpeed *= 0.7; // 출근 시간 (30% 감소)
        } else if (hour >= 17 && hour <= 19) {
            baseSpeed *= 0.7; // 퇴근 시간 (30% 감소)
        } else if (hour >= 22 || hour <= 6) {
            baseSpeed *= 1.2; // 심야 시간 (20% 증가)
        }
        
        return baseSpeed;
    }
    
    // 순서 기반 신뢰도 계산
    private double calculateConfidenceBySequence(int currentSeq, int targetSeq, double distanceKm) {
        double confidence = 0.8; // 기본 신뢰도
        
        // 정류장 간격이 적을수록 신뢰도 높음
        int stationGap = targetSeq - currentSeq;
        if (stationGap <= 3) {
            confidence += 0.1;
        } else if (stationGap > 10) {
            confidence -= 0.2;
        }
        
        // 거리가 가까울수록 신뢰도 높음
        if (distanceKm < 2.0) {
            confidence += 0.1;
        } else if (distanceKm > 8.0) {
            confidence -= 0.2;
        }
        
        return Math.min(confidence, 1.0);
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
    
    // 평균 속도 계산 (노선별, 시간대별)
    private double calculateAverageSpeed(BusLocation busLocation, BusStation station) {
        // 기본 평균 속도 (시내버스 기준)
        double baseSpeed = 25.0; // km/h
        
        // 시간대별 속도 조정
        Calendar cal = Calendar.getInstance();
        int hour = cal.get(Calendar.HOUR_OF_DAY);
        
        if (hour >= 7 && hour <= 9) {
            baseSpeed *= 0.7; // 출근 시간 (30% 감소)
        } else if (hour >= 17 && hour <= 19) {
            baseSpeed *= 0.7; // 퇴근 시간 (30% 감소)
        } else if (hour >= 22 || hour <= 6) {
            baseSpeed *= 1.2; // 심야 시간 (20% 증가)
        }
        
        return baseSpeed;
    }
    
    // 교통 상황 팩터 계산
    private double calculateTrafficFactor() {
        Calendar cal = Calendar.getInstance();
        int hour = cal.get(Calendar.HOUR_OF_DAY);
        int dayOfWeek = cal.get(Calendar.DAY_OF_WEEK);
        
        // 주말 vs 평일
        if (dayOfWeek == Calendar.SATURDAY || dayOfWeek == Calendar.SUNDAY) {
            return 1.1; // 주말은 교통량 적음
        }
        
        // 시간대별 교통 상황
        if (hour >= 7 && hour <= 9) {
            return 0.7; // 출근 시간 (혼잡)
        } else if (hour >= 17 && hour <= 19) {
            return 0.7; // 퇴근 시간 (혼잡)
        } else if (hour >= 10 && hour <= 16) {
            return 0.9; // 오전/오후 (보통)
        } else {
            return 1.1; // 심야 (원활)
        }
    }
    
    // 날씨 팩터 계산
    private double calculateWeatherFactor() {
        // 실제로는 기상청 API 연동 필요
        // 현재는 기본값 반환
        return 1.0;
    }
    
    // 시간대별 팩터 계산
    private double calculateTimeFactor() {
        Calendar cal = Calendar.getInstance();
        int hour = cal.get(Calendar.HOUR_OF_DAY);
        
        // 시간대별 혼잡도
        if (hour >= 6 && hour <= 8) {
            return 0.8; // 출근 시간
        } else if (hour >= 18 && hour <= 20) {
            return 0.8; // 퇴근 시간
        } else if (hour >= 22 || hour <= 5) {
            return 1.2; // 심야 시간
        } else {
            return 1.0; // 일반 시간
        }
    }
    
    // 교통 상황 문자열 반환
    private String getTrafficCondition(double trafficFactor) {
        if (trafficFactor < 0.8) {
            return "혼잡";
        } else if (trafficFactor > 1.1) {
            return "원활";
        } else {
            return "정상";
        }
    }
    
    // 노선별 도착 예측
    public List<BusArrivalPrediction> predictArrivalsForRoute(String routeId) {
        List<BusArrivalPrediction> predictions = new ArrayList<>();
        
        try {
            // 해당 노선의 모든 버스 위치 조회
            List<BusLocation> routeLocations = busLocationService.getBusLocations(routeId);
            
            // 각 버스별로 모든 정류장 도착 시간 예측
            for (BusLocation busLocation : routeLocations) {
                // TODO: 노선의 모든 정류장 정보를 조회하여 각 정류장별 도착 시간 예측
                // 현재는 간단히 현재 정류장만 예측
            }
            
        } catch (Exception e) {
            log.error("노선 도착 예측 실패: {}", e.getMessage(), e);
        }
        
        return predictions;
    }
} 