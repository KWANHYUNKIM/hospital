package com.bippobippo.hospital.dto.response.board;

import com.bippobippo.hospital.entity.board.Board;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardDetailResponse {
    private Integer id;
    private String title;
    private String summary;
    private String authorName;
    private String profileImage;
    private String categoryName;
    private Integer categoryId;
    private Integer userId;
    private String createdAt;
    private String updatedAt;
    private String content;
    private String metaData;
    private List<TagResponse> tags;
    private List<BoardAttachmentResponse> attachments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TagResponse {
        private Integer id;
        private String name;
        private String slug;
    }

    public static BoardDetailResponse from(Board board) {
        return BoardDetailResponse.builder()
                .id(board.getId())
                .title(board.getTitle())
                .summary(board.getSummary())
                .authorName(board.getUser() != null ? board.getUser().getUsername() : null)
                .profileImage(board.getUser() != null ? board.getUser().getProfileImage() : null)
                .categoryName(board.getCategory() != null ? board.getCategory().getName() : null)
                .categoryId(board.getCategory() != null ? board.getCategory().getId() : null)
                .userId(board.getUserId())
                .createdAt(board.getCreatedAt().toString())
                .updatedAt(board.getUpdatedAt().toString())
                .content(board.getBoardDetail() != null ? board.getBoardDetail().getContent() : null)
                .metaData(board.getBoardDetail() != null ? board.getBoardDetail().getMetaData() : null)
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

@Data
class AttachmentResponse {
    private Integer id;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
} 