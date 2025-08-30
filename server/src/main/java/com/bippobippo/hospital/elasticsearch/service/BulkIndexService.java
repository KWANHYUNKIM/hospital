package com.bippobippo.hospital.elasticsearch.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.action.bulk.BulkRequest;
import org.elasticsearch.action.bulk.BulkResponse;
import org.elasticsearch.action.index.IndexRequest;
import org.elasticsearch.action.admin.indices.refresh.RefreshRequest;
import org.elasticsearch.xcontent.XContentType;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.domain.Sort;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Service
public class BulkIndexService {
    
    private static final Logger logger = LoggerFactory.getLogger(BulkIndexService.class);
    
    private static final int BATCH_SIZE = 500;
    private static final int PARALLEL_BATCHES = 5;
    private static final int MAX_RETRIES = 10;
    private static final long RETRY_DELAY = 15000;
    private static final int TIME_WINDOW = 5;
    
    @Autowired
    private RestHighLevelClient elasticsearchClient;
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    private final ExecutorService executorService = Executors.newFixedThreadPool(PARALLEL_BATCHES);
    
    /**
     * 병원 데이터 벌크 색인
     */
    public void bulkIndex() throws IOException {
        long startTime = System.currentTimeMillis();
        List<Double> processingTimes = new ArrayList<>();
        
        try {
            logger.info("✅ MongoDB 연결 성공!");
            
            long totalHospitals = mongoTemplate.count(new Query(), "hospitals");
            logger.info("🔍 총 {}개의 병원 데이터를 처리합니다.", totalHospitals);
            
            long processedCount = 0;
            int batchCount = 0;
            int consecutiveErrors = 0;
            long lastSuccessfulBatch = System.currentTimeMillis();
            String lastId = null;
            
            while (processedCount < totalHospitals) {
                try {
                    if (System.currentTimeMillis() - lastSuccessfulBatch > 300000) {
                        logger.info("⚠️ 오랜 시간 성공적인 배치가 없어 연결을 재확인합니다...");
                    }
                    
                    if (consecutiveErrors >= 3) {
                        logger.info("⚠️ 연속 오류 발생으로 30초 대기...");
                        Thread.sleep(30000);
                        consecutiveErrors = 0;
                    }
                    
                    // 커서 기반 페이지네이션
                    Query query = new Query();
                    if (lastId != null) {
                        query.addCriteria(Criteria.where("_id").gt(lastId));
                    }
                    query.with(Sort.by(Sort.Direction.ASC, "_id"))
                         .limit(BATCH_SIZE * PARALLEL_BATCHES);
                    
                    List<Map> hospitals = mongoTemplate.find(query, Map.class, "hospitals");
                    
                    if (hospitals.isEmpty()) break;
                    
                    lastId = hospitals.get(hospitals.size() - 1).get("_id").toString();
                    
                    List<CompletableFuture<BatchResult>> futures = new ArrayList<>();
                    
                    // 병렬 배치 처리
                    for (int i = 0; i < PARALLEL_BATCHES; i++) {
                        int currentIndex = i * BATCH_SIZE;
                        if (currentIndex >= hospitals.size()) break;
                        
                        int endIndex = Math.min(currentIndex + BATCH_SIZE, hospitals.size());
                        List<Map> batch = hospitals.subList(currentIndex, endIndex);
                        
                        final int currentBatchNumber = batchCount + i + 1;
                        CompletableFuture<BatchResult> future = CompletableFuture.supplyAsync(() -> {
                            try {
                                return processHospitalBatch(batch, currentBatchNumber);
                            } catch (Exception e) {
                                logger.error("배치 처리 중 오류:", e);
                                return new BatchResult(0, 0.0);
                            }
                        }, executorService);
                        
                        futures.add(future);
                    }
                    
                    // 모든 배치 완료 대기
                    CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
                    
                    int processed = 0;
                    for (CompletableFuture<BatchResult> future : futures) {
                        BatchResult result = future.get();
                        processed += result.count;
                        processingTimes.add(result.time);
                    }
                    
                    processedCount += processed;
                    batchCount += futures.size();
                    consecutiveErrors = 0;
                    lastSuccessfulBatch = System.currentTimeMillis();
                    
                    double progress = (double) processedCount / totalHospitals * 100;
                    double avgProcessingTime = calculateMovingAverage(processingTimes, TIME_WINDOW);
                    int remainingBatches = (int) Math.ceil((double) (totalHospitals - processedCount) / (BATCH_SIZE * PARALLEL_BATCHES));
                    double estimatedRemainingTime = remainingBatches * avgProcessingTime;
                    
                    logger.info("📊 진행 상황: {}/{} ({}%)", processedCount, totalHospitals, Math.round(progress));
                    logger.info("⏱️ 예상 남은 시간: {}분", Math.round(estimatedRemainingTime / 60));
                    logger.info("⚡ 평균 처리 속도: {} 문서/초", 
                        String.format("%.2f", (BATCH_SIZE * PARALLEL_BATCHES / avgProcessingTime)));
                    
                    // 배치 처리 후 대기 시간을 동적으로 조정
                    long waitTime = Math.max(1000, Math.min(5000, (long) (avgProcessingTime * 1000)));
                    Thread.sleep(waitTime);
                    
                } catch (Exception e) {
                    logger.error("❌ 배치 {} 처리 중 오류 발생:", batchCount + 1, e);
                    consecutiveErrors++;
                    
                    if (e instanceof RuntimeException) {
                        logger.info("🔄 MongoDB 연결 재시도...");
                        continue;
                    }
                    throw e;
                }
            }
            
            // 인덱스 새로고침
            RefreshRequest refreshRequest = new RefreshRequest("hospitals");
            elasticsearchClient.indices().refresh(refreshRequest, org.elasticsearch.client.RequestOptions.DEFAULT);
            
            double totalTime = (System.currentTimeMillis() - startTime) / 1000.0;
            logger.info("✅ 인덱싱 완료! 총 소요시간: {}분", Math.round(totalTime / 60));
            logger.info("📈 평균 처리 속도: {} 문서/초", 
                String.format("%.2f", totalHospitals / totalTime));
                
        } catch (Exception e) {
            logger.error("❌ 인덱싱 중 오류 발생:", e);
            throw new RuntimeException("벌크 인덱싱 실패", e);
        } finally {
            executorService.shutdown();
            try {
                if (!executorService.awaitTermination(60, TimeUnit.SECONDS)) {
                    executorService.shutdownNow();
                }
            } catch (InterruptedException e) {
                executorService.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
    }
    
    /**
     * 병원 배치 처리
     */
    private BatchResult processHospitalBatch(List<Map> hospitals, int batchNumber) throws IOException {
        long startTime = System.currentTimeMillis();
        
        try {
            BulkRequest bulkRequest = new BulkRequest();
            
            for (Map hospital : hospitals) {
                try {
                    // 추가 정보 조회
                    Map<String, Object> additionalInfo = fetchAdditionalInfo(hospital);
                    
                    // times 정보 가져오기
                    Query timesQuery = new Query(Criteria.where("ykiho").is(hospital.get("ykiho")));
                    Map times = mongoTemplate.findOne(timesQuery, Map.class, "hospitaltimes");
                    
                    // 병원 데이터 생성
                    Map<String, Object> hospitalData = createHospitalData(hospital, times, additionalInfo, new HashMap<>());
                    
                    // IndexRequest 생성 및 BulkRequest에 추가
                    IndexRequest indexRequest = new IndexRequest("hospitals")
                        .id(hospitalData.get("ykiho").toString())
                        .source(hospitalData, XContentType.JSON);
                    
                    bulkRequest.add(indexRequest);
                    
                } catch (Exception e) {
                    logger.error("병원 데이터 처리 중 오류: {}", hospital.get("ykiho"), e);
                }
            }
            
            // Bulk 요청 실행
            BulkResponse response = elasticsearchClient.bulk(bulkRequest, org.elasticsearch.client.RequestOptions.DEFAULT);
            if (response.hasFailures()) {
                logger.error("배치 {}에서 일부 문서 색인 실패", batchNumber);
            }
            
            double processingTime = (System.currentTimeMillis() - startTime) / 1000.0;
            logger.debug("배치 {} 처리 완료: {}개 문서, {}초", batchNumber, hospitals.size(), 
                String.format("%.2f", processingTime));
            
            return new BatchResult(hospitals.size(), processingTime);
            
        } catch (Exception e) {
            logger.error("배치 {} 처리 중 오류:", batchNumber, e);
            throw e;
        }
    }
    
    /**
     * 병원 데이터 생성
     */
    private Map<String, Object> createHospitalData(Map hospital, Map times, Map<String, Object> additionalInfo, 
                                                  Map<String, List<Map>> nearbyPharmaciesMap) {
        Map<String, Object> hospitalData = new HashMap<>();
        
        hospitalData.put("ykiho", hospital.get("ykiho") != null ? hospital.get("ykiho") : hospital.get("_id").toString());
        hospitalData.put("yadmNm", hospital.get("yadmNm") != null ? hospital.get("yadmNm") : "-");
        hospitalData.put("addr", hospital.get("addr") != null ? hospital.get("addr") : "-");
        hospitalData.put("region", hospital.get("sidoCdNm") != null ? hospital.get("sidoCdNm") : "-");
        hospitalData.put("category", hospital.get("clCdNm") != null ? hospital.get("clCdNm") : "-");
        
        if (hospital.get("YPos") != null && hospital.get("XPos") != null) {
            Map<String, Double> location = new HashMap<>();
            location.put("lat", (Double) hospital.get("YPos"));
            location.put("lon", (Double) hospital.get("XPos"));
            hospitalData.put("location", location);
        }
        
        hospitalData.put("hospUrl", hospital.get("hospUrl") != null ? hospital.get("hospUrl") : "-");
        hospitalData.put("telno", hospital.get("telno") != null ? hospital.get("telno") : "-");
        hospitalData.put("veteran_hospital", hospital.get("veteran_hospital"));
        
        // times 정보
        if (times != null) {
            Map<String, Object> timesData = new HashMap<>();
            timesData.put("trmtMonStart", times.get("trmtMonStart"));
            timesData.put("trmtMonEnd", times.get("trmtMonEnd"));
            timesData.put("trmtTueStart", times.get("trmtTueStart"));
            timesData.put("trmtTueEnd", times.get("trmtTueEnd"));
            timesData.put("trmtWedStart", times.get("trmtWedStart"));
            timesData.put("trmtWedEnd", times.get("trmtWedEnd"));
            timesData.put("trmtThuStart", times.get("trmtThuStart"));
            timesData.put("trmtThuEnd", times.get("trmtThuEnd"));
            timesData.put("trmtFriStart", times.get("trmtFriStart"));
            timesData.put("trmtFriEnd", times.get("trmtFriEnd"));
            timesData.put("trmtSatStart", times.get("trmtSatStart"));
            timesData.put("trmtSatEnd", times.get("trmtSatEnd"));
            timesData.put("lunchWeek", times.get("lunchWeek"));
            timesData.put("rcvWeek", times.get("rcvWeek"));
            timesData.put("rcvSat", times.get("rcvSat"));
            timesData.put("emyNgtYn", times.get("emyNgtYn"));
            timesData.put("noTrmtSat", times.get("noTrmtSat"));
            timesData.put("noTrmtSun", times.get("noTrmtSun"));
            timesData.put("emyDayTelNo1", times.get("emyDayTelNo1"));
            timesData.put("emyDayTelNo2", times.get("emyDayTelNo2"));
            timesData.put("emyDayYn", times.get("emyDayYn"));
            timesData.put("emyNgtTelNo1", times.get("emyNgtTelNo1"));
            timesData.put("emyNgtTelNo2", times.get("emyNgtTelNo2"));
            timesData.put("noTrmtHoli", times.get("noTrmtHoli"));
            timesData.put("parkEtc", times.get("parkEtc"));
            timesData.put("parkQty", times.get("parkQty"));
            timesData.put("parkXpnsYn", times.get("parkXpnsYn"));
            timesData.put("plcDir", times.get("plcDir"));
            timesData.put("plcDist", times.get("plcDist"));
            timesData.put("plcNm", times.get("plcNm"));
            
            hospitalData.put("times", timesData);
        }
        
        // 가까운 약국 정보
        String ykiho = hospitalData.get("ykiho").toString();
        hospitalData.put("nearby_pharmacies", nearbyPharmaciesMap.getOrDefault(ykiho, new ArrayList<>()));
        
        // 과목 정보
        List<Map> subjects = (List<Map>) additionalInfo.get("subjects");
        if (subjects != null && !subjects.isEmpty()) {
            List<String> major = subjects.stream()
                .map(s -> (String) s.get("dgsbjtCdNm"))
                .filter(Objects::nonNull)
                .toList();
            hospitalData.put("major", major);
        } else {
            hospitalData.put("major", List.of("-"));
        }
        
        // 장비 정보
        List<Map> equipment = (List<Map>) additionalInfo.get("equipment");
        if (equipment != null) {
            List<Map<String, Object>> equipmentData = equipment.stream()
                .map(e -> Map.of(
                    "typeCd", e.get("typeCd"),
                    "typeCdNm", e.get("typeCdNm"),
                    "typeCnt", e.get("typeCnt")
                ))
                .toList();
            hospitalData.put("equipment", equipmentData);
        }
        
        // 식이치료 정보
        List<Map> foodTreatment = (List<Map>) additionalInfo.get("food_treatment_info");
        if (foodTreatment != null) {
            List<Map<String, Object>> foodTreatmentData = foodTreatment.stream()
                .map(f -> Map.of(
                    "typeCd", f.get("typeCd"),
                    "typeCdNm", f.get("typeCdNm"),
                    "genMealAddYn", f.get("genMealAddYn"),
                    "psnlCnt", f.get("psnlCnt")
                ))
                .toList();
            hospitalData.put("food_treatment", foodTreatmentData);
        }
        
        // 중환자실 정보
        List<Map> intensiveCare = (List<Map>) additionalInfo.get("intensive_care_info");
        if (intensiveCare != null) {
            List<Map<String, Object>> intensiveCareData = intensiveCare.stream()
                .map(i -> Map.of(
                    "typeCd", i.get("typeCd"),
                    "typeCdNm", i.get("typeCdNm")
                ))
                .toList();
            hospitalData.put("intensive_care", intensiveCareData);
        }
        
        // 간호등급 정보
        List<Map> nursingGrade = (List<Map>) additionalInfo.get("nursing_grade");
        if (nursingGrade != null) {
            List<Map<String, Object>> nursingGradeData = nursingGrade.stream()
                .map(n -> Map.of(
                    "typeCd", n.get("typeCd"),
                    "typeCdNm", n.get("typeCdNm"),
                    "nursingRt", n.get("nursingRt")
                ))
                .toList();
            hospitalData.put("nursing_grade", nursingGradeData);
        }
        
        // 인력 정보
        List<Map> personnel = (List<Map>) additionalInfo.get("personnel_info");
        if (personnel != null) {
            List<Map<String, Object>> personnelData = personnel.stream()
                .map(p -> Map.of(
                    "pharmCd", p.get("pharmCd"),
                    "pharmCdNm", p.get("pharmCdNm"),
                    "pharmCnt", p.get("pharmCnt")
                ))
                .toList();
            hospitalData.put("personnel", personnelData);
        }
        
        // 전문과목 정보
        List<Map> speciality = (List<Map>) additionalInfo.get("speciality_info");
        if (speciality != null) {
            List<Map<String, Object>> specialityData = speciality.stream()
                .map(s -> Map.of(
                    "typeCd", s.get("typeCd"),
                    "typeCdNm", s.get("typeCdNm")
                ))
                .toList();
            hospitalData.put("speciality", specialityData);
        }
        
        return hospitalData;
    }
    
    /**
     * 추가 정보 조회
     */
    private Map<String, Object> fetchAdditionalInfo(Map hospital) {
        try {
            String ykiho = (String) hospital.get("ykiho");
            
            Query subjectsQuery = new Query(Criteria.where("ykiho").is(ykiho));
            Query equipmentQuery = new Query(Criteria.where("ykiho").is(ykiho));
            Query foodTreatmentQuery = new Query(Criteria.where("ykiho").is(ykiho));
            Query intensiveCareQuery = new Query(Criteria.where("ykiho").is(ykiho));
            Query nursingGradeQuery = new Query(Criteria.where("ykiho").is(ykiho));
            Query personnelQuery = new Query(Criteria.where("ykiho").is(ykiho));
            Query specialityQuery = new Query(Criteria.where("ykiho").is(ykiho));
            
            List<Map> subjects = mongoTemplate.find(subjectsQuery, Map.class, "hospitalsubjects");
            List<Map> equipment = mongoTemplate.find(equipmentQuery, Map.class, "hospital_equipment");
            List<Map> foodTreatment = mongoTemplate.find(foodTreatmentQuery, Map.class, "hospital_food_treatment_info");
            List<Map> intensiveCare = mongoTemplate.find(intensiveCareQuery, Map.class, "hospital_intensive_care_info");
            List<Map> nursingGrade = mongoTemplate.find(nursingGradeQuery, Map.class, "hospital_nursing_grade");
            List<Map> personnel = mongoTemplate.find(personnelQuery, Map.class, "hospital_personnel_info");
            List<Map> speciality = mongoTemplate.find(specialityQuery, Map.class, "hospital_speciality_info");
            
            Map<String, Object> additionalInfo = new HashMap<>();
            additionalInfo.put("subjects", subjects);
            additionalInfo.put("equipment", equipment);
            additionalInfo.put("food_treatment_info", foodTreatment);
            additionalInfo.put("intensive_care_info", intensiveCare);
            additionalInfo.put("nursing_grade", nursingGrade);
            additionalInfo.put("personnel_info", personnel);
            additionalInfo.put("speciality_info", speciality);
            
            return additionalInfo;
        } catch (Exception e) {
            logger.error("병원 {} 추가 정보 조회 중 오류:", hospital.get("ykiho"), e);
            return createEmptyAdditionalInfo();
        }
    }
    
    /**
     * 빈 추가 정보 생성
     */
    private Map<String, Object> createEmptyAdditionalInfo() {
        Map<String, Object> emptyInfo = new HashMap<>();
        emptyInfo.put("subjects", new ArrayList<>());
        emptyInfo.put("equipment", new ArrayList<>());
        emptyInfo.put("food_treatment_info", new ArrayList<>());
        emptyInfo.put("intensive_care_info", new ArrayList<>());
        emptyInfo.put("nursing_grade", new ArrayList<>());
        emptyInfo.put("personnel_info", new ArrayList<>());
        emptyInfo.put("speciality_info", new ArrayList<>());
        return emptyInfo;
    }
    
    /**
     * 거리 계산
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371e3; // 지구 반지름 (미터)
        double φ1 = Math.toRadians(lat1);
        double φ2 = Math.toRadians(lat2);
        double Δφ = Math.toRadians(lat2 - lat1);
        double Δλ = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                   Math.cos(φ1) * Math.cos(φ2) *
                   Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }
    
    /**
     * 이동 평균 계산
     */
    private double calculateMovingAverage(List<Double> times, int windowSize) {
        if (times.size() < windowSize) {
            return times.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        }
        List<Double> recentTimes = times.subList(times.size() - windowSize, times.size());
        return recentTimes.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }
    
    /**
     * 약국 데이터 벌크 색인
     */
    public void bulkPharmaciesIndex() throws IOException {
        long startTime = System.currentTimeMillis();
        
        try {
            logger.info("🚀 약국 데이터 벌크 색인 시작...");
            
            // MongoDB에서 약국 데이터 조회
            List<Map> pharmacies = mongoTemplate.find(new Query(), Map.class, "pharmacies");
            logger.info("총 {}개의 약국 데이터를 처리합니다.", pharmacies.size());
            
            if (pharmacies.isEmpty()) {
                logger.info("⚠️ 색인할 약국 데이터가 없습니다.");
                return;
            }
            
            // 배치 크기 설정
            int batchSize = 500;
            int totalProcessed = 0;
            
            for (int i = 0; i < pharmacies.size(); i += batchSize) {
                int endIndex = Math.min(i + batchSize, pharmacies.size());
                List<Map> batch = pharmacies.subList(i, endIndex);
                
                BulkRequest bulkRequest = new BulkRequest();
                
                for (Map pharmacy : batch) {
                    try {
                        // 약국 데이터 생성
                        Map<String, Object> pharmacyData = new HashMap<>();
                        
                        pharmacyData.put("ykiho", pharmacy.get("ykiho"));
                        pharmacyData.put("yadmNm", pharmacy.get("yadmNm"));
                        pharmacyData.put("clCd", pharmacy.get("clCd"));
                        pharmacyData.put("clCdNm", pharmacy.get("clCdNm"));
                        pharmacyData.put("sidoCd", pharmacy.get("sidoCd"));
                        pharmacyData.put("sidoCdNm", pharmacy.get("sidoCdNm"));
                        pharmacyData.put("sgguCd", pharmacy.get("sgguCd"));
                        pharmacyData.put("sgguCdNm", pharmacy.get("sgguCdNm"));
                        pharmacyData.put("emdongNm", pharmacy.get("emdongNm"));
                        pharmacyData.put("postNo", pharmacy.get("postNo"));
                        pharmacyData.put("addr", pharmacy.get("addr"));
                        pharmacyData.put("telno", pharmacy.get("telno"));
                        pharmacyData.put("estbDd", pharmacy.get("estbDd"));
                        
                        // 위치 정보
                        if (pharmacy.get("Ypos") != null && pharmacy.get("Xpos") != null) {
                            Map<String, Double> location = new HashMap<>();
                            location.put("lat", (Double) pharmacy.get("Ypos"));
                            location.put("lon", (Double) pharmacy.get("Xpos"));
                            pharmacyData.put("location", location);
                        }
                        
                        // IndexRequest 생성 및 BulkRequest에 추가
                        IndexRequest indexRequest = new IndexRequest("pharmacies")
                            .id(pharmacyData.get("ykiho").toString())
                            .source(pharmacyData, XContentType.JSON);
                        
                        bulkRequest.add(indexRequest);
                        
                    } catch (Exception e) {
                        logger.error("약국 데이터 처리 중 오류: {}", pharmacy.get("ykiho"), e);
                    }
                }
                
                // Bulk 요청 실행
                BulkResponse response = elasticsearchClient.bulk(bulkRequest, org.elasticsearch.client.RequestOptions.DEFAULT);
                if (response.hasFailures()) {
                    logger.error("배치 {}에서 일부 문서 색인 실패", (i / batchSize) + 1);
                }
                
                totalProcessed += batch.size();
                double progress = (double) totalProcessed / pharmacies.size() * 100;
                logger.info("📊 진행 상황: {}/{} ({}%)", totalProcessed, pharmacies.size(), Math.round(progress));
                
                // 배치 처리 후 잠시 대기
                Thread.sleep(1000);
            }
            
            // 인덱스 새로고침
            RefreshRequest refreshRequest = new RefreshRequest("pharmacies");
            elasticsearchClient.indices().refresh(refreshRequest, org.elasticsearch.client.RequestOptions.DEFAULT);
            
            double totalTime = (System.currentTimeMillis() - startTime) / 1000.0;
            logger.info("✅ 약국 데이터 색인 완료! 총 소요시간: {}초", String.format("%.2f", totalTime));
            logger.info("📈 평균 처리 속도: {} 문서/초", 
                String.format("%.2f", pharmacies.size() / totalTime));
                
        } catch (Exception e) {
            logger.error("❌ 약국 데이터 벌크 색인 중 오류 발생:", e);
            throw new RuntimeException("약국 데이터 벌크 색인 실패", e);
        }
    }
    
    /**
     * 지도 데이터 벌크 색인 (Node.js bulkMapIndex.js와 동일한 로직)
     */
    public void bulkMapIndex() throws IOException {
        long startTime = System.currentTimeMillis();
        
        try {
            logger.info("🚀 지도 데이터 벌크 색인 시작...");
            
            // 1. 데이터 로드 시작
            logger.info("1. 데이터 로드 시작...");
            
            // 병원 데이터 조회
            List<Map> hospitals = mongoTemplate.find(new Query(), Map.class, "hospitals");
            logger.info("총 병원 수: {}", hospitals.size());
            
            // 약국 데이터 조회
            List<Map> pharmacies = mongoTemplate.find(new Query(), Map.class, "pharmacies");
            logger.info("총 약국 수: {}", pharmacies.size());
            
            // 2. 위치 기반 그룹화 시작
            logger.info("2. 위치 기반 그룹화 시작...");
            Map<String, Map<String, Object>> locationGroups = new HashMap<>();
            
            // 병원 데이터 처리
            for (Map hospital : hospitals) {
                if (hospital.get("YPos") != null && hospital.get("XPos") != null) {
                    String key = hospital.get("YPos") + "_" + hospital.get("XPos");
                    if (!locationGroups.containsKey(key)) {
                        Map<String, Object> group = new HashMap<>();
                        Map<String, Double> location = new HashMap<>();
                        location.put("lat", (Double) hospital.get("YPos"));
                        location.put("lon", (Double) hospital.get("XPos"));
                        group.put("location", location);
                        group.put("markers", new ArrayList<>());
                        locationGroups.put(key, group);
                    }
                    
                    Map<String, Object> marker = new HashMap<>();
                    marker.put("type", "hospital");
                    marker.put("data", hospital);
                    ((List<Map<String, Object>>) locationGroups.get(key).get("markers")).add(marker);
                }
            }
            
            // 약국 데이터 처리
            for (Map pharmacy : pharmacies) {
                if (pharmacy.get("Ypos") != null && pharmacy.get("Xpos") != null) {
                    String key = pharmacy.get("Ypos") + "_" + pharmacy.get("Xpos");
                    if (!locationGroups.containsKey(key)) {
                        Map<String, Object> group = new HashMap<>();
                        Map<String, Double> location = new HashMap<>();
                        location.put("lat", (Double) pharmacy.get("Ypos"));
                        location.put("lon", (Double) pharmacy.get("Xpos"));
                        group.put("location", location);
                        group.put("markers", new ArrayList<>());
                        locationGroups.put(key, group);
                    }
                    
                    Map<String, Object> marker = new HashMap<>();
                    marker.put("type", "pharmacy");
                    marker.put("data", pharmacy);
                    ((List<Map<String, Object>>) locationGroups.get(key).get("markers")).add(marker);
                }
            }
            
            logger.info("총 그룹 수: {}", locationGroups.size());
            
            // 3. Elasticsearch 문서 변환 시작
            logger.info("3. Elasticsearch 문서 변환 시작...");
            List<Map<String, Object>> allDocs = new ArrayList<>();
            
            for (Map.Entry<String, Map<String, Object>> entry : locationGroups.entrySet()) {
                String key = entry.getKey();
                Map<String, Object> group = entry.getValue();
                List<Map<String, Object>> markers = (List<Map<String, Object>>) group.get("markers");
                int totalCount = markers.size();
                
                // 같은 위치에 2개 이상의 마커가 있는 경우 클러스터링
                if (totalCount > 1) {
                    List<Map<String, Object>> hospitalDetails = new ArrayList<>();
                    List<Map<String, Object>> pharmacyDetails = new ArrayList<>();
                    
                    for (Map<String, Object> marker : markers) {
                        String type = (String) marker.get("type");
                        Map<String, Object> data = (Map<String, Object>) marker.get("data");
                        
                        if ("hospital".equals(type)) {
                            Map<String, Object> hospitalDetail = new HashMap<>();
                            hospitalDetail.put("type", "hospital");
                            hospitalDetail.put("name", data.get("name"));
                            hospitalDetail.put("yadmNm", data.get("yadmNm"));
                            hospitalDetail.put("addr", data.get("addr"));
                            hospitalDetail.put("telno", data.get("telno"));
                            hospitalDetail.put("clCd", data.get("clCd"));
                            hospitalDetail.put("clCdNm", data.get("clCdNm"));
                            hospitalDetail.put("ykiho", data.get("ykiho"));
                            hospitalDetails.add(hospitalDetail);
                        } else if ("pharmacy".equals(type)) {
                            Map<String, Object> pharmacyDetail = new HashMap<>();
                            pharmacyDetail.put("type", "pharmacy");
                            pharmacyDetail.put("ykiho", data.get("ykiho"));
                            pharmacyDetail.put("yadmNm", data.get("yadmNm"));
                            pharmacyDetail.put("clCd", data.get("clCd"));
                            pharmacyDetail.put("clCdNm", data.get("clCdNm"));
                            pharmacyDetail.put("addr", data.get("addr"));
                            pharmacyDetail.put("telno", data.get("telno"));
                            pharmacyDetails.add(pharmacyDetail);
                        }
                    }
                    
                    Map<String, Object> clusterDoc = new HashMap<>();
                    clusterDoc.put("type", "cluster");
                    clusterDoc.put("location", group.get("location"));
                    clusterDoc.put("clusterId", key);
                    clusterDoc.put("clusterCount", totalCount);
                    clusterDoc.put("isClustered", true);
                    clusterDoc.put("hospitals", hospitalDetails);
                    clusterDoc.put("pharmacies", pharmacyDetails);
                    clusterDoc.put("hospitalCount", hospitalDetails.size());
                    clusterDoc.put("pharmacyCount", pharmacyDetails.size());
                    
                    allDocs.add(clusterDoc);
                } else {
                    // 단일 마커인 경우
                    Map<String, Object> marker = markers.get(0);
                    String type = (String) marker.get("type");
                    Map<String, Object> data = (Map<String, Object>) marker.get("data");
                    
                    if ("hospital".equals(type)) {
                        Map<String, Object> hospitalDoc = new HashMap<>();
                        hospitalDoc.put("type", "hospital");
                        hospitalDoc.put("name", data.get("name"));
                        hospitalDoc.put("yadmNm", data.get("yadmNm"));
                        hospitalDoc.put("addr", data.get("addr"));
                        hospitalDoc.put("telno", data.get("telno"));
                        hospitalDoc.put("clCd", data.get("clCd"));
                        hospitalDoc.put("clCdNm", data.get("clCdNm"));
                        hospitalDoc.put("ykiho", data.get("ykiho"));
                        hospitalDoc.put("location", group.get("location"));
                        hospitalDoc.put("isClustered", false);
                        allDocs.add(hospitalDoc);
                    } else if ("pharmacy".equals(type)) {
                        Map<String, Object> pharmacyDoc = new HashMap<>();
                        pharmacyDoc.put("type", "pharmacy");
                        pharmacyDoc.put("ykiho", data.get("ykiho"));
                        pharmacyDoc.put("yadmNm", data.get("yadmNm"));
                        pharmacyDoc.put("clCd", data.get("clCd"));
                        pharmacyDoc.put("clCdNm", data.get("clCdNm"));
                        pharmacyDoc.put("addr", data.get("addr"));
                        pharmacyDoc.put("telno", data.get("telno"));
                        pharmacyDoc.put("location", group.get("location"));
                        pharmacyDoc.put("isClustered", false);
                        allDocs.add(pharmacyDoc);
                    }
                }
            }
            
            logger.info("색인할 총 문서 수: {}", allDocs.size());
            logger.info("클러스터 수: {}", allDocs.stream().filter(doc -> (Boolean) doc.get("isClustered")).count());
            logger.info("단일 마커 수: {}", allDocs.stream().filter(doc -> !(Boolean) doc.get("isClustered")).count());
            
            // 4. Elasticsearch 색인 시작
            logger.info("4. Elasticsearch 색인 시작...");
            for (int i = 0; i < allDocs.size(); i += BATCH_SIZE) {
                int endIndex = Math.min(i + BATCH_SIZE, allDocs.size());
                List<Map<String, Object>> chunk = allDocs.subList(i, endIndex);
                
                BulkRequest bulkRequest = new BulkRequest();
                
                for (Map<String, Object> doc : chunk) {
                    IndexRequest indexRequest = new IndexRequest("map_data")
                        .source(doc, XContentType.JSON);
                    bulkRequest.add(indexRequest);
                }
                
                BulkResponse bulkResponse = elasticsearchClient.bulk(bulkRequest, org.elasticsearch.client.RequestOptions.DEFAULT);
                
                if (bulkResponse.hasFailures()) {
                    logger.error("❌ 배치 {} 색인 실패: {}", (i / BATCH_SIZE) + 1, bulkResponse.buildFailureMessage());
                } else {
                    logger.info("✅ {}개 색인 완료", i + chunk.size());
                }
            }
            
            // 인덱스 새로고침
            elasticsearchClient.indices().refresh(new RefreshRequest("map_data"), org.elasticsearch.client.RequestOptions.DEFAULT);
            
            // 색인 후 실제 문서 개수 조회
            try {
                org.elasticsearch.client.core.CountRequest countRequest = new org.elasticsearch.client.core.CountRequest("map_data");
                org.elasticsearch.client.core.CountResponse countResponse = elasticsearchClient.count(countRequest, org.elasticsearch.client.RequestOptions.DEFAULT);
                long count = countResponse.getCount();
                logger.info("Elasticsearch map_data 문서 개수: {}", count);
            } catch (Exception err) {
                logger.error("count API 호출 중 오류: {}", err.getMessage());
            }
            
            long endTime = System.currentTimeMillis();
            long processingTime = endTime - startTime;
            
            logger.info("✅ 모든 지도 데이터 색인 완료!");
            logger.info("📊 총 처리 시간: {}ms", processingTime);
            
        } catch (Exception e) {
            logger.error("❌ 지도 데이터 벌크 색인 중 오류 발생:", e);
            throw e;
        }
    }
    
    /**
     * 지도 클러스터 데이터 벌크 색인
     */
    public void bulkMapClusterIndex() throws IOException {
        // TODO: 구현 필요
        logger.info("지도 클러스터 데이터 벌크 색인 - 구현 예정");
    }
    
    /**
     * 단일 병원 문서 색인
     */
    public void indexSingleHospital(Map hospital) throws IOException {
        try {
            // 추가 정보 조회
            Map<String, Object> additionalInfo = fetchAdditionalInfo(hospital);
            
            // times 정보 가져오기
            Query timesQuery = new Query(Criteria.where("ykiho").is(hospital.get("ykiho")));
            Map times = mongoTemplate.findOne(timesQuery, Map.class, "hospitaltimes");
            
            // 병원 데이터 생성
            Map<String, Object> hospitalData = createHospitalData(hospital, times, additionalInfo, new HashMap<>());
            
            // 단일 문서 색인
            IndexRequest indexRequest = new IndexRequest("hospitals")
                .id(hospitalData.get("ykiho").toString())
                .source(hospitalData, XContentType.JSON);
            
            elasticsearchClient.index(indexRequest, org.elasticsearch.client.RequestOptions.DEFAULT);
            
            logger.debug("✅ 단일 병원 문서 색인 완료: {}", hospital.get("ykiho"));
            
        } catch (Exception e) {
            logger.error("❌ 단일 병원 문서 색인 중 오류 발생: {}", hospital.get("ykiho"), e);
            throw e;
        }
    }
    
    /**
     * 단일 약국 문서 색인
     */
    public void indexSinglePharmacy(Map pharmacy) throws IOException {
        try {
            Map<String, Object> pharmacyData = new HashMap<>();
            
            pharmacyData.put("ykiho", pharmacy.get("ykiho"));
            pharmacyData.put("yadmNm", pharmacy.get("yadmNm"));
            pharmacyData.put("clCd", pharmacy.get("clCd"));
            pharmacyData.put("clCdNm", pharmacy.get("clCdNm"));
            pharmacyData.put("sidoCd", pharmacy.get("sidoCd"));
            pharmacyData.put("sidoCdNm", pharmacy.get("sidoCdNm"));
            pharmacyData.put("sgguCd", pharmacy.get("sgguCd"));
            pharmacyData.put("sgguCdNm", pharmacy.get("sgguCdNm"));
            pharmacyData.put("emdongNm", pharmacy.get("emdongNm"));
            pharmacyData.put("postNo", pharmacy.get("postNo"));
            pharmacyData.put("addr", pharmacy.get("addr"));
            pharmacyData.put("telno", pharmacy.get("telno"));
            pharmacyData.put("estbDd", pharmacy.get("estbDd"));
            
            // 위치 정보
            if (pharmacy.get("Ypos") != null && pharmacy.get("Xpos") != null) {
                Map<String, Double> location = new HashMap<>();
                location.put("lat", (Double) pharmacy.get("Ypos"));
                location.put("lon", (Double) pharmacy.get("Xpos"));
                pharmacyData.put("location", location);
            }
            
            // 단일 문서 색인
            IndexRequest indexRequest = new IndexRequest("pharmacies")
                .id(pharmacyData.get("ykiho").toString())
                .source(pharmacyData, XContentType.JSON);
            
            elasticsearchClient.index(indexRequest, org.elasticsearch.client.RequestOptions.DEFAULT);
            
            logger.debug("✅ 단일 약국 문서 색인 완료: {}", pharmacy.get("ykiho"));
            
        } catch (Exception e) {
            logger.error("❌ 단일 약국 문서 색인 중 오류 발생: {}", pharmacy.get("ykiho"), e);
            throw e;
        }
    }
    
    /**
     * 단일 문서 삭제
     */
    public void deleteSingleDocument(String indexName, String documentId) throws IOException {
        try {
            org.elasticsearch.action.delete.DeleteRequest deleteRequest = 
                new org.elasticsearch.action.delete.DeleteRequest(indexName, documentId);
            
            elasticsearchClient.delete(deleteRequest, org.elasticsearch.client.RequestOptions.DEFAULT);
            
            logger.debug("✅ 문서 삭제 완료: {} - {}", indexName, documentId);
            
        } catch (Exception e) {
            logger.error("❌ 문서 삭제 중 오류 발생: {} - {}", indexName, documentId, e);
            throw e;
        }
    }
    
    /**
     * 문서 업데이트
     */
    public void updateSingleDocument(String indexName, String documentId, Map<String, Object> updateData) throws IOException {
        try {
            org.elasticsearch.action.update.UpdateRequest updateRequest = 
                new org.elasticsearch.action.update.UpdateRequest(indexName, documentId);
            
            updateRequest.doc(updateData, XContentType.JSON);
            updateRequest.docAsUpsert(true); // 문서가 없으면 생성
            
            elasticsearchClient.update(updateRequest, org.elasticsearch.client.RequestOptions.DEFAULT);
            
            logger.debug("✅ 문서 업데이트 완료: {} - {}", indexName, documentId);
            
        } catch (Exception e) {
            logger.error("❌ 문서 업데이트 중 오류 발생: {} - {}", indexName, documentId, e);
            throw e;
        }
    }
    
    /**
     * 배치 결과 클래스
     */
    private static class BatchResult {
        private final int count;
        private final double time;
        
        public BatchResult(int count, double time) {
            this.count = count;
            this.time = time;
        }
        
        public int getCount() { return count; }
        public double getTime() { return time; }
    }
} 