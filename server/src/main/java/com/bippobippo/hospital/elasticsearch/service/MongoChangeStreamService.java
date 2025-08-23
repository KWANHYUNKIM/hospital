package com.bippobippo.hospital.elasticsearch.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.messaging.MessageListenerContainer;
import org.springframework.data.mongodb.core.messaging.DefaultMessageListenerContainer;
import org.springframework.data.mongodb.core.messaging.Message;
import org.springframework.data.mongodb.core.messaging.Subscription;
import org.springframework.data.mongodb.core.messaging.ChangeStreamRequest;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Service
public class MongoChangeStreamService {
    
    private static final Logger logger = LoggerFactory.getLogger(MongoChangeStreamService.class);
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @Autowired
    private AutoIndexingService autoIndexingService;
    
    @Autowired
    private BulkIndexService bulkIndexService;
    
    private MessageListenerContainer container;
    private Subscription hospitalSubscription;
    private Subscription pharmacySubscription;
    
    private final ExecutorService executorService = Executors.newFixedThreadPool(2);
    
    @PostConstruct
    public void initialize() {
        logger.info("🚀 MongoDB Change Stream 서비스 초기화 시작...");
        
        try {
            // MessageListenerContainer 초기화
            container = new DefaultMessageListenerContainer(mongoTemplate);
            container.start();
            
            // 병원 컬렉션 변경사항 감지
            setupHospitalChangeStream();
            
            // 약국 컬렉션 변경사항 감지
            setupPharmacyChangeStream();
            
            logger.info("✅ MongoDB Change Stream 서비스 초기화 완료!");
            
        } catch (Exception e) {
            logger.error("❌ MongoDB Change Stream 서비스 초기화 중 오류 발생:", e);
        }
    }
    
    /**
     * 병원 컬렉션 변경사항 감지 설정
     */
    private void setupHospitalChangeStream() {
        try {
            ChangeStreamRequest<Document> request = ChangeStreamRequest
                .builder()
                .collection("hospitals")
                .publishTo(this::handleHospitalChange) // 리스너는 여기서 설정
                .build();
            
            hospitalSubscription = container.register(request, Document.class, this::handleError);
            logger.info("🏥 병원 컬렉션 Change Stream 구독 시작");
            
        } catch (Exception e) {
            logger.error("❌ 병원 Change Stream 설정 중 오류 발생:", e);
        }
    }
    
    /**
     * 약국 컬렉션 변경사항 감지 설정
     */
    private void setupPharmacyChangeStream() {
        try {
            ChangeStreamRequest<Document> request = ChangeStreamRequest
                .builder()
                .collection("pharmacies")
                .publishTo(this::handlePharmacyChange) // 리스너는 여기서 설정
                .build();
            
            pharmacySubscription = container.register(request, Document.class, this::handleError);
            logger.info("💊 약국 컬렉션 Change Stream 구독 시작");
            
        } catch (Exception e) {
            logger.error("❌ 약국 Change Stream 설정 중 오류 발생:", e);
        }
    }
    
    /**
     * 병원 데이터 변경사항 처리
     */
    private void handleHospitalChange(Message<Document, Document> message) {
        try {
            Document changeStreamDocument = message.getBody();
            String operationType = changeStreamDocument.getString("operationType");
            Document fullDocument = changeStreamDocument.get("fullDocument", Document.class);
            Document documentKey = changeStreamDocument.get("documentKey", Document.class);
            
            logger.info("🏥 병원 데이터 변경 감지: {} - ID: {}", 
                operationType, 
                fullDocument != null ? fullDocument.get("_id") : documentKey.get("_id"));
            
            CompletableFuture.runAsync(() -> {
                try {
                    switch (operationType) {
                        case "insert":
                        case "update":
                        case "replace":
                            if (fullDocument != null) {
                                // 새로운 데이터 색인 또는 업데이트
                                bulkIndexService.indexSingleHospital(fullDocument);
                                logger.debug("✅ 병원 데이터 변경사항 처리 완료: {}", operationType);
                            }
                            break;
                            
                        case "delete":
                            if (documentKey != null) {
                                // 데이터 삭제
                                String documentId = documentKey.get("_id").toString();
                                bulkIndexService.deleteSingleDocument("hospitals", documentId);
                                logger.debug("✅ 병원 데이터 삭제 처리 완료");
                            }
                            break;
                            
                        default:
                            logger.debug("알 수 없는 작업 타입: {}", operationType);
                    }
                    
                    // 지도 데이터도 업데이트 필요
                    autoIndexingService.syncMapDataIfNeeded();
                    
                } catch (Exception e) {
                    logger.error("❌ 병원 변경사항 처리 중 오류 발생:", e);
                }
            }, executorService);
            
        } catch (Exception e) {
            logger.error("❌ 병원 Change Stream 메시지 처리 중 오류 발생:", e);
        }
    }
    
    /**
     * 약국 데이터 변경사항 처리
     */
    private void handlePharmacyChange(Message<Document, Document> message) {
        try {
            Document changeStreamDocument = message.getBody();
            String operationType = changeStreamDocument.getString("operationType");
            Document fullDocument = changeStreamDocument.get("fullDocument", Document.class);
            Document documentKey = changeStreamDocument.get("documentKey", Document.class);
            
            logger.info("💊 약국 데이터 변경 감지: {} - ID: {}", 
                operationType, 
                fullDocument != null ? fullDocument.get("_id") : documentKey.get("_id"));
            
            CompletableFuture.runAsync(() -> {
                try {
                    switch (operationType) {
                        case "insert":
                        case "update":
                        case "replace":
                            if (fullDocument != null) {
                                // 새로운 데이터 색인 또는 업데이트
                                bulkIndexService.indexSinglePharmacy(fullDocument);
                                logger.debug("✅ 약국 데이터 변경사항 처리 완료: {}", operationType);
                            }
                            break;
                            
                        case "delete":
                            if (documentKey != null) {
                                // 데이터 삭제
                                String documentId = documentKey.get("_id").toString();
                                bulkIndexService.deleteSingleDocument("pharmacies", documentId);
                                logger.debug("✅ 약국 데이터 삭제 처리 완료");
                            }
                            break;
                            
                        default:
                            logger.debug("알 수 없는 작업 타입: {}", operationType);
                    }
                    
                    // 지도 데이터도 업데이트 필요
                    autoIndexingService.syncMapDataIfNeeded();
                    
                } catch (Exception e) {
                    logger.error("❌ 약국 변경사항 처리 중 오류 발생:", e);
                }
            }, executorService);
            
        } catch (Exception e) {
            logger.error("❌ 약국 Change Stream 메시지 처리 중 오류 발생:", e);
        }
    }
    
    /**
     * Change Stream 상태 조회
     */
    public boolean isChangeStreamActive() {
        return container != null && container.isRunning() &&
               hospitalSubscription != null && pharmacySubscription != null;
    }
    
    /**
     * Change Stream 재시작
     */
    public void restartChangeStreams() {
        logger.info("🔄 Change Stream 재시작 시작...");
        
        try {
            // 기존 구독 해제
            if (hospitalSubscription != null) {
                hospitalSubscription.cancel();
            }
            if (pharmacySubscription != null) {
                pharmacySubscription.cancel();
            }
            
            // 잠시 대기
            Thread.sleep(1000);
            
            // 새로운 구독 설정
            setupHospitalChangeStream();
            setupPharmacyChangeStream();
            
            logger.info("✅ Change Stream 재시작 완료!");
            
        } catch (Exception e) {
            logger.error("❌ Change Stream 재시작 중 오류 발생:", e);
        }
    }
    
    /**
     * 특정 컬렉션의 Change Stream만 재시작
     */
    public void restartChangeStream(String collectionName) {
        logger.info("🔄 {} 컬렉션 Change Stream 재시작 시작...", collectionName);
        
        try {
            switch (collectionName.toLowerCase()) {
                case "hospitals":
                    if (hospitalSubscription != null) {
                        hospitalSubscription.cancel();
                    }
                    Thread.sleep(500);
                    setupHospitalChangeStream();
                    break;
                    
                case "pharmacies":
                    if (pharmacySubscription != null) {
                        pharmacySubscription.cancel();
                    }
                    Thread.sleep(500);
                    setupPharmacyChangeStream();
                    break;
                    
                default:
                    logger.warn("알 수 없는 컬렉션: {}", collectionName);
                    return;
            }
            
            logger.info("✅ {} 컬렉션 Change Stream 재시작 완료!", collectionName);
            
        } catch (Exception e) {
            logger.error("❌ {} 컬렉션 Change Stream 재시작 중 오류 발생:", collectionName, e);
        }
    }
    
    /**
     * 에러 핸들러
     */
    private void handleError(Throwable throwable) {
        logger.error("❌ Change Stream 에러 발생:", throwable);
    }
    
    @PreDestroy
    public void cleanup() {
        logger.info("🔄 MongoDB Change Stream 서비스 정리 시작...");
        
        try {
            // 구독 해제
            if (hospitalSubscription != null) {
                hospitalSubscription.cancel();
            }
            if (pharmacySubscription != null) {
                pharmacySubscription.cancel();
            }
            
            // 컨테이너 정리
            if (container != null) {
                container.stop();
            }
            
            // 스레드 풀 정리
            executorService.shutdown();
            if (!executorService.awaitTermination(30, TimeUnit.SECONDS)) {
                executorService.shutdownNow();
            }
            
            logger.info("✅ MongoDB Change Stream 서비스 정리 완료!");
            
        } catch (Exception e) {
            logger.error("❌ MongoDB Change Stream 서비스 정리 중 오류 발생:", e);
        }
    }
} 