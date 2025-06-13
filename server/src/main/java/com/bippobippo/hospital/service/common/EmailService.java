package com.bippobippo.hospital.service.common;

public interface EmailService {
    void sendVerificationEmail(String email) throws Exception;
    boolean verifyEmail(String email, String code) throws Exception;
    void sendPasswordResetEmail(String email, String resetToken) throws Exception;
} 