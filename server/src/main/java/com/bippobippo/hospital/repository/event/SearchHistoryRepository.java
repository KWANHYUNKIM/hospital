package com.bippobippo.hospital.repository.event;

import com.bippobippo.hospital.model.event.SearchHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SearchHistoryRepository extends MongoRepository<SearchHistory, String> {

    // 사용자별 검색 히스토리 조회
    List<SearchHistory> findByUserIdOrderByCreatedAtDesc(String userId);

    // 특정 검색어 조회
    List<SearchHistory> findBySearchQueryContainingIgnoreCaseOrderByCreatedAtDesc(String searchQuery);

    // 사용자별 특정 검색어 조회
    List<SearchHistory> findByUserIdAndSearchQueryContainingIgnoreCaseOrderByCreatedAtDesc(String userId, String searchQuery);

    // 기간별 검색 히스토리 조회
    List<SearchHistory> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            String userId, LocalDateTime startDate, LocalDateTime endDate);

    // 성공한 검색만 조회
    List<SearchHistory> findByUserIdAndSearchSuccessTrueOrderByCreatedAtDesc(String userId);

    // 지역별 검색 조회
    List<SearchHistory> findByRegionOrderByCreatedAtDesc(String region);

    // 사용자별 지역 검색 조회
    List<SearchHistory> findByUserIdAndRegionOrderByCreatedAtDesc(String userId, String region);

    // 세션별 검색 조회
    List<SearchHistory> findBySessionIdOrderByCreatedAtAsc(String sessionId);

    // 사용자별 최근 검색 조회 (최대 50개)
    @Query(value = "{'userId': ?0}", sort = "{'createdAt': -1}")
    List<SearchHistory> findRecentSearchesByUserId(String userId);

    // 인기 검색어 조회 (전체)
    @Query(value = "{}", sort = "{'createdAt': -1}")
    List<SearchHistory> findPopularSearches();

    // 특정 기간 동안의 모든 검색 조회
    List<SearchHistory> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime startDate, LocalDateTime endDate);

    // 검색 결과가 있는 검색만 조회
    List<SearchHistory> findBySearchResultsCountGreaterThanOrderByCreatedAtDesc(int minResults);

    // 사용자별 검색 개수
    long countByUserId(String userId);

    // 특정 검색어 개수
    long countBySearchQueryContainingIgnoreCase(String searchQuery);

    // 사용자별 특정 검색어 개수
    long countByUserIdAndSearchQueryContainingIgnoreCase(String userId, String searchQuery);

    // 사용자별 성공한 검색 개수
    long countByUserIdAndSearchSuccessTrue(String userId);
} 