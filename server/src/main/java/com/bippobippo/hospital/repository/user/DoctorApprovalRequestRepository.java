package com.bippobippo.hospital.repository.user;

import com.bippobippo.hospital.entity.user.DoctorApprovalRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorApprovalRequestRepository extends JpaRepository<DoctorApprovalRequest, Integer> {
    
    // 사용자별 승인 요청 조회
    List<DoctorApprovalRequest> findByUserId(Integer userId);
    
    // 상태별 승인 요청 조회
    List<DoctorApprovalRequest> findByStatus(DoctorApprovalRequest.ApprovalStatus status);
    
    // 사용자별 대기중인 요청 조회
    Optional<DoctorApprovalRequest> findByUserIdAndStatus(Integer userId, DoctorApprovalRequest.ApprovalStatus status);
    
    // 페이지네이션을 위한 조회
    Page<DoctorApprovalRequest> findByStatus(DoctorApprovalRequest.ApprovalStatus status, Pageable pageable);
    
    // 전체 요청 페이지네이션
    Page<DoctorApprovalRequest> findAll(Pageable pageable);
    
    // 면허번호로 조회
    Optional<DoctorApprovalRequest> findByLicenseNumber(String licenseNumber);
    
    // 승인된 요청 수 조회
    @Query("SELECT COUNT(d) FROM DoctorApprovalRequest d WHERE d.status = 'APPROVED'")
    long countApprovedRequests();
    
    // 대기중인 요청 수 조회
    @Query("SELECT COUNT(d) FROM DoctorApprovalRequest d WHERE d.status = 'PENDING'")
    long countPendingRequests();
    
    // 거부된 요청 수 조회
    @Query("SELECT COUNT(d) FROM DoctorApprovalRequest d WHERE d.status = 'REJECTED'")
    long countRejectedRequests();
} 