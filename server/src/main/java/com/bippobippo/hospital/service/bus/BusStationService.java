package com.bippobippo.hospital.service.bus;

import com.bippobippo.hospital.model.bus.BusStation;
import com.bippobippo.hospital.repository.bus.BusStationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BusStationService {
    private final BusStationRepository repository;

    public List<BusStation> getAllStations() {
        return repository.findAll();
    }

    public List<BusStation> getStationsByCity(String cityCode) {
        return repository.findByCityCode(cityCode);
    }

    public List<BusStation> searchStationsByName(String stationNm) {
        return repository.findByStationNmContaining(stationNm);
    }

    public long getStationCount() {
        return repository.count();
    }

    public BusStation getStationById(String stationId) {
        return repository.findByStationId(stationId);
    }

    public void saveAll(List<BusStation> stations) {
        repository.saveAll(stations);
    }

    public void deleteAll() {
        repository.deleteAll();
    }
} 