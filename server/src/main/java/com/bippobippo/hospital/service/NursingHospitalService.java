package com.bippobippo.hospital.service;

import com.bippobippo.hospital.dto.request.search.NursingHospitalSearchRequest;
import com.bippobippo.hospital.dto.response.search.NursingHospitalSearchResponse;
import com.bippobippo.hospital.model.NursingHospital;
import com.bippobippo.hospital.repository.NursingHospitalRepository;
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
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.sort.SortBuilders;
import org.elasticsearch.search.sort.SortOrder;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NursingHospitalService {
    private final RestHighLevelClient client;
    private final NursingHospitalRepository nursingHospitalRepository;

    public Map<String, List<Map<String, String>>> autoComplete(String query) {
        try {
            if (query == null || query.trim().isEmpty()) {
                return Map.of("hospital", List.of());
            }

            BoolQueryBuilder boolQuery = QueryBuilders.boolQuery()
                .must(QueryBuilders.termQuery("category.keyword", "요양병원"))
                .should(QueryBuilders.matchPhrasePrefixQuery("yadmNm", query.trim()))
                .should(QueryBuilders.matchPhrasePrefixQuery("addr", query.trim()))
                .minimumShouldMatch(1);

            SearchSourceBuilder source = new SearchSourceBuilder()
                .query(boolQuery)
                .size(20)
                .sort(SortBuilders.scoreSort().order(SortOrder.DESC));

            SearchRequest searchRequest = new SearchRequest("hospitals");
            searchRequest.source(source);
            SearchResponse response = client.search(searchRequest, RequestOptions.DEFAULT);

            List<Map<String, String>> suggestions = new ArrayList<>();
            for (SearchHit hit : response.getHits().getHits()) {
                Map<String, Object> hitSource = hit.getSourceAsMap();
                Map<String, String> suggestion = new HashMap<>();
                suggestion.put("name", (String) hitSource.get("yadmNm"));
                suggestion.put("address", (String) hitSource.get("addr"));
                suggestions.add(suggestion);
            }

            return Map.of("hospital", suggestions);

        } catch (IOException e) {
            throw new RuntimeException("요양병원 자동완성 검색 중 오류가 발생했습니다.", e);
        }
    }

    public NursingHospitalSearchResponse searchHospitals(NursingHospitalSearchRequest request) {
        try {
            int page = request.getPage();
            int limit = request.getLimit();

            // 1) BoolQueryBuilder 구성
            BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();

            // — 요양병원 필터
            boolQuery.must(QueryBuilders.termQuery("category.keyword", "요양병원"));

            // — 검색어
            if (request.getQuery() != null && !request.getQuery().isBlank()) {
                boolQuery.must(QueryBuilders.multiMatchQuery(request.getQuery().trim())
                    .field("yadmNm", 3.0f)
                    .field("addr")
                    .field("major")
                    .fuzziness(Fuzziness.AUTO));
            } else {
                boolQuery.must(QueryBuilders.matchAllQuery());
            }

            // — 지역 필터
            if (request.getRegion() != null && !request.getRegion().equals("전국")) {
                boolQuery.filter(QueryBuilders.boolQuery()
                    .should(QueryBuilders.termQuery("region.keyword", request.getRegion()))
                    .should(QueryBuilders.termQuery("region", request.getRegion()))
                    .minimumShouldMatch(1));
            }

            // — 위치 기반 검색
            if (request.getX() != null && request.getY() != null) {
                boolQuery.filter(QueryBuilders.geoDistanceQuery("location")
                    .point(request.getY(), request.getX())
                    .distance(request.getDistance())
                    .geoDistance(GeoDistance.ARC));
            }

            // 2) SearchSourceBuilder 구성
            SearchSourceBuilder source = new SearchSourceBuilder()
                .query(boolQuery)
                .from((page - 1) * limit)
                .size(limit);

            // — 거리 정렬
            if (request.getX() != null && request.getY() != null) {
                source.sort(SortBuilders.geoDistanceSort("location", request.getY(), request.getX())
                    .unit(DistanceUnit.METERS)
                    .order(SortOrder.ASC)
                    .geoDistance(GeoDistance.ARC));
            }

            // 3) 실행 및 매핑
            SearchRequest searchRequest = new SearchRequest("hospitals");
            searchRequest.source(source);
            SearchResponse response = client.search(searchRequest, RequestOptions.DEFAULT);

            List<NursingHospital> hospitals = new ArrayList<>();
            for (SearchHit hit : response.getHits().getHits()) {
                NursingHospital hospital = mapToNursingHospital(hit);
                Object[] sortValues = hit.getSortValues();
                if (sortValues != null && sortValues.length > 0) {
                    double distanceValue = ((Number) sortValues[0]).doubleValue();
                    hospital.setDistance(Math.round(distanceValue));
                }
                hospitals.add(hospital);
            }

            long total = response.getHits().getTotalHits().value;
            int totalPages = (int) Math.ceil((double) total / limit);

            return NursingHospitalSearchResponse.builder()
                .data(hospitals)
                .totalCount(total)
                .currentPage(page)
                .totalPages(totalPages)
                .build();

        } catch (IOException e) {
            throw new RuntimeException("요양병원 검색 중 오류가 발생했습니다.", e);
        }
    }

    public NursingHospital getHospitalById(String ykiho) {
        BoolQueryBuilder boolQuery = QueryBuilders.boolQuery()
            .must(QueryBuilders.termQuery("ykiho.keyword", ykiho))
            .must(QueryBuilders.termQuery("category.keyword", "요양병원"));

        SearchSourceBuilder source = new SearchSourceBuilder()
            .query(boolQuery)
            .size(1);

        try {
            SearchRequest searchRequest = new SearchRequest("hospitals");
            searchRequest.source(source);
            SearchResponse response = client.search(searchRequest, RequestOptions.DEFAULT);

            if (response.getHits().getTotalHits().value == 0) {
                throw new RuntimeException("요양병원을 찾을 수 없습니다.");
            }

            return mapToNursingHospital(response.getHits().getHits()[0]);
        } catch (IOException e) {
            throw new RuntimeException("요양병원 조회 중 오류가 발생했습니다.", e);
        }
    }

    public Map<String, Object> getHospitalDetail(String ykiho) {
        try {
            BoolQueryBuilder boolQuery = QueryBuilders.boolQuery()
                .must(QueryBuilders.termQuery("ykiho.keyword", ykiho))
                .must(QueryBuilders.termQuery("category.keyword", "요양병원"));

            SearchSourceBuilder source = new SearchSourceBuilder()
                .query(boolQuery)
                .size(1);

            SearchRequest searchRequest = new SearchRequest("hospitals");
            searchRequest.source(source);
            SearchResponse response = client.search(searchRequest, RequestOptions.DEFAULT);

            if (response.getHits().getTotalHits().value == 0) {
                throw new RuntimeException("요양병원을 찾을 수 없습니다.");
            }

            Map<String, Object> hospitalDetail = response.getHits().getHits()[0].getSourceAsMap();
            Map<String, Object> formattedResponse = new HashMap<>(hospitalDetail);

            // 기본값 설정
            formattedResponse.putIfAbsent("food_treatment", new String[0]);
            formattedResponse.putIfAbsent("intensive_care", new String[0]);
            formattedResponse.putIfAbsent("personnel", new String[0]);
            formattedResponse.putIfAbsent("speciality", new String[0]);
            formattedResponse.putIfAbsent("subjects", new String[0]);
            formattedResponse.putIfAbsent("equipment", new String[0]);
            formattedResponse.putIfAbsent("nursing_grade", new String[0]);
            formattedResponse.putIfAbsent("nearby_pharmacies", new String[0]);
            formattedResponse.putIfAbsent("subject", "-");
            formattedResponse.putIfAbsent("major", new String[]{"-"});

            // 운영 시간 정보
            Map<String, Object> times = (Map<String, Object>) hospitalDetail.getOrDefault("times", new HashMap<>());
            times.putIfAbsent("trmtWeekStart", "-");
            times.putIfAbsent("trmtWeekEnd", "-");
            times.putIfAbsent("trmtSatStart", "-");
            times.putIfAbsent("trmtSatEnd", "-");
            times.putIfAbsent("lunchWeek", "-");
            formattedResponse.put("times", times);

            // 위치 정보
            Map<String, Object> location = (Map<String, Object>) hospitalDetail.getOrDefault("location", new HashMap<>());
            location.putIfAbsent("lat", 0.0);
            location.putIfAbsent("lon", 0.0);
            formattedResponse.put("location", location);

            return formattedResponse;

        } catch (IOException e) {
            throw new RuntimeException("요양병원 상세 정보 조회 중 오류가 발생했습니다.", e);
        }
    }

    public Map<String, Object> getKeywordStats(String ykiho) {
        // 임시로 빈 데이터 반환
        return Map.of(
            "keywords", List.of(),
            "totalCount", 0
        );
    }

    public Map<String, Object> getReviews(String ykiho, String page, String limit, String sort) {
        // 임시로 빈 데이터 반환
        return Map.of(
            "reviews", List.of(),
            "totalCount", 0,
            "currentPage", Integer.parseInt(page),
            "totalPages", 0
        );
    }

    private NursingHospital mapToNursingHospital(SearchHit hit) {
        NursingHospital hospital = new NursingHospital();
        Map<String, Object> source = hit.getSourceAsMap();
        
        String ykiho = (String) source.get("ykiho");
        hospital.setId(ykiho);
        hospital.setYkiho(ykiho);
        hospital.setYadmNm((String) source.get("yadmNm"));
        hospital.setCategory((String) source.get("category"));
        hospital.setAddr((String) source.get("addr"));
        hospital.setTelno((String) source.get("telno"));
        hospital.setMajor((List<String>) source.get("major"));
        hospital.setTimes((Map<String, Object>) source.get("times"));
        hospital.setRegion((String) source.get("region"));
        hospital.setVeteran_hospital((Boolean) source.get("veteran_hospital"));
        
        Map<String, Object> location = (Map<String, Object>) source.get("location");
        if (location != null) {
            hospital.setLat((Double) location.get("lat"));
            hospital.setLon((Double) location.get("lon"));
        }

        return hospital;
    }
} 