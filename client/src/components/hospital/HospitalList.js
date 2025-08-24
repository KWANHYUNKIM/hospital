import React from "react";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from '../../hooks/useAnalytics';

const HospitalList = ({ hospitals, filters, userLocation }) => {
  const navigate = useNavigate();
  
  // 이벤트 수집 훅 사용
  const { sendClickEvent } = useAnalytics();

  const handleDetailClick = async (hospitalId, hospital, position) => {
    try {
      // 이벤트 수집: 클릭 이벤트 전송
      await sendClickEvent(hospitalId, position, {
        pageType: 'HOSPITAL_LIST',
        clickType: 'DETAIL_VIEW',
        hospitalName: hospital.name,
        hospitalAddress: hospital.address,
        searchFilters: filters
      });
      
      const searchParams = new URLSearchParams();
      
      // 현재 위치 정보 추가
      if (userLocation?.latitude && userLocation?.longitude) {
        searchParams.set('lat', userLocation.latitude);
        searchParams.set('lng', userLocation.longitude);
      }
      
      // 필터 정보 추가
      if (filters.type) {
        searchParams.set('type', filters.type);
      }
      
      navigate(`/hospital/details/${hospitalId}?${searchParams.toString()}`);
    } catch (error) {
      console.error('클릭 이벤트 전송 실패:', error);
      // 이벤트 전송 실패해도 페이지 이동은 계속 진행
      const searchParams = new URLSearchParams();
      
      if (userLocation?.latitude && userLocation?.longitude) {
        searchParams.set('lat', userLocation.latitude);
        searchParams.set('lng', userLocation.longitude);
      }
      
      if (filters.type) {
        searchParams.set('type', filters.type);
      }
      
      navigate(`/hospital/details/${hospitalId}?${searchParams.toString()}`);
    }
  };

  return (
    <div className="space-y-4">
      {hospitals.map((hospital, index) => (
        <div key={hospital.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold">{hospital.name}</h3>
              <p className="text-gray-600">{hospital.address}</p>
              {/* ... other hospital info ... */}
            </div>
            <button
              onClick={() => handleDetailClick(hospital.id, hospital, index + 1)}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
            >
              자세히 보기
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HospitalList;