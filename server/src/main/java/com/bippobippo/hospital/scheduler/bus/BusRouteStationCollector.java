package com.bippobippo.hospital.scheduler.bus;

import com.bippobippo.hospital.model.bus.BusRoute;
import com.bippobippo.hospital.model.bus.BusRouteStation;
import com.bippobippo.hospital.service.bus.BusRouteService;
import com.bippobippo.hospital.service.bus.BusRouteStationService;
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

@Slf4j
@Component
@RequiredArgsConstructor
public class BusRouteStationCollector {
    private final BusRouteService busRouteService;
    private final BusRouteStationService busRouteStationService;

    @Value("${bus.api.serviceKey}")
    private String serviceKey;

    // 하루에 한 번 실행 (새벽 4시)
    @Scheduled(cron = "0 0 4 * * ?")
    public void collectAllRouteStations() {
        log.info("전국 노선별 정류장 정보 수집 시작");
        collectAllRouteStationsInternal();
    }

    // 테스트용 - 즉시 실행 가능
    public void collectAllRouteStationsNow() {
        log.info("전국 노선별 정류장 정보 즉시 수집 시작");
        collectAllRouteStationsInternal();
    }

    private void collectAllRouteStationsInternal() {
        try {
            // 기존 데이터 삭제
            busRouteStationService.deleteAll();
            log.info("기존 노선별 정류장 정보 삭제 완료");

            // 모든 노선 조회
            List<BusRoute> allRoutes = busRouteService.getAllRoutes();
            log.info("총 {}개의 노선에서 정류장 정보 수집 시작", allRoutes.size());

            // 실제 운행 중인 노선만 필터링 (세종시, 부산시)
            List<BusRoute> activeRoutes = allRoutes.stream()
                .filter(route -> "12".equals(route.getCityCode()) || "21".equals(route.getCityCode()))
                .limit(100) // 테스트를 위해 100개로 제한
                .toList();

            log.info("실제 운행 중인 {}개 노선에서 정류장 정보 수집", activeRoutes.size());

            int processedCount = 0;
            for (BusRoute route : activeRoutes) {
                try {
                    collectRouteStations(route);
                    processedCount++;
                    
                    if (processedCount % 10 == 0) {
                        log.info("진행률: {}/{} ({}%)", processedCount, activeRoutes.size(), 
                            (processedCount * 100) / activeRoutes.size());
                    }
                    
                    // API 호출 간격 조절
                    Thread.sleep(500);
                    
                } catch (Exception e) {
                    log.error("노선 {} 정류장 정보 수집 실패: {}", route.getRouteId(), e.getMessage());
                }
            }

            long totalStations = busRouteStationService.getCount();
            log.info("전국 노선별 정류장 정보 수집 완료: 총 {}개 정류장 정보", totalStations);

        } catch (Exception e) {
            log.error("노선별 정류장 정보 수집 중 오류", e);
        }
    }

    private void collectRouteStations(BusRoute route) {
        try {
            String urlString = "http://apis.data.go.kr/1613000/BusRouteInfoInqireService/getRouteAcctoThrghSttnList"
                + "?serviceKey=" + serviceKey
                + "&cityCode=" + route.getCityCode()
                + "&routeId=" + route.getRouteId()
                + "&numOfRows=200"
                + "&pageNo=1"
                + "&_type=xml";

            URL url = new URL(urlString);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setRequestProperty("Accept", "application/xml");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(10000);

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
                log.warn("노선 {} 정류장 API 호출 실패: {}", route.getRouteId(), xml);
                return;
            }

            Document doc = DocumentHelper.parseText(xml);
            List<Node> items = doc.selectNodes("//item");
            List<BusRouteStation> routeStations = new ArrayList<>();

            for (Node item : items) {
                BusRouteStation routeStation = BusRouteStation.builder()
                    .routeId(route.getRouteId())
                    .routeNo(route.getRouteNo())
                    .cityCode(route.getCityCode())
                    .stationId(getText(item, "nodenm"))
                    .stationNm(getText(item, "nodenm"))
                    .stationNo(getText(item, "nodeno"))
                    .stationSeq(Integer.parseInt(getText(item, "nodeord")))
                    .gpsY(getText(item, "gpslati"))
                    .gpsX(getText(item, "gpslong"))
                    .updatedAt(new Date())
                    .build();
                routeStations.add(routeStation);
            }

            if (!routeStations.isEmpty()) {
                busRouteStationService.saveAll(routeStations);
                log.debug("노선 {} 정류장 {}개 저장 완료", route.getRouteId(), routeStations.size());
            } else {
                log.debug("노선 {} 정류장 데이터 없음", route.getRouteId());
            }

        } catch (Exception e) {
            log.error("노선 {} 정류장 정보 수집 중 오류", route.getRouteId(), e);
        }
    }

    private String getText(Node node, String tag) {
        Node n = node.selectSingleNode(tag);
        return n != null ? n.getText() : null;
    }
} 