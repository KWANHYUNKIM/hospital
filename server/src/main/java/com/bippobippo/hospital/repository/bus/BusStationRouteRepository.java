package com.bippobippo.hospital.repository.bus;

import com.bippobippo.hospital.model.bus.BusStationRoute;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface BusStationRouteRepository extends MongoRepository<BusStationRoute, String> {
    
    // 정류장 ID로 조회
    Optional<BusStationRoute> findByStationId(String stationId);
    
    // 정류장명으로 조회
    List<BusStationRoute> findByStationNmContaining(String stationNm);
    
    // 도시코드로 조회
    List<BusStationRoute> findByCityCode(String cityCode);
    
    // 정류장명과 도시코드로 조회
    Optional<BusStationRoute> findByStationNmAndCityCode(String stationNm, String cityCode);
    
    // 특정 노선이 정차하는 정류장들 조회
    List<BusStationRoute> findByRoutesRouteId(String routeId);
    
    // 정류장명으로 검색 (부분 일치)
    List<BusStationRoute> findByStationNmContainingIgnoreCase(String stationNm);
} 