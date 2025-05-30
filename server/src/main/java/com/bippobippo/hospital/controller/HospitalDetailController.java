package com.bippobippo.hospital.controller;

import com.bippobippo.hospital.service.HospitalDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/hospitals/detail")
@RequiredArgsConstructor
public class HospitalDetailController {

    private final HospitalDetailService hospitalDetailService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getHospitalDetail(@PathVariable String id) {
        try {
            Map<String, Object> hospitalDetail = hospitalDetailService.getHospitalDetail(id);
            return ResponseEntity.ok(hospitalDetail);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "서버 오류가 발생했습니다."));
        }
    }
} 