package com.bippobippo.hospital.dto.response.search;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class CommentHospitalSearchResponse {
    private List<HospitalSearch> hospitals;
    private long total;
    private int page;
    private int size;
    private int totalPages;

    @Data
    public static class HospitalSearch {
        private String id;
        private String name;
        private String address;
        private String region;
        private String category;
        private List<String> major;
        private List<String> speciality;
        private Double score;
        private Double distance;
        private Map<String, List<String>> highlight;
    }
} 