package com.bippobippo.hospital.controller.hospital;

import com.bippobippo.hospital.dto.request.search.NursingHospitalSearchRequest;
import com.bippobippo.hospital.dto.response.search.NursingHospitalSearchResponse;
import com.bippobippo.hospital.model.NursingHospital;
import com.bippobippo.hospital.service.hospital.NursingHospitalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nursing-hospitals")
@RequiredArgsConstructor
public class NursingHospitalController {
    private final NursingHospitalService nursingHospitalService;

    @GetMapping("/search")
    public NursingHospitalSearchResponse searchHospitals(NursingHospitalSearchRequest request) {
        return nursingHospitalService.searchHospitals(request);
    }

    @GetMapping("/autoComplete")
    public ResponseEntity<Map<String, List<Map<String, String>>>> autoComplete(
            @RequestParam(required = false) String query) {
        return ResponseEntity.ok(nursingHospitalService.autoComplete(query));
    }

    @GetMapping("/{ykiho}")
    public ResponseEntity<NursingHospital> getHospitalById(@PathVariable String ykiho) {
        return ResponseEntity.ok(nursingHospitalService.getHospitalById(ykiho));
    }

    @GetMapping("/hospital/{ykiho}")
    public ResponseEntity<Map<String, Object>> getHospitalDetail(@PathVariable String ykiho) {
        return ResponseEntity.ok(nursingHospitalService.getHospitalDetail(ykiho));
    }

    @GetMapping("/hospital/{ykiho}/keyword-stats")
    public ResponseEntity<Map<String, Object>> getKeywordStats(@PathVariable String ykiho) {
        return ResponseEntity.ok(nursingHospitalService.getKeywordStats(ykiho));
    }

    @GetMapping("/hospital/{ykiho}/reviews")
    public ResponseEntity<Map<String, Object>> getReviews(
            @PathVariable String ykiho,
            @RequestParam(defaultValue = "1") String page,
            @RequestParam(defaultValue = "10") String limit,
            @RequestParam(defaultValue = "latest") String sort) {
        return ResponseEntity.ok(nursingHospitalService.getReviews(ykiho, page, limit, sort));
    }
} 