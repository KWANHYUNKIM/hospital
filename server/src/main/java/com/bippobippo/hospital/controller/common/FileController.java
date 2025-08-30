package com.bippobippo.hospital.controller.common;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@RestController
@RequestMapping("/uploads")
@RequiredArgsConstructor
public class FileController {

    @Value("${app.upload.path:src/main/resources/static/uploads}")
    private String uploadPath;

    @GetMapping("/profile/{filename:.+}")
    public ResponseEntity<Resource> serveProfileImage(@PathVariable String filename) {
        return serveFile("profile", filename);
    }

    @GetMapping("/news/{filename:.+}")
    public ResponseEntity<Resource> serveNewsImage(@PathVariable String filename) {
        return serveFile("news", filename);
    }

    @GetMapping("/boards/{filename:.+}")
    public ResponseEntity<Resource> serveBoardImage(@PathVariable String filename) {
        return serveFile("boards", filename);
    }

    private ResponseEntity<Resource> serveFile(String folder, String filename) {
        try {
            Path filePath = Paths.get(uploadPath, folder, filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = determineContentType(filename);
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                log.warn("파일을 찾을 수 없거나 읽을 수 없습니다: {}", filePath);
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            log.error("파일 경로 오류: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    private String determineContentType(String filename) {
        String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        switch (extension) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "webp":
                return "image/webp";
            default:
                return "application/octet-stream";
        }
    }
} 