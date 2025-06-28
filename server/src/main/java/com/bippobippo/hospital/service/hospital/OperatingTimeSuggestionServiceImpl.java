package com.bippobippo.hospital.service.hospital;

import com.bippobippo.hospital.entity.OperatingTimeSuggestion;
import com.bippobippo.hospital.repository.OperatingTimeSuggestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OperatingTimeSuggestionServiceImpl implements OperatingTimeSuggestionService {

    private final OperatingTimeSuggestionRepository operatingTimeSuggestionRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public OperatingTimeSuggestion saveSuggestion(OperatingTimeSuggestion suggestion) {
        return operatingTimeSuggestionRepository.save(suggestion);
    }

    @Override
    @Transactional
    public OperatingTimeSuggestion approveSuggestion(Long suggestionId) {
        OperatingTimeSuggestion suggestion = operatingTimeSuggestionRepository.findById(suggestionId)
                .orElseThrow(() -> new RuntimeException("제안을 찾을 수 없습니다."));
        
        String hospitalId = suggestion.getHospitalId();
        
        // MongoDB에서 해당 병원 데이터 조회 (hospitaltimes 컬렉션)
        Query query = new Query(Criteria.where("ykiho").is(hospitalId));
        Map<String, Object> hospital = mongoTemplate.findOne(query, Map.class, "hospitaltimes");
        
        if (hospital == null) {
            // hospitaltimes에서 찾지 못하면 hospitals 컬렉션에서 시도
            hospital = mongoTemplate.findOne(query, Map.class, "hospitals");
            if (hospital == null) {
                throw new RuntimeException("병원을 찾을 수 없습니다: " + hospitalId);
            }
        }
        
        // MongoDB 업데이트 - 최상위 레벨의 영업시간 필드들을 직접 업데이트
        Update update = new Update();
        update.set("trmtMonStart", suggestion.getSuggestedTrmtMonStart());
        update.set("trmtMonEnd", suggestion.getSuggestedTrmtMonEnd());
        update.set("trmtTueStart", suggestion.getSuggestedTrmtTueStart());
        update.set("trmtTueEnd", suggestion.getSuggestedTrmtTueEnd());
        update.set("trmtWedStart", suggestion.getSuggestedTrmtWedStart());
        update.set("trmtWedEnd", suggestion.getSuggestedTrmtWedEnd());
        update.set("trmtThuStart", suggestion.getSuggestedTrmtThuStart());
        update.set("trmtThuEnd", suggestion.getSuggestedTrmtThuEnd());
        update.set("trmtFriStart", suggestion.getSuggestedTrmtFriStart());
        update.set("trmtFriEnd", suggestion.getSuggestedTrmtFriEnd());
        update.set("trmtSatStart", suggestion.getSuggestedTrmtSatStart());
        update.set("trmtSatEnd", suggestion.getSuggestedTrmtSatEnd());
        update.set("noTrmtSun", suggestion.getSuggestedNoTrmtSun());
        update.set("noTrmtHoli", suggestion.getSuggestedNoTrmtHoli());
        update.set("lunchWeek", suggestion.getSuggestedLunchWeek());
        update.set("updatedAt", new java.util.Date());
        
        // hospitaltimes 컬렉션 먼저 시도
        mongoTemplate.updateFirst(query, update, "hospitaltimes");
        
        // hospitals 컬렉션도 업데이트 (백업)
        mongoTemplate.updateFirst(query, update, "hospitals");
        
        // 제안 상태를 승인으로 변경
        suggestion.setStatus(OperatingTimeSuggestion.SuggestionStatus.APPROVED);
        suggestion.setReviewedAt(LocalDateTime.now());
        suggestion.setReviewerNote("승인됨");
        
        return operatingTimeSuggestionRepository.save(suggestion);
    }

    @Override
    public OperatingTimeSuggestion rejectSuggestion(Long suggestionId, String reason) {
        OperatingTimeSuggestion suggestion = operatingTimeSuggestionRepository.findById(suggestionId)
                .orElseThrow(() -> new RuntimeException("제안을 찾을 수 없습니다."));
        
        suggestion.setStatus(OperatingTimeSuggestion.SuggestionStatus.REJECTED);
        suggestion.setReviewedAt(LocalDateTime.now());
        suggestion.setReviewerNote(reason);
        
        return operatingTimeSuggestionRepository.save(suggestion);
    }

    @Override
    public List<OperatingTimeSuggestion> getAllSuggestions() {
        return operatingTimeSuggestionRepository.findAllByOrderBySubmittedAtDesc();
    }

    @Override
    public List<OperatingTimeSuggestion> getPendingSuggestions() {
        return operatingTimeSuggestionRepository.findByStatusOrderBySubmittedAtDesc(OperatingTimeSuggestion.SuggestionStatus.PENDING);
    }
} 