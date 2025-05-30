package com.bippobippo.hospital.service;

import org.springframework.web.multipart.MultipartFile;

public interface GoogleCloudStorageService {
    /**
     * 파일을 Google Cloud Storage에 업로드합니다.
     * @param file 업로드할 파일
     * @return 업로드된 파일의 미디어 링크
     */
    String uploadFile(MultipartFile file);

    /**
     * Google Cloud Storage에서 파일을 삭제합니다.
     * @param fileName 삭제할 파일 이름
     */
    void deleteFile(String fileName);
}