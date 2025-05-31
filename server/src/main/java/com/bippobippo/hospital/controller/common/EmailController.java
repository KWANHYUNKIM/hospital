package com.bippobippo.hospital.controller.common;

import com.bippobippo.hospital.dto.MessageResponse;
import com.bippobippo.hospital.service.common.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

    @PostMapping("/send-verification")
    public ResponseEntity<?> sendVerificationEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("이메일 주소가 필요합니다."));
        }

        try {
            emailService.sendVerificationEmail(email);
            return ResponseEntity.ok(new MessageResponse("인증 코드가 이메일로 전송되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("verificationCode");

        if (email == null || email.isEmpty() || code == null || code.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("이메일과 인증 코드가 필요합니다."));
        }

        try {
            boolean isValid = emailService.verifyEmail(email, code);
            if (isValid) {
                return ResponseEntity.ok(new MessageResponse("이메일 인증이 완료되었습니다."));
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("잘못된 인증 코드입니다."));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
} 