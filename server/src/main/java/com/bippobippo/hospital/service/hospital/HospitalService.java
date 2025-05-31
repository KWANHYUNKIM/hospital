package com.bippobippo.hospital.service.hospital;

import com.bippobippo.hospital.dto.response.hospital.HospitalNearbyResponse;
import java.util.List;

public interface HospitalService {
    List<HospitalNearbyResponse> findNearbyHospitals(Double latitude, Double longitude, Integer radius);
} 