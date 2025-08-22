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
public class AnalyticsResponse {

    private String status;
    private String message;
    private LocalDateTime timestamp;
    private Object data;

    // 성공 응답 생성
    public static AnalyticsResponse success(String message, Object data) {
        return AnalyticsResponse.builder()
                .status("SUCCESS")
                .message(message)
                .timestamp(LocalDateTime.now())
                .data(data)
                .build();
    }

    // 실패 응답 생성
    public static AnalyticsResponse error(String message) {
        return AnalyticsResponse.builder()
                .status("ERROR")
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
} 