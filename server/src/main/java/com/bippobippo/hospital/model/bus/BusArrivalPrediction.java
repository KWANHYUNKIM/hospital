package com.bippobippo.hospital.model.bus;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Document(collection = "bus_arrival_predictions")
public class BusArrivalPrediction {
    @Id
    private String id;
    private String routeId;
    private String routeNm;
    private String stationId;
    private String stationNm;
    private int stationSeq;
    private String vehicleNo;
    private double currentLat;
    private double currentLong;
    private double stationLat;
    private double stationLong;
    private int estimatedArrivalMinutes;
    private double distanceKm;
    private double speedKmh;
    private String trafficCondition; // 정상, 혼잡, 원활
    private String weatherCondition; // 맑음, 비, 눈
    private int dayOfWeek; // 1-7 (월-일)
    private int hourOfDay; // 0-23
    private Date predictedAt;
    private Date estimatedArrivalTime;
    private double confidence; // 예측 신뢰도 (0.0-1.0)
    private List<String> factors; // 예측에 사용된 요소들
} 