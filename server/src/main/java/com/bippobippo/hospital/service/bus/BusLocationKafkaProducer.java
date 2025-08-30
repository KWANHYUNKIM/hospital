package com.bippobippo.hospital.service.bus;

// Kafka 관련 클래스 - 개발 전단계로 주석처리
/*
import com.bippobippo.hospital.model.bus.BusLocation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;
import org.springframework.util.concurrent.ListenableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusLocationKafkaProducer {
    
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    private static final String BUS_LOCATION_TOPIC = "bus-location-raw";
    private static final String BUS_LOCATION_PROCESSED_TOPIC = "bus-location-processed";
    
    // 원본 버스 위치 데이터를 Kafka로 전송
    public void sendBusLocation(BusLocation location) {
        String key = location.getRouteId() + ":" + location.getVehicleNo();
        
        ListenableFuture<SendResult<String, Object>> future = 
            kafkaTemplate.send(BUS_LOCATION_TOPIC, key, location);
        
        future.addCallback(
            result -> log.debug("버스 위치 데이터 전송 성공: {} -> {}", key, result.getRecordMetadata()),
            ex -> log.error("버스 위치 데이터 전송 실패: {}", ex.getMessage())
        );
    }
    
    // 노선별 버스 위치 배치 전송
    public void sendBusLocationBatch(String routeId, java.util.List<BusLocation> locations) {
        for (BusLocation location : locations) {
            sendBusLocation(location);
        }
        log.info("노선 {} 버스 위치 {}건 Kafka 전송 완료", routeId, locations.size());
    }
    
    // 가공된 버스 위치 데이터 전송 (예측, 집계 결과)
    public void sendProcessedBusLocation(Object processedData) {
        ListenableFuture<SendResult<String, Object>> future = 
            kafkaTemplate.send(BUS_LOCATION_PROCESSED_TOPIC, "processed", processedData);
        
        future.addCallback(
            result -> log.debug("가공된 버스 위치 데이터 전송 성공: {}", result.getRecordMetadata()),
            ex -> log.error("가공된 버스 위치 데이터 전송 실패: {}", ex.getMessage())
        );
    }
}
*/ 