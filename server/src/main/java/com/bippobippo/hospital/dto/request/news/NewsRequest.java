package com.bippobippo.hospital.dto.request.news;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Getter
@NoArgsConstructor
public class NewsRequest {
    @NotBlank(message = "제목은 필수입니다")
    @JsonProperty("title")
    private String title;

    @NotBlank(message = "요약은 필수입니다")
    @JsonProperty("summary")
    private String summary;

    @NotBlank(message = "내용은 필수입니다")
    @JsonProperty("content")
    private String content;

    @NotNull(message = "카테고리는 필수입니다")
    @JsonProperty("category_id")
    private Long categoryId;

    @JsonProperty("image_url")
    private String imageUrl;
} 