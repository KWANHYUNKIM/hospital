package com.bippobippo.hospital.controller.search;

import com.bippobippo.hospital.dto.request.search.MainSearchRequest;
import com.bippobippo.hospital.dto.response.search.MainSearchResponse;
import com.bippobippo.hospital.service.hospital.MainSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/autocomplete")
@RequiredArgsConstructor
public class MainSearchController {

    private final MainSearchService mainSearchService;

    @GetMapping
    public ResponseEntity<MainSearchResponse> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude) {
        
        MainSearchRequest request = MainSearchRequest.builder()
                .query(query)
                .latitude(latitude)
                .longitude(longitude)
                .build();

        MainSearchResponse response = mainSearchService.search(request);
        
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(response);
    }
} 