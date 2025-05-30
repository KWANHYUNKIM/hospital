package com.bippobippo.hospital.controller.search;

import com.bippobippo.hospital.dto.response.search.CommentHospitalSearchResponse;
import com.bippobippo.hospital.dto.response.search.CommentHospitalSuggestionResponse;
import com.bippobippo.hospital.service.search.CommentSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comment/autocomplete")
@RequiredArgsConstructor
public class CommentSearchController {

    private final CommentSearchService commentSearchService;

    @GetMapping
    public ResponseEntity<CommentHospitalSuggestionResponse> getSuggestions(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude) {
        return ResponseEntity.ok(commentSearchService.getSuggestions(query, latitude, longitude));
    }

    @GetMapping("/search")
    public ResponseEntity<CommentHospitalSearchResponse> searchHospitals(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(commentSearchService.searchHospitals(query, page, size));
    }
}
