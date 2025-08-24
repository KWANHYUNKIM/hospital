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
            logger.info("약국 검색 시작 - 파라미터: {}", searchParams);
            
            SearchRequest searchRequest = new SearchRequest("pharmacies");
            SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
            
            // 페이지네이션 파라미터 매핑 (page, limit -> size, from)
            int page = searchParams.containsKey("page") ? Integer.parseInt(searchParams.get("page").toString()) : 1;
            int limit = searchParams.containsKey("limit") ? Integer.parseInt(searchParams.get("limit").toString()) : 20;
            int size = limit;
            int from = (page - 1) * limit;
            
            logger.info("페이지네이션 설정 - page: {}, limit: {}, size: {}, from: {}", page, limit, size, from);
            
            searchSourceBuilder.size(size);
            searchSourceBuilder.from(from);
            
            // 쿼리 구성
            BoolQueryBuilder boolQuery = buildSearchQuery(searchParams);
            logger.info("검색 쿼리 구성 완료: {}", boolQuery.toString());
            
            searchSourceBuilder.query(boolQuery);
            
            // 임시로 정렬과 집계 제거
            logger.info("정렬과 집계를 임시로 제거하고 기본 검색만 수행");
            
            searchRequest.source(searchSourceBuilder);
            
            logger.info("Elasticsearch 검색 요청 전송");
            SearchResponse response = elasticsearchClient.search(searchRequest, RequestOptions.DEFAULT);
            logger.info("Elasticsearch 검색 응답 수신 - 총 히트: {}", response.getHits().getTotalHits().value);
            
            return processSearchResponse(response, searchParams);
            
        } catch (Exception e) {
            logger.error("약국 검색 중 오류 발생 - 파라미터: {}", searchParams, e);
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
        try {
            logger.info("검색 쿼리 구성 시작");
            BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
            
            // 키워드 검색
            if (searchParams.containsKey("keyword") && searchParams.get("keyword") != null && !searchParams.get("keyword").toString().isEmpty()) {
                String keyword = searchParams.get("keyword").toString();
                logger.info("키워드 검색 설정: {}", keyword);
                
                // should 절로 다양한 매칭 방식 추가
                boolQuery.should(QueryBuilders.matchQuery("yadmNm", keyword).boost(3.0f));
                boolQuery.should(QueryBuilders.matchQuery("addr", keyword).boost(2.0f));
                boolQuery.should(QueryBuilders.matchQuery("clCdNm", keyword).boost(1.5f));
                
                boolQuery.minimumShouldMatch(1);
                logger.info("키워드 검색 쿼리 구성 완료");
            } else {
                logger.info("키워드가 없어 match_all 쿼리 사용");
                boolQuery.must(QueryBuilders.matchAllQuery());
            }
            
            // 지역 필터 (region 파라미터 사용)
            if (searchParams.containsKey("region") && searchParams.get("region") != null && !searchParams.get("region").toString().isEmpty()) {
                String region = searchParams.get("region").toString();
                if (!"전국".equals(region)) {
                    logger.info("지역 필터 설정: {}", region);
                    boolQuery.filter(QueryBuilders.termQuery("sidoCdNm", region));
                } else {
                    logger.info("전국 검색이므로 지역 필터 미적용");
                }
            }
            
            logger.info("검색 쿼리 구성 완료: {}", boolQuery.toString());
            return boolQuery;
            
        } catch (Exception e) {
            logger.error("검색 쿼리 구성 중 오류 발생", e);
            // 오류가 발생해도 기본 쿼리 반환
            BoolQueryBuilder fallbackQuery = QueryBuilders.boolQuery();
            fallbackQuery.must(QueryBuilders.matchAllQuery());
            return fallbackQuery;
        }
    }
    
    /**
     * 정렬 설정
     */
    private void setupSorting(SearchSourceBuilder searchSourceBuilder, Map<String, Object> searchParams) {
        try {
            logger.info("정렬 설정 시작");
            String sortBy = (String) searchParams.getOrDefault("sortBy", "distance");
            String sortOrder = (String) searchParams.getOrDefault("sortOrder", "asc");
            
            SortOrder order = "asc".equalsIgnoreCase(sortOrder) ? SortOrder.ASC : SortOrder.DESC;
            
            // 위치 기반 검색인 경우 거리 기반 정렬을 기본으로 설정
            if (searchParams.containsKey("latitude") && searchParams.containsKey("longitude")) {
                Double latitude = (Double) searchParams.get("latitude");
                Double longitude = (Double) searchParams.get("longitude");
                
                if (latitude != null && longitude != null) {
                    logger.info("위치 기반 정렬 설정 - 위도: {}, 경도: {}", latitude, longitude);
                    
                    switch (sortBy.toLowerCase()) {
                        case "name":
                            searchSourceBuilder.sort("yadmNm.keyword", order);
                            // 거리 정렬을 보조 정렬로 추가
                            GeoDistanceSortBuilder geoSort = SortBuilders.geoDistanceSort("location", latitude, longitude)
                                .order(SortOrder.ASC)
                                .unit(org.elasticsearch.common.unit.DistanceUnit.KILOMETERS);
                            searchSourceBuilder.sort(geoSort);
                            break;
                        case "region":
                            searchSourceBuilder.sort("sidoCd", order);
                            // 거리 정렬을 보조 정렬로 추가
                            geoSort = SortBuilders.geoDistanceSort("location", latitude, longitude)
                                .order(SortOrder.ASC)
                                .unit(org.elasticsearch.common.unit.DistanceUnit.KILOMETERS);
                            searchSourceBuilder.sort(geoSort);
                            break;
                        case "score":
                            searchSourceBuilder.sort("_score", order);
                            // 거리 정렬을 보조 정렬로 추가
                            geoSort = SortBuilders.geoDistanceSort("location", latitude, longitude)
                                .order(SortOrder.ASC)
                                .unit(org.elasticsearch.common.unit.DistanceUnit.KILOMETERS);
                            searchSourceBuilder.sort(geoSort);
                            break;
                        default:
                            // 기본값: 거리 기반 정렬
                            GeoDistanceSortBuilder defaultGeoSort = SortBuilders.geoDistanceSort("location", latitude, longitude)
                                .order(SortOrder.ASC)
                                .unit(org.elasticsearch.common.unit.DistanceUnit.KILOMETERS);
                            searchSourceBuilder.sort(defaultGeoSort);
                            break;
                    }
                } else {
                    logger.warn("위도 또는 경도가 null이어서 위치 기반 정렬을 건너뜀");
                    searchSourceBuilder.sort("_score", SortOrder.DESC);
                }
            } else {
                // 위치 정보가 없는 경우
                logger.info("위치 정보가 없어 기본 정렬 사용");
                switch (sortBy.toLowerCase()) {
                    case "name":
                        searchSourceBuilder.sort("yadmNm.keyword", order);
                        break;
                    case "region":
                        searchSourceBuilder.sort("sidoCd", order);
                        break;
                    default:
                        searchSourceBuilder.sort("_score", order);
                        break;
                }
            }
            logger.info("정렬 설정 완료");
        } catch (Exception e) {
            logger.error("정렬 설정 중 오류 발생", e);
            // 오류가 발생해도 기본 정렬 사용
            searchSourceBuilder.sort("_score", SortOrder.DESC);
        }
    }
    
    /**
     * 집계 설정
     */
    private void setupAggregations(SearchSourceBuilder searchSourceBuilder, Map<String, Object> searchParams) {
        try {
            logger.info("집계 설정 시작");
            
            // 시도별 집계
            TermsAggregationBuilder sidoAgg = AggregationBuilders.terms("sido_distribution")
                .field("sidoCd")
                .size(20);
            searchSourceBuilder.aggregation(sidoAgg);
            
            // 시군구별 집계
            TermsAggregationBuilder sgguAgg = AggregationBuilders.terms("sggu_distribution")
                .field("sgguCd")
                .size(50);
            searchSourceBuilder.aggregation(sgguAgg);
            
            // 약국 유형별 집계
            TermsAggregationBuilder typeAgg = AggregationBuilders.terms("pharmacy_types")
                .field("clCd")
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
                        // distance 파라미터를 사용하여 집계 범위 설정
                        String distanceStr = "10km";
                        if (searchParams.containsKey("distance")) {
                            distanceStr = searchParams.get("distance").toString();
                        }
                        
                        double maxDistance = 10.0;
                        try {
                            if (distanceStr.contains("km")) {
                                maxDistance = Double.parseDouble(distanceStr.replace("km", ""));
                            } else if (distanceStr.contains("m")) {
                                maxDistance = Double.parseDouble(distanceStr.replace("m", "")) / 1000.0;
                            } else {
                                maxDistance = Double.parseDouble(distanceStr);
                            }
                        } catch (NumberFormatException e) {
                            logger.warn("거리 파라미터 파싱 실패: {}, 기본값 10km 사용", distanceStr);
                            maxDistance = 10.0;
                        }
                        
                        // 거리별 집계 범위를 동적으로 설정
                        double step = Math.max(1.0, maxDistance / 5.0); // 5개 구간으로 나누기
                        
                        GeoDistanceAggregationBuilder distanceAgg = AggregationBuilders
                            .geoDistance("distances", new GeoPoint(latitude, longitude))
                            .field("location")
                            .unit(DistanceUnit.KILOMETERS);
                        
                        // 동적으로 범위 추가
                        for (int i = 0; i < 5; i++) {
                            double start = i * step;
                            double end = (i + 1) * step;
                            if (i == 4) end = maxDistance; // 마지막 구간은 maxDistance까지
                            distanceAgg.addRange(String.format("%.1f-%.1fkm", start, end), start, end);
                        }
                        
                        searchSourceBuilder.aggregation(distanceAgg);
                        logger.info("거리별 집계 설정 완료 - 최대 거리: {}km", maxDistance);
                    } catch (Exception e) {
                        logger.warn("거리 집계 설정 실패: {} {}", latitude, longitude, e);
                    }
                }
            } else {
                logger.info("위치 정보가 없어 거리별 집계 미설정");
            }
            
            logger.info("집계 설정 완료");
        } catch (Exception e) {
            logger.error("집계 설정 중 오류 발생", e);
            // 오류가 발생해도 기본 집계는 설정
            try {
                TermsAggregationBuilder sidoAgg = AggregationBuilders.terms("sido_distribution")
                    .field("sidoCd")
                    .size(20);
                searchSourceBuilder.aggregation(sidoAgg);
            } catch (Exception ex) {
                logger.error("기본 집계 설정도 실패", ex);
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
            pharmacy.put("yadmNm", source.get("yadmNm")); // 프론트엔드 호환성을 위해 추가
            pharmacy.put("clCd", source.get("clCd"));
            pharmacy.put("clCdNm", source.get("clCdNm"));
            pharmacy.put("sidoCd", source.get("sidoCd"));
            pharmacy.put("sidoCdNm", source.get("sidoCdNm"));
            pharmacy.put("sgguCd", source.get("sgguCd"));
            pharmacy.put("sgguCdNm", source.get("sgguCdNm"));
            pharmacy.put("emdongNm", source.get("emdongNm"));
            pharmacy.put("postNo", source.get("postNo"));
            pharmacy.put("address", source.get("addr"));
            pharmacy.put("addr", source.get("addr")); // 프론트엔드 호환성을 위해 추가
            pharmacy.put("telno", source.get("telno"));
            pharmacy.put("estbDd", source.get("estbDd"));
            pharmacy.put("location", source.get("location"));
            pharmacy.put("score", hit.getScore());
            
            // 거리 정보 추가 (위치 기반 검색인 경우)
            if (searchParams.containsKey("latitude") && searchParams.containsKey("longitude") && hit.getSortValues().length > 0) {
                Object distance = hit.getSortValues()[0];
                if (distance instanceof Number) {
                    // km 단위로 변환 (Elasticsearch는 기본적으로 미터 단위)
                    double distanceKm = ((Number) distance).doubleValue();
                    if (distanceKm > 1000) { // 1000m 이상이면 km 단위로 변환
                        distanceKm = distanceKm / 1000.0;
                    }
                    pharmacy.put("distance", Math.round(distanceKm * 100.0) / 100.0); // 소수점 2자리까지 반올림
                } else {
                    pharmacy.put("distance", distance);
                }
            }
            
            pharmacies.add(pharmacy);
        }
        
        // 페이지네이션 정보 계산
        int page = searchParams.containsKey("page") ? Integer.parseInt(searchParams.get("page").toString()) : 1;
        int limit = searchParams.containsKey("limit") ? Integer.parseInt(searchParams.get("limit").toString()) : 20;
        long total = hits.getTotalHits().value;
        int totalPages = (int) Math.ceil((double) total / limit);
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", pharmacies);  // 프론트엔드에서 기대하는 'data' 키
        result.put("totalCount", total);  // 프론트엔드에서 기대하는 'totalCount' 키
        result.put("currentPage", page);  // 프론트엔드에서 기대하는 'currentPage' 키
        result.put("totalPages", totalPages);  // 프론트엔드에서 기대하는 'totalPages' 키
        
        // 기존 키들도 유지 (하위 호환성)
        result.put("pharmacies", pharmacies);
        result.put("total", total);
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
                if (distance instanceof Number) {
                    // km 단위로 변환 (Elasticsearch는 기본적으로 미터 단위)
                    double distanceKm = ((Number) distance).doubleValue();
                    if (distanceKm > 1000) { // 1000m 이상이면 km 단위로 변환
                        distanceKm = distanceKm / 1000.0;
                    }
                    suggestion.put("distance", Math.round(distanceKm * 100.0) / 100.0); // 소수점 2자리까지 반올림
                } else {
                    suggestion.put("distance", distance);
                }
            }
            
            suggestions.add(suggestion);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("pharmacies", suggestions);
        result.put("total", hits.getTotalHits().value);
        
        return result;
    }
} 