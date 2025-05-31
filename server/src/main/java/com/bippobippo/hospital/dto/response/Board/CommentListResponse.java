package com.bippobippo.hospital.dto.response.board;

import com.bippobippo.hospital.entity.board.BoardComment;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class CommentListResponse {
    private Integer id;
    private Integer boardId;
    private Integer userId;
    private String username;
    private String nickname;
    private String authorProfileImage;
    private String comment;
    private Integer parentId;
    private String status;
    private Boolean isSecret;
    private String createdAt;
    private String updatedAt;
    private List<HospitalInfo> hospitals;
    private List<EntityTag> entityTags;

    @Getter
    @Setter
    public static class HospitalInfo {
        private Integer id;
    }

    @Getter
    @Setter
    public static class EntityTag {
        private Integer id;
        private String type;
        private Integer entityId;
    }

    public static CommentListResponse from(BoardComment comment) {
        CommentListResponse response = new CommentListResponse();
        response.setId(comment.getId());
        response.setBoardId(comment.getBoard().getId());
        response.setUserId(comment.getUserId());
        response.setComment(comment.getComment());
        response.setParentId(comment.getParentId());
        response.setStatus(comment.getStatus());
        response.setIsSecret(comment.getIsSecret());
        response.setCreatedAt(comment.getCreatedAt().toString());
        response.setUpdatedAt(comment.getUpdatedAt().toString());
        return response;
    }
} 