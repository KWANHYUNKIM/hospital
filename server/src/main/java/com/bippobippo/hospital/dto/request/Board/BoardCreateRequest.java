package com.bippobippo.hospital.dto.request.board;

import lombok.Getter;
import lombok.Setter;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@Getter
@Setter
public class BoardCreateRequest {
    @NotBlank(message = "제목은 필수입니다")
    private String title;
    
    @NotBlank(message = "요약은 필수입니다")
    private String summary;
    
    @NotNull(message = "카테고리 ID는 필수입니다")
    @JsonProperty("categoryId")
    private String categoryId;
    
    @NotNull(message = "사용자 ID는 필수입니다")
    @JsonProperty("userId")
    private Integer userId;
    
    private String status;
    private Boolean isNotice;
    private String metaFields;
    private List<String> tags;

    @Override
    public String toString() {
        return "BoardCreateRequest{" +
                "title='" + title + '\'' +
                ", summary='" + summary + '\'' +
                ", categoryId='" + categoryId + '\'' +
                ", userId=" + userId +
                ", status='" + status + '\'' +
                ", isNotice=" + isNotice +
                ", metaFields='" + metaFields + '\'' +
                ", tags=" + tags +
                '}';
    }
} 