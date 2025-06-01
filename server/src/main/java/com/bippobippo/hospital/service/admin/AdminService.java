package com.bippobippo.hospital.service.admin;

import com.bippobippo.hospital.dto.MessageResponse;
import com.bippobippo.hospital.dto.request.admin.*;
import com.bippobippo.hospital.dto.response.admin.*;
import org.springframework.web.multipart.MultipartFile;

public interface AdminService {
    DashboardStatsResponse getDashboardStats();
    
    ServerConfigResponse getServerConfigs();
    MessageResponse createServerConfig(ServerConfigRequest request);
    MessageResponse updateServerConfig(Long id, ServerConfigRequest request);
    MessageResponse deleteServerConfig(Long id);
    
    SocialConfigResponse getSocialConfigs();
    MessageResponse createSocialConfig(SocialConfigRequest request);
    MessageResponse updateSocialConfig(String provider, SocialConfigRequest request);
    MessageResponse deleteSocialConfig(String provider);
    
    CorsConfigResponse getCorsConfigs();
    MessageResponse createCorsConfig(CorsConfigRequest request);
    MessageResponse updateCorsConfig(Long id, CorsConfigRequest request);
    MessageResponse deleteCorsConfig(Long id);
    
    GeoJsonUploadResponse uploadCtpBoundary(MultipartFile file);
    GeoJsonListResponse getCtpFiles();
    MessageResponse deleteCtpFile(String fileId);
    
    GeoJsonUploadResponse uploadSigBoundary(MultipartFile file);
    GeoJsonListResponse getSigFiles();
    MessageResponse deleteSigFile(String fileId);
    
    GeoJsonUploadResponse uploadEmdBoundary(MultipartFile file);
    GeoJsonListResponse getEmdFiles();
    MessageResponse deleteEmdFile(String fileId);
    
    GeoJsonUploadResponse uploadLiBoundary(MultipartFile file);
    GeoJsonListResponse getLiFiles();
    MessageResponse deleteLiFile(String fileId);
} 