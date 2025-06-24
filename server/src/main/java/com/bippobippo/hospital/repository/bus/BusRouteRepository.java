package com.bippobippo.hospital.repository.bus;

import com.bippobippo.hospital.model.bus.BusRoute;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BusRouteRepository extends MongoRepository<BusRoute, String> {
    List<BusRoute> findByCityCode(String cityCode);
    BusRoute findByRouteId(String routeId);
    List<BusRoute> findByRouteNo(String routeNo);
} 