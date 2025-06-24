package com.bippobippo.hospital.service.bus;

import com.bippobippo.hospital.model.bus.BusLocation;
import com.bippobippo.hospital.repository.bus.BusLocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BusLocationService {
    private final BusLocationRepository repository;

    public List<BusLocation> getBusLocations(String routeId) {
        return repository.findByRouteId(routeId);
    }

    public List<BusLocation> getBusLocationsByCity(String cityCode) {
        return repository.findByCityCode(cityCode);
    }

    public List<BusLocation> getAllBusLocations() {
        return repository.findAll();
    }

    public void saveAll(List<BusLocation> locations) {
        repository.saveAll(locations);
    }
} 