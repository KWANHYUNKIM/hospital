package com.bippobippo.hospital.dto.request.Board;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class BoardUpdateRequest {
    private String title;
    private String summary;
    private Integer categoryId;
    private String status;
    private Boolean isNotice;
    private Boolean isSecret;
    private String password;
    private String metaFields;
    private List<String> tags;
} 