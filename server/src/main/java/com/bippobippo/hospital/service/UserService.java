package com.bippobippo.hospital.service;

import com.bippobippo.hospital.dto.request.RegisterRequest;
import com.bippobippo.hospital.dto.request.ProfileUpdateRequest;
import com.bippobippo.hospital.entity.Role;
import com.bippobippo.hospital.entity.User;
import com.bippobippo.hospital.repository.RoleRepository;
import com.bippobippo.hospital.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface UserService extends UserDetailsService {
    void register(RegisterRequest request);
    User updateUser(Integer id, User userDetails);
    User findByUsername(String username);
    User findById(Integer id);
    boolean validatePassword(User user, String currentPassword);
    User updateProfile(Integer userId, ProfileUpdateRequest request, MultipartFile profileImage);
    boolean existsByEmail(String email);
} 