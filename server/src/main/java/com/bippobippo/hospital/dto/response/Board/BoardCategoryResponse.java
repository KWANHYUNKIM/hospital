package com.bippobippo.hospital.dto.response.board;

import com.bippobippo.hospital.entity.board.BoardCategory;
import lombok.Getter;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

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
    private List<BoardCategoryResponse> children;

    public static BoardCategoryResponse from(BoardCategory category) {
        if (category == null) {
            return null;
        }

        BoardCategoryResponse response = new BoardCategoryResponse();
        response.id = category.getId();
        response.name = category.getName();
        response.description = category.getDescription();
        response.categoryTypeId = category.getCategoryType() != null ? category.getCategoryType().getId() : null;
        response.parentId = category.getParent() != null ? category.getParent().getId() : null;
        response.orderSequence = category.getOrderSequence();
        response.allowComments = category.getAllowComments();
        response.isSecretDefault = category.getIsSecretDefault();
        response.isActive = category.getIsActive();
        response.config = category.getConfig();
        
        // children 컬렉션을 안전하게 처리
        try {
            response.children = category.getChildren().stream()
                .map(BoardCategoryResponse::from)
                .collect(Collectors.toList());
        } catch (Exception e) {
            response.children = Collections.emptyList();
        }

        return response;
    }
} 