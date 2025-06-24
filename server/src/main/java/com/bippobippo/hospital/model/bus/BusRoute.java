package com.bippobippo.hospital.model.bus;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Document(collection = "bus_routes")
public class BusRoute {
    @Id
    private String id;
    private String routeId;
    private String routeNo;
    private String routeTp;
    private String startNodeNm;
    private String endNodeNm;
    private String startVehicleTime;
    private String endVehicleTime;
    private String cityCode;
    private Date updatedAt;
} 