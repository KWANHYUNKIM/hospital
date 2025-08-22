package com.bippobippo.hospital.model.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_behavior_events")
public class UserBehaviorEvent {

    @Id
    private String id;

    @Field("user_id")
    private String userId;

    @Field("event_type")
    private String eventType; // SEARCH, CLICK, PAGE_VIEW, DWELL_TIME 등

    @Field("page_type")
    private String pageType; // HOSPITAL_LIST, HOSPITAL_DETAIL, SEARCH_RESULT 등

    @Field("search_query")
    private String searchQuery;

    @Field("hospital_id")
    private String hospitalId;

    @Field("click_position")
    private Integer clickPosition;

    @Field("search_results_count")
    private Integer searchResultsCount;

    @Field("dwell_time_seconds")
    private Integer dwellTimeSeconds;

    @Field("user_agent")
    private String userAgent;

    @Field("ip_address")
    private String ipAddress;

    @Field("session_id")
    private String sessionId;

    @Field("additional_data")
    private Map<String, Object> additionalData;

    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("updated_at")
    private LocalDateTime updatedAt;

    // 생성 시 자동으로 시간 설정
    public static UserBehaviorEvent create() {
        LocalDateTime now = LocalDateTime.now();
        return UserBehaviorEvent.builder()
                .createdAt(now)
                .updatedAt(now)
                .build();
    }
} 