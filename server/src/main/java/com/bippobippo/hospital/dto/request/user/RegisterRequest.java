package com.bippobippo.hospital.dto.request.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private String nickname;
    private String interests;
    private String socialId;
    private String socialProvider;
    private Boolean isEmailVerified;
} 