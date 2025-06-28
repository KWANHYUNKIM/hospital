package com.bippobippo.hospital.controller.hospital;

import com.bippobippo.hospital.dto.request.OperatingTimeSuggestionRequest;
import com.bippobippo.hospital.entity.OperatingTimeSuggestion;
import com.bippobippo.hospital.service.hospital.OperatingTimeSuggestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/hospital")
@RequiredArgsConstructor
public class OperatingTimeSuggestionController {

    private final OperatingTimeSuggestionService operatingTimeSuggestionService;

    @PostMapping("/suggest-operating-time")
    public ResponseEntity<Map<String, Object>> submitOperatingTimeSuggestion(@RequestBody OperatingTimeSuggestionRequest request) {
        try {
            // DTO를 엔티티로 변환
            OperatingTimeSuggestion suggestion = new OperatingTimeSuggestion();
            suggestion.setHospitalId(request.getHospitalId());
            suggestion.setHospitalName(request.getHospitalName());
            suggestion.setSuggestion(request.getSuggestion());
            
            // 현재 영업시간 데이터 설정
            suggestion.setTrmtMonStart(request.getTrmtMonStart());
            suggestion.setTrmtMonEnd(request.getTrmtMonEnd());
            suggestion.setTrmtTueStart(request.getTrmtTueStart());
            suggestion.setTrmtTueEnd(request.getTrmtTueEnd());
            suggestion.setTrmtWedStart(request.getTrmtWedStart());
            suggestion.setTrmtWedEnd(request.getTrmtWedEnd());
            suggestion.setTrmtThuStart(request.getTrmtThuStart());
            suggestion.setTrmtThuEnd(request.getTrmtThuEnd());
            suggestion.setTrmtFriStart(request.getTrmtFriStart());
            suggestion.setTrmtFriEnd(request.getTrmtFriEnd());
            suggestion.setTrmtSatStart(request.getTrmtSatStart());
            suggestion.setTrmtSatEnd(request.getTrmtSatEnd());
            suggestion.setNoTrmtSun(request.getNoTrmtSun());
            suggestion.setNoTrmtHoli(request.getNoTrmtHoli());
            suggestion.setLunchWeek(request.getLunchWeek());
            
            // 제안된 영업시간 데이터 설정
            suggestion.setSuggestedTrmtMonStart(request.getSuggestedTrmtMonStart());
            suggestion.setSuggestedTrmtMonEnd(request.getSuggestedTrmtMonEnd());
            suggestion.setSuggestedTrmtTueStart(request.getSuggestedTrmtTueStart());
            suggestion.setSuggestedTrmtTueEnd(request.getSuggestedTrmtTueEnd());
            suggestion.setSuggestedTrmtWedStart(request.getSuggestedTrmtWedStart());
            suggestion.setSuggestedTrmtWedEnd(request.getSuggestedTrmtWedEnd());
            suggestion.setSuggestedTrmtThuStart(request.getSuggestedTrmtThuStart());
            suggestion.setSuggestedTrmtThuEnd(request.getSuggestedTrmtThuEnd());
            suggestion.setSuggestedTrmtFriStart(request.getSuggestedTrmtFriStart());
            suggestion.setSuggestedTrmtFriEnd(request.getSuggestedTrmtFriEnd());
            suggestion.setSuggestedTrmtSatStart(request.getSuggestedTrmtSatStart());
            suggestion.setSuggestedTrmtSatEnd(request.getSuggestedTrmtSatEnd());
            suggestion.setSuggestedNoTrmtSun(request.getSuggestedNoTrmtSun());
            suggestion.setSuggestedNoTrmtHoli(request.getSuggestedNoTrmtHoli());
            suggestion.setSuggestedLunchWeek(request.getSuggestedLunchWeek());
            
            OperatingTimeSuggestion savedSuggestion = operatingTimeSuggestionService.saveSuggestion(suggestion);
            return ResponseEntity.ok(Map.of(
                "message", "영업시간 수정 제안이 성공적으로 제출되었습니다.",
                "suggestionId", savedSuggestion.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "message", "제안 제출 중 오류가 발생했습니다."
            ));
        }
    }

    @PostMapping("/suggestions/{suggestionId}/approve")
    public ResponseEntity<Map<String, Object>> approveSuggestion(@PathVariable Long suggestionId) {
        try {
            OperatingTimeSuggestion approvedSuggestion = operatingTimeSuggestionService.approveSuggestion(suggestionId);
            return ResponseEntity.ok(Map.of(
                "message", "영업시간 수정 제안이 승인되었습니다.",
                "suggestionId", approvedSuggestion.getId(),
                "status", approvedSuggestion.getStatus()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "message", "제안 승인 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/suggestions/{suggestionId}/reject")
    public ResponseEntity<Map<String, Object>> rejectSuggestion(
            @PathVariable Long suggestionId,
            @RequestBody Map<String, String> request) {
        try {
            String reason = request.get("reason");
            OperatingTimeSuggestion rejectedSuggestion = operatingTimeSuggestionService.rejectSuggestion(suggestionId, reason);
            return ResponseEntity.ok(Map.of(
                "message", "영업시간 수정 제안이 거부되었습니다.",
                "suggestionId", rejectedSuggestion.getId(),
                "status", rejectedSuggestion.getStatus()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "message", "제안 거부 중 오류가 발생했습니다: " + e.getMessage()
            ));
        }
    }
} 