package com.bippobippo.hospital.entity;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "operating_time_suggestions")
@Getter
@Setter
public class OperatingTimeSuggestion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "hospital_id", nullable = false)
    private String hospitalId;
    
    @Column(name = "hospital_name", nullable = false)
    private String hospitalName;
    
    @Column(name = "suggestion", nullable = false, columnDefinition = "TEXT")
    private String suggestion;
    
    // 현재 영업시간 데이터
    @Column(name = "trmt_mon_start")
    private String trmtMonStart;
    
    @Column(name = "trmt_mon_end")
    private String trmtMonEnd;
    
    @Column(name = "trmt_tue_start")
    private String trmtTueStart;
    
    @Column(name = "trmt_tue_end")
    private String trmtTueEnd;
    
    @Column(name = "trmt_wed_start")
    private String trmtWedStart;
    
    @Column(name = "trmt_wed_end")
    private String trmtWedEnd;
    
    @Column(name = "trmt_thu_start")
    private String trmtThuStart;
    
    @Column(name = "trmt_thu_end")
    private String trmtThuEnd;
    
    @Column(name = "trmt_fri_start")
    private String trmtFriStart;
    
    @Column(name = "trmt_fri_end")
    private String trmtFriEnd;
    
    @Column(name = "trmt_sat_start")
    private String trmtSatStart;
    
    @Column(name = "trmt_sat_end")
    private String trmtSatEnd;
    
    @Column(name = "no_trmt_sun")
    private String noTrmtSun;
    
    @Column(name = "no_trmt_holi")
    private String noTrmtHoli;
    
    @Column(name = "lunch_week")
    private String lunchWeek;
    
    // 제안된 영업시간 데이터
    @Column(name = "suggested_trmt_mon_start")
    private String suggestedTrmtMonStart;
    
    @Column(name = "suggested_trmt_mon_end")
    private String suggestedTrmtMonEnd;
    
    @Column(name = "suggested_trmt_tue_start")
    private String suggestedTrmtTueStart;
    
    @Column(name = "suggested_trmt_tue_end")
    private String suggestedTrmtTueEnd;
    
    @Column(name = "suggested_trmt_wed_start")
    private String suggestedTrmtWedStart;
    
    @Column(name = "suggested_trmt_wed_end")
    private String suggestedTrmtWedEnd;
    
    @Column(name = "suggested_trmt_thu_start")
    private String suggestedTrmtThuStart;
    
    @Column(name = "suggested_trmt_thu_end")
    private String suggestedTrmtThuEnd;
    
    @Column(name = "suggested_trmt_fri_start")
    private String suggestedTrmtFriStart;
    
    @Column(name = "suggested_trmt_fri_end")
    private String suggestedTrmtFriEnd;
    
    @Column(name = "suggested_trmt_sat_start")
    private String suggestedTrmtSatStart;
    
    @Column(name = "suggested_trmt_sat_end")
    private String suggestedTrmtSatEnd;
    
    @Column(name = "suggested_no_trmt_sun")
    private String suggestedNoTrmtSun;
    
    @Column(name = "suggested_no_trmt_holi")
    private String suggestedNoTrmtHoli;
    
    @Column(name = "suggested_lunch_week")
    private String suggestedLunchWeek;
    
    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SuggestionStatus status = SuggestionStatus.PENDING;
    
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
    
    @Column(name = "reviewer_note", columnDefinition = "TEXT")
    private String reviewerNote;
    
    public enum SuggestionStatus {
        PENDING, APPROVED, REJECTED
    }
} 