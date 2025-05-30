package com.bippobippo.hospital.dto.request.search;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NursingHospitalSearchRequest {
    private Integer page;
    private Integer limit;
    private String region;
    private String query;
    private Double x;
    private Double y;
    private String distance;
} 