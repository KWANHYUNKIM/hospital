package com.bippobippo.hospital.service.common;

import java.util.Map;

public interface EmailService {
    /**
     * 이메일 인증 코드 전송 (중복 전송 방지 포함)
     * @param email 이메일 주소
     * @return 전송 성공 여부와 메시지
     * @throws Exception 전송 실패 시
     */
    Map<String, Object> sendVerificationEmail(String email) throws Exception;
    
    boolean verifyEmail(String email, String code) throws Exception;
    void sendPasswordResetEmail(String email, String resetToken) throws Exception;
} 