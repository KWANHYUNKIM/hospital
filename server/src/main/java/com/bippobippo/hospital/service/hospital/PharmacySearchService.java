package com.bippobippo.hospital.service.hospital;

import com.bippobippo.hospital.dto.request.search.PharmacySearchRequest;
import com.bippobippo.hospital.dto.response.search.PharmacySearchResponse;
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
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.sort.SortBuilders;
import org.elasticsearch.search.sort.SortOrder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PharmacySearchService {

    private final RestHighLevelClient client;

    public PharmacySearchResponse searchPharmacies(PharmacySearchRequest request) {
        try {
            int page = Integer.parseInt(request.getPage());
            int limit = Integer.parseInt(request.getLimit());

            // 1) BoolQueryBuilder 구성
            BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();

            // — 검색어
            if (request.getQuery() != null && !request.getQuery().isBlank()) {
                boolQuery.must(QueryBuilders.multiMatchQuery(request.getQuery().trim())
                        .field("yadmNm", 3f)
                        .field("addr")
                        .field("sidoCdNm")
                        .field("sgguCdNm")
                        .fuzziness(Fuzziness.AUTO));
            } else {
                boolQuery.must(QueryBuilders.matchAllQuery());
            }

            // — 지역 필터
            if (request.getRegion() != null && !request.getRegion().equals("전국")) {
                boolQuery.filter(QueryBuilders.termQuery("sidoCdNm", request.getRegion()));
            }

            // — 약국 유형 필터
            if (request.getType() != null && !request.getType().equals("전체")) {
                boolQuery.filter(QueryBuilders.termQuery("clCdNm", request.getType()));
            }

            // — 거리 필터
            if (request.getX() != null && request.getY() != null) {
                boolQuery.filter(QueryBuilders.geoDistanceQuery("location")
                    .point(request.getY(), request.getX())
                    .distance(request.getDistance(), DistanceUnit.KILOMETERS)
                    .geoDistance(GeoDistance.ARC));
            }

            // 2) SearchSourceBuilder 구성
            SearchSourceBuilder source = new SearchSourceBuilder()
                .query(boolQuery)
                .from((page - 1) * limit)
                .size(limit);

            // — 거리 정렬
            if (request.getX() != null && request.getY() != null) {
                source.sort(SortBuilders.geoDistanceSort(
                        "location", request.getY(), request.getX()
                    )
                    .unit(DistanceUnit.METERS)
                    .order(SortOrder.ASC)
                    .geoDistance(GeoDistance.ARC)
                );
            }

            // 3) 실행 및 매핑
            SearchRequest sr = new SearchRequest("pharmacies");
            sr.source(source);
            SearchResponse resp = client.search(sr, RequestOptions.DEFAULT);

            List<Map<String, Object>> hits = new ArrayList<>();
            resp.getHits().forEach(h -> {
                Map<String, Object> src = h.getSourceAsMap();
                src.put("_id", h.getId());
                if (h.getSortValues().length > 0) {
                    src.put("distance", Math.round((Double) h.getSortValues()[0]));
                }
                hits.add(src);
            });

            long total = resp.getHits().getTotalHits().value;
            int totalPages = (int) Math.ceil((double) total / limit);

            return PharmacySearchResponse.builder()
                .data(hits)
                .totalCount(total)
                .currentPage(page)
                .totalPages(totalPages)
                .build();

        } catch (IOException e) {
            throw new RuntimeException("검색 중 오류가 발생했습니다.", e);
        }
    }
} 