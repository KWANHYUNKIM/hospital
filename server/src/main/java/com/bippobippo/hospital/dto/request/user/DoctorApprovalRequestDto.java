package com.bippobippo.hospital.dto.request.user;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Min;

@Getter
@Setter
public class DoctorApprovalRequestDto {
    
    @NotBlank(message = "의사면허번호는 필수입니다")
    private String licenseNumber;
    
    private String hospitalName;
    
    private String department;
    
    private String specialization;
    
    @Min(value = 0, message = "경력 연수는 0 이상이어야 합니다")
    private Integer experienceYears;
    
    private String requestReason;
} 