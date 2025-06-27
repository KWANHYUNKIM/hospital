package com.bippobippo.hospital.dto.response.user;

import com.bippobippo.hospital.entity.user.DoctorApprovalRequest;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class DoctorApprovalResponseDto {
    private Integer id;
    private Integer userId;
    private String username;
    private String email;
    private String nickname;
    private String licenseNumber;
    private String hospitalName;
    private String department;
    private String specialization;
    private Integer experienceYears;
    private String requestReason;
    private DoctorApprovalRequest.ApprovalStatus status;
    private String adminComment;
    private Integer approvedBy;
    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static DoctorApprovalResponseDto fromEntity(DoctorApprovalRequest entity) {
        DoctorApprovalResponseDto dto = new DoctorApprovalResponseDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser().getId());
        dto.setUsername(entity.getUser().getUsername());
        dto.setEmail(entity.getUser().getEmail());
        dto.setNickname(entity.getUser().getNickname());
        dto.setLicenseNumber(entity.getLicenseNumber());
        dto.setHospitalName(entity.getHospitalName());
        dto.setDepartment(entity.getDepartment());
        dto.setSpecialization(entity.getSpecialization());
        dto.setExperienceYears(entity.getExperienceYears());
        dto.setRequestReason(entity.getRequestReason());
        dto.setStatus(entity.getStatus());
        dto.setAdminComment(entity.getAdminComment());
        dto.setApprovedBy(entity.getApprovedBy());
        dto.setApprovedAt(entity.getApprovedAt());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
} 