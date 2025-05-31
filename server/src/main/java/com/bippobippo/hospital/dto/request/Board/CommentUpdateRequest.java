package com.bippobippo.hospital.dto.request.board;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentUpdateRequest {
    private String comment;
    private String status;
    private Boolean isSecret;
    private String password;
} 