package com.bippobippo.hospital.impl;

import com.bippobippo.hospital.dto.request.Board.CommentCreateRequest;
import com.bippobippo.hospital.dto.request.Board.CommentUpdateRequest;
import com.bippobippo.hospital.dto.response.Board.CommentListResponse;
import com.bippobippo.hospital.entity.board.Board;
import com.bippobippo.hospital.entity.board.BoardComment;
import com.bippobippo.hospital.entity.board.CommentHospitalTag;
import com.bippobippo.hospital.entity.board.EntityTag;
import com.bippobippo.hospital.entity.User;
import com.bippobippo.hospital.repository.board.BoardCommentRepository;
import com.bippobippo.hospital.repository.board.BoardRepository;
import com.bippobippo.hospital.repository.UserRepository;
import com.bippobippo.hospital.service.board.BoardCommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BoardCommentServiceImpl implements BoardCommentService {
    private final BoardCommentRepository commentRepository;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<CommentListResponse> getComments(Integer boardId, int page, int limit) {
        PageRequest pageRequest = PageRequest.of(page - 1, limit);
        return commentRepository.findByBoardIdAndStatusIn(boardId, List.of("published", "deleted"), pageRequest)
                .map(this::convertToCommentListResponse);
    }

    @Override
    @Transactional
    public CommentListResponse createComment(Integer boardId, CommentCreateRequest request, Integer userId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        if (!board.getCategory().getAllowComments()) {
            throw new RuntimeException("이 카테고리에서는 댓글을 작성할 수 없습니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        BoardComment comment = BoardComment.builder()
                .board(board)
                .user(user)
                .userId(userId)
                .comment(request.getComment())
                .parentId(request.getParentId())
                .status("published")
                .build();

        BoardComment savedComment = commentRepository.save(comment);

        // 병원 태그 처리
        if (request.getHospitalTags() != null && !request.getHospitalTags().isEmpty()) {
            List<CommentHospitalTag> hospitalTags = request.getHospitalTags().stream()
                    .<CommentHospitalTag>map(tag -> CommentHospitalTag.builder()
                            .comment(savedComment)
                            .hospitalId(tag.getId())
                            .build())
                    .collect(Collectors.toList());
            savedComment.setHospitalTags(hospitalTags);
        }

        return convertToCommentListResponse(savedComment);
    }

    @Override
    @Transactional
    public CommentListResponse updateComment(Integer boardId, Integer commentId, CommentUpdateRequest request, Integer userId) {
        BoardComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        if (!comment.getBoard().getId().equals(boardId)) {
            throw new RuntimeException("잘못된 게시글의 댓글입니다.");
        }

        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("수정 권한이 없습니다.");
        }

        comment.update(request.getComment());
        return convertToCommentListResponse(comment);
    }

    @Override
    @Transactional
    public void deleteComment(Integer boardId, Integer commentId, Integer userId) {
        BoardComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글을 찾을 수 없습니다."));

        if (!comment.getBoard().getId().equals(boardId)) {
            throw new RuntimeException("잘못된 게시글의 댓글입니다.");
        }

        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("삭제 권한이 없습니다.");
        }

        comment.setStatus("deleted");
    }

    private CommentListResponse convertToCommentListResponse(BoardComment comment) {
        CommentListResponse response = new CommentListResponse();
        response.setId(comment.getId());
        response.setBoardId(comment.getBoard().getId());
        response.setUserId(comment.getUserId());
        response.setComment(comment.getComment());
        response.setUsername(comment.getUser().getUsername());
        response.setNickname(comment.getUser().getNickname());
        response.setAuthorProfileImage(comment.getUser().getProfileImage());
        response.setCreatedAt(comment.getCreatedAt().toString());
        response.setUpdatedAt(comment.getUpdatedAt().toString());
        response.setParentId(comment.getParentId());
        response.setStatus(comment.getStatus());

        // 병원 정보 설정
        if (comment.getHospitalTags() != null) {
            List<CommentListResponse.HospitalInfo> hospitals = comment.getHospitalTags().stream()
                    .map(tag -> {
                        CommentListResponse.HospitalInfo hospital = new CommentListResponse.HospitalInfo();
                        hospital.setId(tag.getHospitalId());
                        // TODO: Elasticsearch에서 병원 정보 조회
                        return hospital;
                    })
                    .collect(Collectors.toList());
            response.setHospitals(hospitals);
        }

        // 엔티티 태그 정보 설정
        if (comment.getEntityTags() != null) {
            List<CommentListResponse.EntityTag> entityTags = comment.getEntityTags().stream()
                    .map(tag -> {
                        CommentListResponse.EntityTag entityTag = new CommentListResponse.EntityTag();
                        entityTag.setId(tag.getId());
                        entityTag.setType(tag.getTagType().getName());
                        entityTag.setEntityId(tag.getEntityId());
                        // TODO: 엔티티 이름 설정
                        return entityTag;
                    })
                    .collect(Collectors.toList());
            response.setEntityTags(entityTags);
        }

        return response;
    }
} 