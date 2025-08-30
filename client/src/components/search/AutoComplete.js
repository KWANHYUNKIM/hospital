import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAutoComplete } from '../../service/hospitalApi';
import { getApiUrl } from '../../utils/api';
import { useAnalytics } from '../../hooks/useAnalytics';

const AutoComplete = ({ searchQuery, setSearchQuery }) => {
  const [suggestions, setSuggestions] = useState({ hospital: [] });
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();
  
  // 이벤트 수집 훅 사용
  const { sendSearchEvent, sendPageViewEvent } = useAnalytics();

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
    setSearchHistory(storedHistory);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions({ hospital: [] });
      return;
    }

    const timer = setTimeout(() => {
      const params = { query: searchQuery.trim() };

      fetchAutoComplete(params)
        .then(data => {
          setSuggestions({ hospital: data.hospital || [] });
          setSelectedIndex(-1);
        })
        .catch(() => {
          setSuggestions({ hospital: [] });
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async (queryParam = searchQuery) => {
    const trimmedQuery = queryParam.trim();
  
    // 검색어가 있으면 검색어 기반 검색 실행
    if (trimmedQuery) {
      let updatedHistory = [
        trimmedQuery,
        ...searchHistory.filter((h) => h !== trimmedQuery),
      ];
      updatedHistory = updatedHistory.slice(0, 10);
      localStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
      setSearchHistory(updatedHistory);
      
      // 이벤트 수집: 검색 이벤트 전송
      const searchResultsCount = suggestions.hospital ? suggestions.hospital.length : 0;
      await sendSearchEvent(trimmedQuery, searchResultsCount, {
        region: extractRegionFromQuery(trimmedQuery)
      });
      
      // 검색 URL 생성 (위치 정보 제거)
      let url = `/hospitals?query=${encodeURIComponent(trimmedQuery)}`;
      
      navigate(url);
      return;
    }
  
    // 검색어가 없으면 아무것도 하지 않음
    return;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => {
        const nextIndex = prev + 1;
        return nextIndex >= suggestions.hospital.length ? 0 : nextIndex;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => {
        const nextIndex = prev - 1;
        return nextIndex < 0 ? suggestions.hospital.length - 1 : nextIndex;
      });
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.hospital.length) {
        handleSearch(suggestions.hospital[selectedIndex].name);
      } else {
        handleSearch();
      }
    }
  };

  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // 지역 추출 헬퍼 함수
  const extractRegionFromQuery = (query) => {
    const regions = [
      "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
      "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
    ];
    
    for (const region of regions) {
      if (query.includes(region)) {
        return region;
      }
    }
    return null;
  };

  return (
    <div className="relative w-full">
      <div className="flex flex-col relative">
        <div className="flex relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="어떤 병원을 찾으시나요?"
            className="flex-1 p-3 border border-gray-300 rounded-l-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
          />
          <button
            onClick={() => handleSearch()}
            className="bg-purple-500 text-white px-4 py-2 rounded-r-lg shadow-sm hover:bg-purple-600"
          >
            검색
          </button>

          {searchQuery && (
            <div className="absolute z-10 bg-white border border-gray-300 mt-1 w-full rounded-lg shadow-lg overflow-hidden" style={{ top: '100%', maxHeight: '240px' }}>
              {(suggestions.hospital || []).length === 0 ? (
                <div className="p-3 text-gray-500 text-center">❌ 검색 결과 없음</div>
              ) : (
                <ul 
                  ref={suggestionsRef}
                  className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                  style={{ maxHeight: '240px' }}
                >
                  {(suggestions.hospital || []).map((hospital, idx) => (
                    <li 
                      key={idx} 
                      onMouseDown={() => handleSearch(hospital.name)}
                      className={`p-3 hover:bg-gray-200 cursor-pointer border-b text-black text-sm ${
                        idx === selectedIndex ? 'bg-gray-200' : ''
                      }`}
                    >
                      <div className="font-medium text-blue-600">{hospital.name}</div>
                      <div className="text-xs text-gray-500">{hospital.address}</div>
                      {hospital.distance && (
                        <div className="text-xs text-green-600">
                          {hospital.distance.toFixed(1)}km
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoComplete;