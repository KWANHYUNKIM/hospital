package com.bippobippo.hospital.service;

import com.bippobippo.hospital.dto.request.search.PharmacyAutocompleteRequest;
import com.bippobippo.hospital.dto.response.search.PharmacyAutocompleteResponse;
import lombok.RequiredArgsConstructor;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.sort.SortBuilders;
import org.elasticsearch.search.sort.SortOrder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PharmacyAutocompleteService {

    private final RestHighLevelClient client;

    public PharmacyAutocompleteResponse search(PharmacyAutocompleteRequest request) {
        try {
            String query = request.getQuery().trim();
            
            // BoolQueryBuilder 구성
            BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();
            
            // should 쿼리
            boolQuery.should(QueryBuilders.matchPhrasePrefixQuery("yadmNm", query));
            boolQuery.should(QueryBuilders.matchPhrasePrefixQuery("addr", query));
            boolQuery.should(QueryBuilders.wildcardQuery("region.keyword", "*" + query + "*"));

            // SearchSourceBuilder 구성
            SearchSourceBuilder searchSource = new SearchSourceBuilder()
                .query(boolQuery)
                .size(20)
                .sort(SortBuilders.scoreSort().order(SortOrder.DESC));

            // 검색 실행
            SearchRequest searchRequest = new SearchRequest("pharmacies");
            searchRequest.source(searchSource);
            SearchResponse response = client.search(searchRequest, RequestOptions.DEFAULT);

            // 결과 매핑
            List<Map<String, String>> suggestions = new ArrayList<>();
            response.getHits().forEach(hit -> {
                Map<String, Object> source = hit.getSourceAsMap();
                Map<String, String> suggestion = new HashMap<>();
                suggestion.put("name", source.get("yadmNm").toString());
                suggestion.put("address", source.get("addr").toString());
                suggestions.add(suggestion);
            });

            return PharmacyAutocompleteResponse.builder()
                .pharmacy(suggestions)
                .build();

        } catch (IOException e) {
            throw new RuntimeException("약국 자동완성 검색 중 오류가 발생했습니다.", e);
        }
    }
} 