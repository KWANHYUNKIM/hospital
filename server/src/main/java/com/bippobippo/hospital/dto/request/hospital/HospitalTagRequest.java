package com.bippobippo.hospital.dto.request.hospital;

import lombok.Getter;
import lombok.Setter;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Getter
@Setter
public class HospitalTagRequest {
    @NotBlank(message = "태그명은 필수입니다")
    @Size(min = 1, max = 50, message = "태그명은 1~50자 사이여야 합니다")
    private String name;
} 