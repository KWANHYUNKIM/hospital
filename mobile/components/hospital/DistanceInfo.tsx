import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// TypeScript 인터페이스 정의
interface Location {
  lat: number;
  lon: number;
}

interface DistanceInfoProps {
  hospitalLocation?: Location;
}

const DistanceInfo: React.FC<DistanceInfoProps> = ({ hospitalLocation }) => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 위치 권한 요청 및 현재 위치 가져오기
    const getCurrentLocation = () => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentLocation = { lat: latitude, lon: longitude };
          setUserLocation(currentLocation);

          // 병원 위치가 존재하는 경우 거리 계산
          if (hospitalLocation) {
            const dist = calculateDistance(
              latitude, 
              longitude, 
              hospitalLocation.lat, 
              hospitalLocation.lon
            );
            setDistance(dist);
          }
          setError(null);
        },
        (err) => {
          console.error('위치 정보를 가져오는 중 오류 발생:', err);
          let errorMessage = '위치 정보를 가져올 수 없습니다.';
          
          switch (err.code) {
            case 1:
              errorMessage = '위치 권한이 거부되었습니다.';
              break;
            case 2:
              errorMessage = '위치를 찾을 수 없습니다.';
              break;
            case 3:
              errorMessage = '위치 요청 시간이 초과되었습니다.';
              break;
          }
          setError(errorMessage);
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 300000, // 5분
        }
      );
    };

    getCurrentLocation();
  }, [hospitalLocation]);

  // Haversine 공식으로 거리 계산
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // 지구 반지름 (km)
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // 거리 반환 (km 단위)
  };

  // 거리를 미터(m)로 변환 (1km 미만일 경우)
  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`; // 미터 단위로 변환
    }
    return `${distance.toFixed(2)}km`; // km 단위 유지
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>📍 {error}</Text>
      </View>
    );
  }

  if (distance !== null) {
    return (
      <View style={styles.container}>
        <Text style={styles.distanceText}>
          📍 현재 위치에서 {formatDistance(distance)}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>📍 거리 계산 중...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  distanceText: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default DistanceInfo; 