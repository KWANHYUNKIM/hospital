package com.bippobippo.hospital.service;

import com.bippobippo.hospital.dto.LoginRequest;
import com.bippobippo.hospital.dto.RegisterRequest;
import com.bippobippo.hospital.entity.User;
import com.bippobippo.hospital.repository.UserRepository;
import com.bippobippo.hospital.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("이미 사용 중인 아이디입니다.");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setNickname(request.getNickname());
        user.setInterests(request.getInterests());
        user.setIsEmailVerified(false);
        user.setSocialId(request.getSocialId());
        user.setSocialProvider(request.getSocialProvider() != null ? 
            User.SocialProvider.valueOf(request.getSocialProvider().toLowerCase()) : null);

        userRepository.save(user);
    }

    @Transactional
    public Map<String, Object> login(LoginRequest request) {
        try {
            // 인증 시도
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getUsername(),
                    request.getPassword()
                )
            );

            // 인증 성공 시 SecurityContext에 저장
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // JWT 토큰 생성
            String token = jwtTokenProvider.createToken(authentication);

            // 응답 데이터 구성
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("username", request.getUsername());
            
            return response;

        } catch (Exception e) {
            log.error("로그인 실패: {}", e.getMessage());
            throw new RuntimeException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }
    }

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UsernameNotFoundException("인증되지 않은 사용자입니다.");
        }
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + authentication.getName()));
    }
} 