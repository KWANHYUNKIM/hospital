import React, { useState, useEffect } from 'react';
import sessionManager from '../../utils/sessionManager';

const AnalyticsConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // 사용자 동의 상태 확인
    const hasConsent = sessionManager.hasUserConsent();
    const hasShownBanner = localStorage.getItem('analytics_banner_shown');
    
    // 동의하지 않았고 배너를 보여주지 않았다면 배너 표시
    if (!hasConsent && !hasShownBanner) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    sessionManager.setUserConsent(true);
    localStorage.setItem('analytics_banner_shown', 'true');
    setShowBanner(false);
    setShowModal(false);
    
    // 동의 후 페이지 새로고침하여 이벤트 수집 시작
    window.location.reload();
  };

  const handleDecline = () => {
    sessionManager.setUserConsent(false);
    localStorage.setItem('analytics_banner_shown', 'true');
    setShowBanner(false);
    setShowModal(false);
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // 배너 컴포넌트
  const ConsentBanner = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            🍪 개인정보 수집 동의
          </h3>
          <p className="text-sm text-gray-600">
            더 나은 서비스를 위해 검색 패턴과 사용 행동을 분석합니다. 
            <button 
              onClick={handleShowModal}
              className="text-blue-600 hover:underline ml-1"
            >
              자세히 보기
            </button>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            거부
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            동의
          </button>
        </div>
      </div>
    </div>
  );

  // 모달 컴포넌트
  const ConsentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              개인정보 수집 및 이용 동의
            </h2>
            <button
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">📊 수집하는 정보</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>검색어 및 검색 결과</li>
                <li>페이지 방문 기록</li>
                <li>클릭 패턴 및 체류 시간</li>
                <li>기기 정보 (브라우저, 운영체제)</li>
                <li>IP 주소 (지역 기반 서비스 제공용)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">🎯 이용 목적</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>검색 결과 개선 및 맞춤형 추천</li>
                <li>서비스 사용성 개선</li>
                <li>인기 병원 및 검색어 분석</li>
                <li>오류 및 성능 모니터링</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">🔒 보안 및 보관</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>암호화된 통신으로 안전하게 전송</li>
                <li>개인을 식별할 수 없는 형태로 처리</li>
                <li>최대 2년간 보관 후 자동 삭제</li>
                <li>언제든지 동의 철회 가능</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800">
                <strong>💡 팁:</strong> 동의하시면 더 정확한 병원 추천과 
                개인화된 검색 결과를 받으실 수 있습니다.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleDecline}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              거부
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              동의
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showBanner && <ConsentBanner />}
      {showModal && <ConsentModal />}
    </>
  );
};

export default AnalyticsConsent; 