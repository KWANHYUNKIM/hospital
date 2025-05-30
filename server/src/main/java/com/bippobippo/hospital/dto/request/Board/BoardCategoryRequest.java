package com.bippobippo.hospital.dto.request.Board;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoardCategoryRequest {
    private String name;
    private String description;
    private Integer typeId;
    private Integer parentId;
    private Integer orderSequence;
    private Boolean allowComments = true;
    private Boolean isSecretDefault = false;
    private Boolean isActive = true;
    private String config;
} 