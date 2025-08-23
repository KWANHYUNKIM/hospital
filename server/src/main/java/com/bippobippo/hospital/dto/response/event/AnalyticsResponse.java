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
        AnalyticsResponse response = new AnalyticsResponse();
        response.setStatus("SUCCESS");
        response.setMessage(message);
        response.setTimestamp(LocalDateTime.now());
        response.setData(data);
        return response;
    }

    // 실패 응답 생성
    public static AnalyticsResponse error(String message) {
        AnalyticsResponse response = new AnalyticsResponse();
        response.setStatus("ERROR");
        response.setMessage(message);
        response.setTimestamp(LocalDateTime.now());
        return response;
    }
} 