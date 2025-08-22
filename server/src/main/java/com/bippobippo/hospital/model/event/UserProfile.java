package com.bippobippo.hospital.model.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_profiles")
public class UserProfile {

    @Id
    private String id;

    @Field("user_id")
    private String userId;

    @Field("preferred_specialties")
    private List<String> preferredSpecialties; // 선호 진료과목

    @Field("preferred_regions")
    private List<String> preferredRegions; // 선호 지역

    @Field("preferred_distance")
    private Integer preferredDistance; // 선호 거리(km)

    @Field("preferred_rating")
    private Double preferredRating; // 선호 평점

    @Field("search_frequency")
    private String searchFrequency; // HIGH, MEDIUM, LOW

    @Field("avg_dwell_time")
    private Integer avgDwellTime; // 평균 체류 시간(초)

    @Field("click_rate")
    private Double clickRate; // 클릭률 (0.0-1.0)

    @Field("preferred_hospital_types")
    private List<String> preferredHospitalTypes; // 종합병원, 전문병원 등

    @Field("search_patterns")
    private Map<String, Integer> searchPatterns; // 검색 패턴 (키워드별 빈도)

    @Field("click_patterns")
    private Map<String, Integer> clickPatterns; // 클릭 패턴 (위치별 빈도)

    @Field("last_search_date")
    private LocalDateTime lastSearchDate;

    @Field("total_searches")
    private Integer totalSearches;

    @Field("total_clicks")
    private Integer totalClicks;

    @Field("total_dwell_time")
    private Integer totalDwellTime;

    @Field("user_agent")
    private String userAgent;

    @Field("ip_address")
    private String ipAddress;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;

    // 생성 시 자동으로 시간 설정
    public static UserProfile create() {
        LocalDateTime now = LocalDateTime.now();
        return UserProfile.builder()
                .createdAt(now)
                .updatedAt(now)
                .build();
    }
} 