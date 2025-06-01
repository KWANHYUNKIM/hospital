package com.bippobippo.hospital.impl.admin;

import com.bippobippo.hospital.dto.MessageResponse;
import com.bippobippo.hospital.dto.request.admin.*;
import com.bippobippo.hospital.dto.response.admin.*;
import com.bippobippo.hospital.entity.common.CorsConfig;
import com.bippobippo.hospital.entity.common.ServerConfig;
import com.bippobippo.hospital.entity.common.SocialConfig;
import com.bippobippo.hospital.repository.admin.*;
import com.bippobippo.hospital.repository.common.SocialConfigRepository;
import com.bippobippo.hospital.service.admin.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Criteria;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.aggregation.Aggregation;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final ServerConfigRepository serverConfigRepository;
    private final SocialConfigRepository socialConfigRepository;
    private final CorsConfigRepository corsConfigRepository;
    private final MongoTemplate mongoTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse response = new DashboardStatsResponse();
        
        // MongoDB에서 통계 데이터 조회
        Query query = new Query();
        long totalHospitals = mongoTemplate.count(query, "hospitals");
        
        // 병원 유형별 분포
        Aggregation typeAggregation = Aggregation.newAggregation(
            Aggregation.group("clCdNm").count().as("count")
        );
        List<Map<String, Object>> hospitalsByType = mongoTemplate.aggregate(
            typeAggregation,
            "hospitals",
            Map.class
        ).getMappedResults().stream()
            .map(map -> (Map<String, Object>) map)
            .collect(Collectors.toList());
        
        // 지역별 분포
        Aggregation regionAggregation = Aggregation.newAggregation(
            Aggregation.group("sidoCdNm").count().as("count")
        );
        List<Map<String, Object>> hospitalsByRegion = mongoTemplate.aggregate(
            regionAggregation,
            "hospitals",
            Map.class
        ).getMappedResults().stream()
            .map(map -> (Map<String, Object>) map)
            .collect(Collectors.toList());
        
        // 최근 업데이트된 병원
        Query recentQuery = new Query();
        recentQuery.limit(5);
        recentQuery.with(org.springframework.data.domain.Sort.by(
            org.springframework.data.domain.Sort.Direction.DESC, "updatedAt"
        ));
        List<Map<String, Object>> recentUpdates = mongoTemplate.find(
            recentQuery,
            Map.class,
            "hospitals"
        ).stream()
            .map(map -> (Map<String, Object>) map)
            .collect(Collectors.toList());
        
        // 빈 필드 현황
        Map<String, Integer> emptyFields = new HashMap<>();
        emptyFields.put("name", (int) mongoTemplate.count(
            Query.query(Criteria.where("yadmNm").exists(false)),
            "hospitals"
        ));
        emptyFields.put("address", (int) mongoTemplate.count(
            Query.query(Criteria.where("addr").exists(false)),
            "hospitals"
        ));
        emptyFields.put("phone", (int) mongoTemplate.count(
            Query.query(Criteria.where("telno").exists(false)),
            "hospitals"
        ));
        emptyFields.put("type", (int) mongoTemplate.count(
            Query.query(Criteria.where("clCdNm").exists(false)),
            "hospitals"
        ));
        emptyFields.put("location", (int) mongoTemplate.count(
            Query.query(Criteria.where("XPos").exists(false)),
            "hospitals"
        ));
        
        // 응답 구성
        Map<String, Object> collectionStats = new HashMap<>();
        Map<String, Object> hospitals = new HashMap<>();
        hospitals.put("total", totalHospitals);
        hospitals.put("complete", mongoTemplate.count(
            Query.query(Criteria.where("status").is("complete")),
            "hospitals"
        ));
        hospitals.put("partial", mongoTemplate.count(
            Query.query(Criteria.where("status").is("partial")),
            "hospitals"
        ));
        hospitals.put("incomplete", mongoTemplate.count(
            Query.query(Criteria.where("status").is("incomplete")),
            "hospitals"
        ));
        collectionStats.put("hospitals", hospitals);
        
        response.setCollectionStats(collectionStats);
        response.setHospitalsByType(hospitalsByType.stream()
            .collect(Collectors.toMap(
                m -> (String) m.get("_id"),
                m -> ((Number) m.get("count")).intValue()
            )));
        response.setHospitalsByRegion(hospitalsByRegion.stream()
            .collect(Collectors.toMap(
                m -> (String) m.get("_id"),
                m -> ((Number) m.get("count")).intValue()
            )));
        response.setRecentUpdates(recentUpdates);
        response.setEmptyFields(emptyFields);
        
        return response;
    }

    @Override
    public ServerConfigResponse getServerConfigs() {
        ServerConfigResponse response = new ServerConfigResponse();
        response.setConfigs(serverConfigRepository.findAll().stream()
            .map(config -> {
                ServerConfigResponse.ServerConfigDto dto = new ServerConfigResponse.ServerConfigDto();
                dto.setId(config.getId());
                dto.setKeyName(config.getKeyName());
                dto.setValue(config.getValue());
                dto.setEnvironment(config.getEnvironment());
                dto.setDescription(config.getDescription());
                dto.setIsActive(config.getIsActive());
                return dto;
            })
            .collect(Collectors.toList()));
        return response;
    }

    @Override
    @Transactional
    public MessageResponse createServerConfig(ServerConfigRequest request) {
        ServerConfig config = new ServerConfig();
        config.setKeyName(request.getKeyName());
        config.setValue(request.getValue());
        config.setEnvironment(request.getEnvironment());
        config.setDescription(request.getDescription());
        config.setIsActive(request.getIsActive());
        
        serverConfigRepository.save(config);
        return new MessageResponse("설정이 추가되었습니다.");
    }

    @Override
    @Transactional
    public MessageResponse updateServerConfig(Long id, ServerConfigRequest request) {
        ServerConfig config = serverConfigRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("설정을 찾을 수 없습니다."));
        
        config.setKeyName(request.getKeyName());
        config.setValue(request.getValue());
        config.setEnvironment(request.getEnvironment());
        config.setDescription(request.getDescription());
        config.setIsActive(request.getIsActive());
        
        serverConfigRepository.save(config);
        return new MessageResponse("설정이 수정되었습니다.");
    }

    @Override
    @Transactional
    public MessageResponse deleteServerConfig(Long id) {
        serverConfigRepository.deleteById(id);
        return new MessageResponse("설정이 삭제되었습니다.");
    }

    @Override
    public SocialConfigResponse getSocialConfigs() {
        SocialConfigResponse response = new SocialConfigResponse();
        response.setConfigs(socialConfigRepository.findAll().stream()
            .map(config -> {
                SocialConfigResponse.SocialConfigDto dto = new SocialConfigResponse.SocialConfigDto();
                dto.setProvider(config.getProvider());
                dto.setClientId(config.getClientId());
                dto.setClientSecret(config.getClientSecret());
                dto.setRedirectUri(config.getRedirectUri());
                dto.setEnvironment(config.getEnvironment());
                dto.setIsActive(config.getIsActive());
                return dto;
            })
            .collect(Collectors.toList()));
        return response;
    }

    @Override
    @Transactional
    public MessageResponse createSocialConfig(SocialConfigRequest request) {
        SocialConfig config = new SocialConfig();
        config.setProvider(request.getProvider());
        config.setClientId(request.getClientId());
        config.setClientSecret(request.getClientSecret());
        config.setRedirectUri(request.getRedirectUri());
        config.setEnvironment(request.getEnvironment());
        config.setIsActive(request.getIsActive());
        
        socialConfigRepository.save(config);
        return new MessageResponse("설정이 추가되었습니다.");
    }

    @Override
    @Transactional
    public MessageResponse updateSocialConfig(String provider, SocialConfigRequest request) {
        SocialConfig config = socialConfigRepository.findByProvider(provider)
            .orElseThrow(() -> new RuntimeException("설정을 찾을 수 없습니다."));
        
        config.setClientId(request.getClientId());
        config.setClientSecret(request.getClientSecret());
        config.setRedirectUri(request.getRedirectUri());
        config.setEnvironment(request.getEnvironment());
        config.setIsActive(request.getIsActive());
        
        socialConfigRepository.save(config);
        return new MessageResponse("설정이 수정되었습니다.");
    }

    @Override
    @Transactional
    public MessageResponse deleteSocialConfig(String provider) {
        SocialConfig config = socialConfigRepository.findByProvider(provider)
            .orElseThrow(() -> new RuntimeException("설정을 찾을 수 없습니다."));
        socialConfigRepository.delete(config);
        return new MessageResponse("설정이 삭제되었습니다.");
    }

    @Override
    public CorsConfigResponse getCorsConfigs() {
        CorsConfigResponse response = new CorsConfigResponse();
        response.setConfigs(corsConfigRepository.findAll().stream()
            .map(config -> {
                CorsConfigResponse.CorsConfigDto dto = new CorsConfigResponse.CorsConfigDto();
                dto.setId(config.getId());
                dto.setOrigin(config.getOrigin());
                dto.setMethods(config.getMethods());
                dto.setHeaders(config.getHeaders());
                dto.setCredentials(config.getCredentials());
                dto.setMaxAge(config.getMaxAge());
                return dto;
            })
            .collect(Collectors.toList()));
        return response;
    }

    @Override
    @Transactional
    public MessageResponse createCorsConfig(CorsConfigRequest request) {
        CorsConfig config = new CorsConfig();
        config.setOrigin(request.getOrigin());
        config.setMethods(request.getMethods());
        config.setHeaders(request.getHeaders());
        config.setCredentials(request.getCredentials());
        config.setMaxAge(request.getMaxAge());
        
        corsConfigRepository.save(config);
        return new MessageResponse("설정이 추가되었습니다.");
    }

    @Override
    @Transactional
    public MessageResponse updateCorsConfig(Long id, CorsConfigRequest request) {
        CorsConfig config = corsConfigRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("설정을 찾을 수 없습니다."));
        
        config.setOrigin(request.getOrigin());
        config.setMethods(request.getMethods());
        config.setHeaders(request.getHeaders());
        config.setCredentials(request.getCredentials());
        config.setMaxAge(request.getMaxAge());
        
        corsConfigRepository.save(config);
        return new MessageResponse("설정이 수정되었습니다.");
    }

    @Override
    @Transactional
    public MessageResponse deleteCorsConfig(Long id) {
        corsConfigRepository.deleteById(id);
        return new MessageResponse("설정이 삭제되었습니다.");
    }

    @Override
    public GeoJsonUploadResponse uploadCtpBoundary(MultipartFile file) {
        // GeoJSON 파일 처리 로직 구현
        return new GeoJsonUploadResponse();
    }

    @Override
    public GeoJsonListResponse getCtpFiles() {
        GeoJsonListResponse response = new GeoJsonListResponse();
        List<Map<String, Object>> features = mongoTemplate.find(
            new Query(),
            Map.class,
            "sggu_boundaries_ctprvn"
        ).stream()
            .map(map -> (Map<String, Object>) map)
            .collect(Collectors.toList());
        response.setFeatures(features);
        return response;
    }

    @Override
    public MessageResponse deleteCtpFile(String fileId) {
        mongoTemplate.remove(
            Query.query(Criteria.where("_id").is(new ObjectId(fileId))),
            "sggu_boundaries_ctprvn"
        );
        return new MessageResponse("시도 경계 삭제 완료");
    }

    @Override
    public GeoJsonUploadResponse uploadSigBoundary(MultipartFile file) {
        // GeoJSON 파일 처리 로직 구현
        return new GeoJsonUploadResponse();
    }

    @Override
    public GeoJsonListResponse getSigFiles() {
        GeoJsonListResponse response = new GeoJsonListResponse();
        List<Map<String, Object>> features = mongoTemplate.find(
            new Query(),
            Map.class,
            "sggu_boundaries_sig"
        ).stream()
            .map(map -> (Map<String, Object>) map)
            .collect(Collectors.toList());
        response.setFeatures(features);
        return response;
    }

    @Override
    public MessageResponse deleteSigFile(String fileId) {
        mongoTemplate.remove(
            Query.query(Criteria.where("_id").is(new ObjectId(fileId))),
            "sggu_boundaries_sig"
        );
        return new MessageResponse("시군구 경계 삭제 완료");
    }

    @Override
    public GeoJsonUploadResponse uploadEmdBoundary(MultipartFile file) {
        // GeoJSON 파일 처리 로직 구현
        return new GeoJsonUploadResponse();
    }

    @Override
    public GeoJsonListResponse getEmdFiles() {
        GeoJsonListResponse response = new GeoJsonListResponse();
        List<Map<String, Object>> features = mongoTemplate.find(
            new Query(),
            Map.class,
            "sggu_boundaries_emd"
        ).stream()
            .map(map -> (Map<String, Object>) map)
            .collect(Collectors.toList());
        response.setFeatures(features);
        return response;
    }

    @Override
    public MessageResponse deleteEmdFile(String fileId) {
        mongoTemplate.remove(
            Query.query(Criteria.where("_id").is(new ObjectId(fileId))),
            "sggu_boundaries_emd"
        );
        return new MessageResponse("읍면동 경계 삭제 완료");
    }

    @Override
    public GeoJsonUploadResponse uploadLiBoundary(MultipartFile file) {
        // GeoJSON 파일 처리 로직 구현
        return new GeoJsonUploadResponse();
    }

    @Override
    public GeoJsonListResponse getLiFiles() {
        GeoJsonListResponse response = new GeoJsonListResponse();
        List<Map<String, Object>> features = mongoTemplate.find(
            new Query(),
            Map.class,
            "sggu_boundaries_li"
        ).stream()
            .map(map -> (Map<String, Object>) map)
            .collect(Collectors.toList());
        response.setFeatures(features);
        return response;
    }

    @Override
    public MessageResponse deleteLiFile(String fileId) {
        mongoTemplate.remove(
            Query.query(Criteria.where("_id").is(new ObjectId(fileId))),
            "sggu_boundaries_li"
        );
        return new MessageResponse("리 경계 삭제 완료");
    }
} 