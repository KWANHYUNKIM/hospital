package com.bippobippo.hospital.model.bus;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Document(collection = "bus_stations")
public class BusStation {
    @Id
    private String id;
    private String stationId;
    private String stationNm;
    private String gpsY;  // 위도
    private String gpsX;  // 경도
    private Date collectedAt;
    private String stationNo;
    private String cityCode;
    private String cityName;
    private String managementCity;
    private Date updatedAt;
} 