package com.bippobippo.hospital.dto.response.news;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsResponse {
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("title")
    private String title;
    
    @JsonProperty("summary")
    private String summary;
    
    @JsonProperty("content")
    private String content;
    
    @JsonProperty("category_id")
    private Long categoryId;
    
    @JsonProperty("category_name")
    private String categoryName;
    
    @JsonProperty("representative_image_url")
    private String representativeImageUrl;
    
    @JsonProperty("view_count")
    private Integer viewCount;
    
    @JsonProperty("author_id")
    private Long authorId;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
    
    @JsonProperty("images")
    private List<String> images;
} 