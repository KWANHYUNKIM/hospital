package com.bippobippo.hospital.repository.user;

import com.bippobippo.hospital.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
    Optional<User> findBySocialIdAndSocialProvider(String socialId, User.SocialProvider socialProvider);
    
    Optional<User> findByNickname(String nickname);
    boolean existsByNickname(String nickname);
} 