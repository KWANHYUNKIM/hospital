package com.bippobippo.hospital.dto.request;

import lombok.Data;

@Data
public class ChatMessageRequest {
    private String message;
    private String location;
    private Coordinates coordinates;

    @Data
    public static class Coordinates {
        private Double latitude;
        private Double longitude;
    }
} 