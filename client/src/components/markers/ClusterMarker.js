import React, { useEffect } from 'react';

const ClusterMarker = ({ 
  map, 
  position, 
  cluster,
  onClusterClick = () => {},
  zoomLevel,
}) => {
  const [marker, setMarker] = React.useState(null);

  useEffect(() => {
    if (!map || !cluster) return;

    // 클러스터 마커인 경우
    const { clusterCount = 1 } = cluster;
    const size = Math.min(36 + (clusterCount * 1.5), 48);
    const fontSize = Math.min(12 + (clusterCount / 10), 16);

    const newMarker = new window.naver.maps.Marker({
      position: position,
      map: map,
      icon: {
        content: `
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
              font-size: ${fontSize}px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              pointer-events: auto;
            ">
              ${clusterCount}
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
        `,
        size: new window.naver.maps.Size(size, size),
        anchor: new window.naver.maps.Point(size/2, size/2)
      }
    });

    // 클릭 이벤트 처리
    window.naver.maps.Event.addListener(newMarker, 'click', () => {
      const point = map.getProjection().fromCoordToOffset(position);
      const pixelOffset = new window.naver.maps.Point(0, -size - 10); // 마커 크기 + 여백만큼 위로
      const adjustedPoint = {
        x: point.x + pixelOffset.x,
        y: point.y + pixelOffset.y
      };
      onClusterClick(cluster, adjustedPoint);
    });

    // 마우스 이벤트 처리
    window.naver.maps.Event.addListener(newMarker, 'mouseover', () => {
      newMarker.setIcon({
        content: `
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
              font-size: ${fontSize}px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.22);
              pointer-events: auto;
            ">
              ${clusterCount}
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
        `,
        size: new window.naver.maps.Size(size, size),
        anchor: new window.naver.maps.Point(size/2, size/2)
      });
    });

    window.naver.maps.Event.addListener(newMarker, 'mouseout', () => {
      newMarker.setIcon({
        content: `
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
              font-size: ${fontSize}px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              pointer-events: auto;
            ">
              ${clusterCount}
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
        `,
        size: new window.naver.maps.Size(size, size),
        anchor: new window.naver.maps.Point(size/2, size/2)
      });
    });

    setMarker(newMarker);

    return () => {
      if (newMarker) {
        newMarker.setMap(null);
      }
    };
  }, [map, position, cluster, onClusterClick]);

};

export default ClusterMarker; 