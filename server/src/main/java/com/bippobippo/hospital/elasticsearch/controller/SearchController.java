package com.bippobippo.hospital.elasticsearch.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.CacheControl;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.SearchHits;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.GeoDistanceQueryBuilder;
import org.elasticsearch.search.sort.SortBuilders;
import org.elasticsearch.search.sort.GeoDistanceSortBuilder;
// Highlight imports removed - using Map<String, Object> instead
import org.elasticsearch.search.sort.SortOrder;
import org.elasticsearch.client.RequestOptions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/elasticsearch")
public class SearchController {
    
    private static final Logger logger = LoggerFactory.getLogger(SearchController.class);
    
    @Autowired
    private RestHighLevelClient elasticsearchClient;
    
    // 지역명 추출 함수
    private String extractRegion(String query) {
        List<String> regions = Arrays.asList(
            "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", 
            "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
        );
        return regions.stream()
            .filter(region -> query.contains(region))
            .findFirst()
            .orElse(null);
    }
    
    /**
     * 자동완성 검색 (상위 5개 결과만)
     */
    @GetMapping("/autocomplete")
    public ResponseEntity<Map<String, Object>> autocomplete(
            @RequestParam String query,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude) {
        
        try {
            String trimmedQuery = query.trim();
            if (trimmedQuery.isEmpty()) {
                return ResponseEntity.ok(Map.of("hospital", new ArrayList<>()));
            }
            
            boolean hasValidLocation = latitude != null && longitude != null &&
                latitude >= -90 && latitude <= 90 &&
                longitude >= -180 && longitude <= 180;
            
            String region = extractRegion(trimmedQuery);
            String searchQuery = trimmedQuery.replace(region != null ? region : "", "").trim();
            
            SearchRequest searchRequest = new SearchRequest("hospitals");
            SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
            searchSourceBuilder.size(5);
            
            // 쿼리 구성
            BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
            
            // should 절 구성
            boolQuery.should(QueryBuilders.matchPhraseQuery("yadmNm", trimmedQuery).boost(20));
            boolQuery.should(QueryBuilders.matchPhraseQuery("yadmNm", searchQuery).boost(15));
            boolQuery.should(QueryBuilders.matchQuery("yadmNm", searchQuery).fuzziness("AUTO").boost(7));
            boolQuery.should(QueryBuilders.matchPhraseQuery("addr", searchQuery).boost(10));
            boolQuery.should(QueryBuilders.matchQuery("addr", searchQuery).fuzziness("AUTO").boost(5));
            boolQuery.should(QueryBuilders.matchPhraseQuery("major", searchQuery).boost(8));
            boolQuery.should(QueryBuilders.matchQuery("major", searchQuery).fuzziness("AUTO").boost(4));
            boolQuery.should(QueryBuilders.matchPhraseQuery("speciality", searchQuery).boost(6));
            boolQuery.should(QueryBuilders.matchQuery("speciality", searchQuery).fuzziness("AUTO").boost(3));
            
            // filter 절 구성
            if (region != null) {
                boolQuery.filter(QueryBuilders.matchQuery("region", region).boost(5));
            }
            
            if (hasValidLocation) {
                GeoDistanceQueryBuilder geoQuery = QueryBuilders.geoDistanceQuery("location")
                    .point(latitude, longitude)
                    .distance("50km");
                boolQuery.filter(geoQuery);
            }
            
            boolQuery.minimumShouldMatch(1);
            searchSourceBuilder.query(boolQuery);
            
            // 정렬 구성
            searchSourceBuilder.sort("_score", SortOrder.DESC);
            
            if (hasValidLocation) {
                GeoDistanceSortBuilder geoSort = SortBuilders.geoDistanceSort("location", latitude, longitude)
                    .order(SortOrder.ASC)
                    .unit(org.elasticsearch.common.unit.DistanceUnit.KILOMETERS)
                    .sortMode(org.elasticsearch.search.sort.SortMode.MIN)
                    .geoDistance(org.elasticsearch.common.geo.GeoDistance.PLANE);
                searchSourceBuilder.sort(geoSort);
            }
            
            searchRequest.source(searchSourceBuilder);
            
            SearchResponse response = elasticsearchClient.search(searchRequest, RequestOptions.DEFAULT);
            SearchHits hits = response.getHits();
            
            List<Map<String, Object>> suggestions = new ArrayList<>();
            for (SearchHit hit : hits.getHits()) {
                Map<String, Object> source = hit.getSourceAsMap();
                float score = hit.getScore();
                
                // 점수 보정
                if (source.get("yadmNm") != null && source.get("yadmNm").toString().contains(searchQuery)) {
                    score += 7;
                }
                if (trimmedQuery.equals(source.get("yadmNm"))) {
                    score += 10;
                }
                if (region != null && region.equals(source.get("region"))) {
                    score += 4;
                }
                if (source.get("major") != null && source.get("major").toString().contains(searchQuery)) {
                    score += 2;
                }
                
                Map<String, Object> suggestion = new HashMap<>();
                suggestion.put("id", hit.getId());
                suggestion.put("name", source.get("yadmNm"));
                suggestion.put("address", source.get("addr"));
                suggestion.put("region", source.get("region"));
                suggestion.put("category", source.get("category"));
                suggestion.put("major", source.get("major") != null ? source.get("major") : new ArrayList<>());
                suggestion.put("speciality", source.get("speciality") != null ? source.get("speciality") : new ArrayList<>());
                suggestion.put("score", score);
                
                if (hasValidLocation && hit.getSortValues().length > 1) {
                    suggestion.put("distance", hit.getSortValues()[1]);
                }
                
                suggestions.add(suggestion);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("hospital", suggestions);
            
            return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(result);
                
        } catch (Exception e) {
            logger.error("❌ 자동완성 검색 중 오류:", e);
            return ResponseEntity.status(500)
                .body(Map.of("message", "자동완성 검색 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 전체 검색 결과 API
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            String trimmedQuery = query.trim();
            if (trimmedQuery.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "hospitals", new ArrayList<>(),
                    "total", 0,
                    "page", page,
                    "size", size
                ));
            }
            
            SearchRequest searchRequest = new SearchRequest("hospitals");
            SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
            searchSourceBuilder.size(size);
            searchSourceBuilder.from((page - 1) * size);
            
            // 쿼리 구성
            BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
            
            // should 절 구성
            boolQuery.should(QueryBuilders.matchPhrasePrefixQuery("yadmNm", trimmedQuery).boost(2));
            boolQuery.should(QueryBuilders.matchPhrasePrefixQuery("addr", trimmedQuery).boost(1));
            boolQuery.should(QueryBuilders.matchQuery("yadmNm", trimmedQuery).fuzziness("AUTO").boost(1.5f));
            boolQuery.should(QueryBuilders.matchQuery("addr", trimmedQuery).fuzziness("AUTO").boost(1));
            
            boolQuery.minimumShouldMatch(1);
            searchSourceBuilder.query(boolQuery);
            
            // 하이라이트 구성
            org.elasticsearch.search.fetch.subphase.highlight.HighlightBuilder highlightBuilder = 
                new org.elasticsearch.search.fetch.subphase.highlight.HighlightBuilder();
            highlightBuilder.field("yadmNm");
            highlightBuilder.field("addr");
            highlightBuilder.preTags("<em>");
            highlightBuilder.postTags("</em>");
            searchSourceBuilder.highlighter(highlightBuilder);
            
            searchRequest.source(searchSourceBuilder);
            
            SearchResponse response = elasticsearchClient.search(searchRequest, RequestOptions.DEFAULT);
            SearchHits hits = response.getHits();
            
            List<Map<String, Object>> hospitals = new ArrayList<>();
            for (SearchHit hit : hits.getHits()) {
                Map<String, Object> source = hit.getSourceAsMap();
                
                Map<String, Object> hospital = new HashMap<>();
                hospital.put("id", hit.getId());
                hospital.put("name", source.get("yadmNm"));
                hospital.put("address", source.get("addr"));
                hospital.put("region", source.get("region"));
                hospital.put("category", source.get("category"));
                hospital.put("major", source.get("major") != null ? source.get("major") : new ArrayList<>());
                hospital.put("speciality", source.get("speciality") != null ? source.get("speciality") : new ArrayList<>());
                
                // 하이라이트 정보
                Map<String, org.elasticsearch.search.fetch.subphase.highlight.HighlightField> highlightFields = hit.getHighlightFields();
                Map<String, List<String>> highlight = new HashMap<>();
                for (Map.Entry<String, org.elasticsearch.search.fetch.subphase.highlight.HighlightField> entry : highlightFields.entrySet()) {
                    org.elasticsearch.search.fetch.subphase.highlight.HighlightField field = entry.getValue();
                    List<String> fragments = new ArrayList<>();
                    for (org.elasticsearch.common.text.Text fragment : field.fragments()) {
                        fragments.add(fragment.string());
                    }
                    highlight.put(entry.getKey(), fragments);
                }
                hospital.put("highlight", highlight);
                
                hospitals.add(hospital);
            }
            
            long total = hits.getTotalHits().value;
            int totalPages = (int) Math.ceil((double) total / size);
            
            Map<String, Object> result = new HashMap<>();
            result.put("hospitals", hospitals);
            result.put("total", total);
            result.put("page", page);
            result.put("size", size);
            result.put("totalPages", totalPages);
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("❌ 검색 중 오류:", e);
            return ResponseEntity.status(500)
                .body(Map.of("message", "검색 중 오류가 발생했습니다."));
        }
    }
} 