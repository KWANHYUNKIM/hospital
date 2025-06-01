package com.bippobippo.hospital.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
public class AnnouncementRequest {
    private String title;
    private String content;
    private String linkUrl;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private String startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private String endDate;
    
    private Integer priority = 0;
    private Boolean isActive = true;
    private MultipartFile image;

    public LocalDateTime getStartDateTime() {
        return LocalDateTime.parse(startDate, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    public LocalDateTime getEndDateTime() {
        return LocalDateTime.parse(endDate, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }
} 