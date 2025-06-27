package com.bippobippo.hospital.service.user;

import com.bippobippo.hospital.dto.request.user.DoctorApprovalRequestDto;
import com.bippobippo.hospital.dto.response.user.DoctorApprovalResponseDto;
import com.bippobippo.hospital.entity.user.DoctorApprovalRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DoctorApprovalService {
    
    // 의사 권한 요청 생성
    DoctorApprovalResponseDto createRequest(Integer userId, DoctorApprovalRequestDto requestDto);
    
    // 모든 요청 조회 (관리자용)
    Page<DoctorApprovalResponseDto> getAllRequests(Pageable pageable);
    
    // 상태별 요청 조회
    Page<DoctorApprovalResponseDto> getRequestsByStatus(DoctorApprovalRequest.ApprovalStatus status, Pageable pageable);
    
    // 사용자별 요청 조회
    List<DoctorApprovalResponseDto> getRequestsByUserId(Integer userId);
    
    // 요청 상세 조회
    DoctorApprovalResponseDto getRequestById(Integer requestId);
    
    // 요청 승인
    DoctorApprovalResponseDto approveRequest(Integer requestId, Integer adminId, String comment);
    
    // 요청 거부
    DoctorApprovalResponseDto rejectRequest(Integer requestId, Integer adminId, String comment);
    
    // 통계 조회
    long getPendingCount();
    long getApprovedCount();
    long getRejectedCount();
} 