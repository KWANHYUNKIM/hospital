package com.bippobippo.hospital.service.bus;

import com.bippobippo.hospital.model.bus.BusRouteStation;
import com.bippobippo.hospital.repository.bus.BusRouteStationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BusRouteStationService {
    private final BusRouteStationRepository repository;

    public List<BusRouteStation> getStationsByRoute(String routeId) {
        return repository.findByRouteId(routeId);
    }

    public List<BusRouteStation> getRoutesByStation(String stationId) {
        return repository.findByStationId(stationId);
    }

    public List<BusRouteStation> getStationsByCity(String cityCode) {
        return repository.findByCityCode(cityCode);
    }

    public void saveAll(List<BusRouteStation> routeStations) {
        repository.saveAll(routeStations);
    }

    public void deleteAll() {
        repository.deleteAll();
    }

    public long getCount() {
        return repository.count();
    }

    public long getRouteStationCount() {
        return repository.count();
    }

    public List<BusRouteStation> getRoutesByStationName(String stationName) {
        return repository.findByStationNmContaining(stationName);
    }

    public List<BusRouteStation> getAllRouteStations() {
        return repository.findAll();
    }
} 