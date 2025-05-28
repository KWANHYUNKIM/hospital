package com.bippobippo.hospital.service;

import com.bippobippo.hospital.dto.RegisterRequest;
import com.bippobippo.hospital.entity.Role;
import com.bippobippo.hospital.entity.User;
import com.bippobippo.hospital.repository.RoleRepository;
import com.bippobippo.hospital.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));
    }

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
        Role userRole = roleRepository.findByRoleName("user")
                .orElseThrow(() -> new RuntimeException("기본 역할을 찾을 수 없습니다."));
        user.getRoles().add(userRole);

        userRepository.save(user);
    }

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

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElse(null);
    }
} 