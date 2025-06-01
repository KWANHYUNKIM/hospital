package com.bippobippo.hospital.dto.request.board;

import lombok.Data;

@Data
public class BoardCategoryRequest {
    private String name;
    private String description;
    private Integer typeId;
    private Integer parentId;
    private Integer orderSequence;
    private boolean allowComments = true;
    private boolean secretDefault = false;
    private boolean active = true;
    private String config;
} 