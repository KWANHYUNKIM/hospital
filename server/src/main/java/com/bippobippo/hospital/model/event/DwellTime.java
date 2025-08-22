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
@Document(collection = "dwell_time_logs")
public class DwellTime {

    @Id
    private String id;

    @Field("user_id")
    private String userId;

    @Field("page_type")
    private String pageType; // HOSPITAL_LIST, HOSPITAL_DETAIL, SEARCH_RESULT 등

    @Field("hospital_id")
    private String hospitalId;

    @Field("search_query")
    private String searchQuery;

    @Field("dwell_time_seconds")
    private Integer dwellTimeSeconds;

    @Field("scroll_depth")
    private Integer scrollDepth; // 스크롤 깊이 (0-100%)

    @Field("interaction_count")
    private Integer interactionCount; // 클릭, 스크롤 등 상호작용 횟수

    @Field("page_load_time")
    private Integer pageLoadTime; // 페이지 로드 시간(ms)

    @Field("exit_method")
    private String exitMethod; // BACK_BUTTON, NEW_SEARCH, EXTERNAL_LINK 등

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
    public static DwellTime create() {
        LocalDateTime now = LocalDateTime.now();
        return DwellTime.builder()
                .createdAt(now)
                .updatedAt(now)
                .build();
    }
} 