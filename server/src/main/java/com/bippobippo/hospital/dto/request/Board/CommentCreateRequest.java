package com.bippobippo.hospital.dto.request.board;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class CommentCreateRequest {
    private String comment;
    private Integer parentId;
    private String status;
    private Boolean isSecret;
    private String password;
    private List<HospitalTagRequest> hospitalTags;
} 