package com.bippobippo.hospital.service.event.impl;

import com.bippobippo.hospital.dto.response.event.UserProfileResponse;
import com.bippobippo.hospital.model.event.*;
import com.bippobippo.hospital.repository.event.*;
import com.bippobippo.hospital.service.event.UserProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {

    private final UserBehaviorEventRepository userBehaviorEventRepository;
    private final SearchHistoryRepository searchHistoryRepository;
    private final ClickPatternRepository clickPatternRepository;
    private final DwellTimeRepository dwellTimeRepository;
    private final UserProfileRepository userProfileRepository;

    @Override
    public UserProfileResponse getUserProfile(String userId) {
        try {
            Optional<UserProfile> existingProfile = userProfileRepository.findByUserId(userId);
            if (existingProfile.isPresent()) {
                UserProfile profile = existingProfile.get();
                return convertToResponse(profile);
            } else {
                return UserProfileResponse.createDefault(userId);
            }
        } catch (Exception e) {
            log.error("사용자 프로파일 조회 실패: userId={}, error={}", userId, e.getMessage(), e);
            return UserProfileResponse.createDefault(userId);
        }
    }

    @Override
    @Transactional
    public UserProfileResponse createOrUpdateUserProfile(String userId) {
        try {
            log.info("사용자 프로파일 생성/업데이트 시작: userId={}", userId);

            // 기존 프로파일 조회
            Optional<UserProfile> existingProfile = userProfileRepository.findByUserId(userId);
            UserProfile userProfile;

            if (existingProfile.isPresent()) {
                userProfile = existingProfile.get();
                log.info("기존 프로파일 업데이트: userId={}", userId);
            } else {
                userProfile = UserProfile.create();
                userProfile.setUserId(userId);
                log.info("새 프로파일 생성: userId={}", userId);
            }

            // 사용자 선호도 계산
            Map<String, Object> preferences = calculateUserPreferences(userId);
            userProfile.setPreferredSpecialties((List<String>) preferences.get("specialties"));
            userProfile.setPreferredRegions((List<String>) preferences.get("regions"));
            userProfile.setPreferredDistance((Integer) preferences.get("distance"));
            userProfile.setPreferredRating((Double) preferences.get("rating"));

            // 검색 패턴 분석
            Map<String, Integer> searchPatterns = analyzeSearchPatterns(userId);
            userProfile.setSearchPatterns(searchPatterns);

            // 클릭 패턴 분석
            Map<String, Integer> clickPatterns = analyzeClickPatterns(userId);
            userProfile.setClickPatterns(clickPatterns);

            // 체류 시간 패턴 분석
            Map<String, Object> dwellTimePatterns = analyzeDwellTimePatterns(userId);
            userProfile.setAvgDwellTime((Integer) dwellTimePatterns.get("avgDwellTime"));

            // 통계 계산
            userProfile.setTotalSearches((int) searchHistoryRepository.countByUserId(userId));
            userProfile.setTotalClicks((int) clickPatternRepository.countByUserId(userId));
            userProfile.setTotalDwellTime((Integer) dwellTimePatterns.get("totalDwellTime"));

            // 검색 빈도 계산
            userProfile.setSearchFrequency(calculateSearchFrequency(userId));

            // 클릭률 계산
            userProfile.setClickRate(calculateClickRate(userId));

            // 최근 검색일 업데이트
            List<SearchHistory> recentSearches = searchHistoryRepository.findRecentSearchesByUserId(userId);
            if (!recentSearches.isEmpty()) {
                userProfile.setLastSearchDate(recentSearches.get(0).getCreatedAt());
            }

            // 업데이트 시간 설정
            userProfile.setUpdatedAt(LocalDateTime.now());

            // 저장
            UserProfile savedProfile = userProfileRepository.save(userProfile);
            log.info("사용자 프로파일 저장 완료: userId={}", userId);

            return convertToResponse(savedProfile);

        } catch (Exception e) {
            log.error("사용자 프로파일 생성/업데이트 실패: userId={}, error={}", userId, e.getMessage(), e);
            return UserProfileResponse.createDefault(userId);
        }
    }

    @Override
    public Map<String, Object> calculateUserPreferences(String userId) {
        Map<String, Object> preferences = new HashMap<>();

        try {
            // 진료과목 선호도 분석 (검색어에서 추출)
            List<SearchHistory> searches = searchHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId);
            Map<String, Long> specialtyCount = searches.stream()
                    .map(SearchHistory::getSearchQuery)
                    .filter(query -> query != null && !query.trim().isEmpty())
                    .collect(Collectors.groupingBy(
                            query -> extractSpecialtyFromQuery(query),
                            Collectors.counting()
                    ));

            List<String> preferredSpecialties = specialtyCount.entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .limit(5)
                    .map(Map.Entry::getKey)
                    .filter(specialty -> !specialty.equals("기타"))
                    .collect(Collectors.toList());

            // 지역 선호도 분석
            Map<String, Long> regionCount = searches.stream()
                    .filter(search -> search.getRegion() != null)
                    .collect(Collectors.groupingBy(
                            SearchHistory::getRegion,
                            Collectors.counting()
                    ));

            List<String> preferredRegions = regionCount.entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .limit(3)
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());

            // 거리 선호도 분석 (기본값 10km)
            Integer preferredDistance = 10;

            // 평점 선호도 분석 (기본값 4.0)
            Double preferredRating = 4.0;

            preferences.put("specialties", preferredSpecialties);
            preferences.put("regions", preferredRegions);
            preferences.put("distance", preferredDistance);
            preferences.put("rating", preferredRating);

        } catch (Exception e) {
            log.error("사용자 선호도 계산 실패: userId={}, error={}", userId, e.getMessage(), e);
            preferences.put("specialties", List.of());
            preferences.put("regions", List.of());
            preferences.put("distance", 10);
            preferences.put("rating", 4.0);
        }

        return preferences;
    }

    @Override
    public Map<String, Integer> analyzeSearchPatterns(String userId) {
        try {
            List<SearchHistory> searches = searchHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId);
            return searches.stream()
                    .collect(Collectors.groupingBy(
                            SearchHistory::getSearchQuery,
                            Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                    ));
        } catch (Exception e) {
            log.error("검색 패턴 분석 실패: userId={}, error={}", userId, e.getMessage(), e);
            return Map.of();
        }
    }

    @Override
    public Map<String, Integer> analyzeClickPatterns(String userId) {
        try {
            List<ClickPattern> clicks = clickPatternRepository.findByUserIdOrderByCreatedAtDesc(userId);
            return clicks.stream()
                    .collect(Collectors.groupingBy(
                            click -> String.valueOf(click.getClickPosition()),
                            Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                    ));
        } catch (Exception e) {
            log.error("클릭 패턴 분석 실패: userId={}, error={}", userId, e.getMessage(), e);
            return Map.of();
        }
    }

    @Override
    public Map<String, Object> analyzeDwellTimePatterns(String userId) {
        Map<String, Object> patterns = new HashMap<>();

        try {
            List<DwellTime> dwellTimes = dwellTimeRepository.findByUserIdOrderByCreatedAtDesc(userId);
            
            if (dwellTimes.isEmpty()) {
                patterns.put("avgDwellTime", 60);
                patterns.put("totalDwellTime", 0);
                return patterns;
            }

            // 평균 체류 시간 계산
            double avgDwellTime = dwellTimes.stream()
                    .mapToInt(DwellTime::getDwellTimeSeconds)
                    .average()
                    .orElse(60.0);

            // 총 체류 시간 계산
            int totalDwellTime = dwellTimes.stream()
                    .mapToInt(DwellTime::getDwellTimeSeconds)
                    .sum();

            patterns.put("avgDwellTime", (int) avgDwellTime);
            patterns.put("totalDwellTime", totalDwellTime);

        } catch (Exception e) {
            log.error("체류 시간 패턴 분석 실패: userId={}, error={}", userId, e.getMessage(), e);
            patterns.put("avgDwellTime", 60);
            patterns.put("totalDwellTime", 0);
        }

        return patterns;
    }

    @Override
    public List<String> getRecommendedSpecialties(String userId) {
        try {
            UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
            if (profile != null && profile.getPreferredSpecialties() != null) {
                return profile.getPreferredSpecialties();
            }
            return List.of();
        } catch (Exception e) {
            log.error("추천 진료과목 조회 실패: userId={}, error={}", userId, e.getMessage(), e);
            return List.of();
        }
    }

    @Override
    public List<String> getRecommendedRegions(String userId) {
        try {
            UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
            if (profile != null && profile.getPreferredRegions() != null) {
                return profile.getPreferredRegions();
            }
            return List.of();
        } catch (Exception e) {
            log.error("추천 지역 조회 실패: userId={}, error={}", userId, e.getMessage(), e);
            return List.of();
        }
    }

    @Override
    public Integer getRecommendedDistance(String userId) {
        try {
            UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
            return profile != null ? profile.getPreferredDistance() : 10;
        } catch (Exception e) {
            log.error("추천 거리 조회 실패: userId={}, error={}", userId, e.getMessage(), e);
            return 10;
        }
    }

    @Override
    public Double getRecommendedRating(String userId) {
        try {
            UserProfile profile = userProfileRepository.findByUserId(userId).orElse(null);
            return profile != null ? profile.getPreferredRating() : 4.0;
        } catch (Exception e) {
            log.error("추천 평점 조회 실패: userId={}, error={}", userId, e.getMessage(), e);
            return 4.0;
        }
    }

    @Override
    public Double calculateUserActivityScore(String userId) {
        try {
            long totalSearches = searchHistoryRepository.countByUserId(userId);
            long totalClicks = clickPatternRepository.countByUserId(userId);
            long totalEvents = userBehaviorEventRepository.countByUserId(userId);

            // 간단한 활동성 점수 계산 (0-100)
            double activityScore = Math.min(100.0, (totalSearches * 10 + totalClicks * 5 + totalEvents * 2) / 10.0);
            return Math.round(activityScore * 100.0) / 100.0;

        } catch (Exception e) {
            log.error("사용자 활동성 점수 계산 실패: userId={}, error={}", userId, e.getMessage(), e);
            return 0.0;
        }
    }

    @Override
    public String calculateSearchFrequency(String userId) {
        try {
            long totalSearches = searchHistoryRepository.countByUserId(userId);
            
            if (totalSearches >= 50) return "HIGH";
            else if (totalSearches >= 20) return "MEDIUM";
            else return "LOW";

        } catch (Exception e) {
            log.error("검색 빈도 계산 실패: userId={}, error={}", userId, e.getMessage(), e);
            return "LOW";
        }
    }

    @Override
    public Double calculateClickRate(String userId) {
        try {
            long totalSearches = searchHistoryRepository.countByUserId(userId);
            long totalClicks = clickPatternRepository.countByUserId(userId);

            if (totalSearches == 0) return 0.0;
            return Math.round((double) totalClicks / totalSearches * 100.0) / 100.0;

        } catch (Exception e) {
            log.error("클릭률 계산 실패: userId={}, error={}", userId, e.getMessage(), e);
            return 0.0;
        }
    }

    @Override
    public Integer calculateAverageDwellTime(String userId) {
        try {
            Map<String, Object> dwellTimePatterns = analyzeDwellTimePatterns(userId);
            return (Integer) dwellTimePatterns.get("avgDwellTime");
        } catch (Exception e) {
            log.error("평균 체류 시간 계산 실패: userId={}, error={}", userId, e.getMessage(), e);
            return 60;
        }
    }

    // 헬퍼 메서드들
    private String extractSpecialtyFromQuery(String query) {
        if (query == null || query.trim().isEmpty()) return "기타";

        String lowerQuery = query.toLowerCase();
        
        if (lowerQuery.contains("정형외과") || lowerQuery.contains("정형")) return "정형외과";
        if (lowerQuery.contains("내과") || lowerQuery.contains("소화기")) return "내과";
        if (lowerQuery.contains("외과") || lowerQuery.contains("일반외과")) return "외과";
        if (lowerQuery.contains("소아과") || lowerQuery.contains("소아")) return "소아과";
        if (lowerQuery.contains("산부인과") || lowerQuery.contains("산부인")) return "산부인과";
        if (lowerQuery.contains("피부과") || lowerQuery.contains("피부")) return "피부과";
        if (lowerQuery.contains("안과") || lowerQuery.contains("눈")) return "안과";
        if (lowerQuery.contains("이비인후과") || lowerQuery.contains("이비인후")) return "이비인후과";
        if (lowerQuery.contains("신경과") || lowerQuery.contains("신경")) return "신경과";
        if (lowerQuery.contains("정신과") || lowerQuery.contains("정신")) return "정신과";
        if (lowerQuery.contains("재활의학과") || lowerQuery.contains("재활")) return "재활의학과";
        if (lowerQuery.contains("응급의학과") || lowerQuery.contains("응급")) return "응급의학과";
        if (lowerQuery.contains("가정의학과") || lowerQuery.contains("가정의")) return "가정의학과";
        if (lowerQuery.contains("치과") || lowerQuery.contains("치아")) return "치과";
        if (lowerQuery.contains("한의원") || lowerQuery.contains("한의")) return "한의원";
        
        return "기타";
    }

    private UserProfileResponse convertToResponse(UserProfile profile) {
        return UserProfileResponse.builder()
                .userId(profile.getUserId())
                .preferredSpecialties(profile.getPreferredSpecialties())
                .preferredRegions(profile.getPreferredRegions())
                .preferredDistance(profile.getPreferredDistance())
                .preferredRating(profile.getPreferredRating())
                .searchFrequency(profile.getSearchFrequency())
                .avgDwellTime(profile.getAvgDwellTime())
                .clickRate(profile.getClickRate())
                .preferredHospitalTypes(profile.getPreferredHospitalTypes())
                .searchPatterns(profile.getSearchPatterns())
                .clickPatterns(profile.getClickPatterns())
                .lastSearchDate(profile.getLastSearchDate())
                .totalSearches(profile.getTotalSearches())
                .totalClicks(profile.getTotalClicks())
                .totalDwellTime(profile.getTotalDwellTime())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
} 