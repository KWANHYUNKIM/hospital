package com.bippobippo.hospital.controller.admin;

import com.bippobippo.hospital.dto.MessageResponse;
import com.bippobippo.hospital.dto.request.admin.*;
import com.bippobippo.hospital.dto.response.admin.*;
import com.bippobippo.hospital.service.admin.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

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
} 