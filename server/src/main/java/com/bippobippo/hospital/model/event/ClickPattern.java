package com.bippobippo.hospital.model.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "click_patterns")
public class ClickPattern {

    @Id
    private String id;

    @Field("user_id")
    private String userId;

    @Field("hospital_id")
    private String hospitalId;

    @Field("search_query")
    private String searchQuery;

    @Field("click_position")
    private Integer clickPosition; // 검색 결과에서 몇 번째 위치

    @Field("page_type")
    private String pageType; // HOSPITAL_LIST, SEARCH_RESULT 등

    @Field("click_type")
    private String clickType; // DETAIL_VIEW, PHONE_CALL, MAP_VIEW 등

    @Field("dwell_time_before_click")
    private Integer dwellTimeBeforeClick; // 클릭하기 전 머문 시간(초)

    @Field("scroll_depth")
    private Integer scrollDepth; // 스크롤 깊이 (0-100%)

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
    public static ClickPattern create() {
        LocalDateTime now = LocalDateTime.now();
        return ClickPattern.builder()
                .createdAt(now)
                .updatedAt(now)
                .build();
    }
} 