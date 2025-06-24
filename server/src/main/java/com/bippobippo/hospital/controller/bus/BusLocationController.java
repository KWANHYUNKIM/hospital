package com.bippobippo.hospital.controller.bus;

import com.bippobippo.hospital.model.bus.BusLocation;
import com.bippobippo.hospital.service.bus.BusLocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bus")
@RequiredArgsConstructor
public class BusLocationController {
    private final BusLocationService busLocationService;

    @GetMapping("/locations")
    public List<BusLocation> getBusLocations(@RequestParam String routeId) {
        return busLocationService.getBusLocations(routeId);
    }

    @GetMapping("/locations/city/{cityCode}")
    public List<BusLocation> getBusLocationsByCity(@PathVariable String cityCode) {
        return busLocationService.getBusLocationsByCity(cityCode);
    }

    @GetMapping("/locations/all")
    public List<BusLocation> getAllBusLocations() {
        return busLocationService.getAllBusLocations();
    }
} 