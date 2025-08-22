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
public class SearchEventRequest {

    @NotBlank(message = "사용자 ID는 필수입니다.")
    private String userId;

    @NotBlank(message = "검색어는 필수입니다.")
    private String searchQuery;

    @NotNull(message = "검색 결과 수는 필수입니다.")
    private Integer searchResultsCount;

    private Boolean searchSuccess;

    private Double latitude;

    private Double longitude;

    private String region;

    private String userAgent;

    private String ipAddress;

    private String sessionId;
} 