package com.bippobippo.hospital.repository.bus;

import com.bippobippo.hospital.model.bus.BusLocation;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BusLocationRepository extends MongoRepository<BusLocation, String> {
    List<BusLocation> findByRouteId(String routeId);
    List<BusLocation> findByCityCode(String cityCode);
} 