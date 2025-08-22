package com.bippobippo.hospital.repository.event;

import com.bippobippo.hospital.model.event.DwellTime;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DwellTimeRepository extends MongoRepository<DwellTime, String> {

    // 사용자별 체류 시간 조회
    List<DwellTime> findByUserIdOrderByCreatedAtDesc(String userId);

    // 병원별 체류 시간 조회
    List<DwellTime> findByHospitalIdOrderByCreatedAtDesc(String hospitalId);

    // 사용자별 특정 병원 체류 시간 조회
    List<DwellTime> findByUserIdAndHospitalIdOrderByCreatedAtDesc(String userId, String hospitalId);

    // 페이지 타입별 체류 시간 조회
    List<DwellTime> findByPageTypeOrderByCreatedAtDesc(String pageType);

    // 사용자별 페이지 타입 체류 시간 조회
    List<DwellTime> findByUserIdAndPageTypeOrderByCreatedAtDesc(String userId, String pageType);

    // 검색어별 체류 시간 조회
    List<DwellTime> findBySearchQueryContainingIgnoreCaseOrderByCreatedAtDesc(String searchQuery);

    // 사용자별 검색어 체류 시간 조회
    List<DwellTime> findByUserIdAndSearchQueryContainingIgnoreCaseOrderByCreatedAtDesc(String userId, String searchQuery);

    // 세션별 체류 시간 조회
    List<DwellTime> findBySessionIdOrderByCreatedAtAsc(String sessionId);

    // 기간별 체류 시간 조회
    List<DwellTime> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            String userId, LocalDateTime startDate, LocalDateTime endDate);

    // 긴 체류 시간 조회 (특정 시간 이상)
    List<DwellTime> findByDwellTimeSecondsGreaterThanOrderByCreatedAtDesc(Integer minSeconds);

    // 사용자별 긴 체류 시간 조회
    List<DwellTime> findByUserIdAndDwellTimeSecondsGreaterThanOrderByCreatedAtDesc(String userId, Integer minSeconds);

    // 사용자별 최근 체류 시간 조회 (최대 50개)
    @Query(value = "{'userId': ?0}", sort = "{'createdAt': -1}")
    List<DwellTime> findRecentDwellTimesByUserId(String userId);

    // 인기 체류 병원 조회
    @Query(value = "{}", sort = "{'createdAt': -1}")
    List<DwellTime> findPopularDwellHospitals();

    // 특정 기간 동안의 모든 체류 시간 조회
    List<DwellTime> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime startDate, LocalDateTime endDate);

    // 스크롤 깊이별 조회
    List<DwellTime> findByScrollDepthGreaterThanOrderByCreatedAtDesc(Integer minScrollDepth);

    // 사용자별 스크롤 깊이 조회
    List<DwellTime> findByUserIdAndScrollDepthGreaterThanOrderByCreatedAtDesc(String userId, Integer minScrollDepth);

    // 사용자별 체류 시간 개수
    long countByUserId(String userId);

    // 병원별 체류 시간 개수
    long countByHospitalId(String hospitalId);

    // 사용자별 특정 병원 체류 시간 개수
    long countByUserIdAndHospitalId(String userId, String hospitalId);

    // 페이지 타입별 체류 시간 개수
    long countByPageType(String pageType);
} 