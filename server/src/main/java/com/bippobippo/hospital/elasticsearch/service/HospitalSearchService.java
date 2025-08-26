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
import org.elasticsearch.index.query.MultiMatchQueryBuilder;
import org.elasticsearch.index.query.QueryBuilder;

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
            logger.info("병원 검색 시작 - 파라미터: {}", searchParams);
            
            SearchRequest searchRequest = new SearchRequest("hospitals");
            SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
            
            // 기본 검색 크기 설정 (클라이언트에서 page, limit으로 보냄)
            int limit = searchParams.containsKey("limit") ? Integer.parseInt(searchParams.get("limit").toString()) : 10;
            int page = searchParams.containsKey("page") ? Integer.parseInt(searchParams.get("page").toString()) : 1;
            int from = (page - 1) * limit;
            
            logger.info("페이지네이션 설정 - page: {}, limit: {}, from: {}", page, limit, from);
            searchSourceBuilder.from(from);
            searchSourceBuilder.size(limit);
            
            // Bool 쿼리 구성
            BoolQueryBuilder boolQuery = new BoolQueryBuilder();
            
            // 검색어가 있는 경우
            if (searchParams.containsKey("query") && searchParams.get("query") != null && !searchParams.get("query").toString().trim().isEmpty()) {
                String query = searchParams.get("query").toString().trim();
                logger.info("검색어 있음 - query: {}", query);
                
                // 병원명, 주소, 전공 등에서 검색
                boolQuery.must(QueryBuilders.multiMatchQuery(query)
                    .field("yadmNm", 3.0f)  // 병원명에 가중치 3
                    .field("addr", 1.0f)    // 주소에 가중치 1
                    .field("major", 2.0f)   // 전공에 가중치 2
                    .type(MultiMatchQueryBuilder.Type.BEST_FIELDS));
            } else {
                logger.info("검색어 없음 - match_all 쿼리 사용");
                boolQuery.must(QueryBuilders.matchAllQuery());
            }
            
            // 필터 조건들 추가
            List<QueryBuilder> filters = new ArrayList<>();
            
            // 지역 필터
            if (searchParams.containsKey("region") && searchParams.get("region") != null && !searchParams.get("region").toString().trim().isEmpty()) {
                String region = searchParams.get("region").toString().trim();
                logger.info("지역 필터 추가: {}", region);
                filters.add(QueryBuilders.termQuery("region", region));
            }
            
            // 카테고리 필터
            if (searchParams.containsKey("category") && searchParams.get("category") != null && !searchParams.get("category").toString().trim().isEmpty()) {
                String category = searchParams.get("category").toString().trim();
                logger.info("카테고리 필터 추가: {}", category);
                filters.add(QueryBuilders.termQuery("category", category));
            }
            
            // 전공 필터
            if (searchParams.containsKey("major") && searchParams.get("major") != null && !searchParams.get("major").toString().trim().isEmpty()) {
                String major = searchParams.get("major").toString().trim();
                logger.info("전공 필터 추가: {}", major);
                filters.add(QueryBuilders.termQuery("major", major));
            }
            
            // 필터들을 bool 쿼리에 추가
            if (!filters.isEmpty()) {
                for (QueryBuilder filter : filters) {
                    boolQuery.filter(filter);
                }
            }
            
            logger.info("쿼리 구성 완료 - must: {}, should: {}, filter: {}", 
                boolQuery.must().size(), boolQuery.should().size(), boolQuery.filter().size());
            
            searchSourceBuilder.query(boolQuery);
            searchRequest.source(searchSourceBuilder);
            
            logger.info("Elasticsearch 검색 요청 전송 - 인덱스: {}", searchRequest.indices()[0]);
            
            // 검색 실행
            SearchResponse response = elasticsearchClient.search(searchRequest, RequestOptions.DEFAULT);
            
            logger.info("Elasticsearch 검색 응답 받음 - 총 히트: {}", response.getHits().getTotalHits().value);
            
            // 결과 처리
            List<Map<String, Object>> hospitals = new ArrayList<>();
            for (SearchHit hit : response.getHits().getHits()) {
                Map<String, Object> hospital = hit.getSourceAsMap();
                hospital.put("_id", hit.getId());
                hospital.put("_score", hit.getScore());
                hospitals.add(hospital);
            }
            
            // 응답 구성
            Map<String, Object> result = new HashMap<>();
            result.put("data", hospitals);
            result.put("totalCount", response.getHits().getTotalHits().value);
            result.put("totalPages", (int) Math.ceil((double) response.getHits().getTotalHits().value / limit));
            result.put("currentPage", page);
            result.put("maxScore", response.getHits().getMaxScore());
            
            logger.info("검색 완료 - 결과 수: {}, 총 페이지: {}", hospitals.size(), result.get("totalPages"));
            
            return result;
            
        } catch (Exception e) {
            logger.error("병원 검색 중 오류 발생", e);
            throw new IOException("병원 검색 실패", e);
        }
    }
    
    /**
     * 검색 쿼리 구성 (단계별 복원)
     */
    private BoolQueryBuilder buildSearchQuery(Map<String, Object> searchParams) {
        logger.info("검색 쿼리 구성 시작");
        
        BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
        
        // 1단계: 검색어 처리 (query 파라미터)
        if (searchParams.containsKey("query") && !searchParams.get("query").toString().isEmpty()) {
            String query = searchParams.get("query").toString().trim();
            logger.info("검색어 설정 - query: {}", query);
            
            // 검색어가 있는 경우 - 필터링 적용
            boolQuery.must(QueryBuilders.multiMatchQuery(query)
                .field("yadmNm", 3.0f)
                .field("addr", 2.0f)
                .field("major", 1.5f)
                .type(org.elasticsearch.index.query.MultiMatchQueryBuilder.Type.BEST_FIELDS)
                .operator(org.elasticsearch.index.query.Operator.OR)
                .minimumShouldMatch("1"));
            
            logger.info("검색어 쿼리 구성 완료 - yadmNm, addr, major");
        } else {
            // 검색어가 없으면 모든 병원 반환
            logger.info("검색어가 없음 - match_all 쿼리 사용");
            boolQuery.should(QueryBuilders.matchAllQuery());
        }
        
        logger.info("검색 쿼리 구성 완료");
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
                if (searchParams.containsKey("x") && searchParams.containsKey("y")) {
                    Double x = Double.parseDouble(searchParams.get("x").toString());
                    Double y = Double.parseDouble(searchParams.get("y").toString());
                    GeoDistanceSortBuilder geoSort = SortBuilders.geoDistanceSort("location", y, x) // lat,lon 순서
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
            hospital.put("_id", hit.getId());
            hospital.put("yadmNm", source.get("yadmNm"));
            hospital.put("addr", source.get("addr"));
            hospital.put("region", source.get("region"));
            hospital.put("category", source.get("category"));
            hospital.put("major", source.get("major"));
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
        result.put("data", hospitals);
        result.put("totalCount", hits.getTotalHits().value);
        result.put("currentPage", searchParams.containsKey("page") ? Integer.parseInt(searchParams.get("page").toString()) : 1);
        result.put("totalPages", searchParams.containsKey("limit") ? (int) Math.ceil((double) hits.getTotalHits().value / Integer.parseInt(searchParams.get("limit").toString())) : 1);
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