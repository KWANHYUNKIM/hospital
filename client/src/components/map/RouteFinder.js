import React, { useState, useEffect, useRef } from 'react';
import { getApiUrl } from '../../utils/api';
import { searchLocation } from '../../service/mapApi';

const RouteFinder = ({ isVisible, onClose, destination, setDestination, currentLocation }) => {
  const [route, setRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transportMode, setTransportMode] = useState('driving'); // driving, walking, transit
  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);

  // 출발지/도착지 입력값 초기화
  useEffect(() => {
    if (currentLocation) {
      setOriginInput('현재 위치');
    }
    if (destination && (destination.lat || destination.lng)) {
      setDestinationInput(destination.name || destination.yadmNm || destination.addr || '');
    }
  }, [currentLocation, destination]);

  // 도착지 입력 변경 시 자동완성 검색
  useEffect(() => {
    if (destinationInput && destinationInput.trim().length > 1) {
      setIsSearching(true);
      searchLocation(destinationInput)
        .then(results => {
          const mappedResults = results.map(item => ({
            ...item,
            name: item.yadmNm || item.name || '이름 없음',
            address: item.addr || item.address || '주소 없음',
            lat: item.location?.lat || item.lat,
            lng: item.location?.lon || item.lng
          }));
          setSuggestions(mappedResults);
          setShowSuggestions(true);
        })
        .catch(() => {
          setSuggestions([]);
          setShowSuggestions(false);
        })
        .finally(() => setIsSearching(false));
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [destinationInput]);

  // 자동완성 항목 클릭
  const handleSuggestionClick = (suggestion) => {
    setDestinationInput(suggestion.name);
    setDestination({
      ...suggestion,
      name: suggestion.name,
      lat: suggestion.lat,
      lng: suggestion.lng
    });
    setShowSuggestions(false);
  };

  // 경로 계산
  const calculateRoute = async () => {
    if (!destination || !destination.lat || !destination.lng || !currentLocation) {
      setError('출발지와 도착지 정보가 필요합니다.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${getApiUrl()}/api/map/route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: {
            lat: currentLocation.lat,
            lng: currentLocation.lng
          },
          destination: {
            lat: destination.lat,
            lng: destination.lng,
            name: destination.name
          },
          mode: transportMode
        })
      });
      if (!response.ok) {
        throw new Error('경로 계산 중 오류가 발생했습니다.');
      }
      const routeData = await response.json();
      setRoute(routeData);
    } catch (err) {
      console.error('경로 계산 오류:', err);
      setError('경로를 계산할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 좌표가 있는 경우에만 경로 계산 버튼 활성화
  const canCalculate = originInput && destination && destination.lat && destination.lng;

  if (!isVisible) return null;

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
  };
  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)}km`;
    }
    return `${meters}m`;
  };
  const getTransportIcon = (mode) => {
    switch (mode) {
      case 'driving': return '🚗';
      case 'walking': return '🚶';
      case 'transit': return '🚌';
      default: return '🚗';
    }
  };
  const getTransportLabel = (mode) => {
    switch (mode) {
      case 'driving': return '자동차';
      case 'walking': return '도보';
      case 'transit': return '대중교통';
      default: return '자동차';
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl flex flex-col items-center">
      <div className="w-full bg-white rounded-lg shadow-lg px-6 py-4 flex flex-col gap-2 border border-gray-200">
        {/* 헤더 및 닫기버튼 */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">빠른길찾기</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* 출발지/도착지 입력 */}
        <div className="flex gap-2 items-center mb-2">
          <div className="flex-1 flex items-center bg-white rounded-lg border border-gray-300 px-3 py-2 shadow-lg">
            <span className="text-green-500 text-xl mr-2">▶</span>
            <input
              type="text"
              className="w-full bg-transparent outline-none"
              value={originInput}
              onChange={e => setOriginInput(e.target.value)}
              placeholder="출발지 입력 (예: 현재 위치)"
              disabled
            />
          </div>
          <button className="mx-2 text-gray-400 hover:text-gray-600" title="출발/도착 바꾸기" disabled>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4M21 5H3M7 23l-4-4 4-4M3 19h18"/></svg>
          </button>
          <div className="flex-1 flex flex-col relative">
            <div className="flex items-center bg-white rounded-lg border border-gray-300 px-3 py-2 shadow-lg">
              <span className="text-red-500 text-xl mr-2">📍</span>
              <input
                ref={inputRef}
                type="text"
                className="w-full bg-transparent outline-none"
                value={destinationInput}
                onChange={e => {
                  setDestinationInput(e.target.value);
                  setDestination({}); // 좌표 없는 상태로 초기화
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="도착지 입력"
                autoComplete="off"
              />
              {isSearching && (
                <svg className="animate-spin h-5 w-5 text-gray-400 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex flex-col border-b border-gray-100 last:border-b-0"
                  >
                    <span className="font-medium text-gray-900">{suggestion.name}</span>
                    <span className="text-sm text-gray-500">{suggestion.address}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* 교통수단 선택 */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2">
            {['driving', 'walking', 'transit'].map((mode) => (
              <button
                key={mode}
                onClick={() => setTransportMode(mode)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  transportMode === mode
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{getTransportIcon(mode)}</span>
                <span>{getTransportLabel(mode)}</span>
              </button>
            ))}
          </div>
          <button
            onClick={calculateRoute}
            disabled={!canCalculate || isLoading}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ml-4 ${canCalculate && !isLoading ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            길찾기
          </button>
        </div>
        {/* 경로 정보 */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">경로를 계산하는 중...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-2">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}
        {route && !isLoading && (
          <div className="space-y-4 mt-2">
            {/* 요약 정보 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">총 거리</span>
                <span className="font-semibold text-blue-900">
                  {formatDistance(route.distance)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">예상 소요시간</span>
                <span className="font-semibold text-blue-900">
                  {formatDuration(route.duration)}
                </span>
              </div>
            </div>
            {/* 경로 단계 */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">상세 경로</h3>
              <div className="space-y-3">
                {route.steps?.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-700">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{step.instruction}</p>
                      {step.distance && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistance(step.distance)} • {formatDuration(step.duration)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* 지도에서 보기 버튼 */}
            <button
              onClick={() => {
                // 지도에서 경로를 표시하는 로직
                console.log('지도에서 경로 표시');
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              지도에서 보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteFinder; 