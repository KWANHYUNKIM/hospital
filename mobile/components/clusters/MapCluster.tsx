import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { fetchMapClusterData } from '../../services/mapApi';
import BoundaryPolygon from '../map/BoundaryPolygon';

// TypeScript 인터페이스 정의
interface ClusterLocation {
  lat: number;
  lon: number;
}

interface ClusterData {
  id: string;
  name: string;
  location: ClusterLocation;
  hospitalCount: number;
  pharmacyCount: number;
  boundaryType: string;
  marker?: any;
}

interface MapBounds {
  sw: { lat: number; lng: number };
  ne: { lat: number; lng: number };
}

interface MapClusterProps {
  mapRef: React.RefObject<MapView>;
  zoomLevel: number;
  onClusterClick?: (cluster: ClusterData, position: { latitude: number; longitude: number }) => void;
  region: Region;
}

const MapCluster: React.FC<MapClusterProps> = ({ mapRef, zoomLevel, onClusterClick, region }) => {
  const [clusters, setClusters] = useState<ClusterData[]>([]);
  const [hoveredCluster, setHoveredCluster] = useState<ClusterData | null>(null);
  const [mapReady, setMapReady] = useState<boolean>(false);

  // 클러스터 데이터 로드
  const loadClusters = async (currentRegion: Region) => {
    try {
      const bounds: MapBounds = {
        sw: {
          lat: currentRegion.latitude - currentRegion.latitudeDelta / 2,
          lng: currentRegion.longitude - currentRegion.longitudeDelta / 2
        },
        ne: {
          lat: currentRegion.latitude + currentRegion.latitudeDelta / 2,
          lng: currentRegion.longitude + currentRegion.longitudeDelta / 2
        }
      };
      
      const clusterData = await fetchMapClusterData(bounds, zoomLevel);
      setClusters(clusterData);
    } catch (error) {
      console.error('클러스터 데이터 로드 실패:', error);
      Alert.alert('오류', '클러스터 데이터를 불러오는데 실패했습니다.');
    }
  };

  // 지도 영역 변경 시 클러스터 로드
  useEffect(() => {
    if (mapReady) {
      loadClusters(region);
    }
  }, [region, zoomLevel, mapReady]);

  // 클러스터 색상 결정 (119 컨셉)
  const getClusterColor = (total: number): string => {
    if (total > 100) return '#E63946'; // 진한 응급차 레드
    if (total > 50) return '#FF4B4B';  // 밝은 응급차 레드
    if (total > 20) return '#FF6B6B';  // 연한 레드
    return '#FF8585';  // 아주 연한 레드
  };

  // 클러스터 크기 계산
  const getClusterSize = (total: number): number => {
    return Math.min(32 + Math.floor(Math.log2(total + 1) * 3), 48);
  };

  // 클러스터 마커 클릭 핸들러
  const handleClusterPress = (cluster: ClusterData) => {
    if (onClusterClick) {
      const position = {
        latitude: cluster.location.lat,
        longitude: cluster.location.lon
      };
      onClusterClick(cluster, position);
    }
  };

  // 클러스터 마커 컴포넌트
  const ClusterMarker: React.FC<{ cluster: ClusterData }> = ({ cluster }) => {
    const total = cluster.hospitalCount + cluster.pharmacyCount;
    const size = getClusterSize(total);
    const color = getClusterColor(total);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      setHoveredCluster(cluster);
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      setHoveredCluster(null);
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Marker
        coordinate={{
          latitude: cluster.location.lat,
          longitude: cluster.location.lon
        }}
        onPress={() => handleClusterPress(cluster)}
        anchor={{ x: 0.5, y: 0.5 }}
      >
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => handleClusterPress(cluster)}
          activeOpacity={0.8}
        >
          <Animated.View style={[
            styles.clusterMarker,
            {
              width: size,
              height: size,
              backgroundColor: color,
              transform: [{ scale: scaleAnim }]
            }
          ]}>
            <Text style={[
              styles.clusterText,
              {
                fontSize: size > 40 ? 14 : 12,
                color: '#FFFFFF'
              }
            ]}>
              {cluster.name}
            </Text>
          </Animated.View>
          
          {/* 호버 정보 */}
          {hoveredCluster?.id === cluster.id && (
            <View style={[styles.clusterInfo, { backgroundColor: color }]}>
              <Text style={styles.clusterInfoText}>
                병원 {cluster.hospitalCount || 0} · 약국 {cluster.pharmacyCount || 0}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Marker>
    );
  };

  return (
    <>
      {/* 클러스터 마커들 */}
      {clusters.map((cluster) => (
        <ClusterMarker key={cluster.id || `${cluster.name}-${cluster.location.lat}-${cluster.location.lon}`} cluster={cluster} />
      ))}
      
      {/* 호버된 클러스터의 경계 폴리곤 */}
      {hoveredCluster && (
        <BoundaryPolygon
          mapRef={mapRef}
          boundaryType={hoveredCluster.boundaryType}
          name={hoveredCluster.name}
          strokeColor={getClusterColor(hoveredCluster.hospitalCount + hoveredCluster.pharmacyCount)}
          fillColor={getClusterColor(hoveredCluster.hospitalCount + hoveredCluster.pharmacyCount)}
          strokeOpacity={0.8}
          fillOpacity={0.2}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  clusterMarker: {
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    minWidth: 32,
    minHeight: 32,
  },
  clusterText: {
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  clusterInfo: {
    position: 'absolute',
    top: -45,
    left: '50%',
    transform: [{ translateX: -50 }],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 10,
  },
  clusterInfoText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default MapCluster; 