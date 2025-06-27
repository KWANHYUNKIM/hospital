package com.bippobippo.hospital.controller.user;

import com.bippobippo.hospital.dto.request.user.DoctorApprovalRequestDto;
import com.bippobippo.hospital.dto.response.user.DoctorApprovalResponseDto;
import com.bippobippo.hospital.entity.user.DoctorApprovalRequest;
import com.bippobippo.hospital.security.CustomUserDetails;
import com.bippobippo.hospital.service.user.DoctorApprovalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/doctor-approval")
@RequiredArgsConstructor
public class DoctorApprovalController {

    private final DoctorApprovalService doctorApprovalService;

    // 의사 권한 요청 생성 (일반 사용자)
    @PostMapping("/request")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createRequest(
            @Valid @RequestBody DoctorApprovalRequestDto requestDto,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            DoctorApprovalResponseDto response = doctorApprovalService.createRequest(userDetails.getUserId(), requestDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 사용자별 요청 조회
    @GetMapping("/my-requests")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DoctorApprovalResponseDto>> getMyRequests(Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            List<DoctorApprovalResponseDto> requests = doctorApprovalService.getRequestsByUserId(userDetails.getUserId());
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // 모든 요청 조회 (관리자용)
    @GetMapping("/admin/requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<DoctorApprovalResponseDto>> getAllRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<DoctorApprovalResponseDto> requests = doctorApprovalService.getAllRequests(pageable);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // 상태별 요청 조회 (관리자용)
    @GetMapping("/admin/requests/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<DoctorApprovalResponseDto>> getRequestsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            DoctorApprovalRequest.ApprovalStatus approvalStatus = DoctorApprovalRequest.ApprovalStatus.valueOf(status.toUpperCase());
            Pageable pageable = PageRequest.of(page, size);
            Page<DoctorApprovalResponseDto> requests = doctorApprovalService.getRequestsByStatus(approvalStatus, pageable);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // 요청 상세 조회 (관리자용)
    @GetMapping("/admin/requests/{requestId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorApprovalResponseDto> getRequestById(@PathVariable Integer requestId) {
        try {
            DoctorApprovalResponseDto request = doctorApprovalService.getRequestById(requestId);
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // 요청 승인 (관리자용)
    @PostMapping("/admin/requests/{requestId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveRequest(
            @PathVariable Integer requestId,
            @RequestParam(required = false) String comment,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            DoctorApprovalResponseDto response = doctorApprovalService.approveRequest(requestId, userDetails.getUserId(), comment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 요청 거부 (관리자용)
    @PostMapping("/admin/requests/{requestId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectRequest(
            @PathVariable Integer requestId,
            @RequestParam(required = false) String comment,
            Authentication authentication) {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            DoctorApprovalResponseDto response = doctorApprovalService.rejectRequest(requestId, userDetails.getUserId(), comment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 통계 조회 (관리자용)
    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getStats() {
        try {
            Map<String, Long> stats = new HashMap<>();
            stats.put("pending", doctorApprovalService.getPendingCount());
            stats.put("approved", doctorApprovalService.getApprovedCount());
            stats.put("rejected", doctorApprovalService.getRejectedCount());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
} 