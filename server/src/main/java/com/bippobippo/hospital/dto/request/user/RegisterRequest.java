package com.bippobippo.hospital.dto.request.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private String nickname;
    private String realName;
    private String interests;
    private String socialId;
    private String socialProvider;
    private Boolean isEmailVerified;
    private String profileImage;
} 