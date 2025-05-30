package com.bippobippo.hospital.dto.request.search;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class PharmacySearchRequest {
    private String page;
    private String limit;
    private String region;
    private String type;
    private String query;
    private Double x;
    private Double y;
    private String distance;
} 