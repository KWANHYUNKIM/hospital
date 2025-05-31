package com.hospital.chat.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatUtil {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${openai.api.key}")
    private String openaiApiKey;

    @Value("${elasticsearch.url}")
    private String elasticsearchUrl;

    // 병원 검색 관련 키워드
    private static final List<String> HOSPITAL_KEYWORDS = Arrays.asList(
        "병원", "의원", "치과", "한의원", "내과", "외과", "소아과", "정형외과",
        "이비인후과", "안과", "피부과", "산부인과", "응급실", "야간", "주말",
        "진료", "검진", "처방", "처방전", "진단", "상담", "예약"
    );

    // 지역 키워드
    private static final List<String> REGION_KEYWORDS = Arrays.asList(
        "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
        "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
    );

    // 메시지가 병원 검색 관련인지 확인
    public boolean isHospitalSearch(String message) {
        return HOSPITAL_KEYWORDS.stream().anyMatch(keyword -> message.contains(keyword));
    }

    // 메시지에서 지역 추출
    public String extractRegion(String message) {
        return REGION_KEYWORDS.stream()
            .filter(region -> message.contains(region))
            .findFirst()
            .orElse(null);
    }

    // 두 지점 간의 거리 계산 (Haversine 공식)
    public double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371; // 지구의 반경 (km)
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // 지역 기반 병원 검색
    public String searchHospitalsByRegion(String message, String region) {
        try {
            // Elasticsearch 검색
            String searchUrl = elasticsearchUrl + "/hospitals/_search";
            String searchQuery = String.format("""
                {
                    "query": {
                        "term": {
                            "region.keyword": "%s"
                        }
                    },
                    "size": 5,
                    "sort": [
                        { "_score": { "order": "desc" } }
                    ]
                }
                """, region);

            String response = restTemplate.postForObject(searchUrl, searchQuery, String.class);
            List<Object> hospitals = extractHospitalsFromResponse(response);

            // OpenAI API 호출
            String openaiResponse = callOpenAI(message, region, hospitals);

            return createRegionSearchResponse(region, openaiResponse);
        } catch (Exception e) {
            log.error("지역 기반 병원 검색 오류:", e);
            return createErrorResponse();
        }
    }

    // 위치 기반 병원 검색
    public String searchHospitalsByLocation(String message, Double latitude, Double longitude) {
        try {
            // 검색어에서 키워드 추출
            List<String> keywords = Arrays.asList(message.toLowerCase().split(" "));
            List<String> departmentKeywords = Arrays.asList("내과", "외과", "소아과", "치과", "한의원", "정형외과", "이비인후과", "안과", "피부과", "산부인과");
            List<String> serviceKeywords = Arrays.asList("야간", "주말", "응급", "영업중");

            // 검색 조건 파싱
            double distance = keywords.contains("500미터") ? 0.5 :
                            keywords.contains("1킬로") ? 1 :
                            keywords.contains("2킬로") ? 2 :
                            keywords.contains("3킬로") ? 3 : 5;

            // Elasticsearch 검색
            String searchUrl = elasticsearchUrl + "/hospitals/_search";
            String searchQuery = String.format("""
                {
                    "query": {
                        "bool": {
                            "filter": [
                                {
                                    "geo_distance": {
                                        "distance": "%fkm",
                                        "location": {
                                            "lat": %f,
                                            "lon": %f
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    "size": 5,
                    "sort": [
                        {
                            "_geo_distance": {
                                "location": {
                                    "lat": %f,
                                    "lon": %f
                                },
                                "order": "asc",
                                "unit": "km"
                            }
                        }
                    ]
                }
                """, distance, latitude, longitude, latitude, longitude);

            String response = restTemplate.postForObject(searchUrl, searchQuery, String.class);
            List<Object> hospitals = extractHospitalsFromResponse(response);

            // OpenAI API 호출
            String openaiResponse = callOpenAI(message, null, hospitals);

            return createLocationSearchResponse(openaiResponse);
        } catch (Exception e) {
            log.error("위치 기반 병원 검색 오류:", e);
            return createErrorResponse();
        }
    }

    private List<Object> extractHospitalsFromResponse(String response) {
        // Elasticsearch 응답에서 병원 정보 추출
        // 실제 구현에서는 ObjectMapper를 사용하여 JSON 파싱
        return List.of(); // 임시 반환값
    }

    private String callOpenAI(String message, String region, List<Object> hospitals) {
        // OpenAI API 호출 구현
        // 실제 구현에서는 OpenAI API를 호출하여 응답 생성
        return ""; // 임시 반환값
    }

    private String createRegionSearchResponse(String region, String openaiResponse) {
        return String.format("""
            <div class="message bot">
                <div class="message-content" style="padding: 10px; border-radius: 8px; max-width: 80%%; word-break: break-word;">
                    <div class="answer-section">
                        <div class="answer-content">
                            <h2 class="answer-title">%s 지역 병원 검색 결과</h2>
                            <div class="search-result">
                                %s
                            </div>
                            <div class="notice-section">
                                <h4>안내사항</h4>
                                <ul>
                                    <li>응급실이 필요한 경우 119에 연락하세요.</li>
                                    <li>방문 전 전화 예약을 권장합니다.</li>
                                    <li>운영시간은 변경될 수 있으니 방문 전 확인하세요.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            """, region, openaiResponse);
    }

    private String createLocationSearchResponse(String openaiResponse) {
        return String.format("""
            <div class="message bot">
                <div class="message-content" style="padding: 10px; border-radius: 8px; max-width: 80%%; word-break: break-word;">
                    <div class="answer-section">
                        <div class="answer-content">
                            <h2 class="answer-title">내 주변 병원 검색 결과</h2>
                            <div class="search-result">
                                %s
                            </div>
                            <div class="notice-section">
                                <h4>안내사항</h4>
                                <ul>
                                    <li>응급실이 필요한 경우 119에 연락하세요.</li>
                                    <li>방문 전 전화 예약을 권장합니다.</li>
                                    <li>운영시간은 변경될 수 있으니 방문 전 확인하세요.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            """, openaiResponse);
    }

    private String createErrorResponse() {
        return """
            <div class="message bot">
                <div class="message-content" style="padding: 10px; border-radius: 8px; max-width: 80%; word-break: break-word;">
                    <div class="answer-section">
                        <div class="answer-content">
                            <p>죄송합니다. 병원 검색 중 오류가 발생했습니다.</p>
                        </div>
                    </div>
                </div>
            </div>
            """;
    }
} 