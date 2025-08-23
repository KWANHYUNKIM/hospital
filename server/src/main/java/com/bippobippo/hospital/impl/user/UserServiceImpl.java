package com.bippobippo.hospital.impl.user;

import com.bippobippo.hospital.service.user.UserService;
// import com.bippobippo.hospital.service.common.GoogleCloudStorageService;
import com.bippobippo.hospital.dto.request.user.RegisterRequest;
import com.bippobippo.hospital.dto.request.user.ProfileUpdateRequest;
import com.bippobippo.hospital.entity.user.Role;
import com.bippobippo.hospital.entity.user.User;
import com.bippobippo.hospital.repository.user.RoleRepository;
import com.bippobippo.hospital.repository.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    // private final GoogleCloudStorageService gcsService;
    private final ObjectMapper objectMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));
    }

    @Override
    @Transactional
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

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setNickname(request.getNickname());
        user.setInterests(request.getInterests());
        user.setSocialId(request.getSocialId());
        if (request.getSocialProvider() != null) {
            user.setSocialProvider(User.SocialProvider.valueOf(request.getSocialProvider().toLowerCase()));
        }
        user.setIsEmailVerified(request.getIsEmailVerified());

        // 기본 사용자 역할 부여
        Role userRole = roleRepository.findByRoleName("USER")
                .orElseThrow(() -> new RuntimeException("기본 역할을 찾을 수 없습니다."));
        user.getRoles().add(userRole);

        userRepository.save(user);
    }

    @Override
    @Transactional
    public User updateUser(Integer id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (userDetails.getEmail() != null) {
            user.setEmail(userDetails.getEmail());
        }
        if (userDetails.getNickname() != null) {
            user.setNickname(userDetails.getNickname());
        }
        if (userDetails.getInterests() != null) {
            user.setInterests(userDetails.getInterests());
        }
        if (userDetails.getProfileImage() != null) {
            user.setProfileImage(userDetails.getProfileImage());
        }
        if (userDetails.getSocialId() != null) {
            user.setSocialId(userDetails.getSocialId());
        }
        if (userDetails.getSocialProvider() != null) {
            user.setSocialProvider(userDetails.getSocialProvider());
        }

        return userRepository.save(user);
    }

    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElse(null);
    }

    @Override
    public User findById(Integer id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public boolean validatePassword(User user, String currentPassword) {
        return passwordEncoder.matches(currentPassword, user.getPassword());
    }

    @Override
    @Transactional
    public User updateProfile(Integer userId, ProfileUpdateRequest request, MultipartFile profileImage) {
        try {
            log.info("프로필 업데이트 시작 - userId: {}, request: {}, profileImage: {}", 
                userId, request, profileImage != null ? profileImage.getOriginalFilename() : "null");

            User user = findById(userId);
            if (user == null) {
                log.error("사용자를 찾을 수 없음 - userId: {}", userId);
                throw new RuntimeException("사용자를 찾을 수 없습니다.");
            }

            // 닉네임 업데이트
            if (request.getNickname() != null) {
                log.info("닉네임 업데이트 - 기존: {}, 새로운: {}", user.getNickname(), request.getNickname());
                user.setNickname(request.getNickname());
            }

            // 관심사 업데이트
            if (request.getInterests() != null) {
                try {
                    log.info("관심사 업데이트 - 기존: {}, 새로운: {}", user.getInterests(), request.getInterests());
                    String interestsJson = objectMapper.writeValueAsString(request.getInterests());
                    user.setInterests(interestsJson);
                } catch (IOException e) {
                    log.error("관심사 JSON 변환 중 오류 발생", e);
                    throw new RuntimeException("관심사 업데이트 중 오류가 발생했습니다.", e);
                }
            }

            // 비밀번호 업데이트
            if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
                log.info("비밀번호 업데이트");
                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            }

            // 프로필 이미지 업데이트
            if (profileImage != null && !profileImage.isEmpty()) {
                try {
                    log.info("프로필 이미지 업데이트 - 파일명: {}", profileImage.getOriginalFilename());
                    // Google Cloud Storage 비활성화로 인해 더미 URL 반환
                    String imageUrl = "storage_disabled_" + profileImage.getOriginalFilename();
                    user.setProfileImage(imageUrl);
                    log.warn("Google Cloud Storage가 비활성화되어 더미 URL을 사용합니다: {}", imageUrl);
                } catch (RuntimeException e) {
                    log.error("프로필 이미지 업로드 중 오류 발생", e);
                    throw new RuntimeException("프로필 이미지 업로드 중 오류가 발생했습니다.", e);
                }
            }

            User savedUser = userRepository.save(user);
            log.info("프로필 업데이트 완료 - userId: {}", userId);
            return savedUser;
        } catch (Exception e) {
            log.error("프로필 업데이트 중 예외 발생", e);
            throw e;
        }
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
} 