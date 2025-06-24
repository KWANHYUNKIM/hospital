package com.bippobippo.hospital.repository.bus;

import com.bippobippo.hospital.model.bus.BusStation;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BusStationRepository extends MongoRepository<BusStation, String> {
    List<BusStation> findByCityCode(String cityCode);
    List<BusStation> findByStationNmContaining(String stationNm);
} 