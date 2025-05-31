package com.bippobippo.hospital.service.user;

import com.bippobippo.hospital.dto.request.user.RegisterRequest;
import com.bippobippo.hospital.dto.request.user.ProfileUpdateRequest;
import com.bippobippo.hospital.entity.user.User;
import org.springframework.security.core.userdetails.UserDetailsService;

import org.springframework.web.multipart.MultipartFile;

public interface UserService extends UserDetailsService {
    void register(RegisterRequest request);
    User updateUser(Integer id, User userDetails);
    User findByUsername(String username);
    User findById(Integer id);
    boolean validatePassword(User user, String currentPassword);
    User updateProfile(Integer userId, ProfileUpdateRequest request, MultipartFile profileImage);
    boolean existsByEmail(String email);
} 