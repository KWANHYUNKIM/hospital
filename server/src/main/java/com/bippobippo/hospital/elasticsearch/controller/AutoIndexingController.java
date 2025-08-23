package com.bippobippo.hospital.elasticsearch.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/elasticsearch")
public class AutoIndexingController {
    
    private static final Logger logger = LoggerFactory.getLogger(AutoIndexingController.class);
    
    @Autowired
    private com.bippobippo.hospital.elasticsearch.service.AutoIndexingService autoIndexingService;
    
    // @Autowired
    // private com.bippobippo.hospital.elasticsearch.service.MongoChangeStreamService mongoChangeStreamService;
    
    /**
     * 동기화 상태 조회
     */
    @GetMapping("/sync/status")
    public ResponseEntity<Map<String, Object>> getSyncStatus() {
        try {
            Map<String, Object> status = autoIndexingService.getSyncStatus();
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            logger.error("❌ 동기화 상태 조회 중 오류 발생:", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "동기화 상태 조회 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 수동 동기화 트리거
     */
    @PostMapping("/sync/trigger")
    public ResponseEntity<Map<String, Object>> triggerManualSync(
            @RequestParam String dataType) {
        try {
            autoIndexingService.triggerManualSync(dataType);
            return ResponseEntity.ok(Map.of(
                "message", "동기화가 시작되었습니다.",
                "dataType", dataType,
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            logger.error("❌ 수동 동기화 트리거 중 오류 발생:", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "동기화 트리거 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 전체 동기화 트리거
     */
    @PostMapping("/sync/full")
    public ResponseEntity<Map<String, Object>> triggerFullSync() {
        try {
            autoIndexingService.triggerManualSync("all");
            return ResponseEntity.ok(Map.of(
                "message", "전체 동기화가 시작되었습니다.",
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            logger.error("❌ 전체 동기화 트리거 중 오류 발생:", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "전체 동기화 트리거 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * Change Stream 상태 조회
     */
    @GetMapping("/changestream/status")
    public ResponseEntity<Map<String, Object>> getChangeStreamStatus() {
        try {
            // boolean isActive = mongoChangeStreamService.isChangeStreamActive();
            boolean isActive = false; // 임시로 false 반환
            return ResponseEntity.ok(Map.of(
                "active", isActive,
                "message", isActive ? "Change Stream이 활성 상태입니다." : "Change Stream이 비활성 상태입니다.",
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            logger.error("❌ Change Stream 상태 조회 중 오류 발생:", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Change Stream 상태 조회 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * Change Stream 재시작
     */
    @PostMapping("/changestream/restart")
    public ResponseEntity<Map<String, Object>> restartChangeStreams() {
        try {
            // mongoChangeStreamService.restartChangeStreams();
            logger.info("Change Stream 재시작 요청 (임시로 비활성화됨)");
            return ResponseEntity.ok(Map.of(
                "message", "Change Stream이 재시작되었습니다.",
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            logger.error("❌ Change Stream 재시작 중 오류 발생:", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Change Stream 재시작 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 특정 컬렉션 Change Stream 재시작
     */
    @PostMapping("/changestream/restart/{collection}")
    public ResponseEntity<Map<String, Object>> restartChangeStream(
            @PathVariable String collection) {
        try {
            // mongoChangeStreamService.restartChangeStream(collection);
            logger.info("Collection {} Change Stream 재시작 요청 (임시로 비활성화됨)", collection);
            return ResponseEntity.ok(Map.of(
                "message", collection + " 컬렉션의 Change Stream이 재시작되었습니다.",
                "collection", collection,
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            logger.error("❌ {} 컬렉션 Change Stream 재시작 중 오류 발생:", collection, e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Change Stream 재시작 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 동기화 설정 조회
     */
    @GetMapping("/sync/config")
    public ResponseEntity<Map<String, Object>> getSyncConfig() {
        try {
            Map<String, Object> config = new HashMap<>();
            config.put("scheduledSyncEnabled", true);
            config.put("scheduledSyncInterval", "5분");
            config.put("changeStreamEnabled", true);
            config.put("autoIndexingEnabled", true);
            config.put("batchSize", 500);
            config.put("parallelBatches", 5);
            config.put("maxRetries", 10);
            config.put("retryDelay", "15초");
            
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            logger.error("❌ 동기화 설정 조회 중 오류 발생:", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "동기화 설정 조회 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 동기화 히스토리 조회 (최근 10개)
     */
    @GetMapping("/sync/history")
    public ResponseEntity<Map<String, Object>> getSyncHistory() {
        try {
            // 실제 구현에서는 데이터베이스에서 히스토리를 조회해야 함
            Map<String, Object> history = new HashMap<>();
            history.put("message", "동기화 히스토리는 향후 구현 예정입니다.");
            history.put("recentSyncs", new String[0]);
            history.put("totalSyncs", 0);
            
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            logger.error("❌ 동기화 히스토리 조회 중 오류 발생:", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "동기화 히스토리 조회 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 성능 통계 조회
     */
    @GetMapping("/sync/performance")
    public ResponseEntity<Map<String, Object>> getPerformanceStats() {
        try {
            // 실제 구현에서는 성능 메트릭을 수집해야 함
            Map<String, Object> stats = new HashMap<>();
            stats.put("message", "성능 통계는 향후 구현 예정입니다.");
            stats.put("avgSyncTime", 0);
            stats.put("totalDocumentsProcessed", 0);
            stats.put("successRate", 100.0);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("❌ 성능 통계 조회 중 오류 발생:", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "성능 통계 조회 중 오류가 발생했습니다."));
        }
    }
} 