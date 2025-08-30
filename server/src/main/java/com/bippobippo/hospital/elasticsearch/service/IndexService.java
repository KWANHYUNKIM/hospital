package com.bippobippo.hospital.elasticsearch.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.client.indices.CreateIndexRequest;
import org.elasticsearch.client.indices.GetIndexRequest;
import org.elasticsearch.action.admin.indices.delete.DeleteIndexRequest;
import org.elasticsearch.client.indices.GetIndexResponse;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.xcontent.XContentType;
import org.elasticsearch.action.support.master.AcknowledgedResponse;
import org.elasticsearch.client.indices.GetIndexRequest;
import org.elasticsearch.client.core.CountRequest;
import org.elasticsearch.client.core.CountResponse;
import org.elasticsearch.client.RequestOptions;

import java.io.IOException;
import java.util.Map;
import java.util.HashMap;

@Service
public class IndexService {
    
    private static final Logger logger = LoggerFactory.getLogger(IndexService.class);
    
    @Autowired
    private RestHighLevelClient elasticsearchClient;
    
    /**
     * 병원 인덱스 생성
     */
    public void createHospitalIndex() throws IOException {
        try {
            // 인덱스 존재 여부 확인
            GetIndexRequest existsRequest = new GetIndexRequest("hospitals");
            boolean existsResponse = elasticsearchClient.indices().exists(existsRequest, RequestOptions.DEFAULT);
            
            if (existsResponse) {
                logger.info("기존 인덱스 'hospitals' 삭제 중...");
                DeleteIndexRequest deleteRequest = new DeleteIndexRequest("hospitals");
                AcknowledgedResponse deleteResponse = elasticsearchClient.indices().delete(deleteRequest, RequestOptions.DEFAULT);
                logger.info("기존 인덱스 'hospitals' 삭제 완료!");
            }

            // 인덱스 생성
            CreateIndexRequest createRequest = new CreateIndexRequest("hospitals");
            createRequest.settings(Settings.builder()
                .put("index.number_of_shards", 3)
                .put("index.number_of_replicas", 1)
            );
            
            String mappingJson = """
                {
                  "properties": {
                    "yadmNm": { "type": "text" },
                    "addr": { "type": "text" },
                    "region": { "type": "keyword" },
                    "subject": { "type": "text" },
                    "major": { "type": "keyword" },
                    "location": { "type": "geo_point" },
                    "hospUrl": { "type": "text" },
                    "telno": { "type": "text" },
                    "times": {
                      "type": "object",
                      "dynamic": true,
                      "properties": {
                        "trmtMonStart": { "type": "text" },
                        "trmtMonEnd": { "type": "text" },
                        "trmtTueStart": { "type": "text" },
                        "trmtTueEnd": { "type": "text" },
                        "trmtWedStart": { "type": "text" },
                        "trmtWedEnd": { "type": "text" },
                        "trmtThuStart": { "type": "text" },
                        "trmtThuEnd": { "type": "text" },
                        "trmtFriStart": { "type": "text" },
                        "trmtFriEnd": { "type": "text" },
                        "trmtSatStart": { "type": "text" },
                        "trmtSatEnd": { "type": "text" },
                        "lunchWeek": { "type": "text" },
                        "rcvWeek": { "type": "text" },
                        "rcvSat": { "type": "text" },
                        "emyNgtYn": { "type": "text" },
                        "noTrmtSat": { "type": "text" },
                        "noTrmtSun": { "type": "text" },
                        "emyDayTelNo1": { "type": "text" },
                        "emyDayTelNo2": { "type": "text" },
                        "emyDayYn": { "type": "text" },
                        "emyNgtTelNo1": { "type": "text" },
                        "emyNgtTelNo2": { "type": "text" },
                        "noTrmtHoli": { "type": "text" },
                        "parkEtc": { "type": "text" },
                        "parkQty": { "type": "integer" },
                        "parkXpnsYn": { "type": "text" },
                        "plcDir": { "type": "text" },
                        "plcDist": { "type": "text" },
                        "plcNm": { "type": "text" }
                      }
                    },
                    "equipment": {
                      "type": "nested",
                      "properties": {
                        "typeCd": { "type": "text" },
                        "typeCdNm": { "type": "text" },
                        "typeCnt": { "type": "text" }
                      }
                    },
                    "food_treatment": {
                      "type": "nested",
                      "properties": {
                        "typeCd": { "type": "text" },
                        "typeCdNm": { "type": "text" },
                        "genMealAddYn": { "type": "text" },
                        "psnlCnt": { "type": "text" }
                      }
                    },
                    "intensive_care": {
                      "type": "nested",
                      "properties": {
                        "typeCd": { "type": "text" },
                        "typeCdNm": { "type": "text" }
                      }
                    },
                    "nursing_grade": {
                      "type": "nested",
                      "properties": {
                        "typeCd": { "type": "text" },
                        "typeCdNm": { "type": "text" },
                        "nursingRt": { "type": "text" }
                      }
                    },
                    "personnel": {
                      "type": "nested",
                      "properties": {
                        "pharmCd": { "type": "text" },
                        "typeCdNm": { "type": "text" },
                        "pharmCnt": { "type": "text" }
                      }
                    },
                    "speciality": {
                      "type": "nested",
                      "properties": {
                        "typeCd": { "type": "text" },
                        "typeCdNm": { "type": "text" }
                      }
                    }
                  }
                }
                """;
            
            createRequest.mapping(mappingJson, XContentType.JSON);
            elasticsearchClient.indices().create(createRequest, RequestOptions.DEFAULT);
            logger.info("✅ 병원 인덱스 'hospitals' 생성 완료!");
            
        } catch (Exception e) {
            logger.error("❌ 병원 인덱스 생성 중 오류 발생:", e);
            throw e;
        }
    }
    
    /**
     * 약국 인덱스 생성
     */
    public void createPharmaciesIndex() throws IOException {
        try {
            // 인덱스 존재 여부 확인
            GetIndexRequest existsRequest = new GetIndexRequest("pharmacies");
            boolean existsResponse = elasticsearchClient.indices().exists(existsRequest, RequestOptions.DEFAULT);
            
            if (existsResponse) {
                logger.info("기존 인덱스 'pharmacies' 삭제 중...");
                DeleteIndexRequest deleteRequest = new DeleteIndexRequest("pharmacies");
                AcknowledgedResponse deleteResponse = elasticsearchClient.indices().delete(deleteRequest, RequestOptions.DEFAULT);
                logger.info("기존 인덱스 'pharmacies' 삭제 완료!");
            }

            // 인덱스 생성
            CreateIndexRequest createRequest = new CreateIndexRequest("pharmacies");
            createRequest.settings(Settings.builder()
                .put("index.number_of_shards", 3)
                .put("index.number_of_replicas", 1)
            );
            
            String mappingJson = """
                {
                  "properties": {
                    "ykiho": { "type": "keyword" },
                    "yadmNm": { "type": "text" },
                    "clCd": { "type": "keyword" },
                    "clCdNm": { "type": "keyword" },
                    "sidoCd": { "type": "keyword" },
                    "sidoCdNm": { "type": "keyword" },
                    "sgguCd": { "type": "keyword" },
                    "sgguCdNm": { "type": "keyword" },
                    "emdongNm": { "type": "keyword" },
                    "postNo": { "type": "keyword" },
                    "addr": { "type": "text" },
                    "telno": { "type": "text" },
                    "estbDd": { "type": "keyword" },
                    "location": { "type": "geo_point" }
                  }
                }
                """;
            
            createRequest.mapping(mappingJson, XContentType.JSON);
            elasticsearchClient.indices().create(createRequest, RequestOptions.DEFAULT);
            logger.info("✅ 약국 인덱스 'pharmacies' 생성 완료!");
            
        } catch (Exception e) {
            logger.error("❌ 약국 인덱스 생성 중 오류 발생:", e);
            throw e;
        }
    }
    
    /**
     * 지도 인덱스 생성
     */
    public void createMapIndex() throws IOException {
        try {
            // 인덱스 존재 여부 확인
            GetIndexRequest existsRequest = new GetIndexRequest("map_data");
            boolean existsResponse = elasticsearchClient.indices().exists(existsRequest, RequestOptions.DEFAULT);
            
            if (existsResponse) {
                logger.info("기존 인덱스 'map_data' 삭제 중...");
                DeleteIndexRequest deleteRequest = new DeleteIndexRequest("map_data");
                AcknowledgedResponse deleteResponse = elasticsearchClient.indices().delete(deleteRequest, RequestOptions.DEFAULT);
                logger.info("기존 인덱스 'map_data' 삭제 완료!");
            }

            // 인덱스 생성
            CreateIndexRequest createRequest = new CreateIndexRequest("map_data");
            createRequest.settings(Settings.builder()
                .put("index.number_of_shards", 3)
                .put("index.number_of_replicas", 1)
            );
            
            String mappingJson = """
                {
                  "properties": {
                    "id": { "type": "keyword" },
                    "type": { "type": "keyword" },
                    "name": { "type": "text" },
                    "address": { "type": "text" },
                    "location": { "type": "geo_point" },
                    "category": { "type": "keyword" },
                    "region": { "type": "keyword" }
                  }
                }
                """;
            
            createRequest.mapping(mappingJson, XContentType.JSON);
            elasticsearchClient.indices().create(createRequest, RequestOptions.DEFAULT);
            logger.info("✅ 지도 인덱스 'map_data' 생성 완료!");
            
        } catch (Exception e) {
            logger.error("❌ 지도 인덱스 생성 중 오류 발생:", e);
            throw e;
        }
    }
    
    /**
     * 지도 클러스터 인덱스 생성
     */
    public boolean createMapClusterIndex() throws IOException {
        try {
            // 인덱스 존재 여부 확인
            GetIndexRequest existsRequest = new GetIndexRequest("map_data_cluster");
            boolean existsResponse = elasticsearchClient.indices().exists(existsRequest, RequestOptions.DEFAULT);
            
            if (existsResponse) {
                logger.info("기존 인덱스 'map_data_cluster' 삭제 중...");
                DeleteIndexRequest deleteRequest = new DeleteIndexRequest("map_data_cluster");
                AcknowledgedResponse deleteResponse = elasticsearchClient.indices().delete(deleteRequest, RequestOptions.DEFAULT);
                logger.info("기존 인덱스 'map_data_cluster' 삭제 완료!");
            }

            // 인덱스 생성
            CreateIndexRequest createRequest = new CreateIndexRequest("map_data_cluster");
            createRequest.settings(Settings.builder()
                .put("index.number_of_shards", 1)
                .put("index.number_of_replicas", 1)
            );
            
            String mappingJson = """
                {
                  "properties": {
                    "type": { "type": "keyword" },
                    "name": { "type": "text" },
                    "boundaryType": { "type": "keyword" },
                    "boundaryId": { "type": "keyword" },
                    "location": { "type": "geo_point" },
                    "clusterId": { "type": "keyword" },
                    "hospitalCount": { "type": "integer" },
                    "pharmacyCount": { "type": "integer" },
                    "isClustered": { "type": "boolean" }
                  }
                }
                """;
            
            createRequest.mapping(mappingJson, XContentType.JSON);
            elasticsearchClient.indices().create(createRequest, RequestOptions.DEFAULT);
            logger.info("✅ 지도 클러스터 인덱스 'map_data_cluster' 생성 완료!");
            return true;
            
        } catch (Exception e) {
            logger.error("❌ 지도 클러스터 인덱스 생성 중 오류 발생:", e);
            return false;
        }
    }
    
    /**
     * 병원 인덱스 삭제
     */
    public void deleteHospitalsIndex() throws IOException {
        try {
            GetIndexRequest existsRequest = new GetIndexRequest("hospitals");
            boolean existsResponse = elasticsearchClient.indices().exists(existsRequest, RequestOptions.DEFAULT);
            if (existsResponse) {
                DeleteIndexRequest deleteRequest = new DeleteIndexRequest("hospitals");
                AcknowledgedResponse deleteResponse = elasticsearchClient.indices().delete(deleteRequest, RequestOptions.DEFAULT);
                logger.info("✅ 병원 인덱스 'hospitals' 삭제 완료!");
            } else {
                logger.info("병원 인덱스 'hospitals'가 존재하지 않습니다.");
            }
        } catch (Exception e) {
            logger.error("❌ 병원 인덱스 삭제 중 오류 발생:", e);
            throw e;
        }
    }
    
    /**
     * 약국 인덱스 삭제
     */
    public void deletePharmaciesIndex() throws IOException {
        try {
            GetIndexRequest existsRequest = new GetIndexRequest("pharmacies");
            boolean existsResponse = elasticsearchClient.indices().exists(existsRequest, RequestOptions.DEFAULT);
            if (existsResponse) {
                DeleteIndexRequest deleteRequest = new DeleteIndexRequest("pharmacies");
                AcknowledgedResponse deleteResponse = elasticsearchClient.indices().delete(deleteRequest, RequestOptions.DEFAULT);
                logger.info("✅ 약국 인덱스 'pharmacies' 삭제 완료!");
            } else {
                logger.info("약국 인덱스 'pharmacies'가 존재하지 않습니다.");
            }
        } catch (Exception e) {
            logger.error("❌ 약국 인덱스 삭제 중 오류 발생:", e);
            throw e;
        }
    }
    
    /**
     * 지도 인덱스 삭제
     */
    public void deleteMapIndex() throws IOException {
        try {
            GetIndexRequest existsRequest = new GetIndexRequest("map_data");
            boolean existsResponse = elasticsearchClient.indices().exists(existsRequest, RequestOptions.DEFAULT);
            if (existsResponse) {
                DeleteIndexRequest deleteRequest = new DeleteIndexRequest("map_data");
                AcknowledgedResponse deleteResponse = elasticsearchClient.indices().delete(deleteRequest, RequestOptions.DEFAULT);
                logger.info("✅ 지도 인덱스 'map_data' 삭제 완료!");
            } else {
                logger.info("지도 인덱스 'map_data'가 존재하지 않습니다.");
            }
        } catch (Exception e) {
            logger.error("❌ 지도 인덱스 삭제 중 오류 발생:", e);
            throw e;
        }
    }
    
    /**
     * 지도 클러스터 인덱스 삭제
     */
    public void deleteMapClusterIndex() throws IOException {
        try {
            GetIndexRequest existsRequest = new GetIndexRequest("map_cluster");
            boolean existsResponse = elasticsearchClient.indices().exists(existsRequest, RequestOptions.DEFAULT);
            if (existsResponse) {
                DeleteIndexRequest deleteRequest = new DeleteIndexRequest("map_cluster");
                AcknowledgedResponse deleteResponse = elasticsearchClient.indices().delete(deleteRequest, RequestOptions.DEFAULT);
                logger.info("✅ 지도 클러스터 인덱스 'map_cluster' 삭제 완료!");
            } else {
                logger.info("지도 클러스터 인덱스 'map_cluster'가 존재하지 않습니다.");
            }
        } catch (Exception e) {
            logger.error("❌ 지도 클러스터 인덱스 삭제 중 오류 발생:", e);
            throw e;
        }
    }
    
    /**
     * 인덱스 문서 수 조회
     */
    public long getDocumentCount(String indexName) throws IOException {
        try {
            CountRequest countRequest = new CountRequest(indexName);
            CountResponse response = elasticsearchClient.count(countRequest, RequestOptions.DEFAULT);
            return response.getCount();
        } catch (Exception e) {
            logger.error("❌ 인덱스 {} 문서 수 조회 중 오류 발생:", indexName, e);
            return 0;
        }
    }
    
    /**
     * 인덱스 존재 여부 확인
     */
    public boolean indexExists(String indexName) throws IOException {
        try {
            GetIndexRequest existsRequest = new GetIndexRequest(indexName);
            boolean existsResponse = elasticsearchClient.indices().exists(existsRequest, RequestOptions.DEFAULT);
            return existsResponse;
        } catch (Exception e) {
            logger.error("❌ 인덱스 {} 존재 여부 확인 중 오류 발생:", indexName, e);
            return false;
        }
    }
    
    /**
     * 인덱스 삭제 (일반적인 인덱스)
     */
    public boolean deleteIndex(String indexName) throws IOException {
        try {
            GetIndexRequest existsRequest = new GetIndexRequest(indexName);
            boolean existsResponse = elasticsearchClient.indices().exists(existsRequest, RequestOptions.DEFAULT);
            if (existsResponse) {
                DeleteIndexRequest deleteRequest = new DeleteIndexRequest(indexName);
                AcknowledgedResponse deleteResponse = elasticsearchClient.indices().delete(deleteRequest, RequestOptions.DEFAULT);
                logger.info("✅ 인덱스 '{}' 삭제 완료!", indexName);
                return deleteResponse.isAcknowledged();
            } else {
                logger.info("인덱스 '{}'가 존재하지 않습니다.", indexName);
                return true;
            }
        } catch (Exception e) {
            logger.error("❌ 인덱스 {} 삭제 중 오류 발생:", indexName, e);
            return false;
        }
    }
    
    /**
     * map_data 인덱스 생성
     */
    public boolean createMapDataIndex() throws IOException {
        try {
            // 인덱스 존재 여부 확인
            GetIndexRequest existsRequest = new GetIndexRequest("map_data");
            boolean existsResponse = elasticsearchClient.indices().exists(existsRequest, RequestOptions.DEFAULT);
            
            if (existsResponse) {
                logger.info("기존 인덱스 'map_data' 삭제 중...");
                DeleteIndexRequest deleteRequest = new DeleteIndexRequest("map_data");
                AcknowledgedResponse deleteResponse = elasticsearchClient.indices().delete(deleteRequest, RequestOptions.DEFAULT);
                logger.info("기존 인덱스 'map_data' 삭제 완료!");
            }

            // 인덱스 생성
            CreateIndexRequest createRequest = new CreateIndexRequest("map_data");
            createRequest.settings(Settings.builder()
                .put("index.number_of_shards", 1)
                .put("index.number_of_replicas", 1)
            );
            
            String mappingJson = """
                {
                  "properties": {
                    "type": { "type": "keyword" },
                    "name": { "type": "text" },
                    "address": { "type": "text" },
                    "category": { "type": "keyword" },
                    "region": { "type": "keyword" },
                    "location": { "type": "geo_point" },
                    "clusterId": { "type": "keyword" },
                    "clusterCount": { "type": "integer" },
                    "isClustered": { "type": "boolean" }
                  }
                }
                """;
            
            createRequest.mapping(mappingJson, XContentType.JSON);
            
            AcknowledgedResponse response = elasticsearchClient.indices().create(createRequest, RequestOptions.DEFAULT);
            
            if (response.isAcknowledged()) {
                logger.info("✅ map_data 인덱스 생성 완료!");
                return true;
            } else {
                logger.error("❌ map_data 인덱스 생성 실패!");
                return false;
            }
            
        } catch (Exception e) {
            logger.error("❌ map_data 인덱스 생성 중 오류 발생:", e);
            return false;
        }
    }
    
    /**
     * 인덱스 정보 조회
     */
    public Map<String, Object> getIndexInfo(String indexName) throws IOException {
        try {
            GetIndexRequest getRequest = new GetIndexRequest(indexName);
            GetIndexResponse response = elasticsearchClient.indices().get(getRequest, RequestOptions.DEFAULT);
            
            Map<String, Object> indexInfo = new HashMap<>();
            indexInfo.put("indexName", indexName);
            indexInfo.put("exists", true);
            
            // 인덱스 설정 정보
            if (response.getSettings().get(indexName) != null) {
                Settings settings = response.getSettings().get(indexName);
                indexInfo.put("shards", settings.getAsInt("index.number_of_shards", 1));
                indexInfo.put("replicas", settings.getAsInt("index.number_of_replicas", 1));
            }
            
            // 매핑 정보
            if (response.getMappings().get(indexName) != null) {
                indexInfo.put("mappings", response.getMappings().get(indexName).sourceAsMap());
            }
            
            // 문서 수
            long documentCount = getDocumentCount(indexName);
            indexInfo.put("documentCount", documentCount);
            
            return indexInfo;
            
        } catch (Exception e) {
            logger.error("❌ 인덱스 {} 정보 조회 중 오류 발생:", indexName, e);
            Map<String, Object> errorInfo = new HashMap<>();
            errorInfo.put("indexName", indexName);
            errorInfo.put("exists", false);
            errorInfo.put("error", e.getMessage());
            return errorInfo;
        }
    }
} 