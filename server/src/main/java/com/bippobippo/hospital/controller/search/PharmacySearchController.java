package com.bippobippo.hospital.controller.search;

import com.bippobippo.hospital.dto.request.search.PharmacySearchRequest;
import com.bippobippo.hospital.dto.response.search.PharmacySearchResponse;
import com.bippobippo.hospital.service.hospital.PharmacySearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pharmacies")
@RequiredArgsConstructor
public class PharmacySearchController {

    private final PharmacySearchService pharmacySearchService;

    @GetMapping
    public PharmacySearchResponse searchPharmacies(
            @RequestParam(defaultValue = "1") String page,
            @RequestParam(defaultValue = "10") String limit,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Double x,
            @RequestParam(required = false) Double y,
            @RequestParam(defaultValue = "10km") String distance) {

        PharmacySearchRequest request = PharmacySearchRequest.builder()
                .page(page)
                .limit(limit)
                .region(region)
                .type(type)
                .query(query)
                .x(x)
                .y(y)
                .distance(distance)
                .build();

        return pharmacySearchService.searchPharmacies(request);
    }
} 