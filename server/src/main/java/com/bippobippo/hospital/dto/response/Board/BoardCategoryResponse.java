package com.bippobippo.hospital.dto.response.Board;

import com.bippobippo.hospital.entity.board.BoardCategory;
import lombok.Getter;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
@NoArgsConstructor
public class BoardCategoryResponse {
    private Integer id;
    @JsonProperty("category_name")
    private String name;
    private String description;
    @JsonProperty("parent_id")
    private Integer parentId;
    @JsonProperty("category_type_id")
    private Integer categoryTypeId;
    @JsonProperty("type_name")
    private String typeName;
    @JsonProperty("type_code")
    private String typeCode;
    @JsonProperty("order_sequence")
    private Integer orderSequence;
    @JsonProperty("allow_comments")
    private Boolean allowComments;
    @JsonProperty("is_secret_default")
    private Boolean isSecretDefault;
    @JsonProperty("is_active")
    private Boolean isActive;
    private String config;
    @JsonProperty("has_children")
    private Boolean hasChildren;

    public static BoardCategoryResponse from(BoardCategory category) {
        BoardCategoryResponse response = new BoardCategoryResponse();
        response.id = category.getId();
        response.name = category.getName();
        response.description = category.getDescription();
        response.parentId = category.getParent() != null ? category.getParent().getId() : null;
        response.categoryTypeId = category.getCategoryType().getId();
        response.typeName = category.getCategoryType().getTypeName();
        response.typeCode = category.getCategoryType().getTypeCode();
        response.orderSequence = category.getOrderSequence();
        response.allowComments = category.getAllowComments();
        response.isSecretDefault = category.getIsSecretDefault();
        response.isActive = category.getIsActive();
        response.config = category.getConfig();
        response.hasChildren = !category.getChildren().isEmpty();
        return response;
    }
} 