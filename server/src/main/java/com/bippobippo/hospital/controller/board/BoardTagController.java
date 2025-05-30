package com.bippobippo.hospital.controller.board;

import com.bippobippo.hospital.service.board.BoardTagService;
import lombok.Getter;
import lombok.Setter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards/{boardId}/tags")
@RequiredArgsConstructor
public class BoardTagController {
    private final BoardTagService boardTagService;

    @PostMapping
    public ResponseEntity<?> createTags(
            @PathVariable Integer boardId,
            @RequestBody TagRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String userId = userDetails.getUsername();
        return ResponseEntity.ok(boardTagService.createTags(boardId, request.getTags(), userId));
    }

    @Getter
    @Setter
    public static class TagRequest {
        private List<String> tags;
    }
} 