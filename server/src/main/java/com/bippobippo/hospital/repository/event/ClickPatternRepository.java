package com.bippobippo.hospital.repository.event;

import com.bippobippo.hospital.model.event.ClickPattern;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClickPatternRepository extends MongoRepository<ClickPattern, String> {

    // 사용자별 클릭 패턴 조회
    List<ClickPattern> findByUserIdOrderByCreatedAtDesc(String userId);

    // 병원별 클릭 패턴 조회
    List<ClickPattern> findByHospitalIdOrderByCreatedAtDesc(String hospitalId);

    // 사용자별 특정 병원 클릭 조회
    List<ClickPattern> findByUserIdAndHospitalIdOrderByCreatedAtDesc(String userId, String hospitalId);

    // 검색어별 클릭 패턴 조회
    List<ClickPattern> findBySearchQueryContainingIgnoreCaseOrderByCreatedAtDesc(String searchQuery);

    // 사용자별 검색어 클릭 조회
    List<ClickPattern> findByUserIdAndSearchQueryContainingIgnoreCaseOrderByCreatedAtDesc(String userId, String searchQuery);

    // 클릭 위치별 조회
    List<ClickPattern> findByClickPositionOrderByCreatedAtDesc(Integer clickPosition);

    // 사용자별 클릭 위치 조회
    List<ClickPattern> findByUserIdAndClickPositionOrderByCreatedAtDesc(String userId, Integer clickPosition);

    // 페이지 타입별 클릭 조회
    List<ClickPattern> findByPageTypeOrderByCreatedAtDesc(String pageType);

    // 클릭 타입별 조회
    List<ClickPattern> findByClickTypeOrderByCreatedAtDesc(String clickType);

    // 세션별 클릭 조회
    List<ClickPattern> findBySessionIdOrderByCreatedAtAsc(String sessionId);

    // 기간별 클릭 패턴 조회
    List<ClickPattern> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            String userId, LocalDateTime startDate, LocalDateTime endDate);

    // 사용자별 최근 클릭 조회 (최대 100개)
    @Query(value = "{'userId': ?0}", sort = "{'createdAt': -1}")
    List<ClickPattern> findRecentClicksByUserId(String userId);

    // 인기 클릭 병원 조회
    @Query(value = "{}", sort = "{'createdAt': -1}")
    List<ClickPattern> findPopularClickedHospitals();

    // 특정 기간 동안의 모든 클릭 조회
    List<ClickPattern> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime startDate, LocalDateTime endDate);

    // 사용자별 클릭 개수
    long countByUserId(String userId);

    // 병원별 클릭 개수
    long countByHospitalId(String hospitalId);

    // 사용자별 특정 병원 클릭 개수
    long countByUserIdAndHospitalId(String userId, String hospitalId);

    // 클릭 위치별 개수
    long countByClickPosition(Integer clickPosition);
} 