package com.bippobippo.hospital.dto.response.search;

import lombok.Data;
import java.util.List;

@Data
public class CommentHospitalSuggestionResponse {
    private List<HospitalSuggestion> hospital;

    @Data
    public static class HospitalSuggestion {
        private String id;
        private String name;
        private String address;
        private String region;
        private String category;
        private String major;
        private String speciality;
        private Double score;
        private Double distance;
    }
} 