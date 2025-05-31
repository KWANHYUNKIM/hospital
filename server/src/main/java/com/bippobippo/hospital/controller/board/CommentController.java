package com.bippobippo.hospital.controller.board;

import com.bippobippo.hospital.entity.board.Comment;
import com.bippobippo.hospital.service.user.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comment")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @GetMapping("/{postId}/list")
    public ResponseEntity<?> getComments(@PathVariable Long postId) {
        List<Comment> comments = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "comments", comments
        ));
    }

    @PostMapping("/{postId}/create")
    public ResponseEntity<?> createComment(
        @PathVariable Long postId,
        @RequestBody Map<String, Object> request
    ) {
        String content = (String) request.get("comment");
        Long parentId = request.get("parentId") != null ? Long.valueOf(request.get("parentId").toString()) : null;
        @SuppressWarnings("unchecked")
        List<Map<String, String>> hospitalTags = (List<Map<String, String>>) request.get("hospitalTags");

        Comment comment = commentService.createComment(postId, content, parentId, hospitalTags);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "comment", comment
        ));
    }
} 