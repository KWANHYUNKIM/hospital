package com.bippobippo.hospital.elasticsearch.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;

@Service
public class ElasticsearchService {
    
    private static final Logger logger = LoggerFactory.getLogger(ElasticsearchService.class);
    
    @Autowired
    private IndexService indexService;
    
    @Autowired
    private BulkIndexService bulkIndexService;
    
    /**
     * 병원 데이터 재색인 프로세스
     */
    public void reindex() {
        try {
            logger.info("🔄 병원 데이터 재색인 프로세스 시작...");
            
            logger.info("Step 1: 기존 병원 인덱스 삭제...");
            indexService.deleteHospitalsIndex();
            
            logger.info("Step 2: 새로운 병원 인덱스 생성...");
            indexService.createHospitalIndex();
            
            logger.info("Step 3: 병원 데이터 벌크 색인...");
            bulkIndexService.bulkIndex();
            
            logger.info("✅ 병원 데이터 재색인 프로세스 완료!");
        } catch (Exception e) {
            logger.error("❌ 병원 데이터 재색인 프로세스 중 오류 발생:", e);
            throw new RuntimeException("재색인 프로세스 실패", e);
        }
    }
    
    /**
     * 약국 데이터 재색인 프로세스
     */
    public void reindexPharmacies(List<Object> pharmacies) {
        try {
            logger.info("🔄 약국 데이터 재색인 프로세스 시작...");
            
            logger.info("Step 1: 기존 약국 인덱스 삭제...");
            indexService.deletePharmaciesIndex();
            
            logger.info("Step 2: 새로운 약국 인덱스 생성...");
            indexService.createPharmaciesIndex();
            
            logger.info("Step 3: 약국 데이터 벌크 색인...");
            bulkIndexService.bulkPharmaciesIndex();
            
            logger.info("✅ 약국 데이터 재색인 프로세스 완료!");
        } catch (Exception e) {
            logger.error("❌ 약국 데이터 재색인 프로세스 중 오류 발생:", e);
            throw new RuntimeException("약국 재색인 프로세스 실패", e);
        }
    }
    
    /**
     * 지도 데이터 재색인 프로세스
     */
    public void reindexMap() {
        try {
            logger.info("🔄 지도 데이터 재색인 프로세스 시작...");
            
            logger.info("Step 1: 기존 지도 인덱스 삭제...");
            indexService.deleteMapIndex();
            
            logger.info("Step 2: 새로운 지도 인덱스 생성...");
            indexService.createMapIndex();
            
            logger.info("Step 3: 지도 데이터 벌크 색인...");
            bulkIndexService.bulkMapIndex();
            
            logger.info("✅ 지도 데이터 재색인 프로세스 완료!");
        } catch (Exception e) {
            logger.error("❌ 지도 데이터 재색인 프로세스 중 오류 발생:", e);
            throw new RuntimeException("지도 재색인 프로세스 실패", e);
        }
    }
    
    /**
     * 지도 클러스터 데이터 재색인 프로세스
     */
    public void reindexMapCluster() {
        try {
            logger.info("🔄 클러스터 데이터 재색인 프로세스 시작...");
            
            logger.info("Step 1: 기존 클러스터 인덱스 삭제...");
            indexService.deleteMapClusterIndex();
            
            logger.info("Step 2: 새로운 클러스터 인덱스 생성...");
            indexService.createMapClusterIndex();
            
            logger.info("Step 3: 클러스터 데이터 색인...");
            bulkIndexService.bulkMapClusterIndex();
            
            logger.info("✅ 클러스터 데이터 재색인 완료!");
        } catch (Exception e) {
            logger.error("❌ 클러스터 데이터 재색인 중 오류 발생:", e);
            throw new RuntimeException("클러스터 재색인 프로세스 실패", e);
        }
    }
} 