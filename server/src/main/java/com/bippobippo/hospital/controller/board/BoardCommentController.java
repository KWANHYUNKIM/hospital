package com.bippobippo.hospital.controller.board;

import com.bippobippo.hospital.dto.request.board.CommentCreateRequest;
import com.bippobippo.hospital.dto.request.board.CommentUpdateRequest;
import com.bippobippo.hospital.dto.response.board.CommentListResponse;
import com.bippobippo.hospital.service.board.BoardCommentService;
import com.bippobippo.hospital.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/boards/{boardId}/comments")
@RequiredArgsConstructor
public class BoardCommentController {
    private final BoardCommentService commentService;

    @GetMapping
    public ResponseEntity<Page<CommentListResponse>> getComments(
            @PathVariable Integer boardId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(commentService.getComments(boardId, page, limit));
    }

    @PostMapping
    public ResponseEntity<CommentListResponse> createComment(
            @PathVariable Integer boardId,
            @RequestBody CommentCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(commentService.createComment(boardId, request, userDetails.getUserId()));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentListResponse> updateComment(
            @PathVariable Integer boardId,
            @PathVariable Integer commentId,
            @RequestBody CommentUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(commentService.updateComment(boardId, commentId, request, userDetails.getUserId()));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Integer boardId,
            @PathVariable Integer commentId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        commentService.deleteComment(boardId, commentId, userDetails.getUserId());
        return ResponseEntity.ok().build();
    }
} 