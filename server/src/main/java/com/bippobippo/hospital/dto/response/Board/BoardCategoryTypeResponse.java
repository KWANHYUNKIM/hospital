package com.bippobippo.hospital.dto.response.board;

import com.bippobippo.hospital.entity.board.BoardCategoryType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
@NoArgsConstructor
public class BoardCategoryTypeResponse {
    private Integer id;
    @JsonProperty("type_name")
    private String typeName;
    @JsonProperty("type_code")
    private String typeCode;
    private String description;
    @JsonProperty("order_sequence")
    private Integer orderSequence;
    @JsonProperty("is_active")
    private Boolean isActive;

    public static BoardCategoryTypeResponse from(BoardCategoryType categoryType) {
        BoardCategoryTypeResponse response = new BoardCategoryTypeResponse();
        response.id = categoryType.getId();
        response.typeName = categoryType.getTypeName();
        response.typeCode = categoryType.getTypeCode();
        response.description = categoryType.getDescription();
        response.orderSequence = categoryType.getOrderSequence();
        response.isActive = categoryType.getIsActive();
        return response;
    }
} 