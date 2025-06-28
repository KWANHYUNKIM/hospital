package com.bippobippo.hospital.service.hospital;

import com.bippobippo.hospital.entity.OperatingTimeSuggestion;

import java.util.List;

public interface OperatingTimeSuggestionService {
    OperatingTimeSuggestion saveSuggestion(OperatingTimeSuggestion suggestion);
    OperatingTimeSuggestion approveSuggestion(Long suggestionId);
    OperatingTimeSuggestion rejectSuggestion(Long suggestionId, String reason);
    List<OperatingTimeSuggestion> getAllSuggestions();
    List<OperatingTimeSuggestion> getPendingSuggestions();
} 