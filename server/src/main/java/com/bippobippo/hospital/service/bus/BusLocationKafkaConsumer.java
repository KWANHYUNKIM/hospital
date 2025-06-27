package com.bippobippo.hospital.service.bus;

import com.bippobippo.hospital.model.bus.BusLocation;
import com.bippobippo.hospital.websocket.BusLocationWebSocketHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusLocationKafkaConsumer {
    
    private final BusLocationService busLocationService;
    private final BusLocationCacheService cacheService;
    private final BusLocationWebSocketHandler webSocketHandler;
    
    // 원본 버스 위치 데이터 소비
    // @KafkaListener(topics = "bus-location-raw", groupId = "bus-location-processor")
    public void consumeBusLocation(
            @Payload BusLocation location,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION_ID) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        
        try {
            log.debug("버스 위치 데이터 수신: {} (partition: {}, offset: {})", 
                location.getRouteId(), partition, offset);
            
            // 1. MongoDB에 저장
            busLocationService.saveAll(List.of(location));
            
            // 2. Redis에 캐싱
            cacheService.cacheBusLocation(location);
            
            // 3. WebSocket으로 실시간 브로드캐스트
            webSocketHandler.broadcastBusLocationByRoute(location.getRouteId(), location);
            
            log.debug("버스 위치 데이터 처리 완료: {}", location.getRouteId());
            
        } catch (Exception e) {
            log.error("버스 위치 데이터 처리 실패: {}", e.getMessage(), e);
        }
    }
    
    // 가공된 버스 위치 데이터 소비 (예측, 집계 결과)
    // @KafkaListener(topics = "bus-location-processed", groupId = "bus-location-processed-consumer")
    public void consumeProcessedBusLocation(
            @Payload Object processedData,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION_ID) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        
        try {
            log.info("가공된 버스 위치 데이터 수신: {} (partition: {}, offset: {})", 
                processedData.getClass().getSimpleName(), partition, offset);
            
            // 가공된 데이터 처리 (예측 결과, 집계 데이터 등)
            // TODO: 가공된 데이터에 따른 처리 로직 구현
            
        } catch (Exception e) {
            log.error("가공된 버스 위치 데이터 처리 실패: {}", e.getMessage(), e);
        }
    }
} 