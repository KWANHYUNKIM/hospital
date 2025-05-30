package com.bippobippo.hospital.impl;

import com.bippobippo.hospital.service.map.MapService;
import com.bippobippo.hospital.model.MapData;
import lombok.RequiredArgsConstructor;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.common.geo.GeoDistance;
import org.elasticsearch.common.unit.DistanceUnit;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.bucket.geogrid.GeoGridAggregationBuilder;
import org.elasticsearch.search.aggregations.bucket.geogrid.ParsedGeoHashGrid;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.sort.GeoDistanceSortBuilder;
import org.elasticsearch.search.sort.SortBuilders;
import org.elasticsearch.search.sort.SortOrder;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.IndexOperations;
import org.springframework.data.mongodb.core.index.IndexResolver;
import org.springframework.data.mongodb.core.index.MongoPersistentEntityIndexResolver;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MapServiceImpl implements MapService {

    private final RestHighLevelClient client;
    private final MongoTemplate mongoTemplate;
    private final MongoMappingContext mongoMappingContext;

    @Override
    public List<Map<String, Object>> getMapData(String type, Double swLat, Double swLng, Double neLat, Double neLng, Integer limit) {
        try {
            BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();

            if (type != null) {
                boolQuery.must(QueryBuilders.termQuery("type", type));
            }

            if (swLat != null && swLng != null && neLat != null && neLng != null) {
                boolQuery.filter(QueryBuilders.geoBoundingBoxQuery("location")
                    .setCorners(neLat, swLng, swLat, neLng));
            }

            SearchSourceBuilder source = new SearchSourceBuilder()
                .query(boolQuery)
                .size(limit != null ? limit : 100)
                .fetchSource(new String[]{
                    "type", "name", "address", "yadmNm", "addr", "telno", "location",
                    "clCdNm", "sidoCdNm", "sgguCdNm", "postNo", "estbDd", "hospUrl"
                }, null);

            SearchRequest request = new SearchRequest("map_data");
            request.source(source);
            SearchResponse response = client.search(request, RequestOptions.DEFAULT);

            List<Map<String, Object>> results = new ArrayList<>();
            response.getHits().forEach(hit -> {
                Map<String, Object> sourceMap = hit.getSourceAsMap();
                Map<String, Object> location = (Map<String, Object>) sourceMap.get("location");
                if (location != null) {
                    sourceMap.put("lat", location.get("lat"));
                    sourceMap.put("lng", location.get("lon"));
                }
                results.add(sourceMap);
            });

            return results;
        } catch (IOException e) {
            throw new RuntimeException("지도 데이터 조회 중 오류가 발생했습니다.", e);
        }
    }

    @Override
    public List<Map<String, Object>> search(String query) {
        try {
            BoolQueryBuilder boolQuery = QueryBuilders.boolQuery()
                .should(QueryBuilders.matchQuery("name", query))
                .should(QueryBuilders.matchQuery("yadmNm", query))
                .should(QueryBuilders.matchQuery("address", query))
                .should(QueryBuilders.matchQuery("addr", query))
                .minimumShouldMatch(1);

            SearchSourceBuilder source = new SearchSourceBuilder()
                .query(boolQuery)
                .size(10);

            SearchRequest request = new SearchRequest("map_data");
            request.source(source);
            SearchResponse response = client.search(request, RequestOptions.DEFAULT);

            List<Map<String, Object>> results = new ArrayList<>();
            response.getHits().forEach(hit -> results.add(hit.getSourceAsMap()));
            return results;
        } catch (IOException e) {
            throw new RuntimeException("검색 중 오류가 발생했습니다.", e);
        }
    }

    @Override
    public List<Map<String, Object>> getSummary() {
        // TODO: Elasticsearch Aggregation으로 구현
        return new ArrayList<>();
    }

    @Override
    public List<Map<String, Object>> getSidoSummary() {
        // TODO: Elasticsearch Aggregation으로 구현
        return new ArrayList<>();
    }

    @Override
    public List<Map<String, Object>> getSgguSummary(Double swLat, Double swLng, Double neLat, Double neLng) {
        // TODO: Elasticsearch Aggregation으로 구현
        return new ArrayList<>();
    }

    @Override
    public List<Map<String, Object>> getEmdongSummary(Double swLat, Double swLng, Double neLat, Double neLng) {
        // TODO: Elasticsearch Aggregation으로 구현
        return new ArrayList<>();
    }

    @Override
    public List<String> getRiSummary() {
        // TODO: Elasticsearch Aggregation으로 구현
        return new ArrayList<>();
    }

    @Override
    public List<Map<String, Object>> getClusters(Double swLat, Double swLng, Double neLat, Double neLng, Double centerLat, Double centerLng, Integer radius) {
        try {
            // 위도/경도 값 검증
            if (swLat == null || swLng == null || neLat == null || neLng == null || 
                centerLat == null || centerLng == null || radius == null) {
                throw new IllegalArgumentException("유효하지 않은 좌표값");
            }

            BoolQueryBuilder boolQuery = QueryBuilders.boolQuery()
                .filter(QueryBuilders.termQuery("type", "cluster"))
                .filter(QueryBuilders.geoDistanceQuery("location")
                    .point(centerLat, centerLng)
                    .distance(radius, DistanceUnit.KILOMETERS));

            SearchSourceBuilder source = new SearchSourceBuilder()
                .query(boolQuery)
                .size(50)
                .fetchSource(new String[]{
                    "location", "clusterCount", "hospitalCount", "pharmacyCount", 
                    "clusterId", "hospitals", "pharmacies"
                }, null);

            // 거리순 정렬 추가
            GeoDistanceSortBuilder sortBuilder = SortBuilders.geoDistanceSort("location", centerLat, centerLng)
                .order(SortOrder.ASC)
                .unit(DistanceUnit.KILOMETERS);
            source.sort(sortBuilder);

            SearchRequest request = new SearchRequest("map_data");
            request.source(source);
            SearchResponse response = client.search(request, RequestOptions.DEFAULT);

            List<Map<String, Object>> clusters = new ArrayList<>();
            response.getHits().forEach(hit -> {
                Map<String, Object> sourceMap = hit.getSourceAsMap();
                Map<String, Object> cluster = new HashMap<>();
                cluster.put("id", hit.getId());
                cluster.put("type", "cluster");
                cluster.put("location", sourceMap.get("location"));
                cluster.put("clusterCount", sourceMap.getOrDefault("clusterCount", 0));
                cluster.put("hospitalCount", sourceMap.getOrDefault("hospitalCount", 0));
                cluster.put("pharmacyCount", sourceMap.getOrDefault("pharmacyCount", 0));
                
                // clusterId가 없으면 location 좌표로 생성
                String clusterId = (String) sourceMap.get("clusterId");
                if (clusterId == null) {
                    Map<String, Object> location = (Map<String, Object>) sourceMap.get("location");
                    clusterId = location.get("lat") + "_" + location.get("lon");
                }
                cluster.put("clusterId", clusterId);

                // details 객체 생성
                Map<String, Object> details = new HashMap<>();
                details.put("hospitals", sourceMap.getOrDefault("hospitals", new ArrayList<>()));
                details.put("pharmacies", sourceMap.getOrDefault("pharmacies", new ArrayList<>()));
                cluster.put("details", details);

                clusters.add(cluster);
            });

            return clusters;
        } catch (IOException e) {
            throw new RuntimeException("클러스터 데이터 조회 중 오류가 발생했습니다.", e);
        }
    }

    @Override
    public List<Map<String, Object>> getMapCluster(Double swLat, Double swLng, Double neLat, Double neLng, Integer zoomLevel) {
        try {
            // 위도/경도 값 검증
            if (swLat == null || swLng == null || neLat == null || neLng == null) {
                throw new IllegalArgumentException("유효하지 않은 좌표값");
            }

            // 줌 레벨에 따른 경계 타입 결정
            String boundaryType;
            if (zoomLevel >= 15) {
                boundaryType = "emd,li";  // 동과 리 모두 포함
            } else if (zoomLevel >= 13) {
                boundaryType = "emd";
            } else if (zoomLevel >= 11) {
                boundaryType = "sig";
            } else {
                boundaryType = "ctprvn";
            }

            BoolQueryBuilder boolQuery = QueryBuilders.boolQuery();

            // boundaryType 쿼리 추가
            if (boundaryType.contains(",")) {
                boolQuery.must(QueryBuilders.termsQuery("boundaryType", boundaryType.split(",")));
            } else {
                boolQuery.must(QueryBuilders.termQuery("boundaryType", boundaryType));
            }

            // geo_bounding_box 필터 추가
            boolQuery.filter(QueryBuilders.geoBoundingBoxQuery("location")
                .setCorners(
                    Math.max(swLat, neLat),
                    Math.min(swLng, neLng),
                    Math.min(swLat, neLat),
                    Math.max(swLng, neLng)
                ));

            SearchSourceBuilder source = new SearchSourceBuilder()
                .query(boolQuery)
                .size(100);

            SearchRequest request = new SearchRequest("map_data_cluster");
            request.source(source);
            SearchResponse response = client.search(request, RequestOptions.DEFAULT);

            List<Map<String, Object>> clusters = new ArrayList<>();
            response.getHits().forEach(hit -> {
                Map<String, Object> sourceMap = hit.getSourceAsMap();
                Map<String, Object> cluster = new HashMap<>();
                cluster.put("id", hit.getId());
                cluster.put("name", sourceMap.get("name"));
                cluster.put("boundaryType", sourceMap.get("boundaryType"));
                cluster.put("boundaryId", sourceMap.get("boundaryId"));
                cluster.put("location", sourceMap.get("location"));
                cluster.put("hospitalCount", sourceMap.getOrDefault("hospitalCount", 0));
                cluster.put("pharmacyCount", sourceMap.getOrDefault("pharmacyCount", 0));
                cluster.put("isClustered", sourceMap.getOrDefault("isClustered", false));
                clusters.add(cluster);
            });

            return clusters;
        } catch (IOException e) {
            throw new RuntimeException("맵 클러스터 데이터 조회 중 오류가 발생했습니다.", e);
        }
    }

    @Override
    public Map<String, Object> getBoundaryGeometry(String boundaryType, String name) {
        try {
            if (boundaryType == null || name == null) {
                throw new IllegalArgumentException("경계 타입과 이름이 필요합니다.");
            }

            String collectionName;
            String queryField;
            switch(boundaryType) {
                case "ctprvn":
                    collectionName = "sggu_boundaries_ctprvn";
                    queryField = "properties.CTP_KOR_NM";
                    break;
                case "sig":
                    collectionName = "sggu_boundaries_sig";
                    queryField = "properties.SIG_KOR_NM";
                    break;
                case "emd":
                    collectionName = "sggu_boundaries_emd";
                    queryField = "properties.EMD_KOR_NM";
                    break;
                case "li":
                    collectionName = "sggu_boundaries_li";
                    queryField = "properties.LI_KOR_NM";
                    break;
                default:
                    throw new IllegalArgumentException("유효하지 않은 경계 타입입니다.");
            }

            // MongoDB 쿼리 생성
            Query query = new Query(Criteria.where(queryField).is(name));
            Map<String, Object> boundary = mongoTemplate.findOne(query, Map.class, collectionName);

            if (boundary == null) {
                throw new RuntimeException("해당하는 경계를 찾을 수 없습니다.");
            }

            Map<String, Object> geometry = (Map<String, Object>) boundary.get("geometry");
            if (geometry == null || !Arrays.asList("MultiPolygon", "Polygon").contains(geometry.get("type"))) {
                throw new RuntimeException("유효하지 않은 geometry 타입입니다.");
            }

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("type", boundaryType);
            responseData.put("name", name);
            responseData.put("geometry", geometry);
            responseData.put("geometryType", geometry.get("type"));

            return responseData;
        } catch (Exception e) {
            throw new RuntimeException("경계 geometry 데이터 조회 중 오류가 발생했습니다.", e);
        }
    }

    private int calculatePrecision(int zoomLevel) {
        // zoomLevel에 따른 적절한 precision 값 반환
        if (zoomLevel <= 4) return 1;
        if (zoomLevel <= 8) return 2;
        if (zoomLevel <= 10) return 3;
        if (zoomLevel <= 12) return 4;
        if (zoomLevel <= 14) return 5;
        if (zoomLevel <= 16) return 6;
        return 7;
    }
} 