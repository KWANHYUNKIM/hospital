package com.bippobippo.hospital.service;

import com.bippobippo.hospital.dto.MessageResponse;
import com.bippobippo.hospital.dto.request.AnnouncementRequest;
import com.bippobippo.hospital.dto.response.AnnouncementResponse;

import java.util.List;

public interface AnnouncementService {
    List<AnnouncementResponse> getAllAnnouncements();
    List<AnnouncementResponse> getActiveAnnouncements();
    MessageResponse createAnnouncement(AnnouncementRequest request);
    MessageResponse updateAnnouncement(Long id, AnnouncementRequest request);
    MessageResponse deleteAnnouncement(Long id);
} 