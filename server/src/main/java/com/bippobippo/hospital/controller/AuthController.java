package com.bippobippo.hospital.controller;

import com.bippobippo.hospital.dto.request.LoginRequest;
import com.bippobippo.hospital.dto.request.RegisterRequest;
import com.bippobippo.hospital.dto.MessageResponse;
import com.bippobippo.hospital.dto.request.ProfileUpdateRequest;
import com.bippobippo.hospital.entity.User;
import com.bippobippo.hospital.service.AuthService;
import com.bippobippo.hospital.service.UserService;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(new MessageResponse("회원가입이 완료되었습니다."));
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
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(HttpServletResponse response) {
        // JWT 쿠키 제거
        Cookie jwtCookie = new Cookie("jwt", "");
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false); // 개발 환경에서는 false
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0);
        response.addCookie(jwtCookie);

        // SecurityContext 클리어
        SecurityContextHolder.clearContext();

        // CORS 헤더 설정
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:8081");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        response.setHeader("Set-Cookie", "jwt=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");

        // 캐시 제어 헤더 추가
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");

        return ResponseEntity.ok(new MessageResponse("로그아웃되었습니다."));
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
            userInfo.put("profile_image", user.getProfileImage());
            userInfo.put("role", user.getRoles().stream()
                    .findFirst()
                    .map(role -> role.getRoleName())
                    .orElse("user"));
            
            response.put("user", userInfo);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MessageResponse("서버 오류가 발생했습니다."));
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        try {
            boolean exists = userService.existsByEmail(email);
            return ResponseEntity.ok(Map.of(
                "exists", exists,
                "message", exists ? "이미 가입된 이메일입니다." : "사용 가능한 이메일입니다."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MessageResponse("서버 오류가 발생했습니다."));
        }
    }

    @GetMapping("/naver/start")
    public ResponseEntity<?> startNaverLogin(HttpServletResponse response) {
        try {
            Map<String, Object> result = authService.startNaverLogin();
            
            // state를 쿠키에 저장
            Cookie stateCookie = new Cookie("naver_oauth_state", (String) result.get("state"));
            stateCookie.setHttpOnly(true);
            stateCookie.setSecure(false);
            stateCookie.setPath("/");
            stateCookie.setMaxAge(300); // 5분
            response.addCookie(stateCookie);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MessageResponse("네이버 로그인 시작 중 오류가 발생했습니다."));
        }
    }

    @PostMapping("/naver/callback")
    public ResponseEntity<?> handleNaverCallback(@RequestBody Map<String, String> request, HttpServletResponse response) {
        try {
            String code = request.get("code");
            String state = request.get("state");
            
            if (code == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("인증 코드가 필요합니다."));
            }

            Map<String, Object> result = authService.handleNaverCallback(code, state);
            
            // state 쿠키 제거
            Cookie stateCookie = new Cookie("naver_oauth_state", "");
            stateCookie.setHttpOnly(true);
            stateCookie.setSecure(false);
            stateCookie.setPath("/");
            stateCookie.setMaxAge(0);
            response.addCookie(stateCookie);

            // JWT 토큰을 쿠키로 저장
            if (result.get("token") != null) {
                Cookie jwtCookie = new Cookie("jwt", (String) result.get("token"));
                jwtCookie.setHttpOnly(true);
                jwtCookie.setSecure(false);
                jwtCookie.setPath("/");
                jwtCookie.setMaxAge(24 * 60 * 60); // 24시간
                response.addCookie(jwtCookie);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MessageResponse("네이버 로그인 처리 중 오류가 발생했습니다."));
        }
    }

    @PostMapping("/kakao/callback")
    public ResponseEntity<?> handleKakaoCallback(@RequestBody Map<String, String> request, HttpServletResponse response) {
        try {
            String code = request.get("code");
            if (code == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("인증 코드가 필요합니다."));
            }

            Map<String, Object> result = authService.handleKakaoCallback(code);

            // JWT 토큰을 쿠키로 저장
            if (result.get("token") != null) {
                Cookie jwtCookie = new Cookie("jwt", (String) result.get("token"));
                jwtCookie.setHttpOnly(true);
                jwtCookie.setSecure(false);
                jwtCookie.setPath("/");
                jwtCookie.setMaxAge(24 * 60 * 60); // 24시간
                response.addCookie(jwtCookie);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MessageResponse("카카오 로그인 처리 중 오류가 발생했습니다."));
        }
    }

    @PostMapping("/google/callback")
    public ResponseEntity<?> handleGoogleCallback(@RequestBody Map<String, String> request, HttpServletResponse response) {
        try {
            String code = request.get("code");
            if (code == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("인증 코드가 필요합니다."));
            }

            Map<String, Object> result = authService.handleGoogleCallback(code);

            // JWT 토큰을 쿠키로 저장
            if (result.get("token") != null) {
                Cookie jwtCookie = new Cookie("jwt", (String) result.get("token"));
                jwtCookie.setHttpOnly(true);
                jwtCookie.setSecure(false);
                jwtCookie.setPath("/");
                jwtCookie.setMaxAge(24 * 60 * 60); // 24시간
                response.addCookie(jwtCookie);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MessageResponse("구글 로그인 처리 중 오류가 발생했습니다."));
        }
    }

    @GetMapping("/social-config/{provider}")
    public ResponseEntity<?> getSocialConfig(@PathVariable String provider) {
        try {
            Map<String, Object> config = authService.getSocialConfig(provider);
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MessageResponse("소셜 로그인 설정 조회 중 오류가 발생했습니다."));
        }
    }
} 