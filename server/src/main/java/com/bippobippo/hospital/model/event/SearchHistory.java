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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "search_history")
public class SearchHistory {

    @Id
    private String id;

    @Field("user_id")
    private String userId;

    @Field("search_query")
    private String searchQuery;

    @Field("search_results_count")
    private Integer searchResultsCount;

    @Field("clicked_hospital_ids")
    private List<String> clickedHospitalIds;

    @Field("search_success")
    private Boolean searchSuccess; // 검색 결과가 있는지 여부

    @Field("latitude")
    private Double latitude;

    @Field("longitude")
    private Double longitude;

    @Field("region")
    private String region;

    @Field("user_agent")
    private String userAgent;

    @Field("ip_address")
    private String ipAddress;

    @Field("session_id")
    private String sessionId;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;

    // 생성 시 자동으로 시간 설정
    public static SearchHistory create() {
        LocalDateTime now = LocalDateTime.now();
        return SearchHistory.builder()
                .createdAt(now)
                .updatedAt(now)
                .build();
    }
} 