import React, { useState, useEffect, useCallback } from 'react';
import {
  FaSearch,
  FaListUl,
  FaLayerGroup,
  FaMap,
  FaThermometerHalf,
  FaBus,
  FaBookmark,
  FaShareAlt,
  FaInfoCircle,
  FaSatellite,
  FaExpand,
  FaCompress,
  FaUndo,
  FaLocationArrow,
  FaRoute
} from 'react-icons/fa';
import { MdOutlineKeyboardArrowUp } from 'react-icons/md';
import { initialMedicalTypes, pharmacyTypes, getMedicalStats } from './constants';
import FilterDropdown from './FilterDropdown';
import ZoomControls from './ZoomControls';
import HelpModal from './HelpModal';
import FullscreenControl from './FullscreenControl';
import LocationControl from './LocationControl';
import ResetControl from './ResetControl';
import ListViewControl from './ListViewControl';
import LayerControl from './LayerControl';
import MapStyleControl from './MapStyleControl';
import RouteFinder from './RouteFinder';

function MapToolbar({
  onSearch,
  onListView,
  onToggleLayers,
  onSwitchStyle,
  onToggleHeatmap,
  onPublicTransport,
  onBookmark,
  onCopyLink,
  onReset,
  onLegend,
  onZoomIn,
  onZoomOut,
  onFilterChange,
  map,
  hospitals,
  pharmacies,
  onItemClick,
  selectedInfo
}) {
  const [showFilter, setShowFilter] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showRouteFinder, setShowRouteFinder] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [medicalStats, setMedicalStats] = useState({
    hospitals: initialMedicalTypes,
    pharmacies: pharmacyTypes
  });
  const [selectedTypes, setSelectedTypes] = useState(initialMedicalTypes.map(t => t.key));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 현재 위치 가져오기
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('현재 위치를 가져올 수 없습니다:', error);
          // 기본 위치 설정 (서울)
          setCurrentLocation({
            lat: 37.5665,
            lng: 126.9780
          });
        }
      );
    } else {
      // 기본 위치 설정 (서울)
      setCurrentLocation({
        lat: 37.5665,
        lng: 126.9780
      });
    }
  }, []);

  // 컴포넌트 마운트 시 현재 위치 가져오기
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // 길찾기 버튼 클릭 핸들러 (토글)
  const handleRouteFinder = () => {
    setShowRouteFinder((prev) => !prev);
  };

  // 검색, 도움말 등 다른 메뉴 클릭 시 RouteFinder 닫기
  const handleSearch = () => {
    setShowRouteFinder(false);
    onSearch && onSearch();
  };
  const handleHelp = () => {
    setShowRouteFinder(false);
    setShowHelp(true);
  };

  // 통계 데이터 가져오기 (이 부분을 주석 처리)
  /*
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getMedicalStats();
        setMedicalStats(stats);
        setSelectedTypes(stats.hospitals.map(t => t.key));
      } catch (error) {
        console.error('통계 데이터 로딩 실패:', error);
      }
    };
    fetchStats();
  }, []);
  */

  const handleTypeToggle = (type) => {
    const next = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(next);
    onFilterChange?.(next);
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`전체화면 오류: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const buttons = [
    { label: '검색',        icon: <FaSearch size={18} />,       onClick: handleSearch },
    { label: '길찾기',      icon: <FaRoute size={18} />,         onClick: handleRouteFinder },
    // { label: '히트맵',      icon: <FaThermometerHalf size={18} />, onClick: onToggleHeatmap },
    // { label: '대중교통',    icon: <FaBus size={18} />,          onClick: onPublicTransport },
    // { label: '북마크',      icon: <FaBookmark size={18} />,     onClick: onBookmark },
    // { label: '공유',        icon: <FaShareAlt size={18} />,     onClick: onCopyLink },
    { label: '풀스크린',    icon: isFullscreen ? <FaCompress size={18} /> : <FaExpand size={18} />, onClick: toggleFullscreen },
    { label: '도움말',      icon: <FaInfoCircle size={18} />,   onClick: handleHelp },
    // { label: '필터',        icon: <FaSatellite size={18} />,    onClick: () => setShowFilter(v => !v) }
  ];

  return (
    <div className="absolute right-2 top-40 z-30 flex flex-col gap-2">
      {/* 툴바 */}
      <div className="bg-white rounded-md shadow-md border border-gray-300 overflow-hidden">
        <div className="bg-purple-500 text-white text-sm font-semibold text-center py-1">
          메뉴
        </div>
        <div className="flex flex-col">
          {buttons.slice(0, 2).map((btn, i) => (
            <button
              key={i}
              onClick={btn.onClick}
              aria-label={btn.label}
              className="flex items-center justify-center w-14 h-12 hover:bg-gray-100 transition"
            >
              <div className="flex flex-col items-center text-sm">
                <div className="mb-1">{btn.icon}</div>
                <span className="text-xs">{btn.label}</span>
              </div>
            </button>
          ))}
          <LocationControl map={map} />
          <ListViewControl 
            hospitals={hospitals} 
            pharmacies={pharmacies} 
            onItemClick={onItemClick}
          />
          <LayerControl onToggleLayers={onToggleLayers} />
          <MapStyleControl map={map} onSwitchStyle={onSwitchStyle} />
          {buttons.slice(2).map((btn, i) => (
            <button
              key={i + 2}
              onClick={btn.onClick}
              aria-label={btn.label}
              className="flex items-center justify-center w-14 h-12 hover:bg-gray-100 transition"
            >
              <div className="flex flex-col items-center text-sm">
                <div className="mb-1">{btn.icon}</div>
                <span className="text-xs">{btn.label}</span>
              </div>
            </button>
          ))}
          <ResetControl map={map} onReset={onReset} />
          <button className="flex items-center justify-center w-14 h-10 hover:bg-gray-100">
            <MdOutlineKeyboardArrowUp size={20} />
          </button>
        </div>
      </div>

      {/* 필터 드롭다운 */}
      {showFilter && (
        <FilterDropdown
          selectedTypes={selectedTypes}
          onTypeToggle={handleTypeToggle}
          medicalStats={medicalStats}
        />
      )}

      {/* 확대/축소 */}
      <ZoomControls onZoomIn={onZoomIn} onZoomOut={onZoomOut} />

      {/* 도움말 모달 */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* 길찾기 모달 */}
      <RouteFinder
        isVisible={showRouteFinder}
        onClose={() => setShowRouteFinder(false)}
        currentLocation={currentLocation}
        destination={destination}
        setDestination={setDestination}
      />
    </div>
  );
}

export default MapToolbar; 