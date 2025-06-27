package com.bippobippo.hospital.service.bus;

import com.bippobippo.hospital.model.bus.BusStationRoute;
import com.bippobippo.hospital.repository.bus.BusStationRouteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusStationRouteService {
    
    private final BusStationRouteRepository repository;
    
    // 정류장 ID로 조회
    public Optional<BusStationRoute> getByStationId(String stationId) {
        return repository.findByStationId(stationId);
    }
    
    // 정류장명으로 조회
    public List<BusStationRoute> getByStationName(String stationName) {
        return repository.findByStationNmContainingIgnoreCase(stationName);
    }
    
    // 도시코드로 조회
    public List<BusStationRoute> getByCityCode(String cityCode) {
        return repository.findByCityCode(cityCode);
    }
    
    // 정류장명과 도시코드로 조회
    public Optional<BusStationRoute> getByStationNameAndCity(String stationName, String cityCode) {
        return repository.findByStationNmAndCityCode(stationName, cityCode);
    }
    
    // 특정 노선이 정차하는 정류장들 조회
    public List<BusStationRoute> getStationsByRouteId(String routeId) {
        return repository.findByRoutesRouteId(routeId);
    }
    
    // 저장
    public BusStationRoute save(BusStationRoute busStationRoute) {
        return repository.save(busStationRoute);
    }
    
    // 일괄 저장
    public void saveAll(List<BusStationRoute> busStationRoutes) {
        repository.saveAll(busStationRoutes);
    }
    
    // 전체 삭제
    public void deleteAll() {
        repository.deleteAll();
    }
    
    // 전체 개수 조회
    public long getCount() {
        return repository.count();
    }
    
    // 정류장별 정차 버스 정보 생성/업데이트
    public void updateStationRoutes(String stationId, String stationName, String cityCode, 
                                   String gpsY, String gpsX, List<BusStationRoute.RouteInfo> routes) {
        
        Optional<BusStationRoute> existing = repository.findByStationId(stationId);
        
        BusStationRoute busStationRoute;
        if (existing.isPresent()) {
            // 기존 데이터 업데이트
            busStationRoute = existing.get();
            busStationRoute.setStationNm(stationName);
            busStationRoute.setCityCode(cityCode);
            busStationRoute.setGpsY(gpsY);
            busStationRoute.setGpsX(gpsX);
            busStationRoute.setRoutes(routes);
        } else {
            // 새 데이터 생성
            busStationRoute = BusStationRoute.builder()
                .stationId(stationId)
                .stationNm(stationName)
                .cityCode(cityCode)
                .gpsY(gpsY)
                .gpsX(gpsX)
                .routes(routes)
                .build();
        }
        
        repository.save(busStationRoute);
        log.debug("정류장 {} 정차 버스 정보 업데이트 완료 ({}개 노선)", stationId, routes.size());
    }
} 