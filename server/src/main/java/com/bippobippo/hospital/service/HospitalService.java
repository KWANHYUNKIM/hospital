package com.bippobippo.hospital.service;

import com.bippobippo.hospital.dto.response.HospitalNearbyResponse;
import java.util.List;

public interface HospitalService {
    List<HospitalNearbyResponse> findNearbyHospitals(Double latitude, Double longitude, Integer radius);
} 