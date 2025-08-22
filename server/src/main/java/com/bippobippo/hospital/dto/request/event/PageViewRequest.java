package com.bippobippo.hospital.dto.request.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageViewRequest {

    @NotBlank(message = "사용자 ID는 필수입니다.")
    private String userId;

    @NotBlank(message = "페이지 타입은 필수입니다.")
    private String pageType;

    private String hospitalId;

    private String searchQuery;

    private String userAgent;

    private String ipAddress;

    private String sessionId;

    private String referrer; // 이전 페이지 URL
} 