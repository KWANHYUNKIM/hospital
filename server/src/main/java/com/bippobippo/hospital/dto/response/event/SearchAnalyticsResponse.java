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
public class SearchAnalyticsResponse {

    private String userId;
    private List<String> recentSearches;
    private List<String> popularSearches;
    private Map<String, Integer> searchFrequency;
    private Map<String, Integer> regionPreferences;
    private Map<String, Integer> specialtyPreferences;
    private Integer totalSearches;
    private Integer successfulSearches;
    private Double searchSuccessRate;
    private LocalDateTime lastSearchDate;
    private String mostSearchedRegion;
    private String mostSearchedSpecialty;
    private List<SearchTrend> searchTrends;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchTrend {
        private String searchQuery;
        private Integer frequency;
        private LocalDateTime lastSearched;
        private Double successRate;
    }

    // 기본 검색 분석 응답 생성
    public static SearchAnalyticsResponse createDefault(String userId) {
        return SearchAnalyticsResponse.builder()
                .userId(userId)
                .recentSearches(List.of())
                .popularSearches(List.of())
                .searchFrequency(Map.of())
                .regionPreferences(Map.of())
                .specialtyPreferences(Map.of())
                .totalSearches(0)
                .successfulSearches(0)
                .searchSuccessRate(0.0)
                .searchTrends(List.of())
                .build();
    }
} 