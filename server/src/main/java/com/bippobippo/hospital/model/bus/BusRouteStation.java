package com.bippobippo.hospital.model.bus;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Document(collection = "bus_route_stations")
public class BusRouteStation {
    @Id
    private String id;
    private String routeId;
    private String routeNo;
    private String cityCode;
    private String stationId;
    private String stationNm;
    private String stationNo;
    private int stationSeq; // 정류장 순서
    private String gpsY; // 위도
    private String gpsX; // 경도
    private Date updatedAt;
} 