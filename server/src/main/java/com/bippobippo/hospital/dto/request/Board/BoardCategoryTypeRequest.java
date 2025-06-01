package com.bippobippo.hospital.dto.request.board;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Getter
@NoArgsConstructor
public class BoardCategoryTypeRequest {
    @NotBlank(message = "타입 이름은 필수입니다")
    @JsonProperty("type_name")
    private String typeName;

    @NotBlank(message = "타입 코드는 필수입니다")
    @JsonProperty("type_code")
    private String typeCode;

    private String description;

    @NotNull(message = "순서는 필수입니다")
    @JsonProperty("order_sequence")
    private Integer orderSequence;

    @JsonProperty("is_active")
    private Boolean isActive;
} 