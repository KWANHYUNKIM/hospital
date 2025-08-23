package com.bippobippo.hospital.dto.request.user;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
} 