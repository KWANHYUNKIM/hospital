package com.bippobippo.hospital.dto.response.Board;

import com.bippobippo.hospital.entity.board.BoardMetaField;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoardMetaFieldResponse {
    private Integer id;
    private String key;
    private String value;
    
    @JsonProperty("created_at")
    private String createdAt;
    
    @JsonProperty("updated_at")
    private String updatedAt;

    public static BoardMetaFieldResponse from(BoardMetaField metaField) {
        BoardMetaFieldResponse response = new BoardMetaFieldResponse();
        response.setId(metaField.getId());
        response.setKey(metaField.getFieldName());
        response.setValue(metaField.getFieldLabel());
        response.setCreatedAt(metaField.getCreatedAt().toString());
        return response;
    }
} 