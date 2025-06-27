package com.bippobippo.hospital.entity.user;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctor_approval_requests")
@Getter
@Setter
@NoArgsConstructor
public class DoctorApprovalRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "license_number", nullable = false)
    private String licenseNumber; // 의사면허번호

    @Column(name = "hospital_name")
    private String hospitalName; // 소속 병원명

    @Column(name = "department")
    private String department; // 진료과

    @Column(name = "specialization")
    private String specialization; // 전문분야

    @Column(name = "experience_years")
    private Integer experienceYears; // 경력 연수

    @Column(name = "request_reason", columnDefinition = "TEXT")
    private String requestReason; // 요청 사유

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ApprovalStatus status = ApprovalStatus.PENDING; // 승인 상태

    @Column(name = "admin_comment", columnDefinition = "TEXT")
    private String adminComment; // 관리자 코멘트

    @Column(name = "approved_by")
    private Integer approvedBy; // 승인한 관리자 ID

    @Column(name = "approved_at")
    private LocalDateTime approvedAt; // 승인 일시

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ApprovalStatus {
        PENDING("대기중"),
        APPROVED("승인됨"),
        REJECTED("거부됨");

        private final String description;

        ApprovalStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
} 