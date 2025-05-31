package com.bippobippo.hospital.service.impl;

import com.bippobippo.hospital.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final Map<String, EmailVerification> verificationCodes = new ConcurrentHashMap<>();
    private final Random random = new Random();

    @Override
    public void sendVerificationEmail(String email) throws Exception {
        // 6자리 랜덤 인증 코드 생성
        String code = String.format("%06d", random.nextInt(900000) + 100000);
        
        // 인증 코드 저장 (1분 후 만료)
        verificationCodes.put(email, new EmailVerification(code, LocalDateTime.now().plusMinutes(1)));

        // 이메일 메시지 생성
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("이메일 인증 코드");
        message.setText("인증 코드: " + code + "\n\n이 코드는 1분 동안 유효합니다.");

        // 이메일 전송
        mailSender.send(message);
        
        log.info("Verification email sent to: {}", email);
    }

    @Override
    public boolean verifyEmail(String email, String code) throws Exception {
        EmailVerification verification = verificationCodes.get(email);
        if (verification != null && 
            verification.code.equals(code) && 
            verification.expiresAt.isAfter(LocalDateTime.now())) {
            verificationCodes.remove(email);
            return true;
        }
        return false;
    }

    private static class EmailVerification {
        final String code;
        final LocalDateTime expiresAt;

        EmailVerification(String code, LocalDateTime expiresAt) {
            this.code = code;
            this.expiresAt = expiresAt;
        }
    }
} 