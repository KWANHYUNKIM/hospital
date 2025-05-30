package com.bippobippo.hospital.service.board;

import com.bippobippo.hospital.dto.request.Board.CommentCreateRequest;
import com.bippobippo.hospital.dto.request.Board.CommentUpdateRequest;
import com.bippobippo.hospital.dto.response.Board.CommentListResponse;
import org.springframework.data.domain.Page;

public interface BoardCommentService {
    Page<CommentListResponse> getComments(Integer boardId, int page, int limit);
    CommentListResponse createComment(Integer boardId, CommentCreateRequest request, Integer userId);
    CommentListResponse updateComment(Integer boardId, Integer commentId, CommentUpdateRequest request, Integer userId);
    void deleteComment(Integer boardId, Integer commentId, Integer userId);
} 