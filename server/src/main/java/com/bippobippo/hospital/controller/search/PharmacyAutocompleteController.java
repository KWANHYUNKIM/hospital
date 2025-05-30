package com.bippobippo.hospital.controller.search;

import com.bippobippo.hospital.dto.request.search.PharmacyAutocompleteRequest;
import com.bippobippo.hospital.dto.response.search.PharmacyAutocompleteResponse;
import com.bippobippo.hospital.service.PharmacyAutocompleteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pharmacy-autocomplete")
@RequiredArgsConstructor
public class PharmacyAutocompleteController {

    private final PharmacyAutocompleteService pharmacyAutocompleteService;

    @GetMapping
    public ResponseEntity<PharmacyAutocompleteResponse> search(
            @RequestParam(required = false) String query) {
        
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        PharmacyAutocompleteRequest request = PharmacyAutocompleteRequest.builder()
                .query(query)
                .build();

        PharmacyAutocompleteResponse response = pharmacyAutocompleteService.search(request);
        
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(response);
    }
} 