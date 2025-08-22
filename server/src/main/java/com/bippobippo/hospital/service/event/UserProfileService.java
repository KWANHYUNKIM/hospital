package com.bippobippo.hospital.service.event;

import com.bippobippo.hospital.dto.response.event.UserProfileResponse;

import java.util.List;
import java.util.Map;

public interface UserProfileService {

    // 사용자 프로파일 조회
    UserProfileResponse getUserProfile(String userId);

    // 사용자 프로파일 생성 또는 업데이트
    UserProfileResponse createOrUpdateUserProfile(String userId);

    // 사용자 선호도 계산
    Map<String, Object> calculateUserPreferences(String userId);

    // 검색 패턴 분석
    Map<String, Integer> analyzeSearchPatterns(String userId);

    // 클릭 패턴 분석
    Map<String, Integer> analyzeClickPatterns(String userId);

    // 체류 시간 패턴 분석
    Map<String, Object> analyzeDwellTimePatterns(String userId);

    // 사용자별 추천 진료과목
    List<String> getRecommendedSpecialties(String userId);

    // 사용자별 추천 지역
    List<String> getRecommendedRegions(String userId);

    // 사용자별 추천 거리
    Integer getRecommendedDistance(String userId);

    // 사용자별 추천 평점
    Double getRecommendedRating(String userId);

    // 사용자 활동성 점수 계산
    Double calculateUserActivityScore(String userId);

    // 사용자별 검색 빈도 계산
    String calculateSearchFrequency(String userId);

    // 사용자별 클릭률 계산
    Double calculateClickRate(String userId);

    // 사용자별 평균 체류 시간 계산
    Integer calculateAverageDwellTime(String userId);
} 