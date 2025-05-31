package com.bippobippo.hospital.dto.response.board;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RelatedBoardListResponse {
    private List<BoardListItem> items;

    @Getter
    @Setter
    public static class BoardListItem {
        private Integer id;
        private String title;
        private String summary;
        private Integer categoryId;
        private String categoryName;
        private Integer categoryTypeId;
        private String categoryTypeName;
        private Integer userId;
        private String userName;
        private String userProfileImage;
        private List<String> tags;
        private Integer viewCount;
        private Integer commentCount;
        private Boolean isSecret;
        private String status;
    }
} 