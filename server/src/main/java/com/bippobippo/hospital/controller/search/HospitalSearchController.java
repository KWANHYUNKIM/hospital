package com.bippobippo.hospital.controller.search;

import com.bippobippo.hospital.dto.request.HospitalSearchRequest;
import com.bippobippo.hospital.dto.response.HospitalSearchResponse;
import com.bippobippo.hospital.service.HospitalSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
public class HospitalSearchController {

    private final HospitalSearchService hospitalSearchService;

    @GetMapping("/search")
    public HospitalSearchResponse searchHospitals(
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

        HospitalSearchRequest request = HospitalSearchRequest.builder()
                .page(page)
                .limit(limit)
                .region(region)
                .subject(subject)
                .category(category)
                .major(major)
                .query(query)
                .x(x)
                .y(y)
                .distance(distance)
                .build();

        return hospitalSearchService.searchHospitals(request);
    }
} 