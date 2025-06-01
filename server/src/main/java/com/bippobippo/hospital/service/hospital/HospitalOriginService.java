package com.bippobippo.hospital.service.hospital;

import com.bippobippo.hospital.entity.hospital.HospitalOrigin;
import com.bippobippo.hospital.entity.hospital.HospitalOriginHistory;
import com.bippobippo.hospital.entity.user.User;
import com.bippobippo.hospital.repository.hospital.HospitalOriginHistoryRepository;
import com.bippobippo.hospital.repository.hospital.HospitalOriginRepository;
import com.bippobippo.hospital.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HospitalOriginService {
    private final HospitalOriginRepository originRepository;
    private final HospitalOriginHistoryRepository historyRepository;
    private final UserRepository userRepository;

    public List<HospitalOrigin> findAll() {
        return originRepository.findAll();
    }

    @Transactional
    public HospitalOrigin create(HospitalOrigin origin, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        origin.setCreatedBy(userId);
        origin.setUpdatedBy(userId);
        HospitalOrigin savedOrigin = originRepository.save(origin);

        HospitalOriginHistory history = new HospitalOriginHistory();
        history.setOriginId(savedOrigin.getId());
        history.setAction("CREATE");
        history.setNewValue(savedOrigin.toString());
        history.setChangedBy(userId);
        historyRepository.save(history);

        return savedOrigin;
    }

    @Transactional
    public HospitalOrigin update(Integer id, HospitalOrigin origin, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        HospitalOrigin existingOrigin = originRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Origin을 찾을 수 없습니다."));

        String previousValue = existingOrigin.toString();
        
        existingOrigin.setOriginUrl(origin.getOriginUrl());
        existingOrigin.setEnvironment(origin.getEnvironment());
        existingOrigin.setDescription(origin.getDescription());
        existingOrigin.setIsActive(origin.getIsActive());
        existingOrigin.setUpdatedBy(userId);
        
        HospitalOrigin updatedOrigin = originRepository.save(existingOrigin);

        HospitalOriginHistory history = new HospitalOriginHistory();
        history.setOriginId(updatedOrigin.getId());
        history.setAction("UPDATE");
        history.setPreviousValue(previousValue);
        history.setNewValue(updatedOrigin.toString());
        history.setChangedBy(userId);
        historyRepository.save(history);

        return updatedOrigin;
    }

    @Transactional
    public void deactivate(Integer id, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        HospitalOrigin origin = originRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Origin을 찾을 수 없습니다."));

        String previousValue = origin.toString();
        origin.setIsActive(false);
        origin.setUpdatedBy(userId);
        HospitalOrigin updatedOrigin = originRepository.save(origin);

        HospitalOriginHistory history = new HospitalOriginHistory();
        history.setOriginId(updatedOrigin.getId());
        history.setAction("DEACTIVATE");
        history.setPreviousValue(previousValue);
        history.setNewValue(updatedOrigin.toString());
        history.setChangedBy(userId);
        historyRepository.save(history);
    }

    @Transactional
    public void delete(Integer id, Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        HospitalOrigin origin = originRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Origin을 찾을 수 없습니다."));

        String previousValue = origin.toString();
        
        HospitalOriginHistory history = new HospitalOriginHistory();
        history.setOriginId(origin.getId());
        history.setAction("DELETE");
        history.setPreviousValue(previousValue);
        history.setChangedBy(userId);
        historyRepository.save(history);

        originRepository.delete(origin);
    }
} 