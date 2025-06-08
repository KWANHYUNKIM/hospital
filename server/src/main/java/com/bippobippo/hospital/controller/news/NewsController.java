package com.bippobippo.hospital.controller.news;

import com.bippobippo.hospital.dto.request.news.NewsCategoryRequest;
import com.bippobippo.hospital.dto.request.news.NewsRequest;
import com.bippobippo.hospital.dto.response.news.NewsCategoryResponse;
import com.bippobippo.hospital.dto.response.news.NewsResponse;
import com.bippobippo.hospital.service.news.NewsService;
import com.bippobippo.hospital.service.news.NewsCategoryService;
import com.bippobippo.hospital.service.common.GoogleCloudStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;
    private final NewsCategoryService newsCategoryService;
    private final GoogleCloudStorageService gcsService;

    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        return ResponseEntity.ok(newsCategoryService.getAllCategories());
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCategory(@RequestBody NewsCategoryRequest request) {
        return ResponseEntity.ok(newsCategoryService.createCategory(request));
    }

    @PutMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody NewsCategoryRequest request) {
        return ResponseEntity.ok(newsCategoryService.updateCategory(id, request));
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        newsCategoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<?> getNews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false, defaultValue = "ACTIVE") String status) {
        Page<NewsResponse> newsPage = newsService.getNews(page, limit, categoryId, status);
        return ResponseEntity.ok(newsPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getNewsById(@PathVariable Long id) {
        return ResponseEntity.ok(newsService.getNewsById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createNews(@RequestBody NewsRequest request) {
        return ResponseEntity.ok(newsService.createNews(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateNews(@PathVariable Long id, @RequestBody NewsRequest request) {
        return ResponseEntity.ok(newsService.updateNews(id, request));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateNewsStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String status = request.get("status");
        return ResponseEntity.ok(newsService.updateNewsStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteNews(@PathVariable Long id) {
        newsService.deleteNews(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/related")
    public ResponseEntity<?> getRelatedNews(@RequestParam Long categoryId, @RequestParam Long excludeId, @RequestParam(defaultValue = "3") int limit) {
        return ResponseEntity.ok(newsService.getRelatedNews(categoryId, excludeId, limit));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadNewsImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = ((com.bippobippo.hospital.impl.common.GoogleCloudStorageServiceImpl) gcsService).uploadNewsImage(file);
            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            response.put("message", "이미지 업로드 성공");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "이미지 업로드 실패: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
} 