package com.bippobippo.hospital.dto.response;

import com.bippobippo.hospital.entity.Announcement;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AnnouncementResponse {
    private Long id;
    private String title;
    private String content;
    private String imageUrl;
    private String linkUrl;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "Asia/Seoul")
    private LocalDateTime startDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "Asia/Seoul")
    private LocalDateTime endDate;

    private Integer priority;
    private Boolean isActive;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "Asia/Seoul")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "Asia/Seoul")
    private LocalDateTime updatedAt;

    public static AnnouncementResponse from(Announcement announcement) {
        AnnouncementResponse response = new AnnouncementResponse();
        response.setId(announcement.getId());
        response.setTitle(announcement.getTitle());
        response.setContent(announcement.getContent());
        response.setImageUrl(announcement.getImageUrl());
        response.setLinkUrl(announcement.getLinkUrl());
        response.setStartDate(announcement.getStartDate());
        response.setEndDate(announcement.getEndDate());
        response.setPriority(announcement.getPriority());
        response.setIsActive(announcement.getIsActive());
        response.setCreatedAt(announcement.getCreatedAt());
        response.setUpdatedAt(announcement.getUpdatedAt());
        return response;
    }
} 