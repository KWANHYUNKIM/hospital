package com.bippobippo.hospital.repository.event;

import com.bippobippo.hospital.model.event.UserProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserProfileRepository extends MongoRepository<UserProfile, String> {

    // 사용자 ID로 프로파일 조회
    Optional<UserProfile> findByUserId(String userId);

    // 선호 진료과목별 사용자 조회
    List<UserProfile> findByPreferredSpecialtiesContaining(String specialty);

    // 선호 지역별 사용자 조회
    List<UserProfile> findByPreferredRegionsContaining(String region);

    // 검색 빈도별 사용자 조회
    List<UserProfile> findBySearchFrequency(String searchFrequency);

    // 클릭률 기준 조회 (특정 클릭률 이상)
    List<UserProfile> findByClickRateGreaterThan(Double minClickRate);

    // 평균 체류 시간 기준 조회 (특정 시간 이상)
    List<UserProfile> findByAvgDwellTimeGreaterThan(Integer minDwellTime);

    // 선호 거리 기준 조회
    List<UserProfile> findByPreferredDistanceLessThanEqual(Integer maxDistance);

    // 선호 평점 기준 조회 (특정 평점 이상)
    List<UserProfile> findByPreferredRatingGreaterThanEqual(Double minRating);

    // 최근 검색일 기준 조회
    List<UserProfile> findByLastSearchDateAfter(LocalDateTime date);

    // 총 검색 횟수 기준 조회 (활성 사용자)
    List<UserProfile> findByTotalSearchesGreaterThan(Integer minSearches);

    // 총 클릭 횟수 기준 조회 (활성 사용자)
    List<UserProfile> findByTotalClicksGreaterThan(Integer minClicks);

    // 선호 병원 타입별 사용자 조회
    List<UserProfile> findByPreferredHospitalTypesContaining(String hospitalType);

    // 사용자별 최근 업데이트된 프로파일 조회
    @Query(value = "{'userId': ?0}", sort = "{'updatedAt': -1}")
    List<UserProfile> findRecentProfilesByUserId(String userId);

    // 활성 사용자 조회 (최근 30일 내 검색)
    @Query(value = "{'lastSearchDate': {$gte: ?0}}")
    List<UserProfile> findActiveUsers(LocalDateTime thirtyDaysAgo);

    // 고클릭률 사용자 조회
    @Query(value = "{'clickRate': {$gte: ?0}}")
    List<UserProfile> findHighClickRateUsers(Double minClickRate);

    // 긴 체류 시간 사용자 조회
    @Query(value = "{'avgDwellTime': {$gte: ?0}}")
    List<UserProfile> findLongDwellTimeUsers(Integer minDwellTime);

    // 특정 지역 선호 사용자 조회
    @Query(value = "{'preferredRegions': {$in: [?0]}}")
    List<UserProfile> findUsersByPreferredRegion(String region);

    // 특정 진료과목 선호 사용자 조회
    @Query(value = "{'preferredSpecialties': {$in: [?0]}}")
    List<UserProfile> findUsersByPreferredSpecialty(String specialty);

    // 사용자 존재 여부 확인
    boolean existsByUserId(String userId);

    // 특정 조건의 사용자 수
    long countBySearchFrequency(String searchFrequency);

    long countByClickRateGreaterThan(Double minClickRate);

    long countByAvgDwellTimeGreaterThan(Integer minDwellTime);
} 