package com.bippobippo.hospital.controller;

import com.bippobippo.hospital.dto.MessageResponse;
import com.bippobippo.hospital.dto.request.AnnouncementRequest;
import com.bippobippo.hospital.dto.response.AnnouncementResponse;
import com.bippobippo.hospital.entity.Announcement;
import com.bippobippo.hospital.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AnnouncementResponse>> getAllAnnouncements() {
        return ResponseEntity.ok(announcementService.getAllAnnouncements());
    }

    @GetMapping("/active")
    public ResponseEntity<List<AnnouncementResponse>> getActiveAnnouncements() {
        return ResponseEntity.ok(announcementService.getActiveAnnouncements());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> createAnnouncement(@ModelAttribute AnnouncementRequest request) {
        return ResponseEntity.ok(announcementService.createAnnouncement(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> updateAnnouncement(
            @PathVariable Long id,
            @ModelAttribute AnnouncementRequest request) {
        return ResponseEntity.ok(announcementService.updateAnnouncement(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteAnnouncement(@PathVariable Long id) {
        return ResponseEntity.ok(announcementService.deleteAnnouncement(id));
    }
} 