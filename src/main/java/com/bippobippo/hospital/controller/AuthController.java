package com.bippobippo.hospital.controller;

import com.bippobippo.hospital.dto.LoginRequest;
import com.bippobippo.hospital.dto.RegisterRequest;
import com.bippobippo.hospital.dto.MessageResponse;
import com.bippobippo.hospital.entity.User;
import com.bippobippo.hospital.service.AuthService;
import com.bippobippo.hospital.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        try {
            Map<String, Object> result = authService.login(request);
            
            // JWT 토큰을 쿠키로 저장
            Cookie jwtCookie = new Cookie("jwt", (String) result.get("token"));
            jwtCookie.setHttpOnly(true);
            jwtCookie.setSecure(false); // 개발 환경에서는 false
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge(24 * 60 * 60); // 24시간
            response.addCookie(jwtCookie);

            // 응답 데이터 구성
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("message", "로그인 성공");
            responseData.put("user", result);

            return ResponseEntity.ok(responseData);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/check-auth")
    public ResponseEntity<?> checkAuth(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401).body(new MessageResponse("인증되지 않은 사용자입니다."));
            }

            User user = userService.findByUsername(userDetails.getUsername());
            if (user == null) {
                return ResponseEntity.status(404).body(new MessageResponse("사용자를 찾을 수 없습니다."));
            }

            Map<String, Object> response = new HashMap<>();
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("role", user.getRoles().stream()
                    .findFirst()
                    .map(role -> role.getRoleName())
                    .orElse("user"));
            userInfo.put("profile_image", user.getProfileImage());
            
            response.put("user", userInfo);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MessageResponse("서버 오류가 발생했습니다."));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        Cookie jwtCookie = new Cookie("jwt", null);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0);
        response.addCookie(jwtCookie);

        return ResponseEntity.ok().build();
    }
} 