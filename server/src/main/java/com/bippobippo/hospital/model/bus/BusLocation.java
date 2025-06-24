package com.bippobippo.hospital.model.bus;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Document(collection = "bus_locations")
public class BusLocation {
    @Id
    private String id;
    private String cityCode;
    private String routeId;
    private String routeNm;
    private String vehicleNo;
    private String nodeId;
    private String nodeNm;
    private double gpsLat;
    private double gpsLong;
    private Date updatedAt;
} 