package com.bippobippo.hospital.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HospitalNearbyRequest {
    private Double latitude;
    private Double longitude;
    private Integer radius = 5000; // 기본값 5km
} 