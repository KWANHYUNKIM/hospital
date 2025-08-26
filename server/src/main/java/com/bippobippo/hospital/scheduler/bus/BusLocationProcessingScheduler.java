package com.bippobippo.hospital.scheduler.bus;

import com.bippobippo.hospital.service.bus.BusLocationProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BusLocationProcessingScheduler {
    
    private final BusLocationProcessingService processingService;
    
    // 30초마다 실시간 통계 생성
    // @Scheduled(fixedRate = 30000)  // 일시적으로 비활성화
    public void generateRealTimeStats() {
        try {
            log.debug("실시간 버스 위치 통계 생성 시작");
            processingService.generateAndSendRealTimeStats();
        } catch (Exception e) {
            log.error("실시간 통계 생성 스케줄러 오류: {}", e.getMessage(), e);
        }
    }
} 