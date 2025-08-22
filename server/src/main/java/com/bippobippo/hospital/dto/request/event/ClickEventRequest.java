package com.bippobippo.hospital.dto.request.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClickEventRequest {

    @NotBlank(message = "사용자 ID는 필수입니다.")
    private String userId;

    @NotBlank(message = "병원 ID는 필수입니다.")
    private String hospitalId;

    private String searchQuery;

    @NotNull(message = "클릭 위치는 필수입니다.")
    private Integer clickPosition;

    private String pageType;

    private String clickType; // DETAIL_VIEW, PHONE_CALL, MAP_VIEW 등

    private Integer dwellTimeBeforeClick; // 클릭하기 전 머문 시간(초)

    private Integer scrollDepth; // 스크롤 깊이 (0-100%)

    private String userAgent;

    private String ipAddress;

    private String sessionId;
} 