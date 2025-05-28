package com.bippobippo.hospital.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
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