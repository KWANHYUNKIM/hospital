package com.bippobippo.hospital.service.hospital;

import com.bippobippo.hospital.dto.request.hospital.HospitalSearchRequest;
import com.bippobippo.hospital.dto.response.hospital.HospitalSearchResponse;
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
import org.elasticsearch.index.query.functionscore.FunctionScoreQueryBuilder;
import org.elasticsearch.index.query.functionscore.ScoreFunctionBuilders;
import org.elasticsearch.script.Script;
import org.elasticsearch.script.ScriptType;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.sort.SortBuilders;
import org.elasticsearch.search.sort.SortOrder;
import org.elasticsearch.common.lucene.search.function.FunctionScoreQuery;
import org.elasticsearch.common.lucene.search.function.CombineFunction;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HospitalSearchService {

    private final RestHighLevelClient client;
    private static final String TIMEZONE = "Asia/Seoul";

    public HospitalSearchResponse searchHospitals(HospitalSearchRequest request) {
        try {
            int page = Integer.parseInt(request.getPage());
            int limit = Integer.parseInt(request.getLimit());

            // 현재 시간·요일 계산
            LocalDateTime now = LocalDateTime.now(ZoneId.of(TIMEZONE));
            int currentTime = now.getHour() * 60 + now.getMinute();
            String currentDay = now.format(DateTimeFormatter.ofPattern("EEEE")).toLowerCase();
            String dayKey = getDayKey(currentDay);

            // 1) BoolQueryBuilder 구성
            BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();

            // — 검색어
            if (request.getQuery() != null && !request.getQuery().isBlank()) {
                boolQuery.must(QueryBuilders.multiMatchQuery(request.getQuery().trim())
                        .field("yadmNm", 3f)
                        .field("addr")
                        .field("major")
                        .fuzziness(Fuzziness.AUTO));
            }

            // — 지역 필터
            if (request.getRegion() != null && !request.getRegion().equals("전국")) {
                boolQuery.filter(QueryBuilders.termQuery("region", request.getRegion()));
            }

            // — 진료과 필터
            if (request.getMajor() != null && !request.getMajor().equals("전체")) {
                boolQuery.must(QueryBuilders.matchQuery("major", request.getMajor()));
            }

            // — 카테고리 필터 ("영업중"은 스크립트로)
            if (request.getCategory() != null && !request.getCategory().equals("전체")) {
                if (request.getCategory().equals("영업중")) {
                    String scriptSrc =
                        "if(!doc.containsKey('times.trmt'+params.dayKey+'Start')||" +
                        "!doc.containsKey('times.trmt'+params.dayKey+'End')) return false;" +
                        "def s=doc['times.trmt'+params.dayKey+'Start'].value;" +
                        "def e=doc['times.trmt'+params.dayKey+'End'].value;" +
                        "if(s==null||e==null) return false;" +
                        "int sh=s/100, sm=s%100, eh=e/100, em=e%100;" +
                        "return params.currentTime >= (sh*60+sm) " +
                        "&& params.currentTime < (eh*60+em);";
                    Map<String, Object> params = Map.of(
                        "currentTime", currentTime,
                        "dayKey", dayKey
                    );
                    boolQuery.filter(QueryBuilders.scriptQuery(
                        new Script(ScriptType.INLINE, "painless", scriptSrc, params)
                    ));
                } else {
                    boolQuery.filter(QueryBuilders.termQuery(
                        "category.keyword", request.getCategory()
                    ));
                }
            }

            // — 진료과목 필터
            if (request.getSubject() != null && !request.getSubject().equals("전체")) {
                boolQuery.filter(QueryBuilders.matchQuery(
                    "subjects.dgsbjtCdNm", request.getSubject()
                ));
            }

            // — 거리 필터
            if (request.getX() != null && request.getY() != null) {
                boolQuery.filter(QueryBuilders.geoDistanceQuery("location")
                    .point(request.getY(), request.getX())
                    .distance(request.getDistance(), DistanceUnit.KILOMETERS)
                    .geoDistance(GeoDistance.ARC));
            }

            // 2) Function Score: 운영 시간 부스팅
            String boostSrc =
                "int ct=params.currentTime; String cd=params.currentDay;" +
                "if(!doc.containsKey('schedule.'+cd+'.openTime')||" +
                "!doc.containsKey('schedule.'+cd+'.closeTime')) return 0;" +
                "String o=doc['schedule.'+cd+'.openTime'].value.toString();" +
                "String c=doc['schedule.'+cd+'.closeTime'].value.toString();" +
                "if(o.length()<4||c.length()<4||o.equals('-')||c.equals('-')) return 0;" +
                "int oh=Integer.parseInt(o.substring(0,2)), om=Integer.parseInt(o.substring(2,4));" +
                "int ch=Integer.parseInt(c.substring(0,2)), cm=Integer.parseInt(c.substring(2,4));" +
                "return (ct >= (oh*60+om) && ct < (ch*60+cm)) ? 10.0 : 0;";
            Map<String, Object> boostParams = Map.of(
                "currentTime", currentTime,
                "currentDay", currentDay
            );
            Script boostScript = new Script(
                ScriptType.INLINE, "painless", boostSrc, boostParams
            );
            FunctionScoreQueryBuilder.FilterFunctionBuilder[] funcs = {
                new FunctionScoreQueryBuilder.FilterFunctionBuilder(
                    ScoreFunctionBuilders.scriptFunction(boostScript)
                )
            };
            FunctionScoreQueryBuilder funcScore = QueryBuilders.functionScoreQuery(boolQuery, funcs)
                .scoreMode(FunctionScoreQuery.ScoreMode.SUM)
                .boostMode(CombineFunction.SUM);

            // 3) SearchSourceBuilder 구성
            SearchSourceBuilder source = new SearchSourceBuilder()
                .query(funcScore)
                .from((page - 1) * limit)
                .size(limit);

            // — 거리 정렬
            if (request.getX() != null && request.getY() != null) {
                source.sort(SortBuilders.geoDistanceSort(
                        "location", request.getY(), request.getX()
                    )
                    .unit(DistanceUnit.KILOMETERS)
                    .order(SortOrder.ASC)
                    .geoDistance(GeoDistance.ARC)
                );
            }

            // 4) 실행 및 매핑
            SearchRequest sr = new SearchRequest("hospitals");
            sr.source(source);
            SearchResponse resp = client.search(sr, RequestOptions.DEFAULT);

            List<Map<String, Object>> hits = new ArrayList<>();
            resp.getHits().forEach(h -> {
                Map<String, Object> src = h.getSourceAsMap();
                src.put("_id", h.getId());
                hits.add(src);
            });

            long total = resp.getHits().getTotalHits().value;
            int totalPages = (int) Math.ceil((double) total / limit);

            return HospitalSearchResponse.builder()
                .data(hits)
                .totalCount(total)
                .currentPage(page)
                .totalPages(totalPages)
                .build();

        } catch (IOException e) {
            throw new RuntimeException("검색 중 오류가 발생했습니다.", e);
        }
    }

    private String getDayKey(String day) {
        return Map.of(
            "monday", "Mon", "tuesday", "Tue", "wednesday", "Wed", "thursday", "Thu",
            "friday", "Fri", "saturday", "Sat", "sunday", "Sun"
        ).getOrDefault(day.toLowerCase(), "Mon");
    }
}