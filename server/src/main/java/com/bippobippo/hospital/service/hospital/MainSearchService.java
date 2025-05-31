package com.bippobippo.hospital.service.hospital;

import com.bippobippo.hospital.dto.request.search.MainSearchRequest;
import com.bippobippo.hospital.dto.response.search.MainSearchResponse;
import lombok.RequiredArgsConstructor;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.common.geo.GeoDistance;
import org.elasticsearch.common.unit.DistanceUnit;
import org.elasticsearch.common.unit.Fuzziness;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.sort.SortBuilders;
import org.elasticsearch.search.sort.SortOrder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MainSearchService {

    private final RestHighLevelClient client;
    private static final List<String> REGIONS = Arrays.asList(
        "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
        "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
    );

    public MainSearchResponse search(MainSearchRequest request) {
        try {
            String query = request.getQuery() != null ? request.getQuery().trim() : "";
            if (query.isEmpty()) {
                return MainSearchResponse.builder()
                    .hospital(new ArrayList<>())
                    .build();
            }

            // 지역명 추출
            String region = extractRegion(query);
            String searchQuery = query.replace(region != null ? region : "", "").trim();

            // 위치 유효성 검사
            boolean hasValidLocation = isValidLocation(request.getLatitude(), request.getLongitude());

            // 1) BoolQueryBuilder 구성
            BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();

            // — should 쿼리
            boolQuery.should(QueryBuilders.matchPhraseQuery("yadmNm", query).boost(20f));
            boolQuery.should(QueryBuilders.matchPhraseQuery("yadmNm", searchQuery).boost(15f));
            boolQuery.should(QueryBuilders.matchQuery("yadmNm", searchQuery)
                .fuzziness(Fuzziness.AUTO)
                .boost(7f));
            boolQuery.should(QueryBuilders.matchPhraseQuery("addr", searchQuery).boost(10f));
            boolQuery.should(QueryBuilders.matchQuery("addr", searchQuery)
                .fuzziness(Fuzziness.AUTO)
                .boost(5f));
            boolQuery.should(QueryBuilders.matchPhraseQuery("major", searchQuery).boost(8f));
            boolQuery.should(QueryBuilders.matchQuery("major", searchQuery)
                .fuzziness(Fuzziness.AUTO)
                .boost(4f));
            boolQuery.should(QueryBuilders.matchPhraseQuery("speciality", searchQuery).boost(6f));
            boolQuery.should(QueryBuilders.matchQuery("speciality", searchQuery)
                .fuzziness(Fuzziness.AUTO)
                .boost(3f));

            // — filter 쿼리
            if (region != null) {
                boolQuery.filter(QueryBuilders.matchQuery("region", region).boost(5f));
            }

            if (hasValidLocation) {
                boolQuery.filter(QueryBuilders.geoDistanceQuery("location")
                    .point(request.getLatitude(), request.getLongitude())
                    .distance("50km", DistanceUnit.KILOMETERS)
                    .geoDistance(GeoDistance.PLANE));
            }

            boolQuery.minimumShouldMatch(1);

            // 2) SearchSourceBuilder 구성
            SearchSourceBuilder searchSource = new SearchSourceBuilder()
                .query(boolQuery)
                .size(5);

            // — 정렬
            searchSource.sort(SortBuilders.scoreSort().order(SortOrder.DESC));
            if (hasValidLocation) {
                searchSource.sort(SortBuilders.geoDistanceSort(
                    "location",
                    request.getLatitude(),
                    request.getLongitude()
                )
                .unit(DistanceUnit.KILOMETERS)
                .order(SortOrder.ASC)
                .geoDistance(GeoDistance.PLANE));
            }

            // 3) 실행 및 매핑
            SearchRequest searchRequest = new SearchRequest("hospitals");
            searchRequest.source(searchSource);
            SearchResponse response = client.search(searchRequest, RequestOptions.DEFAULT);

            List<Map<String, Object>> suggestions = new ArrayList<>();
            response.getHits().forEach(hit -> {
                Map<String, Object> sourceMap = hit.getSourceAsMap();
                double score = hit.getScore();

                // 점수 보정
                if (sourceMap.get("yadmNm").toString().contains(searchQuery)) score += 7;
                if (sourceMap.get("yadmNm").toString().equals(query)) score += 10;
                if (region != null && sourceMap.get("region").toString().equals(region)) score += 4;
                if (sourceMap.get("major") != null && 
                    sourceMap.get("major").toString().contains(searchQuery)) score += 2;

                Map<String, Object> suggestion = Map.of(
                    "id", hit.getId(),
                    "name", sourceMap.get("yadmNm"),
                    "address", sourceMap.get("addr"),
                    "region", sourceMap.get("region"),
                    "category", sourceMap.get("category"),
                    "major", sourceMap.getOrDefault("major", new ArrayList<>()),
                    "speciality", sourceMap.getOrDefault("speciality", new ArrayList<>()),
                    "score", score,
                    "distance", hasValidLocation && hit.getSortValues().length > 1 ? 
                        hit.getSortValues()[1] : null
                );

                suggestions.add(suggestion);
            });

            return MainSearchResponse.builder()
                .hospital(suggestions)
                .build();

        } catch (IOException e) {
            throw new RuntimeException("검색 중 오류가 발생했습니다.", e);
        }
    }

    private String extractRegion(String query) {
        return REGIONS.stream()
            .filter(region -> query.contains(region))
            .findFirst()
            .orElse(null);
    }

    private boolean isValidLocation(Double latitude, Double longitude) {
        return latitude != null && longitude != null &&
            latitude >= -90 && latitude <= 90 &&
            longitude >= -180 && longitude <= 180;
    }
} 