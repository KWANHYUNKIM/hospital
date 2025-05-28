package com.bippobippo.hospital.controller;

import com.bippobippo.hospital.entity.HospitalOrigin;
import com.bippobippo.hospital.service.HospitalOriginService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/origins")
@RequiredArgsConstructor
public class HospitalOriginController {
    private final HospitalOriginService originService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<HospitalOrigin>> getAllOrigins() {
        try {
            List<HospitalOrigin> origins = originService.findAll();
            return ResponseEntity.ok(origins);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createOrigin(@RequestBody HospitalOrigin origin, Authentication authentication) {
        try {
            Integer userId = Integer.parseInt(authentication.getName());
            HospitalOrigin createdOrigin = originService.create(origin, userId);
            return ResponseEntity.status(201).body(createdOrigin);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("서버 오류가 발생했습니다.");
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrigin(@PathVariable Integer id, @RequestBody HospitalOrigin origin, Authentication authentication) {
        try {
            Integer userId = Integer.parseInt(authentication.getName());
            HospitalOrigin updatedOrigin = originService.update(id, origin, userId);
            return ResponseEntity.ok(updatedOrigin);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("Origin을 찾을 수 없습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("서버 오류가 발생했습니다.");
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deactivateOrigin(@PathVariable Integer id, Authentication authentication) {
        try {
            Integer userId = Integer.parseInt(authentication.getName());
            originService.deactivate(id, userId);
            return ResponseEntity.ok("Origin이 비활성화되었습니다.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body("Origin을 찾을 수 없습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("서버 오류가 발생했습니다.");
        }
    }
} 