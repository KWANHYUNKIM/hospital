package com.bippobippo.hospital.elasticsearch.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.GeoDistanceQueryBuilder;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.SearchHits;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.sort.SortBuilders;
import org.elasticsearch.search.sort.GeoDistanceSortBuilder;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.bucket.terms.TermsAggregationBuilder;
import org.elasticsearch.search.aggregations.bucket.range.GeoDistanceAggregationBuilder;
import org.elasticsearch.search.sort.SortOrder;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.common.geo.GeoPoint;
import org.elasticsearch.common.unit.DistanceUnit;

import java.io.IOException;
import java.util.*;

@Service
public class PharmacySearchService {
    
    private static final Logger logger = LoggerFactory.getLogger(PharmacySearchService.class);
    
    @Autowired
    private RestHighLevelClient elasticsearchClient;
    
    /**
     * 약국 검색
     */
    public Map<String, Object> searchPharmacies(Map<String, Object> searchParams) throws IOException {
        try {
            SearchRequest searchRequest = new SearchRequest("pharmacies");
            SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
            
            // 기본 검색 크기 설정
            int size = searchParams.containsKey("size") ? (Integer) searchParams.get("size") : 20;
            int from = searchParams.containsKey("from") ? (Integer) searchParams.get("from") : 0;
            searchSourceBuilder.size(size);
            searchSourceBuilder.from(from);
            
            // 쿼리 구성
            BoolQueryBuilder boolQuery = buildSearchQuery(searchParams);
            searchSourceBuilder.query(boolQuery);
            
            // 정렬 설정
            setupSorting(searchSourceBuilder, searchParams);
            
            // 집계 설정
            setupAggregations(searchSourceBuilder, searchParams);
            
            searchRequest.source(searchSourceBuilder);
            
            SearchResponse response = elasticsearchClient.search(searchRequest, RequestOptions.DEFAULT);
            return processSearchResponse(response, searchParams);
            
        } catch (Exception e) {
            logger.error("약국 검색 중 오류 발생:", e);
            throw new RuntimeException("약국 검색 실패", e);
        }
    }
    
    /**
     * 약국 자동완성 검색
     */
    public Map<String, Object> autocompletePharmacies(String query, Double latitude, Double longitude) throws IOException {
        try {
            SearchRequest searchRequest = new SearchRequest("pharmacies");
            SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
            searchSourceBuilder.size(10);
            
            // 쿼리 구성
            BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
            
            // should 절 구성
            boolQuery.should(QueryBuilders.matchPhraseQuery("yadmNm", query).boost(20));
            boolQuery.should(QueryBuilders.matchQuery("yadmNm", query).fuzziness("AUTO").boost(10));
            boolQuery.should(QueryBuilders.matchPhraseQuery("addr", query).boost(15));
            boolQuery.should(QueryBuilders.matchQuery("addr", query).fuzziness("AUTO").boost(8));
            boolQuery.should(QueryBuilders.matchPhraseQuery("clCdNm", query).boost(12));
            boolQuery.should(QueryBuilders.matchQuery("clCdNm", query).fuzziness("AUTO").boost(6));
            
            // 위치 기반 필터링
            if (latitude != null && longitude != null) {
                GeoDistanceQueryBuilder geoQuery = QueryBuilders.geoDistanceQuery("location")
                    .point(latitude, longitude)
                    .distance("20km");
                boolQuery.filter(geoQuery);
            }
            
            boolQuery.minimumShouldMatch(1);
            searchSourceBuilder.query(boolQuery);
            
            // 정렬 구성
            searchSourceBuilder.sort("_score", SortOrder.DESC);
            
            if (latitude != null && longitude != null) {
                GeoDistanceSortBuilder geoSort = SortBuilders.geoDistanceSort("location", latitude, longitude)
                    .order(SortOrder.ASC)
                    .unit(org.elasticsearch.common.unit.DistanceUnit.KILOMETERS);
                searchSourceBuilder.sort(geoSort);
            }
            
            searchRequest.source(searchSourceBuilder);
            
            SearchResponse response = elasticsearchClient.search(searchRequest, RequestOptions.DEFAULT);
            return processAutocompleteResponse(response, latitude, longitude);
            
        } catch (Exception e) {
            logger.error("약국 자동완성 검색 중 오류 발생:", e);
            throw new RuntimeException("약국 자동완성 검색 실패", e);
        }
    }
    
    /**
     * 검색 쿼리 구성
     */
    private BoolQueryBuilder buildSearchQuery(Map<String, Object> searchParams) {
        BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
        
        // 키워드 검색
        if (searchParams.containsKey("keyword") && !searchParams.get("keyword").toString().isEmpty()) {
            String keyword = searchParams.get("keyword").toString();
            boolQuery.should(QueryBuilders.multiMatchQuery(keyword)
                .field("yadmNm", 3.0f)
                .field("addr", 2.0f)
                .field("clCdNm", 1.5f)
                .type(org.elasticsearch.index.query.MultiMatchQueryBuilder.Type.BEST_FIELDS)
                .fuzziness("AUTO"));
        }
        
        // 지역 필터
        if (searchParams.containsKey("sidoCd") && !searchParams.get("sidoCd").toString().isEmpty()) {
            String sidoCd = searchParams.get("sidoCd").toString();
            boolQuery.filter(QueryBuilders.termQuery("sidoCd", sidoCd));
        }
        
        if (searchParams.containsKey("sgguCd") && !searchParams.get("sgguCd").toString().isEmpty()) {
            String sgguCd = searchParams.get("sgguCd").toString();
            boolQuery.filter(QueryBuilders.termQuery("sgguCd", sgguCd));
        }
        
        // 약국 유형 필터
        if (searchParams.containsKey("clCd") && !searchParams.get("clCd").toString().isEmpty()) {
            String clCd = searchParams.get("clCd").toString();
            boolQuery.filter(QueryBuilders.termQuery("clCd", clCd));
        }
        
        // 위치 기반 검색
        if (searchParams.containsKey("latitude") && searchParams.containsKey("longitude")) {
            Double latitude = (Double) searchParams.get("latitude");
            Double longitude = (Double) searchParams.get("longitude");
            Double radius = searchParams.containsKey("radius") ? (Double) searchParams.get("radius") : 20.0;
            
            GeoDistanceQueryBuilder geoQuery = QueryBuilders.geoDistanceQuery("location")
                .point(latitude, longitude)
                .distance(radius + "km");
            boolQuery.filter(geoQuery);
        }
        
        // 24시간 운영 여부
        if (searchParams.containsKey("open24h") && (Boolean) searchParams.get("open24h")) {
            // 24시간 운영 약국 필터링 로직 (실제 구현 시 약국 운영시간 데이터 필요)
            boolQuery.filter(QueryBuilders.existsQuery("open24h"));
        }
        
        return boolQuery;
    }
    
    /**
     * 정렬 설정
     */
    private void setupSorting(SearchSourceBuilder searchSourceBuilder, Map<String, Object> searchParams) {
        String sortBy = (String) searchParams.getOrDefault("sortBy", "score");
        String sortOrder = (String) searchParams.getOrDefault("sortOrder", "desc");
        
        SortOrder order = "asc".equalsIgnoreCase(sortOrder) ? SortOrder.ASC : SortOrder.DESC;
        
        switch (sortBy.toLowerCase()) {
            case "distance":
                if (searchParams.containsKey("latitude") && searchParams.containsKey("longitude")) {
                    Double latitude = (Double) searchParams.get("latitude");
                    Double longitude = (Double) searchParams.get("longitude");
                    GeoDistanceSortBuilder geoSort = SortBuilders.geoDistanceSort("location", latitude, longitude)
                        .order(order)
                        .unit(org.elasticsearch.common.unit.DistanceUnit.KILOMETERS);
                    searchSourceBuilder.sort(geoSort);
                }
                break;
            case "name":
                searchSourceBuilder.sort("yadmNm.keyword", order);
                break;
            case "region":
                searchSourceBuilder.sort("sidoCd.keyword", order);
                break;
            default:
                searchSourceBuilder.sort("_score", order);
                break;
        }
    }
    
    /**
     * 집계 설정
     */
    private void setupAggregations(SearchSourceBuilder searchSourceBuilder, Map<String, Object> searchParams) {
        // 시도별 집계
        TermsAggregationBuilder sidoAgg = AggregationBuilders.terms("sido_distribution")
            .field("sidoCd.keyword")
            .size(20);
        searchSourceBuilder.aggregation(sidoAgg);
        
        // 시군구별 집계
        TermsAggregationBuilder sgguAgg = AggregationBuilders.terms("sggu_distribution")
            .field("sgguCd.keyword")
            .size(50);
        searchSourceBuilder.aggregation(sgguAgg);
        
        // 약국 유형별 집계
        TermsAggregationBuilder typeAgg = AggregationBuilders.terms("pharmacy_types")
            .field("clCd.keyword")
            .size(20);
        searchSourceBuilder.aggregation(typeAgg);
        
        // 거리별 집계 (위치 기반 검색인 경우)
        if (searchParams.containsKey("latitude") && searchParams.containsKey("longitude")) {
            Object latObj = searchParams.get("latitude");
            Object lngObj = searchParams.get("longitude");
            
            Double latitude = null;
            Double longitude = null;
            
            if (latObj instanceof Number) {
                latitude = ((Number) latObj).doubleValue();
            } else if (latObj instanceof String) {
                try {
                    latitude = Double.parseDouble((String) latObj);
                } catch (NumberFormatException e) {
                    logger.warn("위도 파싱 실패: {}", latObj);
                    return;
                }
            }
            
            if (lngObj instanceof Number) {
                longitude = ((Number) lngObj).doubleValue();
            } else if (lngObj instanceof String) {
                try {
                    longitude = Double.parseDouble((String) lngObj);
                } catch (NumberFormatException e) {
                    logger.warn("경도 파싱 실패: {}", lngObj);
                    return;
                }
            }
            
            if (latitude != null && longitude != null) {
                try {
                    double lat = Double.parseDouble(latitude.toString());
                    double lon = Double.parseDouble(longitude.toString());
                    GeoDistanceAggregationBuilder distanceAgg = AggregationBuilders
                        .geoDistance("distances", new GeoPoint(lat, lon))  // 기준점(GeoPoint)
                        .field("location")                                  // 집계 대상 필드
                        .unit(DistanceUnit.KILOMETERS)                      // (선택) 결과 단위
                        .addRange("0-1km", 0.0, 1.0)
                        .addRange("1-3km", 1.0, 3.0)
                        .addRange("3-5km", 3.0, 5.0)
                        .addRange("5-10km", 5.0, 10.0)
                        .addRange("10km+", 10.0, Double.MAX_VALUE);
                    searchSourceBuilder.aggregation(distanceAgg);
                } catch (Exception e) {
                    logger.warn("Invalid latitude/longitude values: {} {}", latitude, longitude);
                }
            }
        }
    }
    
    /**
     * 검색 결과 처리
     */
    private Map<String, Object> processSearchResponse(SearchResponse response, Map<String, Object> searchParams) {
        SearchHits hits = response.getHits();
        
        List<Map<String, Object>> pharmacies = new ArrayList<>();
        for (SearchHit hit : hits.getHits()) {
            Map<String, Object> source = hit.getSourceAsMap();
            
            Map<String, Object> pharmacy = new HashMap<>();
            pharmacy.put("id", hit.getId());
            pharmacy.put("ykiho", source.get("ykiho"));
            pharmacy.put("name", source.get("yadmNm"));
            pharmacy.put("clCd", source.get("clCd"));
            pharmacy.put("clCdNm", source.get("clCdNm"));
            pharmacy.put("sidoCd", source.get("sidoCd"));
            pharmacy.put("sidoCdNm", source.get("sidoCdNm"));
            pharmacy.put("sgguCd", source.get("sgguCd"));
            pharmacy.put("sgguCdNm", source.get("sgguCdNm"));
            pharmacy.put("emdongNm", source.get("emdongNm"));
            pharmacy.put("postNo", source.get("postNo"));
            pharmacy.put("address", source.get("addr"));
            pharmacy.put("telno", source.get("telno"));
            pharmacy.put("estbDd", source.get("estbDd"));
            pharmacy.put("location", source.get("location"));
            pharmacy.put("score", hit.getScore());
            
            // 거리 정보 추가 (위치 기반 검색인 경우)
            if (searchParams.containsKey("latitude") && searchParams.containsKey("longitude") && hit.getSortValues().length > 0) {
                Object distance = hit.getSortValues()[0];
                pharmacy.put("distance", distance);
            }
            
            pharmacies.add(pharmacy);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("pharmacies", pharmacies);
        result.put("total", hits.getTotalHits().value);
        result.put("maxScore", hits.getMaxScore());
        
        // 집계 결과 추가
        if (response.getAggregations() != null) {
            Map<String, Object> aggregations = new HashMap<>();
            
            // 시도별 집계
            if (response.getAggregations().get("sido_distribution") != null) {
                aggregations.put("sido_distribution", response.getAggregations().get("sido_distribution"));
            }
            
            // 시군구별 집계
            if (response.getAggregations().get("sggu_distribution") != null) {
                aggregations.put("sggu_distribution", response.getAggregations().get("sggu_distribution"));
            }
            
            // 약국 유형별 집계
            if (response.getAggregations().get("pharmacy_types") != null) {
                aggregations.put("pharmacy_types", response.getAggregations().get("pharmacy_types"));
            }
            
            // 거리별 집계
            if (response.getAggregations().get("distances") != null) {
                aggregations.put("distances", response.getAggregations().get("distances"));
            }
            
            result.put("aggregations", aggregations);
        }
        
        return result;
    }
    
    /**
     * 자동완성 결과 처리
     */
    private Map<String, Object> processAutocompleteResponse(SearchResponse response, Double latitude, Double longitude) {
        SearchHits hits = response.getHits();
        
        List<Map<String, Object>> suggestions = new ArrayList<>();
        for (SearchHit hit : hits.getHits()) {
            Map<String, Object> source = hit.getSourceAsMap();
            
            Map<String, Object> suggestion = new HashMap<>();
            suggestion.put("id", hit.getId());
            suggestion.put("ykiho", source.get("ykiho"));
            suggestion.put("name", source.get("yadmNm"));
            suggestion.put("address", source.get("addr"));
            suggestion.put("telno", source.get("telno"));
            suggestion.put("clCdNm", source.get("clCdNm"));
            suggestion.put("score", hit.getScore());
            
            // 거리 정보 추가
            if (latitude != null && longitude != null && hit.getSortValues().length > 1) {
                Object distance = hit.getSortValues()[1];
                suggestion.put("distance", distance);
            }
            
            suggestions.add(suggestion);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("pharmacies", suggestions);
        result.put("total", hits.getTotalHits().value);
        
        return result;
    }
} 