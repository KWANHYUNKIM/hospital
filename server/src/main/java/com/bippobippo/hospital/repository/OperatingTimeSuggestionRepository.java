package com.bippobippo.hospital.repository;

import com.bippobippo.hospital.entity.OperatingTimeSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OperatingTimeSuggestionRepository extends JpaRepository<OperatingTimeSuggestion, Long> {
    List<OperatingTimeSuggestion> findAllByOrderBySubmittedAtDesc();
    List<OperatingTimeSuggestion> findByStatusOrderBySubmittedAtDesc(OperatingTimeSuggestion.SuggestionStatus status);
} 