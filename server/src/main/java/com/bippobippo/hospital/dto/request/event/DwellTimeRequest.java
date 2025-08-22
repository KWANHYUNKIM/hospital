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
public class DwellTimeRequest {

    @NotBlank(message = "사용자 ID는 필수입니다.")
    private String userId;

    @NotBlank(message = "페이지 타입은 필수입니다.")
    private String pageType;

    private String hospitalId;

    private String searchQuery;

    @NotNull(message = "체류 시간은 필수입니다.")
    private Integer dwellTimeSeconds;

    private Integer scrollDepth; // 스크롤 깊이 (0-100%)

    private Integer interactionCount; // 클릭, 스크롤 등 상호작용 횟수

    private Integer pageLoadTime; // 페이지 로드 시간(ms)

    private String exitMethod; // BACK_BUTTON, NEW_SEARCH, EXTERNAL_LINK 등

    private String userAgent;

    private String ipAddress;

    private String sessionId;
} 