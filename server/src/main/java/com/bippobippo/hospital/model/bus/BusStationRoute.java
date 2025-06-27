package com.bippobippo.hospital.model.bus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bus_station_routes")
public class BusStationRoute {
    
    @Id
    private String id;
    
    @Indexed
    private String stationId;        // 정류장 ID
    
    @Indexed
    private String stationNm;        // 정류장명
    
    @Indexed
    private String cityCode;         // 도시코드
    
    private String gpsY;             // 위도
    private String gpsX;             // 경도
    
    // 해당 정류장에 정차하는 노선들
    private List<RouteInfo> routes;
    
    private Date updatedAt;          // 업데이트 시간
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RouteInfo {
        private String routeId;      // 노선 ID
        private String routeNo;      // 노선번호
        private String routeNm;      // 노선명
        private int stationSeq;      // 정류장 순서
        private String direction;    // 운행방향 (상행/하행)
        private String firstBusTime; // 첫차 시간
        private String lastBusTime;  // 막차 시간
        private int interval;        // 배차간격 (분)
    }
} 