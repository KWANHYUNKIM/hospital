package com.bippobippo.hospital.dto.response.board;

import com.bippobippo.hospital.entity.board.BoardComment;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoardCommentResponse {
    private Integer id;
    private String content;
    
    @JsonProperty("user_id")
    private Integer userId;
    
    @JsonProperty("user_name")
    private String userName;
    
    @JsonProperty("created_at")
    private String createdAt;
    
    @JsonProperty("updated_at")
    private String updatedAt;

    public static BoardCommentResponse from(BoardComment comment) {
        BoardCommentResponse response = new BoardCommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getComment());
        response.setUserId(comment.getUserId());
        response.setUserName(comment.getUser().getNickname());
        response.setCreatedAt(comment.getCreatedAt().toString());
        response.setUpdatedAt(comment.getUpdatedAt().toString());
        return response;
    }
} 