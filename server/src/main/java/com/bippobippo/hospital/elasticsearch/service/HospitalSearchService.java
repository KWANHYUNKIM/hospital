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
import org.elasticsearch.index.query.support.QueryParsers;
import org.apache.lucene.search.join.ScoreMode;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.SearchHits;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.sort.SortBuilders;
import org.elasticsearch.search.sort.GeoDistanceSortBuilder;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.bucket.terms.TermsAggregationBuilder;
import org.elasticsearch.search.aggregations.bucket.range.GeoDistanceAggregationBuilder;
import org.elasticsearch.search.aggregations.bucket.range.RangeAggregationBuilder;
import org.elasticsearch.search.sort.SortOrder;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.common.geo.GeoPoint;
import org.elasticsearch.common.unit.DistanceUnit;

import java.io.IOException;
import java.util.*;

@Service
public class HospitalSearchService {
    
    private static final Logger logger = LoggerFactory.getLogger(HospitalSearchService.class);
    
    @Autowired
    private RestHighLevelClient elasticsearchClient;
    
    /**
     * 병원 상세 검색
     */
    public Map<String, Object> searchHospitals(Map<String, Object> searchParams) throws IOException {
        try {
            SearchRequest searchRequest = new SearchRequest("hospitals");
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
            logger.error("병원 검색 중 오류 발생:", e);
            throw new RuntimeException("병원 검색 실패", e);
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
                .field("major", 1.5f)
                .field("speciality", 1.0f)
                .type(org.elasticsearch.index.query.MultiMatchQueryBuilder.Type.BEST_FIELDS)
                .fuzziness("AUTO"));
        }
        
        // 지역 필터
        if (searchParams.containsKey("region") && !searchParams.get("region").toString().isEmpty()) {
            String region = searchParams.get("region").toString();
            boolQuery.filter(QueryBuilders.termQuery("region", region));
        }
        
        // 카테고리 필터
        if (searchParams.containsKey("category") && !searchParams.get("category").toString().isEmpty()) {
            String category = searchParams.get("category").toString();
            boolQuery.filter(QueryBuilders.termQuery("category", category));
        }
        
        // 전문과목 필터
        if (searchParams.containsKey("speciality") && !searchParams.get("speciality").toString().isEmpty()) {
            String speciality = searchParams.get("speciality").toString();
            boolQuery.filter(QueryBuilders.nestedQuery("speciality", 
                QueryBuilders.matchQuery("speciality.typeCdNm", speciality), 
                ScoreMode.Avg));
        }
        
        // 진료시간 필터
        if (searchParams.containsKey("openNow") && (Boolean) searchParams.get("openNow")) {
            // 현재 시간에 열려있는 병원 필터링 로직
            setupOpenNowFilter(boolQuery);
        }
        
        // 위치 기반 검색
        if (searchParams.containsKey("latitude") && searchParams.containsKey("longitude")) {
            Double latitude = (Double) searchParams.get("latitude");
            Double longitude = (Double) searchParams.get("longitude");
            Double radius = searchParams.containsKey("radius") ? (Double) searchParams.get("radius") : 50.0;
            
            GeoDistanceQueryBuilder geoQuery = QueryBuilders.geoDistanceQuery("location")
                .point(latitude.doubleValue(), longitude.doubleValue())
                .distance(radius + "km");
            boolQuery.filter(geoQuery);
        }
        
        // 응급실 운영 여부
        if (searchParams.containsKey("emergency") && (Boolean) searchParams.get("emergency")) {
            boolQuery.filter(QueryBuilders.termQuery("times.emyDayYn", "Y"));
        }
        
        // 야간진료 여부
        if (searchParams.containsKey("nightCare") && (Boolean) searchParams.get("nightCare")) {
            boolQuery.filter(QueryBuilders.termQuery("times.emyNgtYn", "Y"));
        }
        
        // 주말진료 여부
        if (searchParams.containsKey("weekendCare") && (Boolean) searchParams.get("weekendCare")) {
            boolQuery.filter(QueryBuilders.termQuery("times.rcvSat", "Y"));
        }
        
        // 주차장 보유 여부
        if (searchParams.containsKey("parking") && (Boolean) searchParams.get("parking")) {
            boolQuery.filter(QueryBuilders.existsQuery("times.parkQty"));
        }
        
        return boolQuery;
    }
    
    /**
     * 현재 시간에 열려있는 병원 필터 설정
     */
    private void setupOpenNowFilter(BoolQueryBuilder boolQuery) {
        // 현재 요일과 시간을 기반으로 진료시간 확인
        Calendar now = Calendar.getInstance();
        int dayOfWeek = now.get(Calendar.DAY_OF_WEEK);
        int hour = now.get(Calendar.HOUR_OF_DAY);
        int minute = now.get(Calendar.MINUTE);
        
        String currentTime = String.format("%02d:%02d", hour, minute);
        
        BoolQueryBuilder timeQuery = QueryBuilders.boolQuery();
        
        switch (dayOfWeek) {
            case Calendar.MONDAY:
                timeQuery.should(QueryBuilders.rangeQuery("times.trmtMonStart").lte(currentTime));
                timeQuery.should(QueryBuilders.rangeQuery("times.trmtMonEnd").gte(currentTime));
                break;
            case Calendar.TUESDAY:
                timeQuery.should(QueryBuilders.rangeQuery("times.trmtTueStart").lte(currentTime));
                timeQuery.should(QueryBuilders.rangeQuery("times.trmtTueEnd").gte(currentTime));
                break;
            case Calendar.WEDNESDAY:
                timeQuery.should(QueryBuilders.rangeQuery("times.trmtWedStart").lte(currentTime));
                timeQuery.should(QueryBuilders.rangeQuery("times.trmtWedEnd").gte(currentTime));
                break;
            case Calendar.THURSDAY:
                timeQuery.should(QueryBuilders.rangeQuery("times.trmtThuStart").lte(currentTime));
                timeQuery.should(QueryBuilders.rangeQuery("times.trmtThuEnd").gte(currentTime));
                break;
            case Calendar.FRIDAY:
                timeQuery.should(QueryBuilders.rangeQuery("times.trmtFriStart").lte(currentTime));
                timeQuery.should(QueryBuilders.rangeQuery("times.trmtFriEnd").gte(currentTime));
                break;
            case Calendar.SATURDAY:
                timeQuery.should(QueryBuilders.rangeQuery("times.trmtSatStart").lte(currentTime));
                timeQuery.should(QueryBuilders.rangeQuery("times.trmtSatEnd").gte(currentTime));
                break;
            case Calendar.SUNDAY:
                // 일요일은 대부분 휴진
                timeQuery.should(QueryBuilders.termQuery("times.rcvSat", "Y"));
                break;
        }
        
        boolQuery.filter(timeQuery);
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
                searchSourceBuilder.sort("region.keyword", order);
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
        // 지역별 집계
        TermsAggregationBuilder regionAgg = AggregationBuilders.terms("regions")
            .field("region.keyword")
            .size(20);
        searchSourceBuilder.aggregation(regionAgg);
        
        // 카테고리별 집계
        TermsAggregationBuilder categoryAgg = AggregationBuilders.terms("categories")
            .field("category.keyword")
            .size(20);
        searchSourceBuilder.aggregation(categoryAgg);
        
        // 전문과목별 집계
        TermsAggregationBuilder specialityAgg = AggregationBuilders.terms("specialities")
            .field("speciality.typeCdNm.keyword")
            .size(50);
        searchSourceBuilder.aggregation(specialityAgg);
        
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
                        .addRange("0-5km", 0.0, 5.0)
                        .addRange("5-10km", 5.0, 10.0)
                        .addRange("10-20km", 10.0, 20.0)
                        .addRange("20-50km", 20.0, 50.0)
                        .addRange("50km+", 50.0, Double.MAX_VALUE);
                    searchSourceBuilder.aggregation(distanceAgg);
                } catch (Exception e) {
                    logger.warn("Invalid latitude/longitude values: {} {}", latitude, longitude);
                }
            }
        }
        
        // 응급실 운영 여부 집계
        TermsAggregationBuilder emergencyAgg = AggregationBuilders.terms("emergency_available")
            .field("times.emyDayYn.keyword")
            .size(2);
        searchSourceBuilder.aggregation(emergencyAgg);
        
        // 야간진료 여부 집계
        TermsAggregationBuilder nightCareAgg = AggregationBuilders.terms("night_care_available")
            .field("times.emyNgtYn.keyword")
            .size(2);
        searchSourceBuilder.aggregation(nightCareAgg);
    }
    
    /**
     * 검색 결과 처리
     */
    private Map<String, Object> processSearchResponse(SearchResponse response, Map<String, Object> searchParams) {
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
            hospital.put("major", source.get("major"));
            hospital.put("speciality", source.get("speciality"));
            hospital.put("location", source.get("location"));
            hospital.put("telno", source.get("telno"));
            hospital.put("hospUrl", source.get("hospUrl"));
            hospital.put("times", source.get("times"));
            hospital.put("equipment", source.get("equipment"));
            hospital.put("food_treatment", source.get("food_treatment"));
            hospital.put("intensive_care", source.get("intensive_care"));
            hospital.put("nursing_grade", source.get("nursing_grade"));
            hospital.put("personnel", source.get("personnel"));
            hospital.put("score", hit.getScore());
            
            // 거리 정보 추가 (위치 기반 검색인 경우)
            if (searchParams.containsKey("latitude") && searchParams.containsKey("longitude") && hit.getSortValues().length > 0) {
                Object distance = hit.getSortValues()[0];
                hospital.put("distance", distance);
            }
            
            hospitals.add(hospital);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("hospitals", hospitals);
        result.put("total", hits.getTotalHits().value);
        result.put("maxScore", hits.getMaxScore());
        
        // 집계 결과 추가
        if (response.getAggregations() != null) {
            Map<String, Object> aggregations = new HashMap<>();
            
            // 지역별 집계
            if (response.getAggregations().get("regions") != null) {
                aggregations.put("regions", response.getAggregations().get("regions"));
            }
            
            // 카테고리별 집계
            if (response.getAggregations().get("categories") != null) {
                aggregations.put("categories", response.getAggregations().get("categories"));
            }
            
            // 전문과목별 집계
            if (response.getAggregations().get("specialities") != null) {
                aggregations.put("specialities", response.getAggregations().get("specialities"));
            }
            
            // 거리별 집계
            if (response.getAggregations().get("distances") != null) {
                aggregations.put("distances", response.getAggregations().get("distances"));
            }
            
            // 응급실 운영 여부 집계
            if (response.getAggregations().get("emergency_available") != null) {
                aggregations.put("emergency_available", response.getAggregations().get("emergency_available"));
            }
            
            // 야간진료 여부 집계
            if (response.getAggregations().get("night_care_available") != null) {
                aggregations.put("night_care_available", response.getAggregations().get("night_care_available"));
            }
            
            result.put("aggregations", aggregations);
        }
        
        return result;
    }
} 