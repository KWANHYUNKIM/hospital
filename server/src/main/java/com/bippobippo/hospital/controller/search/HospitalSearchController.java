package com.bippobippo.hospital.controller.search;

import com.bippobippo.hospital.elasticsearch.service.HospitalSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
public class HospitalSearchController {

    private final HospitalSearchService hospitalSearchService;

    @GetMapping("/search")
    public Map<String, Object> searchHospitals(
            @RequestParam(defaultValue = "1") String page,
            @RequestParam(defaultValue = "10") String limit,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String major,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Double x,
            @RequestParam(required = false) Double y,
            @RequestParam(defaultValue = "10km") String distance) {

        Map<String, Object> searchParams = new HashMap<>();
        searchParams.put("page", page);
        searchParams.put("limit", limit);
        searchParams.put("region", region);
        searchParams.put("subject", subject);
        searchParams.put("category", category);
        searchParams.put("major", major);
        searchParams.put("keyword", query);
        searchParams.put("latitude", y);
        searchParams.put("longitude", x);
        searchParams.put("distance", distance);

        try {
            return hospitalSearchService.searchHospitals(searchParams);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "검색 중 오류가 발생했습니다: " + e.getMessage());
            return errorResponse;
        }
    }
} 