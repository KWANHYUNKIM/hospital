package com.bippobippo.hospital.impl.common;

import com.bippobippo.hospital.service.common.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final Map<String, EmailVerification> verificationCodes = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> lastSentTime = new ConcurrentHashMap<>(); // 마지막 전송 시간 추적
    private final Random random = new Random();
    
    // 이메일 형식 검증을 위한 정규식
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    
    // 중복 전송 방지 시간 (3분)
    private static final int DUPLICATE_PREVENTION_MINUTES = 3;

    @Override
    public Map<String, Object> sendVerificationEmail(String email) throws Exception {
        Map<String, Object> result = new HashMap<>();
        
        // 1. 이메일 형식 검증
        if (!isValidEmailFormat(email)) {
            result.put("success", false);
            result.put("message", "올바른 이메일 형식이 아닙니다.");
            log.warn("Invalid email format: {}", email);
            return result;
        }
        
        // 2. 중복 전송 방지 검사
        if (isDuplicateRequest(email)) {
            result.put("success", false);
            result.put("message", "3분 이내에 다시 시도해주세요.");
            log.info("Duplicate email request prevented for: {}", email);
            return result;
        }
        
        try {
            // 3. 6자리 랜덤 인증 코드 생성
            String code = String.format("%06d", random.nextInt(900000) + 100000);
            
            // 4. 인증 코드 저장 (3분 후 만료)
            verificationCodes.put(email, new EmailVerification(code, LocalDateTime.now().plusMinutes(3)));
            
            // 5. 마지막 전송 시간 기록
            lastSentTime.put(email, LocalDateTime.now());

            // 6. 이메일 메시지 생성
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("이메일 인증 코드");
            message.setText("인증 코드: " + code + "\n\n이 코드는 3분 동안 유효합니다.");

            // 7. 이메일 전송
            mailSender.send(message);
            
            result.put("success", true);
            result.put("message", "인증 코드가 이메일로 전송되었습니다.");
            log.info("Verification email sent to: {}", email);
            
        } catch (Exception e) {
            // 8. 전송 실패 시 저장된 데이터 정리
            verificationCodes.remove(email);
            lastSentTime.remove(email);
            throw e;
        }
        
        return result;
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

    @Override
    public void sendPasswordResetEmail(String email, String resetToken) throws Exception {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("비밀번호 재설정");
        message.setText("비밀번호 재설정 토큰: " + resetToken + "\n\n이 토큰은 1시간 동안 유효합니다.");
        mailSender.send(message);
        log.info("Password reset email sent to: {}", email);
    }

    /**
     * 이메일 형식이 유효한지 검증
     */
    private boolean isValidEmailFormat(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }
    
    /**
     * 중복 전송 요청인지 검사 (3분 이내)
     */
    private boolean isDuplicateRequest(String email) {
        LocalDateTime lastSent = lastSentTime.get(email);
        if (lastSent == null) {
            return false;
        }
        
        LocalDateTime now = LocalDateTime.now();
        return lastSent.plusMinutes(DUPLICATE_PREVENTION_MINUTES).isAfter(now);
    }
    
    /**
     * 만료된 인증 코드 정리
     */
    private void cleanupExpiredCodes() {
        LocalDateTime now = LocalDateTime.now();
        verificationCodes.entrySet().removeIf(entry -> 
            entry.getValue().expiresAt.isBefore(now)
        );
        lastSentTime.entrySet().removeIf(entry -> 
            entry.getValue().plusMinutes(DUPLICATE_PREVENTION_MINUTES).isBefore(now)
        );
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