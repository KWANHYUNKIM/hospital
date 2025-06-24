package com.bippobippo.hospital.scheduler.bus;

import com.bippobippo.hospital.model.bus.BusLocation;
import com.bippobippo.hospital.model.bus.BusRoute;
import com.bippobippo.hospital.service.bus.BusLocationService;
import com.bippobippo.hospital.service.bus.BusRouteService;
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
public class BusLocationScheduler {
    private final BusLocationService busLocationService;
    private final BusRouteService busRouteService;

    @Value("${bus.api.serviceKey}")
    private String serviceKey;
    
    @Value("${bus.api.cities}")
    private String cities;

    // 5분마다 실행 (전국 버스 위치 수집)
    @Scheduled(fixedRate = 300000)
    public void fetchAllBusLocations() {
        log.info("전국 버스 위치 수집 시작");
        
        // MongoDB에서 모든 노선 조회
        List<BusRoute> allRoutes = busRouteService.getAllRoutes();
        log.info("총 {}개의 노선에서 버스 위치 수집 시작", allRoutes.size());
        
        // 노선별로 버스 위치 수집 (처음 50개만 테스트)
        int count = 0;
        for (BusRoute route : allRoutes) {
            if (count >= 50) break; // 테스트용으로 50개만
            
            try {
                fetchBusLocationsByRoute(route);
                Thread.sleep(300); // API 호출 간격 조절
                count++;
            } catch (Exception e) {
                log.error("노선 {} 버스 위치 수집 실패", route.getRouteId(), e);
            }
        }
        
        log.info("전국 버스 위치 수집 완료 (처리된 노선: {})", count);
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
            }
            
            if (!locations.isEmpty()) {
                busLocationService.saveAll(locations);
                log.debug("노선 {} ({}) 버스 위치 {}건 저장", 
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