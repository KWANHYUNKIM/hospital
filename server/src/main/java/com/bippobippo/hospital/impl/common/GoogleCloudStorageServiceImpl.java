package com.bippobippo.hospital.impl.common;

import com.bippobippo.hospital.service.common.GoogleCloudStorageService;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Slf4j
// @Service
@RequiredArgsConstructor
public class GoogleCloudStorageServiceImpl implements GoogleCloudStorageService {
    
    // private final Storage storage;

    @Value("${gcs.bucket.name}")
    private String bucketName;

    @Value("${gcs.project.id}")
    private String projectId;

    private static final String PROFILE_IMAGES_FOLDER = "profile-images/";
    private static final String NEWS_IMAGES_FOLDER = "news-images/";

    @Override
    public String uploadFile(MultipartFile file) {
        // Google Cloud Storage 비활성화
        log.warn("Google Cloud Storage가 비활성화되어 있습니다.");
        return "storage_disabled";
    }

    public String uploadNewsImage(MultipartFile file) {
        // Google Cloud Storage 비활성화
        log.warn("Google Cloud Storage가 비활성화되어 있습니다.");
        return "storage_disabled";
    }

    private String uploadFile(MultipartFile file, String folder) {
        // Google Cloud Storage 비활성화
        log.warn("Google Cloud Storage가 비활성화되어 있습니다.");
        return "storage_disabled";
    }

    private String generateFileName(String originalFileName) {
        String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        return UUID.randomUUID().toString() + extension;
    }

    @Override
    public void deleteFile(String fileName) {
        // Google Cloud Storage 비활성화
        log.warn("Google Cloud Storage가 비활성화되어 있습니다.");
    }

    public void deleteNewsImage(String fileName) {
        // Google Cloud Storage 비활성화
        log.warn("Google Cloud Storage가 비활성화되어 있습니다.");
    }

    private void deleteFile(String fileName, String folder) {
        // Google Cloud Storage 비활성화
        log.warn("Google Cloud Storage가 비활성화되어 있습니다.");
    }
} 