package com.bippobippo.hospital.elasticsearch.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Criteria;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.search.SearchHits;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.client.RequestOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Service
public class AutoIndexingService {
    
    private static final Logger logger = LoggerFactory.getLogger(AutoIndexingService.class);
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @Autowired
    private RestHighLevelClient elasticsearchClient;
    
    @Autowired
    private ElasticsearchService elasticsearchService;
    
    @Autowired
    private BulkIndexService bulkIndexService;
    
    private final ExecutorService executorService = Executors.newFixedThreadPool(3);
    
    // 마지막 동기화 시간 추적
    private Map<String, Date> lastSyncTimes = new HashMap<>();
    
    // 동기화 상태 추적
    private Map<String, Boolean> syncInProgress = new HashMap<>();
    
    @PostConstruct
    public void initialize() {
        logger.info("🚀 자동 색인 서비스 초기화 시작...");
        
        // 서버 시작 시 한 번만 초기 동기화 실행
        CompletableFuture.runAsync(() -> {
            try {
                logger.info("🔄 서버 시작 시 초기 동기화 실행...");
                performInitialSync();
                logger.info("✅ 서버 시작 시 초기 동기화 완료!");
            } catch (Exception e) {
                logger.error("❌ 서버 시작 시 초기 동기화 중 오류 발생:", e);
            }
        }, executorService);
        
        // Change Stream은 단일 MongoDB 서버에서 지원되지 않으므로 비활성화
        logger.warn("⚠️ Change Stream은 단일 MongoDB 서버에서 지원되지 않습니다. 자동 동기화만 사용됩니다.");
    }
    
    /**
     * 초기 동기화 수행 (서버 시작 시 한 번만)
     */
    private void performInitialSync() {
        logger.info("🔄 서버 시작 시 초기 동기화 시작...");
        
        try {
            // 각 인덱스별로 초기 동기화 수행
            logger.info("🏥 병원 데이터 초기 동기화 시작...");
            syncHospitalsIfNeeded();
            
            logger.info("💊 약국 데이터 초기 동기화 시작...");
            syncPharmaciesIfNeeded();
            
            logger.info("🗺️ 지도 데이터 초기 동기화 시작...");
            syncMapDataIfNeeded();
            
            logger.info("🗺️ 지도 클러스터 데이터 초기 동기화 시작...");
            syncMapClusterDataIfNeeded();
            
            logger.info("✅ 서버 시작 시 초기 동기화 완료!");
        } catch (Exception e) {
            logger.error("❌ 서버 시작 시 초기 동기화 중 오류 발생:", e);
        }
    }
    
    /**
     * 일일 동기화 체크 (매일 자정에 실행)
     */
    @Scheduled(cron = "0 0 0 * * ?") // 매일 자정
    public void dailySyncCheck() {
        logger.info("🌅 일일 동기화 체크 시작...");
        
        try {
            // 병원 데이터 동기화 체크
            if (!syncInProgress.getOrDefault("hospitals", false)) {
                CompletableFuture.runAsync(() -> syncHospitalsIfNeeded(), executorService);
            }
            
            // 약국 데이터 동기화 체크
            if (!syncInProgress.getOrDefault("pharmacies", false)) {
                CompletableFuture.runAsync(() -> syncPharmaciesIfNeeded(), executorService);
            }
            
            // 지도 데이터 동기화 체크
            if (!syncInProgress.getOrDefault("map", false)) {
                CompletableFuture.runAsync(() -> syncMapDataIfNeeded(), executorService);
            }
            
            // 지도 클러스터 데이터 동기화 체크
            if (!syncInProgress.getOrDefault("map_cluster", false)) {
                CompletableFuture.runAsync(() -> syncMapClusterDataIfNeeded(), executorService);
            }
            
        } catch (Exception e) {
            logger.error("❌ 일일 동기화 체크 중 오류 발생:", e);
        }
    }
    
    /**
     * 병원 데이터 자동 동기화 (서버 시작 시 + 일일)
     */
    public void syncHospitalsIfNeeded() {
        if (syncInProgress.getOrDefault("hospitals", false)) {
            logger.debug("병원 동기화가 이미 진행 중입니다.");
            return;
        }
        
        syncInProgress.put("hospitals", true);
        
        try {
            logger.info("🏥 병원 데이터 동기화 체크 시작...");
            
            // MongoDB와 Elasticsearch 데이터 수 비교
            long mongoCount = mongoTemplate.count(new Query(), "hospitals");
            long esCount = getElasticsearchDocumentCount("hospitals");
            
            logger.info("📊 데이터 수 비교 - MongoDB: {}, Elasticsearch: {}", mongoCount, esCount);
            
            if (esCount == 0) {
                logger.info("🆕 Elasticsearch에 병원 데이터가 없습니다. 전체 색인을 시작합니다.");
                elasticsearchService.reindex();
            } else if (mongoCount > esCount) {
                logger.info("📈 새로운 병원 데이터가 발견되었습니다. 증분 색인을 시작합니다.");
                performIncrementalHospitalSync();
            } else if (mongoCount < esCount) {
                logger.info("🗑️ MongoDB에서 데이터가 삭제되었습니다. 인덱스를 재생성합니다.");
                elasticsearchService.reindex();
            } else {
                logger.info("✅ 병원 데이터가 동기화되어 있습니다.");
            }
            
            lastSyncTimes.put("hospitals", new Date());
            
        } catch (Exception e) {
            logger.error("❌ 병원 데이터 동기화 중 오류 발생:", e);
        } finally {
            syncInProgress.put("hospitals", false);
        }
    }
    
    /**
     * 약국 데이터 자동 동기화 (서버 시작 시 + 일일)
     */
    public void syncPharmaciesIfNeeded() {
        if (syncInProgress.getOrDefault("pharmacies", false)) {
            logger.debug("약국 동기화가 이미 진행 중입니다.");
            return;
        }
        
        syncInProgress.put("pharmacies", true);
        
        try {
            logger.info("💊 약국 데이터 동기화 체크 시작...");
            
            long mongoCount = mongoTemplate.count(new Query(), "pharmacies");
            long esCount = getElasticsearchDocumentCount("pharmacies");
            
            logger.info("📊 데이터 수 비교 - MongoDB: {}, Elasticsearch: {}", mongoCount, esCount);
            
            if (esCount == 0) {
                logger.info("🆕 Elasticsearch에 약국 데이터가 없습니다. 전체 색인을 시작합니다.");
                elasticsearchService.reindexPharmacies(new ArrayList<>());
            } else if (mongoCount > esCount) {
                logger.info("📈 새로운 약국 데이터가 발견되었습니다. 증분 색인을 시작합니다.");
                performIncrementalPharmacySync();
            } else if (mongoCount < esCount) {
                logger.info("🗑️ MongoDB에서 데이터가 삭제되었습니다. 인덱스를 재생성합니다.");
                elasticsearchService.reindexPharmacies(new ArrayList<>());
            } else {
                logger.info("✅ 약국 데이터가 동기화되어 있습니다.");
            }
            
            lastSyncTimes.put("pharmacies", new Date());
            
        } catch (Exception e) {
            logger.error("❌ 약국 데이터 동기화 중 오류 발생:", e);
        } finally {
            syncInProgress.put("pharmacies", false);
        }
    }
    
    /**
     * 지도 데이터 자동 동기화 (서버 시작 시 + 일일)
     */
    public void syncMapDataIfNeeded() {
        if (syncInProgress.getOrDefault("map", false)) {
            logger.debug("지도 데이터 동기화가 이미 진행 중입니다.");
            return;
        }
        
        syncInProgress.put("map", true);
        
        try {
            logger.info("🗺️ 지도 데이터 동기화 체크 시작...");
            
            // 병원과 약국 데이터를 기반으로 지도 데이터 동기화
            long hospitalCount = mongoTemplate.count(new Query(), "hospitals");
            long pharmacyCount = mongoTemplate.count(new Query(), "pharmacies");
            long esMapCount = getElasticsearchDocumentCount("map_data");
            
            logger.info("📊 지도 데이터 수 비교 - 병원: {}, 약국: {}, ES 지도: {}", 
                hospitalCount, pharmacyCount, esMapCount);
            
            if (esMapCount == 0) {
                logger.info("🆕 Elasticsearch에 지도 데이터가 없습니다. 지도 색인을 시작합니다.");
                elasticsearchService.reindexMap();
            } else {
                // 병원/약국 데이터 변경 시 지도 데이터도 업데이트
                long totalLocations = hospitalCount + pharmacyCount;
                if (Math.abs(totalLocations - esMapCount) > 10) { // 10개 이상 차이나면 재색인
                    logger.info("📈 지도 데이터가 크게 변경되었습니다. 지도 재색인을 시작합니다.");
                    elasticsearchService.reindexMap();
                } else {
                    logger.info("✅ 지도 데이터가 동기화되어 있습니다.");
                }
            }
            
            lastSyncTimes.put("map", new Date());
            
        } catch (Exception e) {
            logger.error("❌ 지도 데이터 동기화 중 오류 발생:", e);
        } finally {
            syncInProgress.put("map", false);
        }
    }
    
    /**
     * 병원 데이터 증분 동기화
     */
    private void performIncrementalHospitalSync() throws IOException {
        try {
            // 마지막 동기화 이후 추가된 데이터만 색인
            Date lastSync = lastSyncTimes.getOrDefault("hospitals", new Date(0));
            
            Query query = new Query(Criteria.where("_id").gt(lastSync.getTime()));
            List<Map> newHospitals = mongoTemplate.find(query, Map.class, "hospitals");
            
            if (!newHospitals.isEmpty()) {
                logger.info("🆕 {}개의 새로운 병원 데이터를 증분 색인합니다.", newHospitals.size());
                
                // 증분 색인 수행
                for (Map hospital : newHospitals) {
                    bulkIndexService.indexSingleHospital(hospital);
                }
                
                logger.info("✅ 병원 데이터 증분 색인 완료!");
            }
            
        } catch (Exception e) {
            logger.error("❌ 병원 데이터 증분 동기화 중 오류 발생:", e);
            // 증분 동기화 실패 시 전체 재색인
            logger.info("🔄 전체 재색인을 시도합니다.");
            elasticsearchService.reindex();
        }
    }
    
    /**
     * 약국 데이터 증분 동기화
     */
    private void performIncrementalPharmacySync() throws IOException {
        try {
            Date lastSync = lastSyncTimes.getOrDefault("pharmacies", new Date(0));
            
            Query query = new Query(Criteria.where("_id").gt(lastSync.getTime()));
            List<Map> newPharmacies = mongoTemplate.find(query, Map.class, "pharmacies");
            
            if (!newPharmacies.isEmpty()) {
                logger.info("🆕 {}개의 새로운 약국 데이터를 증분 색인합니다.", newPharmacies.size());
                
                // 증분 색인 수행
                for (Map pharmacy : newPharmacies) {
                    bulkIndexService.indexSinglePharmacy(pharmacy);
                }
                
                logger.info("✅ 약국 데이터 증분 색인 완료!");
            }
            
        } catch (Exception e) {
            logger.error("❌ 약국 데이터 증분 동기화 중 오류 발생:", e);
            logger.info("🔄 전체 재색인을 시도합니다.");
            elasticsearchService.reindexPharmacies(new ArrayList<>());
        }
    }
    
    /**
     * Elasticsearch 문서 수 조회
     */
    private long getElasticsearchDocumentCount(String indexName) {
        try {
            SearchRequest searchRequest = new SearchRequest(indexName);
            SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
            searchSourceBuilder.size(0); // 문서 내용 없이 개수만 조회
            searchRequest.source(searchSourceBuilder);
            
            SearchResponse response = elasticsearchClient.search(searchRequest, RequestOptions.DEFAULT);
            SearchHits hits = response.getHits();
            return hits.getTotalHits().value;
            
        } catch (Exception e) {
            logger.error("Elasticsearch 문서 수 조회 중 오류 발생:", e);
            return 0;
        }
    }
    
    /**
     * 수동 동기화 트리거
     */
    public void triggerManualSync(String dataType) {
        logger.info("🔧 수동 동기화 트리거: {}", dataType);
        
        switch (dataType.toLowerCase()) {
            case "hospitals":
                CompletableFuture.runAsync(() -> syncHospitalsIfNeeded(), executorService);
                break;
            case "pharmacies":
                CompletableFuture.runAsync(() -> syncPharmaciesIfNeeded(), executorService);
                break;
            case "map":
                CompletableFuture.runAsync(() -> syncMapDataIfNeeded(), executorService);
                break;
            case "all":
                CompletableFuture.runAsync(() -> {
                    syncHospitalsIfNeeded();
                    syncPharmaciesIfNeeded();
                    syncMapDataIfNeeded();
                }, executorService);
                break;
            default:
                logger.warn("알 수 없는 데이터 타입: {}", dataType);
        }
    }
    
    /**
     * 동기화 상태 조회
     */
    public Map<String, Object> getSyncStatus() {
        Map<String, Object> status = new HashMap<>();
        
        for (String dataType : Arrays.asList("hospitals", "pharmacies", "map")) {
            Map<String, Object> typeStatus = new HashMap<>();
            typeStatus.put("lastSync", lastSyncTimes.get(dataType));
            typeStatus.put("syncInProgress", syncInProgress.getOrDefault(dataType, false));
            
            try {
                long mongoCount = mongoTemplate.count(new Query(), dataType);
                long esCount = getElasticsearchDocumentCount(dataType);
                
                typeStatus.put("mongoCount", mongoCount);
                typeStatus.put("esCount", esCount);
                typeStatus.put("synced", mongoCount == esCount);
                
            } catch (Exception e) {
                typeStatus.put("error", e.getMessage());
            }
            
            status.put(dataType, typeStatus);
        }
        
        return status;
    }
    
    /**
     * 서비스 종료 시 정리
     */
    public void shutdown() {
        try {
            executorService.shutdown();
            if (!executorService.awaitTermination(60, TimeUnit.SECONDS)) {
                executorService.shutdownNow();
            }
            logger.info("🔄 자동 색인 서비스가 정상적으로 종료되었습니다.");
        } catch (InterruptedException e) {
            executorService.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
    
    /**
     * map_data 인덱스 생성
     */
    public Map<String, Object> createMapDataIndex() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            logger.info("🚀 map_data 인덱스 생성 시작...");
            
            // 인덱스 존재 여부 확인
            boolean exists = elasticsearchService.indexExists("map_data");
            
            if (exists) {
                logger.info("⚠️ 기존 map_data 인덱스가 존재합니다. 삭제 중...");
                elasticsearchService.deleteIndex("map_data");
                logger.info("✅ 기존 인덱스 삭제 완료");
            }
            
            // 새 인덱스 생성
            boolean created = elasticsearchService.createMapDataIndex();
            
            if (created) {
                result.put("success", true);
                result.put("message", "map_data 인덱스가 성공적으로 생성되었습니다.");
                result.put("timestamp", new Date());
                logger.info("✅ map_data 인덱스 생성 완료!");
            } else {
                result.put("success", false);
                result.put("message", "map_data 인덱스 생성에 실패했습니다.");
                result.put("timestamp", new Date());
                logger.error("❌ map_data 인덱스 생성 실패");
            }
            
        } catch (Exception e) {
            logger.error("❌ map_data 인덱스 생성 중 오류 발생:", e);
            result.put("success", false);
            result.put("message", "map_data 인덱스 생성 중 오류가 발생했습니다: " + e.getMessage());
            result.put("error", e.getMessage());
            result.put("timestamp", new Date());
        }
        
        return result;
    }
    
    /**
     * map_data 인덱스 삭제
     */
    public Map<String, Object> deleteMapDataIndex() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            logger.info("🗑️ map_data 인덱스 삭제 시작...");
            
            boolean deleted = elasticsearchService.deleteIndex("map_data");
            
            if (deleted) {
                result.put("success", true);
                result.put("message", "map_data 인덱스가 성공적으로 삭제되었습니다.");
                result.put("timestamp", new Date());
                logger.info("✅ map_data 인덱스 삭제 완료!");
            } else {
                result.put("success", false);
                result.put("message", "map_data 인덱스 삭제에 실패했습니다.");
                result.put("timestamp", new Date());
                logger.error("❌ map_data 인덱스 삭제 실패");
            }
            
        } catch (Exception e) {
            logger.error("❌ map_data 인덱스 삭제 중 오류 발생:", e);
            result.put("success", false);
            result.put("message", "map_data 인덱스 삭제 중 오류가 발생했습니다: " + e.getMessage());
            result.put("error", e.getMessage());
            result.put("timestamp", new Date());
        }
        
        return result;
    }
    
    /**
     * map_data 인덱스 상태 확인
     */
    public Map<String, Object> getMapDataIndexStatus() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            logger.info("🔍 map_data 인덱스 상태 확인 중...");
            
            boolean exists = elasticsearchService.indexExists("map_data");
            
            result.put("exists", exists);
            result.put("timestamp", new Date());
            
            if (exists) {
                // 인덱스 정보 조회
                Map<String, Object> indexInfo = elasticsearchService.getIndexInfo("map_data");
                result.put("indexInfo", indexInfo);
                result.put("message", "map_data 인덱스가 존재합니다.");
            } else {
                result.put("message", "map_data 인덱스가 존재하지 않습니다.");
            }
            
        } catch (Exception e) {
            logger.error("❌ map_data 인덱스 상태 확인 중 오류 발생:", e);
            result.put("error", e.getMessage());
            result.put("timestamp", new Date());
        }
        
        return result;
    }
    
    /**
     * map_data_cluster 인덱스 생성
     */
    public Map<String, Object> createMapClusterIndex() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            logger.info("🚀 map_data_cluster 인덱스 생성 시작...");
            
            // 기존 인덱스가 있는지 확인
            boolean exists = elasticsearchService.indexExists("map_data_cluster");
            
            if (exists) {
                logger.info("⚠️ 기존 map_data_cluster 인덱스가 존재합니다. 삭제 중...");
                elasticsearchService.deleteIndex("map_data_cluster");
                logger.info("✅ 기존 인덱스 삭제 완료");
            }
            
            // 새 인덱스 생성
            boolean created = elasticsearchService.createMapClusterIndex();
            
            if (created) {
                result.put("success", true);
                result.put("message", "map_data_cluster 인덱스가 성공적으로 생성되었습니다.");
                result.put("timestamp", new Date());
                logger.info("✅ map_data_cluster 인덱스 생성 완료!");
            } else {
                result.put("success", false);
                result.put("message", "map_data_cluster 인덱스 생성에 실패했습니다.");
                result.put("timestamp", new Date());
                logger.error("❌ map_data_cluster 인덱스 생성 실패");
            }
            
        } catch (Exception e) {
            logger.error("❌ map_data_cluster 인덱스 생성 중 오류 발생:", e);
            result.put("success", false);
            result.put("message", "map_data_cluster 인덱스 생성 중 오류가 발생했습니다: " + e.getMessage());
            result.put("error", e.getMessage());
            result.put("timestamp", new Date());
        }
        
        return result;
    }
    
    /**
     * map_data_cluster 인덱스 삭제
     */
    public Map<String, Object> deleteMapClusterIndex() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            logger.info("🗑️ map_data_cluster 인덱스 삭제 시작...");
            
            boolean deleted = elasticsearchService.deleteIndex("map_data_cluster");
            
            if (deleted) {
                result.put("success", true);
                result.put("message", "map_data_cluster 인덱스가 성공적으로 삭제되었습니다.");
                result.put("timestamp", new Date());
                logger.info("✅ map_data_cluster 인덱스 삭제 완료!");
            } else {
                result.put("success", false);
                result.put("message", "map_data_cluster 인덱스 삭제에 실패했습니다.");
                result.put("timestamp", new Date());
                logger.error("❌ map_data_cluster 인덱스 삭제 실패");
            }
            
        } catch (Exception e) {
            logger.error("❌ map_data_cluster 인덱스 삭제 중 오류 발생:", e);
            result.put("success", false);
            result.put("message", "map_data_cluster 인덱스 삭제 중 오류가 발생했습니다: " + e.getMessage());
            result.put("error", e.getMessage());
            result.put("timestamp", new Date());
        }
        
        return result;
    }
    
    /**
     * map_data_cluster 인덱스 상태 확인
     */
    public Map<String, Object> getMapClusterIndexStatus() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            logger.info("🔍 map_data_cluster 인덱스 상태 확인 중...");
            
            boolean exists = elasticsearchService.indexExists("map_data_cluster");
            
            result.put("exists", exists);
            result.put("timestamp", new Date());
            
            if (exists) {
                // 인덱스 정보 조회
                Map<String, Object> indexInfo = elasticsearchService.getIndexInfo("map_data_cluster");
                result.put("indexInfo", indexInfo);
                result.put("message", "map_data_cluster 인덱스가 존재합니다.");
            } else {
                result.put("message", "map_data_cluster 인덱스가 존재하지 않습니다.");
            }
            
        } catch (Exception e) {
            logger.error("❌ map_data_cluster 인덱스 상태 확인 중 오류 발생:", e);
            result.put("error", e.getMessage());
            result.put("timestamp", new Date());
        }
        
        return result;
    }
    
    /**
     * map_data_cluster 인덱스 데이터 생성 (bulk indexing)
     */
    public Map<String, Object> bulkMapClusterIndex() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            logger.info("🚀 map_data_cluster 인덱스 데이터 생성 시작...");
            
            // 먼저 인덱스가 존재하는지 확인
            boolean exists = elasticsearchService.indexExists("map_data_cluster");
            if (!exists) {
                logger.info("⚠️ map_data_cluster 인덱스가 존재하지 않습니다. 먼저 생성합니다...");
                createMapClusterIndex();
            }
            
            // bulk indexing 실행
            boolean success = bulkIndexService.bulkMapClusterIndex();
            
            if (success) {
                result.put("success", true);
                result.put("message", "map_data_cluster 인덱스 데이터 생성이 완료되었습니다.");
                result.put("timestamp", new Date());
                logger.info("✅ map_data_cluster 인덱스 데이터 생성 완료!");
            } else {
                result.put("success", false);
                result.put("message", "map_data_cluster 인덱스 데이터 생성에 실패했습니다.");
                result.put("timestamp", new Date());
                logger.error("❌ map_data_cluster 인덱스 데이터 생성 실패");
            }
            
        } catch (Exception e) {
            logger.error("❌ map_data_cluster 인덱스 데이터 생성 중 오류 발생:", e);
            result.put("success", false);
            result.put("message", "map_data_cluster 인덱스 데이터 생성 중 오류가 발생했습니다: " + e.getMessage());
            result.put("error", e.getMessage());
            result.put("timestamp", new Date());
        }
        
        return result;
    }
    
    /**
     * 지도 클러스터 데이터 자동 동기화 (서버 시작 시 + 일일)
     */
    public void syncMapClusterDataIfNeeded() {
        if (syncInProgress.getOrDefault("map_cluster", false)) {
            logger.debug("지도 클러스터 동기화가 이미 진행 중입니다.");
            return;
        }
        
        syncInProgress.put("map_cluster", true);
        
        try {
            logger.info("🗺️ 지도 클러스터 데이터 동기화 체크 시작...");
            
            // map_data_cluster 인덱스가 존재하는지 확인
            boolean exists = elasticsearchService.indexExists("map_data_cluster");
            
            if (!exists) {
                logger.info("🆕 map_data_cluster 인덱스가 존재하지 않습니다. 인덱스 생성 및 데이터 색인을 시작합니다.");
                createMapClusterIndex();
                bulkMapClusterIndex();
            } else {
                // 인덱스가 존재하면 문서 수 확인
                Map<String, Object> indexInfo = elasticsearchService.getIndexInfo("map_data_cluster");
                long documentCount = 0L;
                if (indexInfo.containsKey("documentCount")) {
                    Object countObj = indexInfo.get("documentCount");
                    if (countObj instanceof Number) {
                        documentCount = ((Number) countObj).longValue();
                    }
                }
                if (documentCount == 0) {
                    logger.info("🆕 map_data_cluster 인덱스가 비어있습니다. 데이터 색인을 시작합니다.");
                    bulkMapClusterIndex();
                } else {
                    logger.info("✅ 지도 클러스터 데이터가 동기화되어 있습니다. 문서 수: {}", documentCount);
                }
            }
            
            lastSyncTimes.put("map_cluster", new Date());
            
        } catch (Exception e) {
            logger.error("❌ 지도 클러스터 데이터 동기화 중 오류 발생:", e);
        } finally {
            syncInProgress.put("map_cluster", false);
        }
    }
} 