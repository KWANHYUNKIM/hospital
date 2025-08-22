package com.bippobippo.hospital.repository.event;

import com.bippobippo.hospital.model.event.UserBehaviorEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserBehaviorEventRepository extends MongoRepository<UserBehaviorEvent, String> {

    // 사용자별 이벤트 조회
    List<UserBehaviorEvent> findByUserIdOrderByCreatedAtDesc(String userId);

    // 특정 이벤트 타입 조회
    List<UserBehaviorEvent> findByUserIdAndEventTypeOrderByCreatedAtDesc(String userId, String eventType);

    // 기간별 이벤트 조회
    List<UserBehaviorEvent> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            String userId, LocalDateTime startDate, LocalDateTime endDate);

    // 검색 쿼리별 이벤트 조회
    List<UserBehaviorEvent> findBySearchQueryContainingIgnoreCaseOrderByCreatedAtDesc(String searchQuery);

    // 병원별 이벤트 조회
    List<UserBehaviorEvent> findByHospitalIdOrderByCreatedAtDesc(String hospitalId);

    // 세션별 이벤트 조회
    List<UserBehaviorEvent> findBySessionIdOrderByCreatedAtAsc(String sessionId);

    // 사용자별 최근 이벤트 조회 (최대 100개)
    @Query(value = "{'userId': ?0}", sort = "{'createdAt': -1}")
    List<UserBehaviorEvent> findRecentEventsByUserId(String userId);

    // 특정 기간 동안의 모든 이벤트 조회
    List<UserBehaviorEvent> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime startDate, LocalDateTime endDate);

    // 이벤트 타입별 통계
    @Query(value = "{'eventType': ?0, 'createdAt': {$gte: ?1, $lte: ?2}}")
    List<UserBehaviorEvent> findByEventTypeAndDateRange(String eventType, LocalDateTime startDate, LocalDateTime endDate);

    // 사용자별 이벤트 개수
    long countByUserId(String userId);

    // 특정 이벤트 타입 개수
    long countByUserIdAndEventType(String userId, String eventType);

    // 사용자별 특정 이벤트 타입과 기간별 조회
    List<UserBehaviorEvent> findByUserIdAndEventTypeAndCreatedAtBetweenOrderByCreatedAtDesc(
            String userId, String eventType, LocalDateTime startDate, LocalDateTime endDate);
} 