package com.bippobippo.hospital.service.bus;

import com.bippobippo.hospital.model.bus.BusLocation;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusLocationCacheService {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    
    private static final String BUS_LOCATION_KEY_PREFIX = "bus:location:";
    private static final String BUS_ROUTE_LOCATIONS_KEY_PREFIX = "bus:route:locations:";
    private static final int CACHE_TTL_SECONDS = 300; // 5분
    
    // 개별 버스 위치 캐싱
    public void cacheBusLocation(BusLocation location) {
        try {
            String key = BUS_LOCATION_KEY_PREFIX + location.getRouteId() + ":" + location.getVehicleNo();
            String value = objectMapper.writeValueAsString(location);
            redisTemplate.opsForValue().set(key, value, CACHE_TTL_SECONDS, TimeUnit.SECONDS);
        } catch (JsonProcessingException e) {
            log.error("버스 위치 캐싱 실패: {}", e.getMessage());
        }
    }
    
    // 노선별 버스 위치 목록 캐싱
    public void cacheBusLocationsByRoute(String routeId, List<BusLocation> locations) {
        try {
            String key = BUS_ROUTE_LOCATIONS_KEY_PREFIX + routeId;
            String value = objectMapper.writeValueAsString(locations);
            redisTemplate.opsForValue().set(key, value, CACHE_TTL_SECONDS, TimeUnit.SECONDS);
        } catch (JsonProcessingException e) {
            log.error("노선별 버스 위치 캐싱 실패: {}", e.getMessage());
        }
    }
    
    // 캐시된 버스 위치 조회
    public BusLocation getCachedBusLocation(String routeId, String vehicleNo) {
        try {
            String key = BUS_LOCATION_KEY_PREFIX + routeId + ":" + vehicleNo;
            String value = redisTemplate.opsForValue().get(key);
            if (value != null) {
                return objectMapper.readValue(value, BusLocation.class);
            }
        } catch (JsonProcessingException e) {
            log.error("캐시된 버스 위치 조회 실패: {}", e.getMessage());
        }
        return null;
    }
    
    // 캐시된 노선별 버스 위치 목록 조회
    public List<BusLocation> getCachedBusLocationsByRoute(String routeId) {
        try {
            String key = BUS_ROUTE_LOCATIONS_KEY_PREFIX + routeId;
            String value = redisTemplate.opsForValue().get(key);
            if (value != null) {
                return objectMapper.readValue(value, 
                    objectMapper.getTypeFactory().constructCollectionType(List.class, BusLocation.class));
            }
        } catch (JsonProcessingException e) {
            log.error("캐시된 노선별 버스 위치 조회 실패: {}", e.getMessage());
        }
        return null;
    }
    
    // 캐시 삭제
    public void deleteCachedBusLocation(String routeId, String vehicleNo) {
        String key = BUS_LOCATION_KEY_PREFIX + routeId + ":" + vehicleNo;
        redisTemplate.delete(key);
    }
    
    // 노선별 캐시 삭제
    public void deleteCachedBusLocationsByRoute(String routeId) {
        String key = BUS_ROUTE_LOCATIONS_KEY_PREFIX + routeId;
        redisTemplate.delete(key);
    }
    
    // 캐시 히트율 확인
    public boolean isCached(String routeId, String vehicleNo) {
        String key = BUS_LOCATION_KEY_PREFIX + routeId + ":" + vehicleNo;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
} 