package com.bippobippo.hospital.controller;

import com.bippobippo.hospital.model.HealthCenter;
import com.bippobippo.hospital.service.HealthCenterService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/health-centers")
@RequiredArgsConstructor
public class HealthCenterController {
    private final HealthCenterService healthCenterService;

    @GetMapping
    public ResponseEntity<Page<HealthCenter>> getHealthCenters(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String sido,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "9") int limit) {
        Page<HealthCenter> centers = healthCenterService.searchHealthCenters(keyword, type, sido, page, limit);
        return ResponseEntity.ok(centers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HealthCenter> getHealthCenterById(@PathVariable String id) {
        HealthCenter center = healthCenterService.getHealthCenterById(id);
        return ResponseEntity.ok(center);
    }
} 