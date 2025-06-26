package com.bippobippo.hospital.service.bus;

import com.bippobippo.hospital.model.bus.BusRoute;
import com.bippobippo.hospital.repository.bus.BusRouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BusRouteService {
    private final BusRouteRepository repository;

    public List<BusRoute> getAllRoutes() {
        return repository.findAll();
    }

    public List<BusRoute> getRoutesByCity(String cityCode) {
        return repository.findByCityCode(cityCode);
    }

    public BusRoute getRouteByRouteId(String routeId) {
        return repository.findByRouteId(routeId);
    }

    public List<BusRoute> getRoutesByRouteNo(String routeNo) {
        return repository.findByRouteNo(routeNo);
    }

    public void saveAll(List<BusRoute> routes) {
        repository.saveAll(routes);
    }

    public void deleteAll() {
        repository.deleteAll();
    }

    // 전체 노선 동기화 (신규/변경/삭제)
    public void syncAllBusRoutes(List<BusRoute> newRoutes) {
        Map<String, BusRoute> existing = repository.findAll().stream()
            .collect(Collectors.toMap(BusRoute::getRouteId, r -> r));
        List<BusRoute> toSave = new ArrayList<>();
        Set<String> newRouteIds = new HashSet<>();
        for (BusRoute route : newRoutes) {
            newRouteIds.add(route.getRouteId());
            BusRoute old = existing.get(route.getRouteId());
            if (old == null || !old.equals(route)) {
                toSave.add(route); // 신규 or 변경
            }
        }
        // 삭제 대상
        List<BusRoute> toDelete = existing.values().stream()
            .filter(r -> !newRouteIds.contains(r.getRouteId()))
            .collect(Collectors.toList());
        repository.saveAll(toSave);
        repository.deleteAll(toDelete);
    }

    public long getRouteCount() {
        return repository.count();
    }
} 