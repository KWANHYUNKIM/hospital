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
@Service
@RequiredArgsConstructor
public class GoogleCloudStorageServiceImpl implements GoogleCloudStorageService {
    
    private final Storage storage;

    @Value("${gcs.bucket.name}")
    private String bucketName;

    @Value("${gcs.project.id}")
    private String projectId;

    private static final String PROFILE_IMAGES_FOLDER = "profile-images/";
    private static final String NEWS_IMAGES_FOLDER = "news-images/";

    @Override
    public String uploadFile(MultipartFile file) {
        return uploadFile(file, PROFILE_IMAGES_FOLDER);
    }

    public String uploadNewsImage(MultipartFile file) {
        return uploadFile(file, NEWS_IMAGES_FOLDER);
    }

    private String uploadFile(MultipartFile file, String folder) {
        try {
            String fileName = generateFileName(file.getOriginalFilename());
            String filePath = folder + fileName;
            
            BlobInfo blobInfo = storage.create(
                BlobInfo.newBuilder(bucketName, filePath)
                    .setContentType(file.getContentType())
                    .build(),
                file.getBytes()
            );
            
            log.info("파일이 성공적으로 업로드되었습니다: {}", filePath);
            return blobInfo.getMediaLink();
        } catch (Exception e) {
            log.error("파일 업로드 중 오류 발생", e);
            throw new RuntimeException("파일 업로드에 실패했습니다.", e);
        }
    }

    private String generateFileName(String originalFileName) {
        String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        return UUID.randomUUID().toString() + extension;
    }

    @Override
    public void deleteFile(String fileName) {
        deleteFile(fileName, PROFILE_IMAGES_FOLDER);
    }

    public void deleteNewsImage(String fileName) {
        deleteFile(fileName, NEWS_IMAGES_FOLDER);
    }

    private void deleteFile(String fileName, String folder) {
        try {
            String filePath = folder + fileName;
            BlobId blobId = BlobId.of(bucketName, filePath);
            boolean deleted = storage.delete(blobId);
            if (deleted) {
                log.info("파일이 성공적으로 삭제되었습니다: {}", filePath);
            } else {
                log.warn("파일을 찾을 수 없습니다: {}", filePath);
            }
        } catch (Exception e) {
            log.error("파일 삭제 중 오류 발생", e);
            throw new RuntimeException("파일 삭제에 실패했습니다.", e);
        }
    }
} 