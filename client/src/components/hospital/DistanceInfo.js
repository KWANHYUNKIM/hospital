import React, { useState, useEffect } from "react";

const DistanceInfo = ({ hospitalLocation }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      console.error("현재 브라우저에서 위치 서비스를 지원하지 않습니다.");
      setLocationError("현재 브라우저에서 위치 서비스를 지원하지 않습니다.");
      return;
    }

    // 권한 상태 확인
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
        if (permissionStatus.state === 'denied') {
          setLocationError("위치 정보 접근이 완전히 차단되었습니다. 브라우저 설정에서 위치 정보 접근을 허용해주세요.");
          return;
        }
        requestLocation();
      }).catch(() => {
        // 권한 API를 지원하지 않는 경우 직접 요청
        requestLocation();
      });
    } else {
      // 권한 API를 지원하지 않는 경우 직접 요청
      requestLocation();
    }
  };

  const requestLocation = () => {
    setIsRequestingPermission(true);
    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lon: longitude });
        setIsRequestingPermission(false);

        // 병원 위치가 존재하는 경우 거리 계산
        if (hospitalLocation) {
          const dist = calculateDistance(latitude, longitude, hospitalLocation.lat, hospitalLocation.lon);
          setDistance(dist);
        }
      },
      (error) => {
        console.error("위치 정보를 가져오는 중 오류 발생:", error);
        setIsRequestingPermission(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("위치 정보 접근이 거부되었습니다. 브라우저 주소창 왼쪽의 자물쇠 아이콘을 클릭하여 위치 정보 접근을 허용해주세요.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("위치 정보를 사용할 수 없습니다. GPS 신호를 확인해주세요.");
            break;
          case error.TIMEOUT:
            setLocationError("위치 정보 요청 시간이 초과되었습니다. 네트워크 상태를 확인해주세요.");
            break;
          default:
            setLocationError("위치 정보를 가져오는 중 오류가 발생했습니다.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // 15초로 증가
        maximumAge: 60000
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, [hospitalLocation]); // 병원 위치가 바뀔 때마다 다시 실행

  // Haversine 공식으로 거리 계산
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // 지구 반지름 (km)
    const toRad = (deg) => (deg * Math.PI) / 180;
    
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
  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)} m`; // 미터 단위로 변환
    }
    return `${distance.toFixed(2)} km`; // km 단위 유지
  };

  const handleRetryLocation = () => {
    getLocation();
  };

  return (
    <>
      {userLocation && distance !== null && (
        <div className="mt-1 text-sm text-gray-600">
          📍 현재 위치에서 {formatDistance(distance)}
        </div>
      )}
      
      {isRequestingPermission && (
        <div className="mt-1 text-sm text-blue-600">
          🔄 위치 정보를 가져오는 중...
        </div>
      )}
      
      {locationError && (
        <div className="mt-1 text-sm text-red-600">
          ⚠️ {locationError}
          <div className="mt-2 text-xs text-gray-500">
            <strong>위치 정보 권한 해결 방법:</strong>
            <br />1. 브라우저 주소창 왼쪽의 자물쇠 아이콘 클릭
            <br />2. "위치 정보" 접근 허용으로 변경
            <br />3. 페이지 새로고침 후 다시 시도
          </div>
          <button
            onClick={handleRetryLocation}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            다시 시도
          </button>
        </div>
      )}
    </>
  );
};

export default DistanceInfo;

