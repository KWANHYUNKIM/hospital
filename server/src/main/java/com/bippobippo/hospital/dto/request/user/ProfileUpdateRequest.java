package com.bippobippo.hospital.dto.request.user;

import lombok.Data;
import java.util.List;

@Data
public class ProfileUpdateRequest {
    private String nickname;
    private List<String> interests;
    private String currentPassword;
    private String newPassword;
} 