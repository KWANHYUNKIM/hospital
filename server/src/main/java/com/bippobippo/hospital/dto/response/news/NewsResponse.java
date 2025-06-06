package com.bippobippo.hospital.dto.response.news;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
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
    
    @JsonProperty("image_url")
    private String imageUrl;
    
    @JsonProperty("view_count")
    private Integer viewCount;
    
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
    
    @JsonProperty("representative_image_url")
    private String representativeImageUrl;
    
    @JsonProperty("images")
    private java.util.List<String> images;
} 