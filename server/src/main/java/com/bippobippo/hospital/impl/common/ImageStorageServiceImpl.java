package com.bippobippo.hospital.impl.common;

import com.bippobippo.hospital.service.common.ImageStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageStorageServiceImpl implements ImageStorageService {
    
    @Value("${app.upload.path:src/main/resources/static/uploads}")
    private String uploadPath;

    private static final String PROFILE_IMAGES_FOLDER = "profile/";
    private static final String NEWS_IMAGES_FOLDER = "news/";
    private static final String BOARDS_IMAGES_FOLDER = "boards/";

    @Override
    public String uploadFile(MultipartFile file) {
        return uploadFile(file, PROFILE_IMAGES_FOLDER);
    }

    public String uploadProfileImage(MultipartFile file) {
        return uploadFile(file, PROFILE_IMAGES_FOLDER);
    }

    public String uploadNewsImage(MultipartFile file) {
        return uploadFile(file, NEWS_IMAGES_FOLDER);
    }

    private String uploadFile(MultipartFile file, String folder) {
        try {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("업로드할 파일이 없습니다.");
            }

            // 파일 확장자 검증
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            
            if (!isValidImageExtension(fileExtension)) {
                throw new IllegalArgumentException("지원하지 않는 이미지 형식입니다. (jpg, jpeg, png, gif만 허용)");
            }

            // 카테고리별 폴더 경로 생성
            String categoryPath = uploadPath + "/" + folder;
            Path categoryDir = Paths.get(categoryPath);
            
            if (!Files.exists(categoryDir)) {
                Files.createDirectories(categoryDir);
            }

            // 고유한 파일명 생성
            String uniqueFilename = generateFileName(originalFilename);
            Path filePath = categoryDir.resolve(uniqueFilename);

            // 파일 저장
            Files.copy(file.getInputStream(), filePath);
            
            log.info("이미지 업로드 완료: {} -> {}", originalFilename, filePath);
            
            return uniqueFilename;
        } catch (IOException e) {
            log.error("이미지 업로드 실패: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("이미지 업로드 중 오류가 발생했습니다.", e);
        }
    }

    private String generateFileName(String originalFileName) {
        String extension = getFileExtension(originalFileName);
        return UUID.randomUUID().toString() + "." + extension;
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    private boolean isValidImageExtension(String extension) {
        return extension.matches("(jpg|jpeg|png|gif)");
    }

    @Override
    public void deleteFile(String fileName) {
        deleteFile(fileName, PROFILE_IMAGES_FOLDER);
    }

    public void deleteProfileImage(String fileName) {
        deleteFile(fileName, PROFILE_IMAGES_FOLDER);
    }

    public void deleteNewsImage(String fileName) {
        deleteFile(fileName, NEWS_IMAGES_FOLDER);
    }

    private void deleteFile(String fileName, String folder) {
        try {
            Path filePath = Paths.get(uploadPath, folder, fileName);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("이미지 삭제 완료: {}", filePath);
            }
        } catch (IOException e) {
            log.error("이미지 삭제 실패: {}", fileName, e);
        }
    }
} 