package com.bippobippo.hospital.service;

import lombok.RequiredArgsConstructor;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HospitalDetailService {

    private final RestHighLevelClient client;

    public Map<String, Object> getHospitalDetail(String id) throws IOException {
        // 1) BoolQueryBuilder 구성
        BoolQueryBuilder boolQuery = QueryBuilders.boolQuery()
            .should(QueryBuilders.termQuery("ykiho", id))
            .should(QueryBuilders.matchQuery("ykiho", id))
            .minimumShouldMatch(1);

        // 2) SearchSourceBuilder 구성
        SearchSourceBuilder source = new SearchSourceBuilder()
            .query(boolQuery)
            .size(1);

        // 3) 검색 실행
        SearchRequest request = new SearchRequest("hospitals");
        request.source(source);
        SearchResponse response = client.search(request, RequestOptions.DEFAULT);

        // 4) 결과 확인
        if (response.getHits().getTotalHits().value == 0) {
            throw new RuntimeException("병원을 찾을 수 없습니다.");
        }

        // 5) 응답 데이터 정리
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
    }
} 