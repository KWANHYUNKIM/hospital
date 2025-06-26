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
import org.springframework.scheduling.annotation.Async;

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
    
    // API 호출 제한 관리 설정
    @Value("${api.rate-limit.batch-size:5}")
    private int batchSize;
    
    @Value("${api.rate-limit.delay-between-batches:3000}")
    private int delayBetweenBatches;
    
    @Value("${api.rate-limit.delay-after-rate-limit:15000}")
    private int delayAfterRateLimit;
    
    @Value("${api.rate-limit.max-rate-limit-retries:3}")
    private int maxRateLimitRetries;
    
    @Value("${api.rate-limit.delay-between-requests:200}")
    private int delayBetweenRequests;
    
    @Value("${api.rate-limit.max-rate-limit-count:3}")
    private int maxRateLimitCount;
    
    @Value("${api.rate-limit.extended-wait-time:60000}")
    private int extendedWaitTime;
    
    // 시간대별 API 호출 제한 관리
    private int getTimeBasedDelay() {
        int hour = java.time.LocalTime.now().getHour();
        
        // 새벽 시간대 (0-6시): 더 빠른 처리
        if (hour >= 0 && hour < 6) {
            return delayBetweenRequests / 2;
        }
        // 출근 시간대 (7-9시): 더 느린 처리
        else if (hour >= 7 && hour < 10) {
            return delayBetweenRequests * 2;
        }
        // 퇴근 시간대 (17-19시): 더 느린 처리
        else if (hour >= 17 && hour < 20) {
            return delayBetweenRequests * 2;
        }
        // 일반 시간대: 기본 설정 사용
        else {
            return delayBetweenRequests;
        }
    }
    
    // API 호출 제한 후 지능적인 대기 시간 계산
    private int getRateLimitDelay(int retryCount) {
        int baseDelay = delayAfterRateLimit;
        
        // 재시도 횟수에 따라 지수적 증가 (1, 2, 4배)
        int multiplier = (int) Math.pow(2, retryCount - 1);
        
        // 최대 5분까지만 대기
        int maxDelay = 300000; // 5분
        int calculatedDelay = baseDelay * multiplier;
        
        return Math.min(calculatedDelay, maxDelay);
    }
    
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
    
    // 배치 처리로 모든 노선의 버스 위치 수집
    @Async
    public void fetchAllBusLocationsNow() {
        log.info("전국 버스 위치 수집 시작");
        
        try {
            List<BusRoute> allRoutes = busRouteService.getAllRoutes();
            log.info("총 {}개 노선에 대해 버스 위치 수집 시작", allRoutes.size());
            
            // API 호출 제한 관리를 위한 변수들
            int successCount = 0;
            int failureCount = 0;
            int rateLimitCount = 0;
            
            for (int i = 0; i < allRoutes.size(); i += batchSize) {
                int endIndex = Math.min(i + batchSize, allRoutes.size());
                List<BusRoute> batch = allRoutes.subList(i, endIndex);
                
                log.info("배치 처리 중: {}/{} (노선 {}개)", endIndex, allRoutes.size(), batch.size());
                
                for (BusRoute route : batch) {
                    int retryCount = 0;
                    boolean processed = false;
                    
                    while (!processed && retryCount < maxRateLimitRetries) {
                        try {
                            // API 호출 제한 체크
                            if (rateLimitCount > maxRateLimitCount) {
                                log.warn("API 호출 제한이 많이 발생했습니다. {}초 대기 후 재시도합니다.", extendedWaitTime / 1000);
                                Thread.sleep(extendedWaitTime); // 설정된 시간만큼 대기
                                rateLimitCount = 0; // 카운터 리셋
                            }
                            
                            fetchBusLocationsByRoute(route);
                            successCount++;
                            processed = true;
                            
                            // 각 노선 처리 후 짧은 대기 (API 호출 제한 방지)
                            Thread.sleep(getTimeBasedDelay());
                            
                        } catch (InterruptedException e) {
                            log.error("버스 위치 수집이 중단되었습니다: {}", e.getMessage());
                            Thread.currentThread().interrupt();
                            return;
                        } catch (Exception e) {
                            String errorMsg = e.getMessage();
                            
                            // API 호출 제한 오류 감지
                            if (errorMsg != null && errorMsg.contains("LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR")) {
                                rateLimitCount++;
                                retryCount++;
                                log.warn("노선 {} API 호출 제한 발생 ({}번째, 재시도 {}/{}). 잠시 대기합니다.", 
                                    route.getRouteId(), rateLimitCount, retryCount, maxRateLimitRetries);
                                
                                try {
                                    Thread.sleep(getRateLimitDelay(retryCount)); // 재시도할수록 더 오래 대기
                                } catch (InterruptedException ie) {
                                    Thread.currentThread().interrupt();
                                    return;
                                }
                            } else {
                                log.error("노선 {} 버스 위치 수집 실패: {}", route.getRouteId(), errorMsg);
                                failureCount++;
                                processed = true; // 다른 오류는 재시도하지 않음
                            }
                        }
                    }
                    
                    // 최대 재시도 횟수를 초과한 경우
                    if (!processed) {
                        log.error("노선 {} 최대 재시도 횟수 초과로 처리 중단", route.getRouteId());
                        failureCount++;
                    }
                }
                
                // 배치 처리 후 대기 (API 호출 제한 방지)
                if (endIndex < allRoutes.size()) {
                    try {
                        log.info("배치 완료. {}초 대기 후 다음 배치 처리...", delayBetweenBatches / 1000);
                        Thread.sleep(delayBetweenBatches);
                    } catch (InterruptedException e) {
                        log.error("배치 처리 대기 중 중단되었습니다: {}", e.getMessage());
                        Thread.currentThread().interrupt();
                        return;
                    }
                }
            }
            
            log.info("전국 버스 위치 수집 완료 - 성공: {}, 실패: {}, 호출 제한: {}회", 
                successCount, failureCount, rateLimitCount);
            
        } catch (Exception e) {
            log.error("전국 버스 위치 수집 중 오류 발생: {}", e.getMessage(), e);
        }
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
                    
                    // GPS 기반 정류장 방문 감지 (개선된 방식)
                    busRouteTrackingService.detectStationVisitByGPS(
                        loc.getVehicleNo(),
                        loc.getGpsLat(),
                        loc.getGpsLong(),
                        loc.getRouteId()
                    );
                    
                    // 기존 방식 (nodeId 기반)도 유지 (백업용)
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