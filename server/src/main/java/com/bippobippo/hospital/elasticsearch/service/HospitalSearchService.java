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
import org.elasticsearch.common.geo.GeoDistance;
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
import org.elasticsearch.search.aggregations.Aggregation;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.aggregations.bucket.range.Range;

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
            
            // 영업중 필터
            if (searchParams.containsKey("operating") && "true".equals(searchParams.get("operating"))) {
                logger.info("영업중 필터 추가");
                setupOpenNowFilter(boolQuery);
            }
            
            // 위치 기반 검색 필터 추가
            if (searchParams.containsKey("x") && searchParams.containsKey("y") && 
                searchParams.get("x") != null && searchParams.get("y") != null) {
                try {
                    Double x = Double.parseDouble(searchParams.get("x").toString());
                    Double y = Double.parseDouble(searchParams.get("y").toString());
                    String distance = searchParams.getOrDefault("distance", "10km").toString();
                    logger.info("위치 기반 검색 필터 추가 - x: {}, y: {}, distance: {}", x, y, distance);
                    
                    filters.add(QueryBuilders.geoDistanceQuery("location")
                        .point(y, x) // lat, lon 순서
                        .distance(distance)
                        .geoDistance(GeoDistance.ARC));
                } catch (NumberFormatException e) {
                    logger.warn("위치 좌표 파싱 실패 - x: {}, y: {}", searchParams.get("x"), searchParams.get("y"));
                }
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
            
            // 정렬 설정 (위치 기반 검색인 경우 거리 정렬)
            setupSorting(searchSourceBuilder, searchParams);
            
            // 집계 설정
            setupAggregations(searchSourceBuilder, searchParams);
            
            searchRequest.source(searchSourceBuilder);
            
            logger.info("Elasticsearch 검색 요청 전송 - 인덱스: {}", searchRequest.indices()[0]);
            
            // 검색 실행
            SearchResponse response = elasticsearchClient.search(searchRequest, RequestOptions.DEFAULT);
            
            logger.info("Elasticsearch 검색 응답 받음 - 총 히트: {}", response.getHits().getTotalHits().value);
            
            // processSearchResponse를 사용하여 결과 처리 (거리 정보 포함)
            return processSearchResponse(response, searchParams);
            
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
        
        // 현재 시간을 분 단위로 변환 (예: 18:33 -> 1833)
        int currentTimeMinutes = hour * 100 + minute;
        
        BoolQueryBuilder timeQuery = QueryBuilders.boolQuery();
        
        switch (dayOfWeek) {
            case Calendar.MONDAY:
                timeQuery.must(QueryBuilders.rangeQuery("times.trmtMonStart").lte(currentTimeMinutes));
                timeQuery.must(QueryBuilders.rangeQuery("times.trmtMonEnd").gte(currentTimeMinutes));
                break;
            case Calendar.TUESDAY:
                timeQuery.must(QueryBuilders.rangeQuery("times.trmtTueStart").lte(currentTimeMinutes));
                timeQuery.must(QueryBuilders.rangeQuery("times.trmtTueEnd").gte(currentTimeMinutes));
                break;
            case Calendar.WEDNESDAY:
                timeQuery.must(QueryBuilders.rangeQuery("times.trmtWedStart").lte(currentTimeMinutes));
                timeQuery.must(QueryBuilders.rangeQuery("times.trmtWedEnd").gte(currentTimeMinutes));
                break;
            case Calendar.THURSDAY:
                timeQuery.must(QueryBuilders.rangeQuery("times.trmtThuStart").lte(currentTimeMinutes));
                timeQuery.must(QueryBuilders.rangeQuery("times.trmtThuEnd").gte(currentTimeMinutes));
                break;
            case Calendar.FRIDAY:
                timeQuery.must(QueryBuilders.rangeQuery("times.trmtFriStart").lte(currentTimeMinutes));
                timeQuery.must(QueryBuilders.rangeQuery("times.trmtFriEnd").gte(currentTimeMinutes));
                break;
            case Calendar.SATURDAY:
                timeQuery.must(QueryBuilders.rangeQuery("times.trmtSatStart").lte(currentTimeMinutes));
                timeQuery.must(QueryBuilders.rangeQuery("times.trmtSatEnd").gte(currentTimeMinutes));
                break;
            case Calendar.SUNDAY:
                // 일요일은 대부분 휴진이지만, 24시간 진료하는 병원도 있음
                timeQuery.must(QueryBuilders.rangeQuery("times.trmtSunStart").lte(currentTimeMinutes));
                timeQuery.must(QueryBuilders.rangeQuery("times.trmtSunEnd").gte(currentTimeMinutes));
                break;
        }
        
        // 휴무일이 아닌지 확인
        timeQuery.mustNot(QueryBuilders.termQuery("times.noTrmtHoli", "휴무"));
        
        boolQuery.filter(timeQuery);
    }
    
    /**
     * 정렬 설정
     */
    private void setupSorting(SearchSourceBuilder searchSourceBuilder, Map<String, Object> searchParams) {
        String sortBy = (String) searchParams.getOrDefault("sortBy", "score");
        String sortOrder = (String) searchParams.getOrDefault("sortOrder", "desc");
        
        SortOrder order = "asc".equalsIgnoreCase(sortOrder) ? SortOrder.ASC : SortOrder.DESC;
        
        // 위치 기반 검색인 경우 자동으로 거리 정렬 적용
        Object xObj = searchParams.get("x");
        Object yObj = searchParams.get("y");
        
        if (xObj != null && yObj != null) {
            try {
                Double x = null;
                Double y = null;
                
                if (xObj instanceof Number) {
                    x = ((Number) xObj).doubleValue();
                } else if (xObj instanceof String) {
                    x = Double.parseDouble((String) xObj);
                }
                
                if (yObj instanceof Number) {
                    y = ((Number) yObj).doubleValue();
                } else if (yObj instanceof String) {
                    y = Double.parseDouble((String) yObj);
                }
                
                if (x != null && y != null) {
                    GeoDistanceSortBuilder geoSort = SortBuilders.geoDistanceSort("location", y, x) // lat,lon 순서
                        .order(SortOrder.ASC) // 거리는 항상 가까운 순으로 정렬
                        .unit(org.elasticsearch.common.unit.DistanceUnit.KILOMETERS);
                    searchSourceBuilder.sort(geoSort);
                }
            } catch (NumberFormatException e) {
                logger.warn("위치 좌표 파싱 실패 - x: {}, y: {}", xObj, yObj);
            }
        } else {
            switch (sortBy.toLowerCase()) {
                case "distance":
                    // 위치 정보가 없으면 거리 정렬 불가
                    searchSourceBuilder.sort("_score", order);
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
            if ((searchParams.containsKey("latitude") && searchParams.containsKey("longitude") || 
                 searchParams.containsKey("x") && searchParams.containsKey("y")) && hit.getSortValues().length > 0) {
                Object distance = hit.getSortValues()[0];
                // 거리 값을 미터 단위로 변환 (Elasticsearch는 km 단위로 반환)
                if (distance instanceof Number) {
                    double distanceKm = ((Number) distance).doubleValue();
                    hospital.put("distance", Math.round(distanceKm * 1000)); // km를 미터로 변환
                } else {
                    hospital.put("distance", distance);
                }
            }
            
            hospitals.add(hospital);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", hospitals);
        result.put("totalCount", hits.getTotalHits().value);
        
        // 페이지네이션 정보 설정
        int page = searchParams.containsKey("page") ? Integer.parseInt(searchParams.get("page").toString()) : 1;
        int limit = searchParams.containsKey("limit") ? Integer.parseInt(searchParams.get("limit").toString()) : 10;
        result.put("currentPage", page);
        result.put("totalPages", (int) Math.ceil((double) hits.getTotalHits().value / limit));
        result.put("maxScore", hits.getMaxScore());
        
        // 집계 결과를 안전하게 처리하여 추가
        if (response.getAggregations() != null) {
            Map<String, Object> aggregations = new HashMap<>();
            
            try {
                // 지역별 집계
                if (response.getAggregations().get("regions") != null) {
                    aggregations.put("regions", processTermsAggregation(response.getAggregations().get("regions")));
                }
                
                // 카테고리별 집계
                if (response.getAggregations().get("categories") != null) {
                    aggregations.put("categories", processTermsAggregation(response.getAggregations().get("categories")));
                }
                
                // 전문과목별 집계
                if (response.getAggregations().get("specialities") != null) {
                    aggregations.put("specialities", processTermsAggregation(response.getAggregations().get("specialities")));
                }
                
                // 거리별 집계
                if (response.getAggregations().get("distances") != null) {
                    aggregations.put("distances", processGeoDistanceAggregation(response.getAggregations().get("distances")));
                }
                
                // 응급실 운영 여부 집계
                if (response.getAggregations().get("emergency_available") != null) {
                    aggregations.put("emergency_available", processTermsAggregation(response.getAggregations().get("emergency_available")));
                }
                
                // 야간진료 여부 집계
                if (response.getAggregations().get("night_care_available") != null) {
                    aggregations.put("night_care_available", processTermsAggregation(response.getAggregations().get("night_care_available")));
                }
                
                result.put("aggregations", aggregations);
            } catch (Exception e) {
                logger.warn("집계 결과 처리 중 오류 발생: {}", e.getMessage());
                // 집계 처리 실패 시 빈 맵으로 설정
                result.put("aggregations", new HashMap<>());
            }
        }
        
        return result;
    }
    
    /**
     * Terms 집계 결과를 안전하게 처리
     */
    private Map<String, Object> processTermsAggregation(Aggregation aggregation) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            if (aggregation instanceof Terms) {
                Terms terms = (Terms) aggregation;
                
                List<Map<String, Object>> buckets = new ArrayList<>();
                for (Terms.Bucket bucket : terms.getBuckets()) {
                    Map<String, Object> bucketMap = new HashMap<>();
                    bucketMap.put("key", bucket.getKeyAsString());
                    bucketMap.put("doc_count", bucket.getDocCount());
                    buckets.add(bucketMap);
                }
                
                result.put("buckets", buckets);
                result.put("doc_count_error_upper_bound", terms.getDocCountError());
                result.put("sum_other_doc_count", terms.getSumOfOtherDocCounts());
            }
        } catch (Exception e) {
            logger.warn("Terms 집계 처리 중 오류: {}", e.getMessage());
            result.put("buckets", new ArrayList<>());
        }
        
        return result;
    }
    
    /**
     * GeoDistance 집계 결과를 안전하게 처리
     */
    private Map<String, Object> processGeoDistanceAggregation(Aggregation aggregation) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            if (aggregation instanceof Range) {
                Range geoDistance = (Range) aggregation;
                
                List<Map<String, Object>> buckets = new ArrayList<>();
                for (Range.Bucket bucket : geoDistance.getBuckets()) {
                    Map<String, Object> bucketMap = new HashMap<>();
                    bucketMap.put("key", bucket.getKeyAsString());
                    bucketMap.put("from", bucket.getFrom());
                    bucketMap.put("to", bucket.getTo());
                    bucketMap.put("doc_count", bucket.getDocCount());
                    buckets.add(bucketMap);
                }
                
                result.put("buckets", buckets);
            }
        } catch (Exception e) {
            logger.warn("GeoDistance 집계 처리 중 오류: {}", e.getMessage());
            result.put("buckets", new ArrayList<>());
        }
        
        return result;
    }
} 