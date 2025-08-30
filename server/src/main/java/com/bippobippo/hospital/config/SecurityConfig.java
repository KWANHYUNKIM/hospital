package com.bippobippo.hospital.config;

import com.bippobippo.hospital.entity.hospital.HospitalOrigin;
import com.bippobippo.hospital.entity.user.User;
import com.bippobippo.hospital.repository.hospital.HospitalOriginRepository;
import com.bippobippo.hospital.repository.user.UserRepository;
import com.bippobippo.hospital.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.http.HttpMethod;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletResponse;


@Slf4j
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserRepository userRepository;
    private final HospitalOriginRepository originRepository;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeRequests(auth -> auth
            // 관리자 전용 API
            .antMatchers("/api/auth/**").permitAll()

            .antMatchers("/api/admin/**").hasRole("ADMIN")

            // 의사 권한 관련 API
            .antMatchers("/api/doctor-approval/request").authenticated()
            .antMatchers("/api/doctor-approval/my-requests").authenticated()
            .antMatchers("/api/doctor-approval/admin/**").hasRole("ADMIN")

            // 채널 API
            .antMatchers(HttpMethod.GET, "/api/channels/**").permitAll()
            .antMatchers("/api/channels/**").hasRole("ADMIN")

            // 뉴스 카테고리 API
            .antMatchers(HttpMethod.GET, "/api/news/categories").permitAll()
            .antMatchers("/api/news/categories/**").hasRole("ADMIN")

            // 게시판 API
            .antMatchers(HttpMethod.GET, "/api/boards/**").permitAll()
            .antMatchers("/api/boards/**").authenticated() // POST, PUT, DELETE 포함

            // 버스 API - 모든 요청 허용 (노선 수집 등)
            .antMatchers("/api/bus/**").permitAll()

            // 영업시간 수정 제안 API - 모든 사용자 허용
            .antMatchers("/api/hospital/suggest-operating-time").permitAll()
            .antMatchers("/api/hospital/suggestions/**").hasRole("ADMIN")

            // 이메일 인증 API - 모든 사용자 허용 (회원가입용)
            .antMatchers("/api/email/**").permitAll()

            // 업로드된 이미지 파일들 - 모든 사용자 접근 허용
            .antMatchers("/uploads/**").permitAll()

            // 기타 모든 API의 GET 요청 허용
            .antMatchers(HttpMethod.GET, "/api/**").permitAll()

            // 나머지는 인증 필요
            .anyRequest().authenticated()
            )
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .deleteCookies("jwt")
                .logoutSuccessHandler((req, res, auth) -> {
                    res.setStatus(HttpServletResponse.SC_OK);
                })
                .permitAll()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));
            return new CustomUserDetails(user);
        };
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 데이터베이스에서 활성화된 출처 목록 가져오기
        List<String> allowedOrigins = originRepository.findAll().stream()
            .filter(HospitalOrigin::getIsActive)
            .map(HospitalOrigin::getOriginUrl)
            .collect(Collectors.toList());
        
        // 개발 환경의 localhost 출처 추가
        String activeProfile = System.getProperty("spring.profiles.active", "dev");
        if ("dev".equals(activeProfile)) {
            allowedOrigins.addAll(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:8081",
                "http://localhost:3002"
            ));
        }
        
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-CSRF-TOKEN",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers",
            "Cookie"
        ));
        configuration.setExposedHeaders(Arrays.asList(
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials",
            "Set-Cookie",
            "X-CSRF-TOKEN"
        ));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
} 