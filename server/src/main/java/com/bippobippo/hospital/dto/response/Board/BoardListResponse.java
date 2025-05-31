package com.bippobippo.hospital.dto.response.board;

import com.bippobippo.hospital.entity.board.Board;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardListResponse {
    private Integer id;
    private String title;
    private String summary;
    
    @JsonProperty("category_id")
    private Integer categoryId;
    
    @JsonProperty("category_name")
    private String categoryName;
    
    @JsonProperty("user_id")
    private Integer userId;
    
    @JsonProperty("user_name")
    private String userName;

    @JsonProperty("profile_image")
    private String profileImage;
    
    private String status;
    
    @JsonProperty("is_notice")
    private Boolean isNotice;
    
    @JsonProperty("view_count")
    private Integer viewCount;
    
    @JsonProperty("like_count")
    private Integer likeCount;
    
    @JsonProperty("comment_count")
    private Integer commentCount;
    
    @JsonProperty("created_at")
    private String createdAt;
    
    @JsonProperty("updated_at")
    private String updatedAt;

    private String authorName;
    private List<TagResponse> tags;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TagResponse {
        private Integer id;
        private String name;
        private String slug;
    }

    public static BoardListResponse from(Board board) {
        return BoardListResponse.builder()
                .id(board.getId())
                .title(board.getTitle())
                .summary(board.getSummary())
                .authorName(board.getUser() != null ? board.getUser().getNickname() : null)
                .profileImage(board.getUser() != null ? board.getUser().getProfileImage() : null)
                .categoryName(board.getCategory() != null ? board.getCategory().getName() : null)
                .categoryId(board.getCategory() != null ? board.getCategory().getId() : null)
                .userId(board.getUserId())
                .userName(board.getUser() != null ? board.getUser().getNickname() : null)
                .status(board.getStatus())
                .isNotice(board.getIsNotice())
                .viewCount(board.getViewCount())
                .likeCount(board.getLikeCount())
                .commentCount(board.getComments() != null ? board.getComments().size() : 0)
                .createdAt(board.getCreatedAt().toString())
                .updatedAt(board.getUpdatedAt().toString())
                .tags(board.getTags().stream()
                        .map(tag -> TagResponse.builder()
                                .id(tag.getId())
                                .name(tag.getName())
                                .slug(tag.getSlug())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
} 