package com.bippobippo.hospital.dto.response.news;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NewsCategoryResponse {
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("name")
    private String name;
} 