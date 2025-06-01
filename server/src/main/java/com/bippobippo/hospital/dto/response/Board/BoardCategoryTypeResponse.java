package com.bippobippo.hospital.dto.response.board;

import com.bippobippo.hospital.entity.board.BoardCategoryType;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class BoardCategoryTypeResponse {
    private Integer id;
    private String type_name;
    private String type_code;
    private String description;
    private Integer order_sequence;
    private Boolean is_active;

    public static BoardCategoryTypeResponse from(BoardCategoryType categoryType) {
        BoardCategoryTypeResponse response = new BoardCategoryTypeResponse();
        response.id = categoryType.getId();
        response.type_name = categoryType.getTypeName();
        response.type_code = categoryType.getTypeCode();
        response.description = categoryType.getDescription();
        response.order_sequence = categoryType.getOrderSequence();
        response.is_active = categoryType.getIsActive();
        return response;
    }
} 