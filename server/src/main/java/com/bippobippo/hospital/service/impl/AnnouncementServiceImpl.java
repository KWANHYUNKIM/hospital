package com.bippobippo.hospital.service.impl;

import com.bippobippo.hospital.dto.MessageResponse;
import com.bippobippo.hospital.dto.request.AnnouncementRequest;
import com.bippobippo.hospital.dto.response.AnnouncementResponse;
import com.bippobippo.hospital.entity.Announcement;
import com.bippobippo.hospital.repository.AnnouncementRepository;
import com.bippobippo.hospital.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final String UPLOAD_DIR = "client/public/images/announcements/";
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getAllAnnouncements() {
        return announcementRepository.findAll().stream()
                .map(AnnouncementResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getActiveAnnouncements() {
        return announcementRepository.findActiveAnnouncements(LocalDateTime.now()).stream()
                .map(AnnouncementResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MessageResponse createAnnouncement(AnnouncementRequest request) {
        try {
            Announcement announcement = new Announcement();
            announcement.setTitle(request.getTitle());
            announcement.setContent(request.getContent());
            announcement.setLinkUrl(request.getLinkUrl());
            
            // String을 LocalDateTime으로 변환
            LocalDateTime startDateTime = LocalDateTime.parse(request.getStartDate(), formatter);
            LocalDateTime endDateTime = LocalDateTime.parse(request.getEndDate(), formatter);
            
            announcement.setStartDate(startDateTime);
            announcement.setEndDate(endDateTime);
            announcement.setPriority(request.getPriority());
            announcement.setIsActive(request.getIsActive());

            if (request.getImage() != null) {
                String imageUrl = saveImage(request.getImage());
                announcement.setImageUrl(imageUrl);
            }

            announcementRepository.save(announcement);
            return new MessageResponse("공지사항이 등록되었습니다.");
        } catch (Exception e) {
            throw new RuntimeException("공지사항 등록에 실패했습니다.", e);
        }
    }

    @Override
    @Transactional
    public MessageResponse updateAnnouncement(Long id, AnnouncementRequest request) {
        try {
            Announcement announcement = announcementRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));

            announcement.setTitle(request.getTitle());
            announcement.setContent(request.getContent());
            announcement.setLinkUrl(request.getLinkUrl());
            
            // String을 LocalDateTime으로 변환
            LocalDateTime startDateTime = LocalDateTime.parse(request.getStartDate(), formatter);
            LocalDateTime endDateTime = LocalDateTime.parse(request.getEndDate(), formatter);
            
            announcement.setStartDate(startDateTime);
            announcement.setEndDate(endDateTime);
            announcement.setPriority(request.getPriority());
            announcement.setIsActive(request.getIsActive());

            if (request.getImage() != null) {
                // 기존 이미지 삭제
                if (announcement.getImageUrl() != null) {
                    deleteImage(announcement.getImageUrl());
                }
                // 새 이미지 저장
                String imageUrl = saveImage(request.getImage());
                announcement.setImageUrl(imageUrl);
            }

            announcementRepository.save(announcement);
            return new MessageResponse("공지사항이 수정되었습니다.");
        } catch (Exception e) {
            throw new RuntimeException("공지사항 수정에 실패했습니다.", e);
        }
    }

    @Override
    @Transactional
    public MessageResponse deleteAnnouncement(Long id) {
        try {
            Announcement announcement = announcementRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));

            if (announcement.getImageUrl() != null) {
                deleteImage(announcement.getImageUrl());
            }

            announcementRepository.delete(announcement);
            return new MessageResponse("공지사항이 삭제되었습니다.");
        } catch (Exception e) {
            throw new RuntimeException("공지사항 삭제에 실패했습니다.", e);
        }
    }

    private String saveImage(MultipartFile file) throws IOException {
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = String.valueOf((int) (Math.random() * 1000));
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = "ann-" + timestamp + "-" + random + extension;

        Path filePath = Paths.get(UPLOAD_DIR + filename);
        Files.copy(file.getInputStream(), filePath);

        return "/images/announcements/" + filename;
    }

    private void deleteImage(String imageUrl) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR + imageUrl.substring(imageUrl.lastIndexOf("/") + 1));
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("이미지 파일 삭제에 실패했습니다.", e);
        }
    }
} 