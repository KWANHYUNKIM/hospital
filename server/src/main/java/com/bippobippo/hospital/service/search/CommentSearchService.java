package com.bippobippo.hospital.service.search;

import com.bippobippo.hospital.dto.response.search.CommentHospitalSearchResponse;
import com.bippobippo.hospital.dto.response.search.CommentHospitalSuggestionResponse;
import lombok.RequiredArgsConstructor;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.common.unit.DistanceUnit;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.fetch.subphase.highlight.HighlightBuilder;
import org.elasticsearch.search.sort.GeoDistanceSortBuilder;
import org.elasticsearch.search.sort.SortBuilders;
import org.elasticsearch.search.sort.SortOrder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentSearchService {

    private final RestHighLevelClient elasticsearchClient;
    private static final List<String> REGIONS = Arrays.asList(
        "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
        "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
    );

    private String extractRegion(String query) {
        return REGIONS.stream()
                .filter(region -> query.contains(region))
                .findFirst()
                .orElse(null);
    }

    public CommentHospitalSuggestionResponse getSuggestions(String query, Double latitude, Double longitude) {
        if (query == null || query.trim().isEmpty()) {
            return new CommentHospitalSuggestionResponse();
        }

        try {
            String region = extractRegion(query);
            String searchQuery = query.replace(region != null ? region : "", "").trim();

            BoolQueryBuilder boolQuery = QueryBuilders.boolQuery()
                    .should(QueryBuilders.matchPhraseQuery("yadmNm", query).boost(20))
                    .should(QueryBuilders.matchPhraseQuery("yadmNm", searchQuery).boost(15))
                    .should(QueryBuilders.matchQuery("yadmNm", searchQuery).fuzziness("AUTO").boost(7))
                    .should(QueryBuilders.matchPhraseQuery("addr", searchQuery).boost(10))
                    .should(QueryBuilders.matchQuery("addr", searchQuery).fuzziness("AUTO").boost(5))
                    .should(QueryBuilders.matchPhraseQuery("major", searchQuery).boost(8))
                    .should(QueryBuilders.matchQuery("major", searchQuery).fuzziness("AUTO").boost(4))
                    .should(QueryBuilders.matchPhraseQuery("speciality", searchQuery).boost(6))
                    .should(QueryBuilders.matchQuery("speciality", searchQuery).fuzziness("AUTO").boost(3));

            if (region != null) {
                boolQuery.filter(QueryBuilders.matchQuery("region", region).boost(5));
            }

            SearchSourceBuilder sourceBuilder = new SearchSourceBuilder()
                    .query(boolQuery)
                    .size(5);

            if (latitude != null && longitude != null) {
                GeoDistanceSortBuilder sortBuilder = SortBuilders.geoDistanceSort("location", latitude, longitude)
                        .order(SortOrder.ASC)
                        .unit(DistanceUnit.KILOMETERS);
                sourceBuilder.sort(sortBuilder);
            }

            SearchRequest searchRequest = new SearchRequest("hospitals")
                    .source(sourceBuilder);

            SearchResponse response = elasticsearchClient.search(searchRequest, RequestOptions.DEFAULT);
            return convertToSuggestionResponse(response);
        } catch (Exception e) {
            throw new RuntimeException("Failed to get suggestions", e);
        }
    }

    public CommentHospitalSearchResponse searchHospitals(String query, int page, int size) {
        try {
            BoolQueryBuilder boolQuery = QueryBuilders.boolQuery()
                .should(QueryBuilders.matchPhrasePrefixQuery("yadmNm", query).boost(2.0f))
                .should(QueryBuilders.matchPhrasePrefixQuery("addr", query).boost(1.0f))
                .should(QueryBuilders.matchQuery("yadmNm", query).fuzziness("AUTO").boost(1.5f))
                .should(QueryBuilders.matchQuery("addr", query).fuzziness("AUTO").boost(1.0f))
                .minimumShouldMatch(1);

            SearchSourceBuilder sourceBuilder = new SearchSourceBuilder()
                .query(boolQuery)
                .from((page - 1) * size)
                .size(size)
                .highlighter(new HighlightBuilder()
                    .field("yadmNm")
                    .field("addr")
                    .preTags("<em>")
                    .postTags("</em>"));

            SearchRequest searchRequest = new SearchRequest("hospitals")
                .source(sourceBuilder);

            SearchResponse response = elasticsearchClient.search(searchRequest, RequestOptions.DEFAULT);
            return convertToSearchResponse(response, page, size);
        } catch (Exception e) {
            throw new RuntimeException("Failed to search hospitals", e);
        }
    }

    private CommentHospitalSuggestionResponse convertToSuggestionResponse(SearchResponse response) {
        CommentHospitalSuggestionResponse result = new CommentHospitalSuggestionResponse();
        List<CommentHospitalSuggestionResponse.HospitalSuggestion> suggestions = new ArrayList<>();

        for (SearchHit hit : response.getHits().getHits()) {
            Map<String, Object> source = hit.getSourceAsMap();
            CommentHospitalSuggestionResponse.HospitalSuggestion suggestion = new CommentHospitalSuggestionResponse.HospitalSuggestion();
            
            suggestion.setId(hit.getId());
            suggestion.setName((String) source.get("yadmNm"));
            suggestion.setAddress((String) source.get("addr"));
            suggestion.setRegion((String) source.get("region"));
            suggestion.setCategory((String) source.get("category"));
            suggestion.setMajor((String) source.get("major"));
            suggestion.setSpeciality((String) source.get("speciality"));
            suggestion.setScore((double) hit.getScore());
            
            if (hit.getSortValues().length > 0) {
                suggestion.setDistance((Double) hit.getSortValues()[0]);
            }

            suggestions.add(suggestion);
        }

        result.setHospital(suggestions);
        return result;
    }

    private CommentHospitalSearchResponse convertToSearchResponse(SearchResponse response, int page, int size) {
        CommentHospitalSearchResponse result = new CommentHospitalSearchResponse();
        List<CommentHospitalSearchResponse.HospitalSearch> hospitals = new ArrayList<>();

        for (SearchHit hit : response.getHits().getHits()) {
            Map<String, Object> source = hit.getSourceAsMap();
            CommentHospitalSearchResponse.HospitalSearch hospital = new CommentHospitalSearchResponse.HospitalSearch();
            
            hospital.setId(hit.getId());
            hospital.setName((String) source.get("yadmNm"));
            hospital.setAddress((String) source.get("addr"));
            hospital.setRegion((String) source.get("region"));
            hospital.setCategory((String) source.get("category"));
            
            // ArrayList 처리
            Object majorObj = source.get("major");
            if (majorObj instanceof List) {
                hospital.setMajor((List<String>) majorObj);
            } else if (majorObj instanceof String) {
                hospital.setMajor(Collections.singletonList((String) majorObj));
            } else {
                hospital.setMajor(new ArrayList<>());
            }

            Object specialityObj = source.get("speciality");
            if (specialityObj instanceof List) {
                hospital.setSpeciality((List<String>) specialityObj);
            } else if (specialityObj instanceof String) {
                hospital.setSpeciality(Collections.singletonList((String) specialityObj));
            } else {
                hospital.setSpeciality(new ArrayList<>());
            }

            hospital.setScore((double) hit.getScore());
            
            Map<String, List<String>> highlightMap = new HashMap<>();
            hit.getHighlightFields().forEach((key, value) -> 
                highlightMap.put(key, Arrays.asList(value.getFragments()).stream()
                    .map(fragment -> fragment.string())
                    .collect(Collectors.toList()))
            );
            hospital.setHighlight(highlightMap);

            hospitals.add(hospital);
        }

        result.setHospitals(hospitals);
        result.setTotal(response.getHits().getTotalHits().value);
        result.setPage(page);
        result.setSize(size);
        result.setTotalPages((int) Math.ceil((double) response.getHits().getTotalHits().value / size));

        return result;
    }
} 