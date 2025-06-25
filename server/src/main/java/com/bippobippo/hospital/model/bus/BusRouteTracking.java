package com.bippobippo.hospital.model.bus;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Document(collection = "bus_route_tracking")
public class BusRouteTracking {
    @Id
    private String id;
    
    // 기본 정보
    private String routeId;
    private String routeNo;
    private String vehicleNo;
    private String cityCode;
    
    // 운행 정보
    private Date startTime;           // 운행 시작 시간
    private Date endTime;             // 운행 종료 시간 (null이면 운행 중)
    private String startStationId;    // 시작 정류장 ID
    private String endStationId;      // 종료 정류장 ID
    private boolean isActive;         // 현재 운행 중인지 여부
    
    // 경로 추적
    private List<StationVisit> stationVisits;  // 방문한 정류장 목록 (순서대로)
    private List<ArrivalPrediction> predictions; // 정류장별 도착 예측 기록
    
    // 통계 정보
    private int totalStations;        // 총 정류장 수
    private double totalDistance;     // 총 운행 거리 (km)
    private int totalDuration;        // 총 운행 시간 (분)
    private double averageSpeed;      // 평균 속도 (km/h)
    
    // 메타데이터
    private Date createdAt;
    private Date updatedAt;
    
    // 수동 setter 추가 (Lombok 문제 해결)
    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
    }
    
    // 정류장 방문 기록
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class StationVisit {
        private String stationId;
        private String stationNm;
        private int stationSeq;
        private Date arrivalTime;     // 실제 도착 시간
        private Date departureTime;   // 실제 출발 시간
        private double gpsLat;
        private double gpsLong;
        private int delayMinutes;     // 지연 시간 (분)
    }
    
    // 도착 예측 기록
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ArrivalPrediction {
        private String stationId;
        private String stationNm;
        private int stationSeq;
        private Date predictedAt;     // 예측 시간
        private Date estimatedArrival; // 예상 도착 시간
        private Date actualArrival;   // 실제 도착 시간
        private int predictedMinutes; // 예측 소요 시간
        private int actualMinutes;    // 실제 소요 시간
        private double confidence;    // 예측 신뢰도
        private double accuracy;      // 예측 정확도 (실제 vs 예측)
        private String factors;       // 예측에 사용된 요소들
    }
} 