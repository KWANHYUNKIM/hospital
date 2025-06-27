package com.bippobippo.hospital.scheduler.bus;

import com.bippobippo.hospital.model.bus.BusRouteStation;
import com.bippobippo.hospital.model.bus.BusStationRoute;
import com.bippobippo.hospital.service.bus.BusRouteStationService;
import com.bippobippo.hospital.service.bus.BusStationRouteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class BusStationRouteCollector {
    
    private final BusRouteStationService busRouteStationService;
    private final BusStationRouteService busStationRouteService;
    
    // 하루에 한 번 실행 (새벽 5시)
    // @Scheduled(cron = "0 0 5 * * ?")
    public void generateStationRoutes() {
        log.info("정류장별 정차 버스 정보 생성 시작");
        generateStationRoutesInternal();
    }
    
    // 수동 실행용
    public void generateStationRoutesNow() {
        log.info("정류장별 정차 버스 정보 즉시 생성 시작");
        generateStationRoutesInternal();
    }
    
    private void generateStationRoutesInternal() {
        try {
            // 기존 데이터 삭제
            busStationRouteService.deleteAll();
            log.info("기존 정류장별 정차 버스 정보 삭제 완료");
            
            // 모든 노선별 정류장 데이터 조회
            List<BusRouteStation> allRouteStations = busRouteStationService.getAllRouteStations();
            log.info("총 {}개의 노선별 정류장 데이터에서 정류장별 정차 버스 정보 생성", allRouteStations.size());
            
            if (allRouteStations.isEmpty()) {
                log.warn("노선별 정류장 데이터가 없습니다. BusRouteStationCollector를 먼저 실행해주세요.");
                return;
            }
            
            // 정류장별로 그룹화
            Map<String, List<BusRouteStation>> stationsByStationId = allRouteStations.stream()
                .collect(Collectors.groupingBy(BusRouteStation::getStationId));
            
            log.info("총 {}개의 고유 정류장에서 정차 버스 정보 생성", stationsByStationId.size());
            
            int processedCount = 0;
            for (Map.Entry<String, List<BusRouteStation>> entry : stationsByStationId.entrySet()) {
                String stationId = entry.getKey();
                List<BusRouteStation> routeStations = entry.getValue();
                
                try {
                    generateStationRoute(stationId, routeStations);
                    processedCount++;
                    
                    if (processedCount % 1000 == 0) {
                        log.info("진행률: {}/{} ({}%)", processedCount, stationsByStationId.size(), 
                            (processedCount * 100) / stationsByStationId.size());
                    }
                    
                } catch (Exception e) {
                    log.error("정류장 {} 정차 버스 정보 생성 실패: {}", stationId, e.getMessage());
                }
            }
            
            long totalStations = busStationRouteService.getCount();
            log.info("정류장별 정차 버스 정보 생성 완료: 총 {}개 정류장", totalStations);
            
        } catch (Exception e) {
            log.error("정류장별 정차 버스 정보 생성 중 오류", e);
        }
    }
    
    private void generateStationRoute(String stationId, List<BusRouteStation> routeStations) {
        if (routeStations.isEmpty()) {
            return;
        }
        
        // 첫 번째 데이터로 정류장 기본 정보 설정
        BusRouteStation first = routeStations.get(0);
        String stationName = first.getStationNm();
        String cityCode = first.getCityCode();
        String gpsY = first.getGpsY();
        String gpsX = first.getGpsX();
        
        // 해당 정류장에 정차하는 노선들 정보 생성
        List<BusStationRoute.RouteInfo> routes = routeStations.stream()
            .map(this::convertToRouteInfo)
            .collect(Collectors.toList());
        
        // 정류장별 정차 버스 정보 저장
        busStationRouteService.updateStationRoutes(stationId, stationName, cityCode, gpsY, gpsX, routes);
    }
    
    private BusStationRoute.RouteInfo convertToRouteInfo(BusRouteStation routeStation) {
        return BusStationRoute.RouteInfo.builder()
            .routeId(routeStation.getRouteId())
            .routeNo(routeStation.getRouteNo())
            .routeNm(routeStation.getRouteNo()) // routeNo를 routeNm으로 사용
            .stationSeq(routeStation.getStationSeq())
            .direction(determineDirection(routeStation.getStationSeq()))
            .firstBusTime("05:00") // 기본값
            .lastBusTime("24:00")  // 기본값
            .interval(10)          // 기본 배차간격 10분
            .build();
    }
    
    private String determineDirection(int stationSeq) {
        // 간단한 로직: 순서가 작으면 상행, 크면 하행
        if (stationSeq <= 20) {
            return "상행";
        } else {
            return "하행";
        }
    }
} 