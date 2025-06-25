package com.bippobippo.hospital.repository.bus;

import com.bippobippo.hospital.model.bus.BusRouteTracking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface BusRouteTrackingRepository extends MongoRepository<BusRouteTracking, String> {
    
    // 특정 버스의 현재 운행 중인 경로 조회
    Optional<BusRouteTracking> findByVehicleNoAndIsActiveTrue(String vehicleNo);
    
    // 특정 노선의 현재 운행 중인 모든 버스 경로 조회
    List<BusRouteTracking> findByRouteIdAndIsActiveTrue(String routeId);
    
    // 특정 도시의 현재 운행 중인 모든 버스 경로 조회
    List<BusRouteTracking> findByCityCodeAndIsActiveTrue(String cityCode);
    
    // 특정 기간의 운행 기록 조회
    List<BusRouteTracking> findByStartTimeBetween(Date startDate, Date endDate);
    
    // 특정 버스의 모든 운행 기록 조회 (최신순)
    List<BusRouteTracking> findByVehicleNoOrderByStartTimeDesc(String vehicleNo);
    
    // 특정 노선의 모든 운행 기록 조회 (최신순)
    List<BusRouteTracking> findByRouteIdOrderByStartTimeDesc(String routeId);
    
    // 특정 정류장을 경유한 운행 기록 조회
    @Query("{'stationVisits.stationId': ?0}")
    List<BusRouteTracking> findByStationIdInVisits(String stationId);
    
    // 완료된 운행 기록만 조회
    List<BusRouteTracking> findByIsActiveFalse();
    
    // 특정 시간 이후에 시작한 운행 기록 조회
    List<BusRouteTracking> findByStartTimeAfter(Date startTime);
    
    // 운행 중인 버스 수 조회
    long countByIsActiveTrue();
    
    // 특정 노선의 운행 중인 버스 수 조회
    long countByRouteIdAndIsActiveTrue(String routeId);
    
    // 전체 운행 중인 버스들 조회
    List<BusRouteTracking> findByIsActiveTrue();
} 