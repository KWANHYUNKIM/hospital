package com.bippobippo.hospital.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class HospitalSearchRequest {
    private String page;
    private String limit;
    private String region;
    private String subject;
    private String category;
    private String major;
    private String query;
    private Double x;
    private Double y;
    private String distance;
} 