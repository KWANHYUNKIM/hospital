package com.bippobippo.hospital.service.event.impl;

import com.bippobippo.hospital.dto.request.event.ClickEventRequest;
import com.bippobippo.hospital.dto.request.event.DwellTimeRequest;
import com.bippobippo.hospital.dto.request.event.PageViewRequest;
import com.bippobippo.hospital.dto.request.event.SearchEventRequest;
import com.bippobippo.hospital.dto.response.event.AnalyticsResponse;
import com.bippobippo.hospital.dto.response.event.SearchAnalyticsResponse;
import com.bippobippo.hospital.dto.response.event.UserProfileResponse;
import com.bippobippo.hospital.model.event.*;
import com.bippobippo.hospital.repository.event.*;
import com.bippobippo.hospital.service.event.AnalyticsService;
import com.bippobippo.hospital.service.event.UserProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final UserBehaviorEventRepository userBehaviorEventRepository;
    private final SearchHistoryRepository searchHistoryRepository;
    private final ClickPatternRepository clickPatternRepository;
    private final DwellTimeRepository dwellTimeRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserProfileService userProfileService;

    @Override
    @Transactional
    public AnalyticsResponse collectSearchEvent(SearchEventRequest request) {
        try {
            log.info("검색 이벤트 수집 시작: userId={}, query={}", request.getUserId(), request.getSearchQuery());

            // 1. UserBehaviorEvent 저장
            UserBehaviorEvent behaviorEvent = UserBehaviorEvent.builder()
                    .userId(request.getUserId())
                    .eventType("SEARCH")
                    .pageType("SEARCH_RESULT")
                    .searchQuery(request.getSearchQuery())
                    .searchResultsCount(request.getSearchResultsCount())
                    .userAgent(request.getUserAgent())
                    .ipAddress(request.getIpAddress())
                    .sessionId(request.getSessionId())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            userBehaviorEventRepository.save(behaviorEvent);

            // 2. SearchHistory 저장
            SearchHistory searchHistory = SearchHistory.builder()
                    .userId(request.getUserId())
                    .searchQuery(request.getSearchQuery())
                    .searchResultsCount(request.getSearchResultsCount())
                    .searchSuccess(request.getSearchSuccess())
                    .latitude(request.getLatitude())
                    .longitude(request.getLongitude())
                    .region(request.getRegion())
                    .userAgent(request.getUserAgent())
                    .ipAddress(request.getIpAddress())
                    .sessionId(request.getSessionId())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            searchHistoryRepository.save(searchHistory);

            // 3. 사용자 프로파일 업데이트
            userProfileService.createOrUpdateUserProfile(request.getUserId());

            log.info("검색 이벤트 수집 완료: userId={}", request.getUserId());
            return AnalyticsResponse.success("검색 이벤트가 성공적으로 수집되었습니다.", Map.of("eventId", behaviorEvent.getId()));

        } catch (Exception e) {
            log.error("검색 이벤트 수집 실패: userId={}, error={}", request.getUserId(), e.getMessage(), e);
            return AnalyticsResponse.error("검색 이벤트 수집 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public AnalyticsResponse collectClickEvent(ClickEventRequest request) {
        try {
            log.info("클릭 이벤트 수집 시작: userId={}, hospitalId={}", request.getUserId(), request.getHospitalId());

            // 1. UserBehaviorEvent 저장
            UserBehaviorEvent behaviorEvent = UserBehaviorEvent.builder()
                    .userId(request.getUserId())
                    .eventType("CLICK")
                    .pageType(request.getPageType())
                    .hospitalId(request.getHospitalId())
                    .searchQuery(request.getSearchQuery())
                    .clickPosition(request.getClickPosition())
                    .userAgent(request.getUserAgent())
                    .ipAddress(request.getIpAddress())
                    .sessionId(request.getSessionId())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            userBehaviorEventRepository.save(behaviorEvent);

            // 2. ClickPattern 저장
            ClickPattern clickPattern = ClickPattern.builder()
                    .userId(request.getUserId())
                    .hospitalId(request.getHospitalId())
                    .searchQuery(request.getSearchQuery())
                    .clickPosition(request.getClickPosition())
                    .pageType(request.getPageType())
                    .clickType(request.getClickType())
                    .dwellTimeBeforeClick(request.getDwellTimeBeforeClick())
                    .scrollDepth(request.getScrollDepth())
                    .userAgent(request.getUserAgent())
                    .ipAddress(request.getIpAddress())
                    .sessionId(request.getSessionId())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            clickPatternRepository.save(clickPattern);

            // 3. 사용자 프로파일 업데이트
            userProfileService.createOrUpdateUserProfile(request.getUserId());

            log.info("클릭 이벤트 수집 완료: userId={}", request.getUserId());
            return AnalyticsResponse.success("클릭 이벤트가 성공적으로 수집되었습니다.", Map.of("eventId", behaviorEvent.getId()));

        } catch (Exception e) {
            log.error("클릭 이벤트 수집 실패: userId={}, error={}", request.getUserId(), e.getMessage(), e);
            return AnalyticsResponse.error("클릭 이벤트 수집 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public AnalyticsResponse collectDwellTimeEvent(DwellTimeRequest request) {
        try {
            log.info("체류 시간 이벤트 수집 시작: userId={}, pageType={}", request.getUserId(), request.getPageType());

            // 1. UserBehaviorEvent 저장
            UserBehaviorEvent behaviorEvent = UserBehaviorEvent.builder()
                    .userId(request.getUserId())
                    .eventType("DWELL_TIME")
                    .pageType(request.getPageType())
                    .hospitalId(request.getHospitalId())
                    .searchQuery(request.getSearchQuery())
                    .dwellTimeSeconds(request.getDwellTimeSeconds())
                    .userAgent(request.getUserAgent())
                    .ipAddress(request.getIpAddress())
                    .sessionId(request.getSessionId())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            userBehaviorEventRepository.save(behaviorEvent);

            // 2. DwellTime 저장
            DwellTime dwellTime = DwellTime.builder()
                    .userId(request.getUserId())
                    .pageType(request.getPageType())
                    .hospitalId(request.getHospitalId())
                    .searchQuery(request.getSearchQuery())
                    .dwellTimeSeconds(request.getDwellTimeSeconds())
                    .scrollDepth(request.getScrollDepth())
                    .interactionCount(request.getInteractionCount())
                    .pageLoadTime(request.getPageLoadTime())
                    .exitMethod(request.getExitMethod())
                    .userAgent(request.getUserAgent())
                    .ipAddress(request.getIpAddress())
                    .sessionId(request.getSessionId())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            dwellTimeRepository.save(dwellTime);

            // 3. 사용자 프로파일 업데이트
            userProfileService.createOrUpdateUserProfile(request.getUserId());

            log.info("체류 시간 이벤트 수집 완료: userId={}", request.getUserId());
            return AnalyticsResponse.success("체류 시간 이벤트가 성공적으로 수집되었습니다.", Map.of("eventId", behaviorEvent.getId()));

        } catch (Exception e) {
            log.error("체류 시간 이벤트 수집 실패: userId={}, error={}", request.getUserId(), e.getMessage(), e);
            return AnalyticsResponse.error("체류 시간 이벤트 수집 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public AnalyticsResponse collectPageViewEvent(PageViewRequest request) {
        try {
            log.info("페이지 뷰 이벤트 수집 시작: userId={}, pageType={}", request.getUserId(), request.getPageType());

            // UserBehaviorEvent 저장
            UserBehaviorEvent behaviorEvent = UserBehaviorEvent.builder()
                    .userId(request.getUserId())
                    .eventType("PAGE_VIEW")
                    .pageType(request.getPageType())
                    .hospitalId(request.getHospitalId())
                    .searchQuery(request.getSearchQuery())
                    .userAgent(request.getUserAgent())
                    .ipAddress(request.getIpAddress())
                    .sessionId(request.getSessionId())
                    .additionalData(Map.of("referrer", request.getReferrer()))
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            userBehaviorEventRepository.save(behaviorEvent);

            log.info("페이지 뷰 이벤트 수집 완료: userId={}", request.getUserId());
            return AnalyticsResponse.success("페이지 뷰 이벤트가 성공적으로 수집되었습니다.", Map.of("eventId", behaviorEvent.getId()));

        } catch (Exception e) {
            log.error("페이지 뷰 이벤트 수집 실패: userId={}, error={}", request.getUserId(), e.getMessage(), e);
            return AnalyticsResponse.error("페이지 뷰 이벤트 수집 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @Override
    public UserProfileResponse getUserProfile(String userId) {
        try {
            return userProfileService.getUserProfile(userId);
        } catch (Exception e) {
            log.error("사용자 프로파일 조회 실패: userId={}, error={}", userId, e.getMessage(), e);
            return UserProfileResponse.createDefault(userId);
        }
    }

    @Override
    public SearchAnalyticsResponse getSearchAnalytics(String userId) {
        try {
            // 최근 검색어 조회
            List<SearchHistory> recentSearches = searchHistoryRepository.findRecentSearchesByUserId(userId);
            List<String> recentSearchQueries = recentSearches.stream()
                    .map(SearchHistory::getSearchQuery)
                    .distinct()
                    .limit(10)
                    .collect(Collectors.toList());

            // 검색 통계 계산
            long totalSearches = searchHistoryRepository.countByUserId(userId);
            long successfulSearches = searchHistoryRepository.countByUserIdAndSearchSuccessTrue(userId);
            double successRate = totalSearches > 0 ? (double) successfulSearches / totalSearches : 0.0;

            return SearchAnalyticsResponse.builder()
                    .userId(userId)
                    .recentSearches(recentSearchQueries)
                    .totalSearches((int) totalSearches)
                    .successfulSearches((int) successfulSearches)
                    .searchSuccessRate(successRate)
                    .build();

        } catch (Exception e) {
            log.error("검색 분석 조회 실패: userId={}, error={}", userId, e.getMessage(), e);
            return SearchAnalyticsResponse.createDefault(userId);
        }
    }

    @Override
    public AnalyticsResponse getPopularSearches() {
        try {
            List<SearchHistory> popularSearches = searchHistoryRepository.findPopularSearches();
            Map<String, Long> searchFrequency = popularSearches.stream()
                    .collect(Collectors.groupingBy(
                            SearchHistory::getSearchQuery,
                            Collectors.counting()
                    ));

            return AnalyticsResponse.success("인기 검색어 조회 완료", searchFrequency);
        } catch (Exception e) {
            log.error("인기 검색어 조회 실패: error={}", e.getMessage(), e);
            return AnalyticsResponse.error("인기 검색어 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @Override
    public AnalyticsResponse getPopularHospitals() {
        try {
            List<ClickPattern> popularHospitals = clickPatternRepository.findPopularClickedHospitals();
            Map<String, Long> hospitalFrequency = popularHospitals.stream()
                    .collect(Collectors.groupingBy(
                            ClickPattern::getHospitalId,
                            Collectors.counting()
                    ));

            return AnalyticsResponse.success("인기 병원 조회 완료", hospitalFrequency);
        } catch (Exception e) {
            log.error("인기 병원 조회 실패: error={}", e.getMessage(), e);
            return AnalyticsResponse.error("인기 병원 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @Override
    public AnalyticsResponse updateUserProfile(String userId) {
        try {
            userProfileService.createOrUpdateUserProfile(userId);
            return AnalyticsResponse.success("사용자 프로파일이 성공적으로 업데이트되었습니다.", null);
        } catch (Exception e) {
            log.error("사용자 프로파일 업데이트 실패: userId={}, error={}", userId, e.getMessage(), e);
            return AnalyticsResponse.error("사용자 프로파일 업데이트 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @Override
    public AnalyticsResponse getEventStatistics(String userId, String eventType, String startDate, String endDate) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);

            List<UserBehaviorEvent> events = userBehaviorEventRepository
                    .findByUserIdAndEventTypeAndCreatedAtBetweenOrderByCreatedAtDesc(userId, eventType, start, end);

            Map<String, Object> statistics = Map.of(
                    "userId", userId,
                    "eventType", eventType,
                    "totalEvents", events.size(),
                    "startDate", startDate,
                    "endDate", endDate
            );

            return AnalyticsResponse.success("이벤트 통계 조회 완료", statistics);
        } catch (Exception e) {
            log.error("이벤트 통계 조회 실패: userId={}, error={}", userId, e.getMessage(), e);
            return AnalyticsResponse.error("이벤트 통계 조회 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
} 