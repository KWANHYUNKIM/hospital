package com.bippobippo.hospital.controller.admin;

import com.bippobippo.hospital.dto.MessageResponse;
import com.bippobippo.hospital.dto.request.admin.*;
import com.bippobippo.hospital.dto.response.admin.*;
import com.bippobippo.hospital.entity.OperatingTimeSuggestion;
import com.bippobippo.hospital.service.admin.AdminService;
import com.bippobippo.hospital.service.hospital.OperatingTimeSuggestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final OperatingTimeSuggestionService operatingTimeSuggestionService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/server-configs")
    public ResponseEntity<ServerConfigResponse> getServerConfigs() {
        return ResponseEntity.ok(adminService.getServerConfigs());
    }

    @PostMapping("/server-configs")
    public ResponseEntity<MessageResponse> createServerConfig(@RequestBody ServerConfigRequest request) {
        return ResponseEntity.ok(adminService.createServerConfig(request));
    }

    @PutMapping("/server-configs/{id}")
    public ResponseEntity<MessageResponse> updateServerConfig(
            @PathVariable Long id,
            @RequestBody ServerConfigRequest request) {
        return ResponseEntity.ok(adminService.updateServerConfig(id, request));
    }

    @DeleteMapping("/server-configs/{id}")
    public ResponseEntity<MessageResponse> deleteServerConfig(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.deleteServerConfig(id));
    }

    @GetMapping("/social-configs")
    public ResponseEntity<SocialConfigResponse> getSocialConfigs() {
        return ResponseEntity.ok(adminService.getSocialConfigs());
    }

    @PostMapping("/social-configs")
    public ResponseEntity<MessageResponse> createSocialConfig(@RequestBody SocialConfigRequest request) {
        return ResponseEntity.ok(adminService.createSocialConfig(request));
    }

    @PutMapping("/social-configs/{provider}")
    public ResponseEntity<MessageResponse> updateSocialConfig(
            @PathVariable String provider,
            @RequestBody SocialConfigRequest request) {
        return ResponseEntity.ok(adminService.updateSocialConfig(provider, request));
    }

    @DeleteMapping("/social-configs/{provider}")
    public ResponseEntity<MessageResponse> deleteSocialConfig(@PathVariable String provider) {
        return ResponseEntity.ok(adminService.deleteSocialConfig(provider));
    }

    @GetMapping("/cors-configs")
    public ResponseEntity<CorsConfigResponse> getCorsConfigs() {
        return ResponseEntity.ok(adminService.getCorsConfigs());
    }

    @PostMapping("/cors-configs")
    public ResponseEntity<MessageResponse> createCorsConfig(@RequestBody CorsConfigRequest request) {
        return ResponseEntity.ok(adminService.createCorsConfig(request));
    }

    @PutMapping("/cors-configs/{id}")
    public ResponseEntity<MessageResponse> updateCorsConfig(
            @PathVariable Long id,
            @RequestBody CorsConfigRequest request) {
        return ResponseEntity.ok(adminService.updateCorsConfig(id, request));
    }

    @DeleteMapping("/cors-configs/{id}")
    public ResponseEntity<MessageResponse> deleteCorsConfig(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.deleteCorsConfig(id));
    }

    @GetMapping("/operating-time-suggestions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OperatingTimeSuggestion>> getAllOperatingTimeSuggestions() {
        return ResponseEntity.ok(operatingTimeSuggestionService.getAllSuggestions());
    }

    @GetMapping("/operating-time-suggestions/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OperatingTimeSuggestion>> getPendingOperatingTimeSuggestions() {
        return ResponseEntity.ok(operatingTimeSuggestionService.getPendingSuggestions());
    }

    @PostMapping("/operating-time-suggestions/{suggestionId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> approveOperatingTimeSuggestion(@PathVariable Long suggestionId) {
        try {
            OperatingTimeSuggestion approvedSuggestion = operatingTimeSuggestionService.approveSuggestion(suggestionId);
            return ResponseEntity.ok(Map.of(
                "message", "영업시간 수정 제안이 승인되었습니다.",
                "suggestionId", approvedSuggestion.getId(),
                "status", approvedSuggestion.getStatus()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "message", "제안 승인 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/operating-time-suggestions/{suggestionId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> rejectOperatingTimeSuggestion(
            @PathVariable Long suggestionId,
            @RequestBody Map<String, String> request) {
        try {
            String reason = request.get("reason");
            OperatingTimeSuggestion rejectedSuggestion = operatingTimeSuggestionService.rejectSuggestion(suggestionId, reason);
            return ResponseEntity.ok(Map.of(
                "message", "영업시간 수정 제안이 거부되었습니다.",
                "suggestionId", rejectedSuggestion.getId(),
                "status", rejectedSuggestion.getStatus()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "message", "제안 거부 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
} 