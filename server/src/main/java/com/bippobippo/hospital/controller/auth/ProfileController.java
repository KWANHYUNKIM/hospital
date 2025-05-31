package com.bippobippo.hospital.controller.auth;

import com.bippobippo.hospital.dto.MessageResponse;
import com.bippobippo.hospital.dto.request.user.ProfileUpdateRequest;
import com.bippobippo.hospital.entity.user.User;
import com.bippobippo.hospital.service.user.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class ProfileController {
    private final UserService userService;
    private final ObjectMapper objectMapper;

    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable Integer id, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401).body(new MessageResponse("인증되지 않은 사용자입니다."));
            }

            User user = userService.findById(id);
            if (user == null) {
                return ResponseEntity.status(404).body(new MessageResponse("사용자를 찾을 수 없습니다."));
            }

            List<String> interests = null;
            if (user.getInterests() != null) {
                interests = objectMapper.readValue(user.getInterests(), List.class);
            }

            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("email", user.getEmail());
            userInfo.put("nickname", user.getNickname());
            userInfo.put("interests", interests);
            userInfo.put("profile_image", user.getProfileImage());

            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            log.error("프로필 조회 중 오류 발생", e);
            return ResponseEntity.status(500).body(new MessageResponse("서버 오류가 발생했습니다."));
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Integer id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(value = "nickname", required = false) String nickname,
            @RequestParam(value = "interests", required = false) String interestsJson,
            @RequestParam(value = "current_password", required = false) String currentPassword,
            @RequestParam(value = "new_password", required = false) String newPassword,
            @RequestParam(value = "profile_image", required = false) MultipartFile profileImage) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401).body(new MessageResponse("인증되지 않은 사용자입니다."));
            }

            User currentUser = userService.findByUsername(userDetails.getUsername());
            if (!currentUser.getId().equals(id)) {
                return ResponseEntity.status(403).body(new MessageResponse("자신의 프로필만 수정할 수 있습니다."));
            }

            ProfileUpdateRequest request = new ProfileUpdateRequest();
            request.setNickname(nickname);
            request.setCurrentPassword(currentPassword);
            request.setNewPassword(newPassword);

            if (interestsJson != null && !interestsJson.isEmpty()) {
                try {
                    List<String> interests = objectMapper.readValue(interestsJson, List.class);
                    request.setInterests(interests);
                } catch (Exception e) {
                    log.error("관심사 JSON 파싱 중 오류 발생", e);
                    return ResponseEntity.status(400).body(new MessageResponse("잘못된 관심사 데이터 형식입니다."));
                }
            }

            // 비밀번호 변경이 있는 경우
            if (newPassword != null && !newPassword.isEmpty()) {
                if (!userService.validatePassword(currentUser, currentPassword)) {
                    return ResponseEntity.status(400).body(new MessageResponse("현재 비밀번호가 일치하지 않습니다."));
                }
            }

            User updatedUser = userService.updateProfile(id, request, profileImage);
            
            List<String> interests = null;
            if (updatedUser.getInterests() != null) {
                interests = objectMapper.readValue(updatedUser.getInterests(), List.class);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "프로필이 성공적으로 업데이트되었습니다.");
            
            Map<String, Object> userData = new HashMap<>();
            userData.put("id", updatedUser.getId());
            userData.put("username", updatedUser.getUsername());
            userData.put("email", updatedUser.getEmail());
            userData.put("nickname", updatedUser.getNickname());
            userData.put("interests", interests);
            userData.put("profile_image", updatedUser.getProfileImage());
            
            response.put("user", userData);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("프로필 업데이트 중 오류 발생", e);
            return ResponseEntity.status(500).body(new MessageResponse("서버 오류가 발생했습니다."));
        }
    }
} 