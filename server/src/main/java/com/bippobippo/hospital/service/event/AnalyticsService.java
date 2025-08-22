package com.bippobippo.hospital.service.event;

import com.bippobippo.hospital.dto.request.event.ClickEventRequest;
import com.bippobippo.hospital.dto.request.event.DwellTimeRequest;
import com.bippobippo.hospital.dto.request.event.PageViewRequest;
import com.bippobippo.hospital.dto.request.event.SearchEventRequest;
import com.bippobippo.hospital.dto.response.event.AnalyticsResponse;
import com.bippobippo.hospital.dto.response.event.SearchAnalyticsResponse;
import com.bippobippo.hospital.dto.response.event.UserProfileResponse;

public interface AnalyticsService {

    // 이벤트 수집 메서드들
    AnalyticsResponse collectSearchEvent(SearchEventRequest request);
    AnalyticsResponse collectClickEvent(ClickEventRequest request);
    AnalyticsResponse collectDwellTimeEvent(DwellTimeRequest request);
    AnalyticsResponse collectPageViewEvent(PageViewRequest request);

    // 분석 데이터 조회 메서드들
    UserProfileResponse getUserProfile(String userId);
    SearchAnalyticsResponse getSearchAnalytics(String userId);
    AnalyticsResponse getPopularSearches();
    AnalyticsResponse getPopularHospitals();

    // 사용자 프로파일 업데이트
    AnalyticsResponse updateUserProfile(String userId);

    // 통계 데이터 조회
    AnalyticsResponse getEventStatistics(String userId, String eventType, String startDate, String endDate);
} 