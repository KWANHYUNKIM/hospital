package com.bippobippo.hospital.service.common;

import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {
    /**
     * 파일을 로컬 저장소에 업로드합니다.
     * @param file 업로드할 파일
     * @return 업로드된 파일의 파일명
     */
    String uploadFile(MultipartFile file);

    /**
     * 프로필 이미지를 로컬 저장소에 업로드합니다.
     * @param file 업로드할 프로필 이미지 파일
     * @return 업로드된 파일의 파일명
     */
    String uploadProfileImage(MultipartFile file);

    /**
     * 로컬 저장소에서 파일을 삭제합니다.
     * @param fileName 삭제할 파일 이름
     */
    void deleteFile(String fileName);

    /**
     * 프로필 이미지를 로컬 저장소에서 삭제합니다.
     * @param fileName 삭제할 프로필 이미지 파일명
     */
    void deleteProfileImage(String fileName);
} 