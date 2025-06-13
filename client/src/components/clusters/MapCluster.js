import React, { useEffect, useState } from 'react';
import { fetchMapClusterData } from '../../service/mapApi';
import BoundaryPolygon from '../map/BoundaryPolygon';

const MapCluster = ({ map, zoomLevel, onClusterClick }) => {
  const [clusters, setClusters] = useState([]);
  const [hoveredCluster, setHoveredCluster] = useState(null);

  useEffect(() => {
    if (!map) return;

    const loadClusters = async () => {
      try {
        const bounds = map.getBounds();
        const sw = bounds.getSW();
        const ne = bounds.getNE();
        
        const clusterData = await fetchMapClusterData(
          {
            sw: { lat: sw.lat(), lng: sw.lng() },
            ne: { lat: ne.lat(), lng: ne.lng() }
          },
          zoomLevel
        );
        
        setClusters(clusterData);
      } catch (error) {
        console.error('클러스터 데이터 로드 실패:', error);
      }
    };

    // 지도 이동 이벤트 리스너
    const idleListener = window.naver.maps.Event.addListener(map, 'idle', loadClusters);
    const zoomListener = window.naver.maps.Event.addListener(map, 'zoom_changed', loadClusters);
    
    // 초기 로드
    loadClusters();

    return () => {
      window.naver.maps.Event.removeListener(idleListener);
      window.naver.maps.Event.removeListener(zoomListener);
    };
  }, [map, zoomLevel]);

  // 클러스터 색상 결정 (119 컨셉)
  const getClusterColor = (total) => {
    if (total > 100) return '#FFD43B'; // 진한 노랑
    if (total > 50) return '#FFE066';  // 밝은 노랑
    if (total > 20) return '#FFF9E3';  // 연노랑
    return '#FFFBEA';                  // 아주 연한 노랑
  };

  // 클러스터 마커 생성 및 관리
  useEffect(() => {
    if (!map) return;

    // 기존 마커 제거
    clusters.forEach(cluster => {
      if (cluster.marker) {
        cluster.marker.setMap(null);
      }
    });

    // 새로운 마커 생성
    clusters.forEach(cluster => {
      const position = new window.naver.maps.LatLng(
        cluster.location.lat,
        cluster.location.lon
      );

      const total = cluster.hospitalCount + cluster.pharmacyCount;
      const size = Math.min(32 + Math.floor(Math.log2(total + 1) * 3), 48);

      const markerContent = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: none;
        ">
          <div style="
            background: #fffbe7;
            border: 2px solid #FFD43B;
            border-radius: 16px;
            padding: 6px 16px;
            color: #222;
            font-weight: bold;
            font-size: 15px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            pointer-events: auto;
          ">
            ${cluster.name}
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 12px solid #FFD43B;
            margin-top: -2px;
          "></div>
        </div>
      `;

      const marker = new window.naver.maps.Marker({
        position,
        map,
        icon: {
          content: markerContent,
          anchor: new window.naver.maps.Point(size/2, size/2)
        }
      });

      // 마우스 이벤트 추가
      const element = marker.getElement();
      if (element) {
        element.addEventListener('mouseenter', () => {
          setHoveredCluster(cluster);
        });
        
        element.addEventListener('mouseleave', () => {
          setHoveredCluster(null);
        });
      }

      // 클릭 이벤트 추가
      window.naver.maps.Event.addListener(marker, 'click', () => {
        if (onClusterClick) {
          onClusterClick(cluster, position);
        }
      });

      // 마커 참조 저장
      cluster.marker = marker;
    });

    return () => {
      clusters.forEach(cluster => {
        if (cluster.marker) {
          cluster.marker.setMap(null);
        }
      });
    };
  }, [clusters, map, onClusterClick]);

  return (
    <>
      {hoveredCluster && (
        <BoundaryPolygon
          map={map}
          boundaryType={hoveredCluster.boundaryType}
          name={hoveredCluster.name}
          style={{
            strokeColor: getClusterColor(hoveredCluster.hospitalCount + hoveredCluster.pharmacyCount),
            fillColor: getClusterColor(hoveredCluster.hospitalCount + hoveredCluster.pharmacyCount),
            strokeOpacity: 0.8,
            fillOpacity: 0.2
          }}
        />
      )}
    </>
  );
};

export default MapCluster; 