package com.bippobippo.hospital.controller.event;

import com.bippobippo.hospital.dto.request.event.ClickEventRequest;
import com.bippobippo.hospital.dto.request.event.DwellTimeRequest;
import com.bippobippo.hospital.dto.request.event.PageViewRequest;
import com.bippobippo.hospital.dto.request.event.SearchEventRequest;
import com.bippobippo.hospital.dto.response.event.AnalyticsResponse;
import com.bippobippo.hospital.dto.response.event.SearchAnalyticsResponse;
import com.bippobippo.hospital.dto.response.event.UserProfileResponse;
import com.bippobippo.hospital.service.event.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * 검색 이벤트 수집
     */
    @PostMapping("/search-event")
    public ResponseEntity<AnalyticsResponse> collectSearchEvent(
            @Valid @RequestBody SearchEventRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            // IP 주소 자동 설정
            if (request.getIpAddress() == null) {
                request.setIpAddress(getClientIpAddress(httpRequest));
            }
            
            // User-Agent 자동 설정
            if (request.getUserAgent() == null) {
                request.setUserAgent(httpRequest.getHeader("User-Agent"));
            }

            log.info("검색 이벤트 수집 요청: userId={}, query={}", request.getUserId(), request.getSearchQuery());
            AnalyticsResponse response = analyticsService.collectSearchEvent(request);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("검색 이벤트 수집 실패: error={}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                AnalyticsResponse.error("검색 이벤트 수집 중 오류가 발생했습니다: " + e.getMessage())
            );
        }
    }

    /**
     * 클릭 이벤트 수집
     */
    @PostMapping("/click-event")
    public ResponseEntity<AnalyticsResponse> collectClickEvent(
            @Valid @RequestBody ClickEventRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            // IP 주소 자동 설정
            if (request.getIpAddress() == null) {
                request.setIpAddress(getClientIpAddress(httpRequest));
            }
            
            // User-Agent 자동 설정
            if (request.getUserAgent() == null) {
                request.setUserAgent(httpRequest.getHeader("User-Agent"));
            }

            log.info("클릭 이벤트 수집 요청: userId={}, hospitalId={}", request.getUserId(), request.getHospitalId());
            AnalyticsResponse response = analyticsService.collectClickEvent(request);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("클릭 이벤트 수집 실패: error={}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                AnalyticsResponse.error("클릭 이벤트 수집 중 오류가 발생했습니다: " + e.getMessage())
            );
        }
    }

    /**
     * 체류 시간 이벤트 수집
     */
    @PostMapping("/dwell-time")
    public ResponseEntity<AnalyticsResponse> collectDwellTimeEvent(
            @Valid @RequestBody DwellTimeRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            // IP 주소 자동 설정
            if (request.getIpAddress() == null) {
                request.setIpAddress(getClientIpAddress(httpRequest));
            }
            
            // User-Agent 자동 설정
            if (request.getUserAgent() == null) {
                request.setUserAgent(httpRequest.getHeader("User-Agent"));
            }

            log.info("체류 시간 이벤트 수집 요청: userId={}, pageType={}", request.getUserId(), request.getPageType());
            AnalyticsResponse response = analyticsService.collectDwellTimeEvent(request);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("체류 시간 이벤트 수집 실패: error={}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                AnalyticsResponse.error("체류 시간 이벤트 수집 중 오류가 발생했습니다: " + e.getMessage())
            );
        }
    }

    /**
     * 페이지 뷰 이벤트 수집
     */
    @PostMapping("/page-view")
    public ResponseEntity<AnalyticsResponse> collectPageViewEvent(
            @Valid @RequestBody PageViewRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            // IP 주소 자동 설정
            if (request.getIpAddress() == null) {
                request.setIpAddress(getClientIpAddress(httpRequest));
            }
            
            // User-Agent 자동 설정
            if (request.getUserAgent() == null) {
                request.setUserAgent(httpRequest.getHeader("User-Agent"));
            }

            log.info("페이지 뷰 이벤트 수집 요청: userId={}, pageType={}", request.getUserId(), request.getPageType());
            AnalyticsResponse response = analyticsService.collectPageViewEvent(request);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("페이지 뷰 이벤트 수집 실패: error={}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                AnalyticsResponse.error("페이지 뷰 이벤트 수집 중 오류가 발생했습니다: " + e.getMessage())
            );
        }
    }

    /**
     * 사용자 프로파일 조회
     */
    @GetMapping("/user-profile/{userId}")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable String userId) {
        try {
            log.info("사용자 프로파일 조회 요청: userId={}", userId);
            UserProfileResponse response = analyticsService.getUserProfile(userId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("사용자 프로파일 조회 실패: userId={}, error={}", userId, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 검색 분석 데이터 조회
     */
    @GetMapping("/search-analytics/{userId}")
    public ResponseEntity<SearchAnalyticsResponse> getSearchAnalytics(@PathVariable String userId) {
        try {
            log.info("검색 분석 데이터 조회 요청: userId={}", userId);
            SearchAnalyticsResponse response = analyticsService.getSearchAnalytics(userId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("검색 분석 데이터 조회 실패: userId={}, error={}", userId, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 인기 검색어 조회
     */
    @GetMapping("/popular-searches")
    public ResponseEntity<AnalyticsResponse> getPopularSearches() {
        try {
            log.info("인기 검색어 조회 요청");
            AnalyticsResponse response = analyticsService.getPopularSearches();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("인기 검색어 조회 실패: error={}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                AnalyticsResponse.error("인기 검색어 조회 중 오류가 발생했습니다: " + e.getMessage())
            );
        }
    }

    /**
     * 인기 병원 조회
     */
    @GetMapping("/popular-hospitals")
    public ResponseEntity<AnalyticsResponse> getPopularHospitals() {
        try {
            log.info("인기 병원 조회 요청");
            AnalyticsResponse response = analyticsService.getPopularHospitals();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("인기 병원 조회 실패: error={}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                AnalyticsResponse.error("인기 병원 조회 중 오류가 발생했습니다: " + e.getMessage())
            );
        }
    }

    /**
     * 사용자 프로파일 업데이트
     */
    @PutMapping("/user-profile/{userId}")
    public ResponseEntity<AnalyticsResponse> updateUserProfile(@PathVariable String userId) {
        try {
            log.info("사용자 프로파일 업데이트 요청: userId={}", userId);
            AnalyticsResponse response = analyticsService.updateUserProfile(userId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("사용자 프로파일 업데이트 실패: userId={}, error={}", userId, e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                AnalyticsResponse.error("사용자 프로파일 업데이트 중 오류가 발생했습니다: " + e.getMessage())
            );
        }
    }

    /**
     * 이벤트 통계 조회
     */
    @GetMapping("/statistics/{userId}")
    public ResponseEntity<AnalyticsResponse> getEventStatistics(
            @PathVariable String userId,
            @RequestParam String eventType,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        
        try {
            log.info("이벤트 통계 조회 요청: userId={}, eventType={}", userId, eventType);
            AnalyticsResponse response = analyticsService.getEventStatistics(userId, eventType, startDate, endDate);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("이벤트 통계 조회 실패: userId={}, error={}", userId, e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                AnalyticsResponse.error("이벤트 통계 조회 중 오류가 발생했습니다: " + e.getMessage())
            );
        }
    }

    /**
     * 헬스 체크
     */
    @GetMapping("/health")
    public ResponseEntity<AnalyticsResponse> healthCheck() {
        return ResponseEntity.ok(AnalyticsResponse.success("Analytics Service is running", null));
    }

    /**
     * 클라이언트 IP 주소 추출
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0];
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
} 