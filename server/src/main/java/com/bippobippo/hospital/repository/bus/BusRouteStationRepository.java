package com.bippobippo.hospital.repository.bus;

import com.bippobippo.hospital.model.bus.BusRouteStation;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BusRouteStationRepository extends MongoRepository<BusRouteStation, String> {
    List<BusRouteStation> findByRouteId(String routeId);
    List<BusRouteStation> findByStationId(String stationId);
    List<BusRouteStation> findByCityCode(String cityCode);
    List<BusRouteStation> findByRouteIdAndStationId(String routeId, String stationId);
} 