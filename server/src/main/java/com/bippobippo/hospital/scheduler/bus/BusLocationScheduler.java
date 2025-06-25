package com.bippobippo.hospital.scheduler.bus;

import com.bippobippo.hospital.model.bus.BusLocation;
import com.bippobippo.hospital.model.bus.BusRoute;
import com.bippobippo.hospital.service.bus.BusLocationService;
import com.bippobippo.hospital.service.bus.BusRouteService;
import com.bippobippo.hospital.service.bus.BusLocationKafkaProducer;
import com.bippobippo.hospital.service.bus.BusRouteTrackingService;
import com.bippobippo.hospital.websocket.BusLocationWebSocketHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Node;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class BusLocationScheduler {
    private final BusLocationService busLocationService;
    private final BusRouteService busRouteService;
    private final BusLocationKafkaProducer kafkaProducer;
    private final BusLocationWebSocketHandler webSocketHandler;
    private final BusRouteTrackingService busRouteTrackingService;

    @Value("${bus.api.serviceKey}")
    private String serviceKey;
    
    @Value("${bus.api.cities}")
    private String cities;

    // 병렬 처리를 위한 스레드 풀 설정
    private final ExecutorService executorService = Executors.newFixedThreadPool(5);
    
    // 배치 처리를 위한 메서드 추가
    private void fetchBusLocationsByBatch(List<BusRoute> routes, int batchSize) {
        List<List<BusRoute>> batches = new ArrayList<>();
        for (int i = 0; i < routes.size(); i += batchSize) {
            batches.add(routes.subList(i, Math.min(i + batchSize, routes.size())));
        }
        
        AtomicInteger totalSuccess = new AtomicInteger(0);
        AtomicInteger totalError = new AtomicInteger(0);
        
        for (List<BusRoute> batch : batches) {
            List<Future<Void>> batchFutures = new ArrayList<>();
            
            for (BusRoute route : batch) {
                Future<Void> future = executorService.submit(() -> {
                    try {
                        fetchBusLocationsByRoute(route);
                        totalSuccess.incrementAndGet();
                    } catch (Exception e) {
                        log.error("노선 {} 버스 위치 수집 실패", route.getRouteId(), e);
                        totalError.incrementAndGet();
                    }
                    return null;
                });
                batchFutures.add(future);
            }
            
            // 배치 완료 대기
            for (Future<Void> future : batchFutures) {
                try {
                    future.get(60, TimeUnit.SECONDS); // 60초 타임아웃
                } catch (TimeoutException e) {
                    log.warn("배치 처리 타임아웃");
                } catch (Exception e) {
                    log.error("배치 처리 실패", e);
                }
            }
            
            log.info("배치 처리 완료 - 성공: {}, 실패: {}", totalSuccess.get(), totalError.get());
            
            // API 호출 제한을 피하기 위한 지연 (배치 간 2초 대기)
            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }

    // 2분마다 실행 (API 제한 회피를 위해 주기 늘림)
    @Scheduled(fixedRate = 120000)
    public void fetchAllBusLocations() {
        log.info("전국 버스 위치 수집 시작");
        fetchAllBusLocationsInternal();
    }
    
    // 테스트용 - 즉시 실행 가능
    public void fetchAllBusLocationsNow() {
        log.info("전국 버스 위치 즉시 수집 시작");
        fetchAllBusLocationsInternal();
    }
    
    private void fetchAllBusLocationsInternal() {
        // MongoDB에서 모든 노선 조회
        List<BusRoute> allRoutes = busRouteService.getAllRoutes();
        log.info("총 {}개의 노선에서 버스 위치 수집 시작", allRoutes.size());
        
        // 도시별 노선 분포 확인
        Map<String, Long> totalCityDistribution = allRoutes.stream()
            .collect(Collectors.groupingBy(BusRoute::getCityCode, Collectors.counting()));
        log.info("전체 노선의 도시별 분포: {}", totalCityDistribution);
        
        // 다양한 도시의 노선을 골고루 선택
        List<BusRoute> routesToProcess = selectDiverseRoutes(allRoutes, 200);
        
        // 선택된 노선의 도시별 분포 로깅
        Map<String, Long> selectedCityDistribution = routesToProcess.stream()
            .collect(Collectors.groupingBy(BusRoute::getCityCode, Collectors.counting()));
        log.info("선택된 노선의 도시별 분포: {}", selectedCityDistribution);
        
        // 배치 크기 설정 (한 번에 처리할 노선 수)
        int batchSize = 20;
        
        // 배치 처리 실행
        fetchBusLocationsByBatch(routesToProcess, batchSize);
        
        log.info("전국 버스 위치 수집 완료 (처리된 노선: {})", routesToProcess.size());
    }
    
    // 다양한 도시의 노선을 선택하는 메서드
    private List<BusRoute> selectDiverseRoutes(List<BusRoute> allRoutes, int maxRoutes) {
        // 도시별로 노선을 그룹화
        Map<String, List<BusRoute>> routesByCity = allRoutes.stream()
            .collect(Collectors.groupingBy(BusRoute::getCityCode));
        
        List<BusRoute> selectedRoutes = new ArrayList<>();
        
        // 각 도시에서 비례적으로 노선 선택
        for (Map.Entry<String, List<BusRoute>> entry : routesByCity.entrySet()) {
            String cityCode = entry.getKey();
            List<BusRoute> cityRoutes = entry.getValue();
            
            // 각 도시에서 최대 20개 노선 선택 (도시별 균등 분배)
            int routesToSelect = Math.min(20, cityRoutes.size());
            List<BusRoute> selectedCityRoutes = cityRoutes.subList(0, routesToSelect);
            selectedRoutes.addAll(selectedCityRoutes);
            
            log.debug("도시 {}에서 {}개 노선 선택", cityCode, routesToSelect);
        }
        
        // 최대 개수로 제한
        if (selectedRoutes.size() > maxRoutes) {
            selectedRoutes = selectedRoutes.subList(0, maxRoutes);
        }
        
        return selectedRoutes;
    }

    private void fetchBusLocationsByRoute(BusRoute route) {
        try {
            String urlString = "http://apis.data.go.kr/1613000/BusLcInfoInqireService/getRouteAcctoBusLcList"
                + "?serviceKey=" + serviceKey
                + "&cityCode=" + route.getCityCode()
                + "&routeId=" + route.getRouteId()
                + "&numOfRows=100"
                + "&pageNo=1"
                + "&_type=xml";
                
            URL url = new URL(urlString);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Accept", "application/xml");
            connection.setConnectTimeout(5000); // 5초 연결 타임아웃
            connection.setReadTimeout(10000);   // 10초 읽기 타임아웃
            
            StringBuilder response = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(connection.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
            }
            
            String xml = response.toString();
            
            // 에러 응답 체크
            if (xml.contains("SERVICE_KEY_IS_NOT_REGISTERED_ERROR") || 
                xml.contains("SERVICE ERROR")) {
                log.warn("노선 {} API 호출 실패: {}", route.getRouteId(), xml);
                return;
            }
            
            List<BusLocation> locations = new ArrayList<>();
            Document doc = DocumentHelper.parseText(xml);
            List<Node> items = doc.selectNodes("//item");
            
            for (Node item : items) {
                BusLocation loc = BusLocation.builder()
                    .cityCode(route.getCityCode())
                    .routeId(route.getRouteId())
                    .routeNm(route.getRouteNo()) // routeNo를 routeNm으로 사용
                    .vehicleNo(getText(item, "vehicleno"))
                    .nodeId(getText(item, "nodeid"))
                    .nodeNm(getText(item, "nodenm"))
                    .gpsLat(parseDouble(getText(item, "gpslati")))
                    .gpsLong(parseDouble(getText(item, "gpslong")))
                    .updatedAt(new Date())
                    .build();
                locations.add(loc);
                
                // 버스 운행 추적 시스템 연동
                try {
                    // 새로운 버스 운행 시작 또는 기존 운행 추적
                    busRouteTrackingService.startNewRouteTracking(loc, route.getRouteNo());
                    
                    // 정류장 방문 기록 추가 (nodeId가 있으면)
                    if (loc.getNodeId() != null && !loc.getNodeId().isEmpty()) {
                        busRouteTrackingService.addStationVisit(
                            loc.getVehicleNo(),
                            loc.getNodeId(),
                            loc.getNodeNm(),
                            0, // TODO: 실제 정류장 순서 조회
                            loc.getGpsLat(),
                            loc.getGpsLong()
                        );
                    }
                } catch (Exception e) {
                    log.error("버스 {} 운행 추적 실패: {}", loc.getVehicleNo(), e.getMessage());
                }
            }
            
            if (!locations.isEmpty()) {
                // Kafka로 원본 데이터 전송 (비동기 처리)
                kafkaProducer.sendBusLocationBatch(route.getRouteId(), locations);
                
                log.debug("노선 {} ({}) 버스 위치 {}건 Kafka 전송 완료", 
                    route.getRouteId(), route.getRouteNo(), locations.size());
            }
            
        } catch (Exception e) {
            log.error("노선 {} 버스 위치 수집 중 오류", route.getRouteId(), e);
        }
    }

    private String getText(Node node, String tag) {
        Node n = node.selectSingleNode(tag);
        return n != null ? n.getText() : null;
    }
    
    private double parseDouble(String s) {
        try { return s == null ? 0 : Double.parseDouble(s); } catch (Exception e) { return 0; }
    }
} 