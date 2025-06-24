package com.bippobippo.hospital.scheduler.bus;

import com.bippobippo.hospital.model.bus.BusRoute;
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
public class BusRouteCollector {
    private final BusRouteService busRouteService;

    @Value("${bus.api.serviceKey}")
    private String serviceKey;
    
    @Value("${bus.api.cities}")
    private String cities;

    // 하루에 한 번 실행 (새벽 3시)
    @Scheduled(cron = "0 0 3 * * ?")
    public void collectAllBusRoutes() {
        log.info("전국 버스 노선 정보 수집 시작");
        collectAllBusRoutesInternal();
    }

    // 테스트용 - 즉시 실행 가능
    public void collectAllBusRoutesNow() {
        log.info("전국 버스 노선 정보 즉시 수집 시작");
        collectAllBusRoutesInternal();
    }

    private void collectAllBusRoutesInternal() {
        busRouteService.deleteAll();
        log.info("기존 노선 정보 삭제 완료");
        List<City> cityList = fetchAllCities();
        for (City city : cityList) {
            try {
                collectBusRoutesByCity(city.getCityCode());
                Thread.sleep(1000); // API 호출 간격 조절
            } catch (Exception e) {
                log.error("도시 {} 버스 노선 수집 실패", city.getCityCode(), e);
            }
        }
        log.info("전국 버스 노선 정보 수집 완료");
    }

    private void collectBusRoutesByCity(String cityCode) {
        try {
            int pageNo = 1;
            int totalCount = 0;
            
            do {
                String urlString = "http://apis.data.go.kr/1613000/BusRouteInfoInqireService/getRouteNoList"
                    + "?serviceKey=" + serviceKey
                    + "&cityCode=" + cityCode
                    + "&numOfRows=100"
                    + "&pageNo=" + pageNo
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
                    log.warn("도시 {} API 호출 실패: {}", cityCode, xml);
                    return;
                }
                
                Document doc = DocumentHelper.parseText(xml);
                
                // 전체 개수 확인
                Node totalCountNode = doc.selectSingleNode("//totalCount");
                if (totalCountNode != null && totalCount == 0) {
                    totalCount = Integer.parseInt(totalCountNode.getText());
                    log.info("도시 {} 총 버스 노선 수: {}", cityCode, totalCount);
                }
                
                // 노선 정보 파싱
                List<Node> items = doc.selectNodes("//item");
                List<BusRoute> routes = new ArrayList<>();
                
                for (Node item : items) {
                    BusRoute route = BusRoute.builder()
                        .cityCode(cityCode)
                        .routeId(getText(item, "routeid"))
                        .routeNo(getText(item, "routeno"))
                        .routeTp(getText(item, "routetype"))
                        .updatedAt(new Date())
                        .build();
                    routes.add(route);
                }
                
                if (!routes.isEmpty()) {
                    busRouteService.saveAll(routes);
                    log.info("도시 {} 페이지 {} 노선 {}건 저장", cityCode, pageNo, routes.size());
                }
                
                pageNo++;
                
            } while (pageNo <= Math.ceil(totalCount / 100.0));
            
        } catch (Exception e) {
            log.error("도시 {} 버스 노선 수집 중 오류", cityCode, e);
        }
    }

    private String getText(Node node, String tag) {
        Node n = node.selectSingleNode(tag);
        return n != null ? n.getText() : null;
    }

    // 도시코드+도시명 DTO
    @lombok.Data
    @lombok.AllArgsConstructor
    private static class City {
        private String cityCode;
        private String cityName;
    }

    // 도시코드 목록을 공공데이터포털 API에서 동적으로 가져오기
    private List<City> fetchAllCities() {
        List<City> cities = new ArrayList<>();
        try {
            String urlString = "http://apis.data.go.kr/1613000/BusRouteInfoInqireService/getCtyCodeList"
                + "?serviceKey=" + serviceKey
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
            String text = response.toString();
            log.info("도시코드 API 응답: {}", text);
            
            // 응답이 "00NORMAL SERVICE.12세종특별시21부산광역시..." 형태
            // 정규식으로 도시코드와 도시명을 추출
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(\\d{2,5})([가-힣]+(?:시|군|도|특별시|광역시))");
            java.util.regex.Matcher matcher = pattern.matcher(text);
            
            while (matcher.find()) {
                String cityCode = matcher.group(1);
                String cityName = matcher.group(2);
                cities.add(new City(cityCode, cityName));
                log.debug("도시 추가: {} - {}", cityCode, cityName);
            }
            
            log.info("총 {}개의 도시코드를 수집했습니다.", cities.size());
            
        } catch (Exception e) {
            log.error("도시코드 목록 동적 수집 실패", e);
        }
        return cities;
    }
} 