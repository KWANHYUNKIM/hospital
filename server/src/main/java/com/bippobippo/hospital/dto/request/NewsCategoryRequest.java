package com.bippobippo.hospital.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import javax.validation.constraints.NotBlank;

@Getter
@NoArgsConstructor
public class NewsCategoryRequest {
    @NotBlank(message = "카테고리 이름은 필수입니다")
    @JsonProperty("name")
    private String name;
} 