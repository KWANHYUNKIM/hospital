package com.bippobippo.hospital.dto.response.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private String userId;
    private List<String> preferredSpecialties;
    private List<String> preferredRegions;
    private Integer preferredDistance;
    private Double preferredRating;
    private String searchFrequency;
    private Integer avgDwellTime;
    private Double clickRate;
    private List<String> preferredHospitalTypes;
    private Map<String, Integer> searchPatterns;
    private Map<String, Integer> clickPatterns;
    private LocalDateTime lastSearchDate;
    private Integer totalSearches;
    private Integer totalClicks;
    private Integer totalDwellTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 프로파일이 없는 경우 기본값 생성
    public static UserProfileResponse createDefault(String userId) {
        return UserProfileResponse.builder()
                .userId(userId)
                .preferredSpecialties(List.of())
                .preferredRegions(List.of())
                .preferredDistance(10)
                .preferredRating(4.0)
                .searchFrequency("LOW")
                .avgDwellTime(60)
                .clickRate(0.0)
                .preferredHospitalTypes(List.of())
                .searchPatterns(Map.of())
                .clickPatterns(Map.of())
                .totalSearches(0)
                .totalClicks(0)
                .totalDwellTime(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
} 