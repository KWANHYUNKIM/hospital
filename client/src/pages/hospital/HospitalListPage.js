import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";  // 쿼리 파라미터 받기
import { useNavigate } from "react-router-dom";
import { fetchHospitals, fetchHospitalDetail } from "../../service/hospitalApi";
import HospitalMajorList from '../../components/hospital/HospitalMajorList';
import OperatingStatus from '../../components/hospital/OperatingStatus';
import DistanceInfo from '../../components/hospital/DistanceInfo';
import NursingHospitalBanner from '../../components/nursing/NursingHospitalBanner';
import FilterDropdown from '../../components/search/FilterDropdown';
import { useAutoAnalytics } from '../../hooks/useAutoAnalytics';

const filterRegions = [
  { label: "전국", icon: "🌍" },
  { label: "서울", icon: "🏙️" },
  { label: "경기", icon: "🏞️" },
  { label: "부산", icon: "🌊" },
  { label: "경남", icon: "🌾" },
  { label: "대구", icon: "🏞️" },
  { label: "인천", icon: "✈️" },
  { label: "경북", icon: "🌾" },
  { label: "전북", icon: "🌻" },
  { label: "충남", icon: "🌳" },
  { label: "전남", icon: "🌻" },
  { label: "대전", icon: "🌳" },
  { label: "광주", icon: "🌻" },
  { label: "충북", icon: "🌳" },
  { label: "강원", icon: "⛰️" },
  { label: "울산", icon: "🌾" },
  { label: "제주", icon: "🏝️" },
  { label: "세종시", icon: "🏢" },
];

const filterSubjects = [
  { label: "전체", icon: "🗂️" },       
  { label: "상급종합", icon: "🏥" },      
  { label: "보건의료원", icon: "🏨" },    
  { label: "보건진료소", icon: "🩺" },    
  { label: "보건지소", icon: "🧪" },     
  { label: "보건소", icon: "🏬" },       
  { label: "병원", icon: "🧑‍⚕️" },       
  { label: "종합병원", icon: "🏣" },    
  { label: "의원", icon: "💊" },          
  { label: "요양병원", icon: "🛌" },       
  { label: "치과의원", icon: "🦷" },       
  { label: "치과병원", icon: "🪥" },       
  { label: "한방병원", icon: "🌿" },     
  { label: "정신병원", icon: "🧠" },       
  { label: "조산원", icon: "🤱" }         
];

// 자주 찾는 진료과목
const popularMajor = [
  { label: "전체", icon: "📋" },
  { label: "내과", icon: "💊" },
  { label: "외과", icon: "🔪" },
  { label: "소아청소년과", icon: "🧒" },
  { label: "산부인과", icon: "🤰" },
  { label: "정형외과", icon: "🦴" },
  { label: "피부과", icon: "🧴" },
  { label: "이비인후과", icon: "👂" },
  { label: "안과", icon: "👁️" },
  { label: "가정의학과", icon: "🏡" }
];

// 전체 진료과목
const filterMajor = [
  ...popularMajor,
  { label: "정신건강의학과", icon: "🧠" },
  { label: "한의원", icon: "🌿" },
  { label: "결핵과", icon: "🫁" },
  { label: "구강내과", icon: "👄" },
  { label: "구강악안면외과", icon: "🦷🔪" },
  { label: "마취통증의학과", icon: "💉" },
  { label: "방사선종양학과", icon: "☢️" },
  { label: "병리과", icon: "🧬" },
  { label: "비뇨의학과", icon: "🚻" },
  { label: "사상체질과", icon: "🌀" },
  { label: "성형외과", icon: "💉✨" },
  { label: "소아치과", icon: "🦷👶" },
  { label: "신경과", icon: "⚡" },
  { label: "신경외과", icon: "🧠🔪" },
  { label: "심장혈관흉부외과", icon: "❤️" },
  { label: "영상의학과", icon: "📸" },
  { label: "영상치의학과", icon: "🦷📸" },
  { label: "예방의학과", icon: "🛡️" },
  { label: "예방치과", icon: "🦷🛡️" },
  { label: "응급의학과", icon: "🚑" },
  { label: "재활의학과", icon: "🦽" },
  { label: "직업환경의학과", icon: "🏭" },
  { label: "진단검사의학과", icon: "🔬" },
  { label: "치과교정과", icon: "🦷🔧" },
  { label: "치과보존과", icon: "🦷🛠️" },
  { label: "치과보철과", icon: "🦷🧱" },
  { label: "치주과", icon: "🦷🌱" },
  { label: "침구과", icon: "🪡" },
  { label: "통합치의학과", icon: "🦷🔄" },
  { label: "한방내과", icon: "🌿💊" },
  { label: "한방부인과", icon: "🌿🤰" },
  { label: "한방소아과", icon: "🌿👶" },
  { label: "한방신경정신과", icon: "🌿🧠" },
  { label: "한방안·이비인후·피부과", icon: "🌿👂🧴" },
  { label: "한방재활의학과", icon: "🌿🦽" },
  { label: "핵의학과", icon: "☢️🔬" }
];

const filterAdditionFilters = [
  { label: "전체", icon: "📌" },
  { label: "영업중", icon: "🏥" },
];

const additionalFilters = [
  { label: "전체", icon: "📌" },
  { label: "영업중", icon: "🏥" },
];

const HospitalListPage = () => {
  const navigate = useNavigate();
  
  // 자동 이벤트 감지 훅 사용
  useAutoAnalytics({
    pageType: 'HOSPITAL_LIST_PAGE',
    autoPageView: true,
    autoClickTracking: true,
    pageViewData: {
      pageTitle: '병원 목록'
    }
  });
  
  const [selectedRegion, setSelectedRegion] = useState("전국");
  const [selectedSubject, setSelectedSubject] = useState("전체");
  const [selectedAdditionalFilter, setSelectedAdditionalFilter] = useState("전체");
  const [selectedMajor, setSelectedMajor] = useState("전체");

  // 검색 쿼리 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [locationBased, setLocationBased] = useState(false); // "내 주변" ON/OFF
  const [userLocation, setUserLocation] = useState({ x: null, y: null });
  const [selectedDistance, setSelectedDistance] = useState(10000); // 기본값 10km (미터 단위)

  // 병원 목록 + 페이징 정보
  const [hospitals, setHospitals] = useState([]);  // 실제 아이템 배열
  const [totalCount, setTotalCount] = useState(0); // 총 개수
  const [totalPages, setTotalPages] = useState(1); // 총 페이지 수
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);          // 페이지당 표시 개수

  // 로딩/에러
  const [, setLoading] = useState(false);
  const [, setError] = useState(null);

  // 초기렌더링
  const [initialized, setInitialized] = useState(false);

  const filterCategories = [
    { name: "지역", options: filterRegions, state: selectedRegion, setState: setSelectedRegion },
    { name: "타입", options: filterSubjects, state: selectedSubject, setState: setSelectedSubject },
    { name: "전공", options: filterMajor, state: selectedMajor, setState: setSelectedMajor },
    { name: "진료시간", options: additionalFilters, state: selectedAdditionalFilter, setState: setSelectedAdditionalFilter },
  ];
  
  const handleFilterChange = (categoryName, option) => {

    if (categoryName === "지역") {
      setSelectedRegion(option);
    } else if (categoryName === "타입") {
      setSelectedSubject(option);
    } else if (categoryName === "전공") {
      setSelectedMajor(option);
    } else if (categoryName === "진료시간") {
      setSelectedAdditionalFilter(option);
    } else if (categoryName === "location") {
      if (option) {
        setUserLocation({ x: option.x, y: option.y });
        setSelectedDistance(option.distance);
        setLocationBased(true);
      } else {
        setUserLocation({ x: null, y: null });
        setLocationBased(false);
      }
    }

    setCurrentPage(1);
  };
  
  // URL에서 쿼리 파라미터 읽어오기
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    const query = params.get("query");

    if (category) {
      setSelectedAdditionalFilter(category);
    } else {
      setSelectedAdditionalFilter("전체");
    }

    if (query) {
      setSearchQuery(query);
    } else {
      setSearchQuery("");
    }

    setInitialized(true);
  }, [location]);

  // 서버 데이터 불러오기
  const fetchHospitalsFromServer = async () => {
    try {
      setLoading(true);
      setError(null);

      // '/api/hospitals/search' 에 ?page=..., &limit=..., &region=..., &subject=..., &nightCare=... 등
      const params = {
        page: currentPage,
        limit: limit,
      };

      // 검색 쿼리 추가
      if (searchQuery.trim() !== "") {
        params.query = searchQuery.trim();
      }

      // 위치 기반 검색 추가
      if (locationBased && userLocation.x !== null && userLocation.y !== null) {
        params.x = userLocation.x;
        params.y = userLocation.y;
        params.distance = `${selectedDistance}m`;
      }

      // 필터가 '전체'가 아닐 경우에만 해당 파라미터 추가
      if (selectedRegion !== "전국") {
        params.region = selectedRegion;
      }

      if (selectedSubject !== "전체") {
        params.category = selectedSubject;
      }

      if (selectedMajor !== "전체") {
        params.major = selectedMajor;
      }

      if (selectedAdditionalFilter === "응급야간진료") {
        params.category = "응급야간진료";
      } else if (selectedAdditionalFilter === "응급주말진료") {
        params.category = "응급주말진료";
      } else if (selectedAdditionalFilter === "영업중") {
        params.operating = "true"; // 영업중 필터 파라미터 추가
      }
    
      const response = await fetchHospitals(params);
      // 구조분해: { data, totalCount, currentPage, totalPages }
      const {
        data,
        totalCount: fetchedTotalCount,
        totalPages: fetchedTotalPages,
        currentPage: fetchedCurrentPage,
      } = response;
      
      // 상태 업데이트
      setHospitals(data);
      setTotalCount(fetchedTotalCount);
      setTotalPages(fetchedTotalPages);
      setCurrentPage(fetchedCurrentPage);
    } catch (err) {
      console.error(err);
      setError("서버에서 병원 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 필터/페이지 변경 시마다 재요청
  useEffect(() => {
    if (initialized) {
      fetchHospitalsFromServer();
    }
  }, [initialized, selectedRegion, selectedSubject, selectedAdditionalFilter, selectedMajor, currentPage, limit, searchQuery, locationBased, userLocation, selectedDistance]);

  // 클릭 핸들러
  const handleAdditionalFilterClick = (filterLabel) => {
    setSelectedAdditionalFilter(filterLabel);
    setCurrentPage(1);
  };

  // 페이지네이션 버튼
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleDetailClick = async (hospitalId) => {
    try {
      const detailData = await fetchHospitalDetail(hospitalId);
      navigate(`/hospital/details/${hospitalId}`, {
        state: { hospitalDetail: detailData }
      });
    } catch (error) {
      console.error("Error fetching hospital details:", error);
      alert("병원 상세 정보를 불러오는 중 오류가 발생했습니다.");
    }
  };

  const handleLocationSearch = () => {
    // 이미 위치 기반 검색이 활성화되어 있으면 비활성화
    if (locationBased) {
      setLocationBased(false);
      setUserLocation({ x: null, y: null });
      setCurrentPage(1);
      fetchHospitalsFromServer();
      return;
    }
    
    // 위치 기반 검색 활성화
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ x: position.coords.longitude, y: position.coords.latitude });
          setLocationBased(true);
          setSelectedRegion("전국"); // 위치 기반 검색은 지역 필터를 무시하거나 전국으로 고정
          setSelectedSubject("전체");
          setSelectedMajor("전체");
          setSelectedAdditionalFilter("전체");
          setSearchQuery(""); // 검색어 초기화
          setCurrentPage(1);
          fetchHospitalsFromServer();
        },
        (error) => {
          console.error("Error getting user location:", error);
          alert("위치 정보를 가져올 수 없습니다. 검색을 계속하려면 허용해주세요.");
        }
      );
    } else {
      alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
    }
  };

  return (
    <div className="sticky top-16 z-50 bg-gray-50">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-blue-400 to-purple-500 text-white p-6 shadow-md">
        <div className="container mx-auto flex flex-col items-center">
          <h1 className="text-2xl font-bold">삐뽀삐뽀119</h1>
          <p className="text-lg mt-2">선택한 지역의 병원을 쉽게 찾아보세요</p>
          {/* 검색어 표시 */}
          {searchQuery && (
            <p className="text-md mt-1">
              검색어: <strong>{searchQuery}</strong>
            </p>
          )}
          {/* 위치 기반 검색 표시 */}
          {locationBased && userLocation.x !== null && userLocation.y !== null && (
            <div className="flex items-center gap-3 mt-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <span className="text-sm font-medium">📍 내 주변 검색</span>
              <button
                onClick={handleLocationSearch}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 flex items-center justify-center shadow-sm border border-white/50 ${
                  locationBased
                    ? 'bg-white/90'
                    : 'bg-white/70 hover:bg-white/90'
                } hover:scale-105 active:scale-95`}
              >
                <div
                  className={`absolute w-4 h-4 bg-blue-500 rounded-full shadow-md transition-all duration-300 transform ${
                    locationBased ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                <span className={`text-xs font-bold transition-all duration-300 ${
                  locationBased ? 'text-blue-600' : 'text-transparent'
                }`}>
                  {locationBased ? 'ON' : 'OFF'}
                </span>
              </button>
              <span className="text-xs text-white/80">
                반경: {selectedDistance/1000}km
              </span>
            </div>
          )}
        </div>
      </header>
      
      {/* 필터 컨테이너 (고정형) */}
      <div className="top-0 z-50 bg-white shadow-md py-4">
        {/* 자주 찾는 진료과목 */}
        <section className="container mx-auto mt-6 p-2 px-4 md:px-40">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
            {popularMajor.map((major) => (
              <button
                key={major.label}
                onClick={() => handleFilterChange('전공', major.label)}
                className={`px-4 py-3 rounded-xl text-sm flex items-center gap-2 transition-all duration-200 transform hover:scale-105 ${
                  selectedMajor === major.label
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
                }`}
              >
                <span className="text-xl">{major.icon}</span>
                <span className="font-medium">{major.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 근무 시간 */}
        <section className="container mx-auto mt-8 p-4 px-4 md:px-40">
          <div className="flex flex-wrap justify-center gap-3">
            {additionalFilters.map((filter) => (
              <button
                key={filter.label}
                onClick={() => handleAdditionalFilterClick(filter.label)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm ${
                  selectedAdditionalFilter === filter.label
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-yellow-500 transform scale-105"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-yellow-50 hover:border-yellow-200 hover:shadow-md"
                } border`}
              >
                <span className="text-lg">{filter.icon}</span>
                <span className="font-medium">{filter.label}</span>
              </button>
            ))}
          </div>
          
          {/* 내위치 토글 - 오른쪽 끝에 배치 */}
          <div className="flex justify-end mt-4">
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleLocationSearch}
                className={`relative w-16 h-8 rounded-full transition-all duration-300 flex items-center justify-center shadow-sm border-2 ${
                  locationBased
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-400 shadow-blue-200/50'
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                } hover:scale-105 active:scale-95`}
              >
                <div
                  className={`absolute w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 transform ${
                    locationBased ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
                <span className={`text-xs font-bold transition-all duration-300 ${
                  locationBased ? 'text-white' : 'text-transparent'
                }`}>
                  {locationBased ? 'ON' : 'OFF'}
                </span>
              </button>
              
              {/* 위치 기반 검색 상태를 직관적으로 표현 */}
              <span className={`text-xs font-medium transition-all duration-300 ${
                locationBased ? 'text-blue-600 font-semibold' : 'text-gray-500'
              }`}>
                {locationBased ? '📍 주변 검색' : '🌍 전체 검색'}
              </span>
            </div>
          </div>
        </section>

        {/* 드롭다운 필터 */}
        <div className="container mx-auto mt-6 p-2 px-4 md:px-40">
          <div className="container mx-auto flex justify-center">
            <FilterDropdown
              categories={filterCategories}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>
      </div>

      {/* 병원 리스트 */}
      <section className="container mx-auto mt-10 p-6 px-4 md:px-40">
        <div className="flex justify-between items-start gap-6">
          {/* 왼쪽: 병원 목록 */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm font-semibold">
                총 {totalCount} 개의 병원
              </div>
            </div>
            
            {hospitals && hospitals.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {hospitals.map((hospital, index) => (
                    <div
                      key={hospital._id}
                      className="relative bg-white shadow-md hover:shadow-lg rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onClick={() => handleDetailClick(hospital._id)}
                      data-hospital-id={hospital._id}
                      data-click-type="DETAIL_VIEW"
                      data-analytics-page-type="HOSPITAL_LIST_PAGE"
                      data-analytics-hospital-name={hospital.yadmNm}
                      data-analytics-hospital-address={hospital.addr}
                      data-analytics-hospital-category={hospital.category}
                      data-analytics-search-query={searchQuery}
                      data-analytics-selected-region={selectedRegion}
                      data-analytics-selected-subject={selectedSubject}
                      data-analytics-selected-major={selectedMajor}
                      data-analytics-current-page={currentPage}
                      data-analytics-position={index + 1}
                    >
                    
                      {/* 병원 이미지 (비율 고정) */}
                      {/* <div className="w-full h-[180px] bg-gray-200 flex items-center justify-center">
                        {hospital.image ? (
                          <img
                            src={hospital.image}
                            onError={(e) => (e.currentTarget.src = "/image-placeholder.jpg")}
                            alt={hospital.yadmNm || "병원 이미지"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 text-sm">🖼️ 이미지 준비 중</span>
                        )}
                      </div> */}

                      <div className="p-4">
                        {/* 병원 유형 */}
                        {hospital.category && (
                        <div className="mb-1 text-xs text-blue-700 font-semibold">
                          {hospital.category}
                        </div>
                        )}
                        
                        {/* 병원 이름 */}
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-800">{hospital.yadmNm}</h3>
                        </div>

                        {/* 주소 & 지도보기 */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span className="flex-1 truncate">{hospital.addr}</span>
                          <a
                            href={`https://map.naver.com/v5/search/${encodeURIComponent(
                              (hospital.addr ? hospital.addr.split(' ')[0] : '') + " " + hospital.yadmNm
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 px-2 py-1 text-blue-500 border border-blue-300 rounded-md flex items-center gap-x-1 hover:bg-blue-100"
                            data-analytics-click="MAP_VIEW"
                            data-analytics-hospital-id={hospital._id}
                          >
                            지도보기 🗺️
                          </a>
                        </div>

                        {/* 거리 정보 */}
                        {hospital.distance ? (
                          <div className="mt-1 text-sm text-blue-600 font-medium">
                            📍 내 주변 {Math.round(hospital.distance)}m
                          </div>
                        ) : (
                          <DistanceInfo hospitalLocation={hospital.location} />
                        )}

                        {/* 진료과 정보 (컴포넌트 사용) */}
                        <HospitalMajorList majors={hospital.major || []} />

                        {/* 🕒 영업 여부 */}
                        <div className="mt-2">
                          <p className="font-semibold text-gray-700">🕒 영업 여부:</p>
                          <OperatingStatus times={hospital.times} />
                        </div>

                        {/* 📞 전화번호 + 바로 전화 버튼 */}
                        <div className="mt-2">
                          <p className="font-semibold text-gray-700">📞 전화번호:</p>

                          {hospital.telno ? (
                            <div className="flex items-center gap-2 mt-1 bg-gray-100 px-3 py-2 rounded-lg">
                              <span className="text-blue-600 font-medium">{hospital.telno}</span>
                              <button
                                className="ml-auto bg-blue-500 text-white px-2 py-1 text-sm rounded-md hover:bg-blue-600 transition"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `tel:${hospital.telno}`;
                                }}
                                data-analytics-click="PHONE_CALL"
                                data-analytics-hospital-id={hospital._id}
                                data-analytics-phone-number={hospital.telno}
                              >
                                📞 바로통화
                              </button>
                            </div>
                          ) : (
                            <div className="px-3 py-1 rounded-md text-sm bg-gray-100 text-gray-500">
                              전화번호 정보 없음
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* 페이지네이션 UI */}
                <div className="flex flex-wrap justify-center items-center mt-6 gap-2">
                  {/* 이전 페이지 버튼 */}
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                  >
                    이전
                  </button>

                  {/* 페이지 번호 (현재 페이지 기준으로 앞뒤 5개만 표시) */}
                  {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                    const page = Math.max(1, currentPage - 5) + i;
                    if (page > totalPages) return null; // totalPages 초과 페이지 숨김

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded ${
                          page === currentPage ? "bg-blue-500 text-white" : "bg-gray-200"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  {/* 다음 페이지 버튼 */}
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                  >
                    다음
                  </button>

                  {/* 페이지당 개수 선택 */}
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setCurrentPage(1); // limit 변경 시 페이지를 1로 초기화
                    }}
                    className="ml-4 px-2 py-1 bg-white border rounded"
                  >
                    <option value={5}>5개씩</option>
                    <option value={10}>10개씩</option>
                    <option value={20}>20개씩</option>
                    <option value={50}>50개씩</option>
                  </select>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500">
                선택한 조건에 맞는 병원이 없습니다.
              </p>
            )}
          </div>

          {/* 오른쪽: 요양병원 둘러보기 */}
          <div className="hidden lg:block w-64">
            <div className="sticky top-24">
              <NursingHospitalBanner />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HospitalListPage;

