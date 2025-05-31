package com.bippobippo.hospital.controller.hospital;

import com.bippobippo.hospital.dto.request.hospital.HospitalNearbyRequest;
import com.bippobippo.hospital.dto.response.hospital.HospitalNearbyResponse;
import com.bippobippo.hospital.service.hospital.HospitalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;

    @GetMapping("/detail")
    public String getHospitalDetail() {
        return "Hospital detail endpoint";
    }

    @GetMapping("/subjects")
    public String getHospitalSubjects() {
        return "Hospital subjects endpoint";
    }

    @PostMapping("/nearby")
    public ResponseEntity<List<HospitalNearbyResponse>> getNearbyHospitals(@RequestBody HospitalNearbyRequest request) {
        List<HospitalNearbyResponse> hospitals = hospitalService.findNearbyHospitals(
            request.getLatitude(),
            request.getLongitude(),
            request.getRadius()
        );
        return ResponseEntity.ok(hospitals);
    }
} 