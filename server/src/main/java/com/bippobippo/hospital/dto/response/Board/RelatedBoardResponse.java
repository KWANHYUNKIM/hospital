package com.bippobippo.hospital.dto.response.Board;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RelatedBoardResponse {
    private Integer id;
    private String title;
    private String summary;
    private String categoryName;
    private String username;
    private Integer userId;
    private Integer commentCount;
    private Integer viewCount;
    private String createdAt;
    private String updatedAt;
} 