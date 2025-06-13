package com.bippobippo.hospital.service.auth;

import com.bippobippo.hospital.dto.request.user.LoginRequest;
import com.bippobippo.hospital.dto.request.user.RegisterRequest;
import com.bippobippo.hospital.entity.user.User;
import com.bippobippo.hospital.entity.user.Role;
import com.bippobippo.hospital.repository.user.UserRepository;
import com.bippobippo.hospital.repository.user.RoleRepository;
import com.bippobippo.hospital.repository.common.SocialConfigRepository;
import com.bippobippo.hospital.security.JwtTokenProvider;
import com.bippobippo.hospital.service.common.EmailService;
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
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.http.HttpStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.client.HttpClientErrorException;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final SocialConfigRepository socialConfigRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RestTemplate restTemplate;
    private final EmailService emailService;

    public void register(RegisterRequest request) {
        // 아이디 중복 체크
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("이미 사용 중인 아이디입니다.");
        }

        // 이메일 중복 체크
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }

        // 닉네임 중복 체크
        if (userRepository.existsByNickname(request.getNickname())) {
            throw new RuntimeException("이미 사용 중인 닉네임입니다.");
        }

        // 비밀번호 해시화
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // 사용자 생성
        User user = User.builder()
                .username(request.getUsername())
                .password(hashedPassword)
                .email(request.getEmail())
                .nickname(request.getNickname())
                .interests(request.getInterests())
                .isEmailVerified(request.getIsEmailVerified())
                .socialId(request.getSocialId())
                .socialProvider(request.getSocialProvider() != null ? 
                    User.SocialProvider.valueOf(request.getSocialProvider().toUpperCase()) : null)
                .build();

        // 사용자 저장
        User savedUser = userRepository.save(user);

        // 기본 사용자 역할 부여
        Role userRole = roleRepository.findByRoleName("USER")
                .orElseThrow(() -> new RuntimeException("기본 역할을 찾을 수 없습니다."));
        
        user.getRoles().add(userRole);
        userRepository.save(user);
    }

    @Transactional
    public Map<String, Object> login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("아이디 또는 비밀번호가 일치하지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }

        // 인증 객체 생성
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // JWT 토큰 생성
        String token = jwtTokenProvider.createToken(authentication);

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("id", user.getId());
        result.put("username", user.getUsername());
        result.put("email", user.getEmail());
        result.put("role", user.getRoles().stream()
                .findFirst()
                .map(role -> role.getRoleName())
                .orElse("user"));

        return result;
    }

    @Transactional
    public Map<String, Object> handleNaverCallback(String code, String state) {
        var config = socialConfigRepository.findByProviderAndIsActive("naver", true)
                .orElseThrow(() -> new RuntimeException("네이버 로그인 설정을 찾을 수 없습니다."));

        // 액세스 토큰 요청
        MultiValueMap<String, String> tokenParams = new LinkedMultiValueMap<>();
        tokenParams.add("grant_type", "authorization_code");
        tokenParams.add("client_id", config.getClientId());
        tokenParams.add("client_secret", config.getClientSecret());
        tokenParams.add("code", code);
        tokenParams.add("state", state);

        ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(
            "https://nid.naver.com/oauth2.0/token",
            tokenParams,
            Map.class
        );

        String accessToken = (String) tokenResponse.getBody().get("access_token");

        // 사용자 정보 요청
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> userResponse = restTemplate.exchange(
            "https://openapi.naver.com/v1/nid/me",
            HttpMethod.GET,
            entity,
            Map.class
        );

        Map<String, Object> response = (Map<String, Object>) userResponse.getBody().get("response");
        String naverId = (String) response.get("id");
        String email = (String) response.get("email");
        String nickname = (String) response.get("name");

        // 기존 사용자 확인
        var existingUser = userRepository.findBySocialIdAndSocialProvider(naverId, User.SocialProvider.naver)
                .or(() -> userRepository.findByEmail(email));

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // 인증 객체 생성
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getUsername(),
                null,
                user.getAuthorities()
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // JWT 토큰 생성
            String token = jwtTokenProvider.createToken(authentication);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("isNewUser", false);
            result.put("token", token);
            result.put("user", Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "nickname", user.getNickname(),
                "role", user.getRoles().stream()
                        .findFirst()
                        .map(role -> role.getRoleName())
                        .orElse("user")
            ));
            return result;
        } else {
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("isNewUser", true);
            result.put("email", email);
            result.put("nickname", nickname);
            result.put("social_id", naverId);
            result.put("provider", "naver");
            return result;
        }
    }

    @Transactional
    public Map<String, Object> handleKakaoCallback(String code) {
        try {
            log.info("카카오 콜백 처리 시작 - code: {}", code);
            
            var config = socialConfigRepository.findByProviderAndIsActive("kakao", true)
                    .orElseThrow(() -> new RuntimeException("카카오 로그인 설정을 찾을 수 없습니다."));
            log.info("카카오 설정 로드 완료 - clientId: {}", config.getClientId());

            // 액세스 토큰 요청
            MultiValueMap<String, String> tokenParams = new LinkedMultiValueMap<>();
            tokenParams.add("grant_type", "authorization_code");
            tokenParams.add("client_id", config.getClientId());
            tokenParams.add("redirect_uri", config.getRedirectUri());
            tokenParams.add("code", code);

            log.info("카카오 액세스 토큰 요청 시작");
            ResponseEntity<Map> tokenResponse;
            try {
                tokenResponse = restTemplate.postForEntity(
                    "https://kauth.kakao.com/oauth/token",
                    tokenParams,
                    Map.class
                );
            } catch (HttpClientErrorException e) {
                log.error("카카오 액세스 토큰 요청 실패: {}", e.getResponseBodyAsString());
                if (e.getStatusCode() == HttpStatus.BAD_REQUEST) {
                    Map<String, Object> errorResponse = new ObjectMapper().readValue(
                        e.getResponseBodyAsString(),
                        Map.class
                    );
                    String errorCode = (String) errorResponse.get("error");
                    String errorDescription = (String) errorResponse.get("error_description");
                    
                    if ("invalid_grant".equals(errorCode)) {
                        throw new RuntimeException("인증 코드가 만료되었거나 이미 사용되었습니다. 다시 로그인해주세요.");
                    } else if ("invalid_request".equals(errorCode)) {
                        throw new RuntimeException("잘못된 요청입니다: " + errorDescription);
                    } else {
                        throw new RuntimeException("카카오 로그인 처리 중 오류가 발생했습니다: " + errorDescription);
                    }
                }
                throw new RuntimeException("카카오 로그인 처리 중 오류가 발생했습니다.");
            }
            log.info("카카오 액세스 토큰 응답 수신");

            String accessToken = (String) tokenResponse.getBody().get("access_token");
            if (accessToken == null) {
                log.error("카카오 액세스 토큰이 null입니다. 응답: {}", tokenResponse.getBody());
                throw new RuntimeException("카카오 액세스 토큰을 받지 못했습니다.");
            }

            // 사용자 정보 요청
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            HttpEntity<?> entity = new HttpEntity<>(headers);

            log.info("카카오 사용자 정보 요청 시작");
            ResponseEntity<Map> userResponse = restTemplate.exchange(
                "https://kapi.kakao.com/v2/user/me",
                HttpMethod.GET,
                entity,
                Map.class
            );
            log.info("카카오 사용자 정보 응답 수신");

            Map<String, Object> responseBody = userResponse.getBody();
            if (responseBody == null) {
                log.error("카카오 사용자 정보 응답이 null입니다.");
                throw new RuntimeException("카카오 사용자 정보를 가져오는데 실패했습니다.");
            }
            log.info("카카오 사용자 정보: {}", responseBody);

            String kakaoId = responseBody.get("id").toString();
            Map<String, Object> kakaoAccount = (Map<String, Object>) responseBody.get("kakao_account");
            Map<String, Object> properties = (Map<String, Object>) responseBody.get("properties");

            if (kakaoAccount == null || properties == null) {
                log.error("카카오 계정 정보 누락 - kakaoAccount: {}, properties: {}", kakaoAccount, properties);
                throw new RuntimeException("카카오 계정 정보가 없습니다. 카카오 로그인 시 이메일과 프로필 정보 제공에 동의해주세요.");
            }

            String email = (String) kakaoAccount.get("email");
            String nickname = (String) properties.get("nickname");
            String profileImage = (String) properties.get("profile_image");

            if (email == null) {
                log.error("카카오 이메일 정보 누락");
                throw new RuntimeException("카카오 계정의 이메일 정보가 없습니다. 카카오 로그인 시 이메일 제공에 동의해주세요.");
            }

            // 기존 사용자 확인
            var existingUser = userRepository.findBySocialIdAndSocialProvider(kakaoId, User.SocialProvider.kakao)
                    .or(() -> userRepository.findByEmail(email));

            if (existingUser.isPresent()) {
                User user = existingUser.get();
                // 인증 객체 생성
                Authentication authentication = new UsernamePasswordAuthenticationToken(
                    user.getUsername(),
                    null,
                    user.getAuthorities()
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);

                // JWT 토큰 생성
                String token = jwtTokenProvider.createToken(authentication);

                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("isNewUser", false);
                result.put("token", token);
                result.put("user", Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "nickname", user.getNickname(),
                    "role", user.getRoles().stream()
                            .findFirst()
                            .map(role -> role.getRoleName())
                            .orElse("user")
                ));
                return result;
            } else {
                Map<String, Object> result = new HashMap<>();
                result.put("success", true);
                result.put("isNewUser", true);
                result.put("email", email);
                result.put("nickname", nickname);
                result.put("profile_image", profileImage);
                result.put("social_id", kakaoId);
                result.put("provider", "kakao");
                return result;
            }
        } catch (Exception e) {
            log.error("카카오 콜백 처리 중 오류 발생", e);
            throw new RuntimeException("카카오 콜백 처리 중 오류가 발생했습니다.");
        }
    }

    @Transactional
    public Map<String, Object> handleGoogleCallback(String code) {
        var config = socialConfigRepository.findByProviderAndIsActive("google", true)
                .orElseThrow(() -> new RuntimeException("구글 로그인 설정을 찾을 수 없습니다."));

        // 액세스 토큰 요청
        MultiValueMap<String, String> tokenParams = new LinkedMultiValueMap<>();
        tokenParams.add("code", code);
        tokenParams.add("client_id", config.getClientId());
        tokenParams.add("client_secret", config.getClientSecret());
        tokenParams.add("redirect_uri", config.getRedirectUri());
        tokenParams.add("grant_type", "authorization_code");

        ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(
            "https://oauth2.googleapis.com/token",
            tokenParams,
            Map.class
        );

        String accessToken = (String) tokenResponse.getBody().get("access_token");

        // 사용자 정보 요청
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> userResponse = restTemplate.exchange(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            HttpMethod.GET,
            entity,
            Map.class
        );

        String googleId = (String) userResponse.getBody().get("id");
        String email = (String) userResponse.getBody().get("email");
        String name = (String) userResponse.getBody().get("name");
        String picture = (String) userResponse.getBody().get("picture");

        // 기존 사용자 확인
        var existingUser = userRepository.findBySocialIdAndSocialProvider(googleId, User.SocialProvider.google)
                .or(() -> userRepository.findByEmail(email));

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // 인증 객체 생성
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                user.getUsername(),
                null,
                user.getAuthorities()
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // JWT 토큰 생성
            String token = jwtTokenProvider.createToken(authentication);

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("isNewUser", false);
            result.put("token", token);
            result.put("user", Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "nickname", user.getNickname(),
                "role", user.getRoles().stream()
                        .findFirst()
                        .map(role -> role.getRoleName())
                        .orElse("user")
            ));
            return result;
        } else {
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("isNewUser", true);
            result.put("email", email);
            result.put("nickname", name);
            result.put("profile_image", picture);
            result.put("social_id", googleId);
            result.put("provider", "google");
            result.put("name", name);
            result.put("given_name", userResponse.getBody().get("given_name"));
            return result;
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSocialConfig(String provider) {
        var config = socialConfigRepository.findByProviderAndIsActive(provider, true)
                .orElseThrow(() -> new RuntimeException("소셜 로그인 설정을 찾을 수 없습니다."));

        Map<String, Object> result = new HashMap<>();
        result.put("client_id", config.getClientId());
        result.put("redirect_uri", config.getRedirectUri());
        return result;
    }

    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return null;
        }
        
        return userRepository.findByUsername(authentication.getName())
                .orElse(null);
    }

    @Transactional
    public void sendPasswordResetEmail(String email) {
        // 사용자 확인
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("등록되지 않은 이메일입니다."));
        
        // 비밀번호 재설정 토큰 생성 (UUID 사용)
        String resetToken = UUID.randomUUID().toString();
        
        // 토큰과 만료 시간을 DB에 저장 (1시간 후 만료)
        user.setResetToken(resetToken);
        LocalDateTime expiryTime = LocalDateTime.now(ZoneId.of("Asia/Seoul")).plusHours(1);
        user.setResetTokenExpiry(expiryTime);
        userRepository.save(user);
        
        log.info("비밀번호 재설정 토큰 생성: 이메일={}, 토큰={}, 만료시간={}", email, resetToken, expiryTime);
        
        try {
            // 실제 이메일 전송
            emailService.sendPasswordResetEmail(email, resetToken);
            log.info("비밀번호 재설정 이메일 전송 완료: {}", email);
        } catch (Exception e) {
            log.error("비밀번호 재설정 이메일 전송 실패: {}", email, e);
            throw new RuntimeException("이메일 전송 중 오류가 발생했습니다.", e);
        }
    }

    @Transactional(readOnly = true)
    public boolean verifyResetToken(String token) {
        User user = userRepository.findByResetToken(token).orElse(null);
        if (user == null) {
            log.warn("토큰 검증 실패: 토큰을 찾을 수 없음 - {}", token);
            return false;
        }
        
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        log.info("토큰 검증: 토큰={}, 현재시간={}, 만료시간={}", token, now, user.getResetTokenExpiry());
        
        // 토큰 만료 시간 확인
        boolean isValid = user.getResetTokenExpiry() != null && 
               user.getResetTokenExpiry().isAfter(now);
        
        log.info("토큰 검증 결과: {}", isValid);
        return isValid;
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("유효하지 않은 토큰입니다."));
        
        // 토큰 만료 시간 확인
        if (user.getResetTokenExpiry() == null || 
            user.getResetTokenExpiry().isBefore(LocalDateTime.now(ZoneId.of("Asia/Seoul")))) {
            throw new RuntimeException("만료된 토큰입니다.");
        }
        
        // 비밀번호 변경
        user.setPassword(passwordEncoder.encode(newPassword));
        
        // 토큰 제거 (재사용 방지)
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        
        userRepository.save(user);
        log.info("비밀번호 재설정 완료: {}", user.getEmail());
    }
} 