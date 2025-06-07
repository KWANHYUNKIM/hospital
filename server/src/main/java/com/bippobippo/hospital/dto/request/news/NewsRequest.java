package com.bippobippo.hospital.dto.request.news;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

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

    @JsonProperty("representative_image_url")
    private String representativeImageUrl;

    @JsonProperty("images")
    private List<String> images;

    @NotNull(message = "작성자 ID는 필수입니다")
    @JsonProperty("author_id")
    private Long authorId;

    @JsonProperty("status")
    private String status;
} 