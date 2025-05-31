package com.bippobippo.hospital.service;

public interface EmailService {
    void sendVerificationEmail(String email) throws Exception;
    boolean verifyEmail(String email, String code) throws Exception;
} 