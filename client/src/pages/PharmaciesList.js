import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FilterDropdown from "../components/FilterDropdown";
import { searchPharmacies, fetchAllPharmacies } from "../service/api";
import PharmacyAutoComplete from "../components/PharmacyAutoComplete";

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

const PharmaciesList = () => {
  const navigate = useNavigate();
  const [selectedRegion, setSelectedRegion] = useState("전국");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationBased, setLocationBased] = useState(false);
  const [userLocation, setUserLocation] = useState({ x: null, y: null });
  const [selectedDistance, setSelectedDistance] = useState(10000);
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  const isInitialMount = useRef(true);

  // URL에서 쿼리 파라미터 읽어오기
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("query") || "";
    const x = params.get("x");
    const y = params.get("y");

    if (query && query !== searchQuery) {
      setSearchQuery(query);
      handleSearch({ preventDefault: () => {} }, query);
    }
    if (x && y) {
      setUserLocation({ x: parseFloat(x), y: parseFloat(y) });
      setLocationBased(true);
    }
    if (!query) setSearchQuery(""); // 쿼리가 없으면 입력창 비우기
  }, [location.search]);

  const filterCategories = [
    { name: "지역", options: filterRegions, state: selectedRegion, setState: setSelectedRegion },
  ];

  const handleFilterChange = (categoryName, option) => {
    if (categoryName === "지역") {
      setSelectedRegion(option);
      // 지역 필터 변경 시 위치 기반 검색 상태 초기화
      setLocationBased(false);
      setUserLocation({ x: null, y: null });
    } 
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const response = await fetchAllPharmacies({
          page: currentPage,
          limit: itemsPerPage
        });
        if (response && response.data) {
          setPharmacies(response.data);
          setTotalPages(response.totalPages);
          setTotalCount(response.totalCount);
        }
      } catch (error) {
        console.error('약국 데이터 로드 중 오류 발생:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [currentPage]);

  const handleSearch = async (e, customQuery) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      setLoading(true);
      setCurrentPage(1); // 검색 시 첫 페이지로 리셋
      
      const apiParams = {
        query: customQuery !== undefined ? customQuery : searchQuery,
        region: selectedRegion,
        page: 1,
        limit: itemsPerPage
      };

      if (locationBased && userLocation.x !== null && userLocation.y !== null) {
        apiParams.x = userLocation.x;
        apiParams.y = userLocation.y;
        apiParams.distance = selectedDistance;
      }

      const response = await searchPharmacies(apiParams);
      
      if (response && response.data) {
        setPharmacies(response.data);
        setTotalPages(response.totalPages);
        setTotalCount(response.totalCount);
      }
    } catch (error) {
      console.error('약국 검색 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }

    const params = new URLSearchParams();
    const effectiveQuery = customQuery !== undefined ? customQuery : searchQuery;

    if (effectiveQuery) {
      params.append("query", effectiveQuery);
      // 검색어가 있으면 URL에 region을 추가하지 않음
    } else {
      // 검색어가 없을 때만 region을 추가
      if (selectedRegion !== "전국") {
        params.append("region", selectedRegion);
      }
    }

    // locationBased가 true이고 유효한 위치값이 있을 때만 x, y 파라미터를 URL에 추가
    if (locationBased && userLocation.x !== null && userLocation.y !== null) {
      params.append("x", userLocation.x.toString());
      params.append("y", userLocation.y.toString());
    }
    navigate(`/pharmacies?${params.toString()}`);
  };

  // 검색어가 변경될 때마다 검색 실행
  useEffect(() => {
    if (searchQuery) {
      handleSearch({ preventDefault: () => {} }, searchQuery);
    }
    // 검색어가 비워졌을 때도 handleSearch를 호출하여 전체 목록 또는 현재 지역 필터 기준으로 검색 (선택적)
    // else if (!searchQuery && !isInitialMount.current) { // 초기 마운트가 아니고 검색어가 비워졌을 때
    //   handleSearch(null, ""); // 빈 검색어로 검색
    // }
  }, [searchQuery]);

  // selectedRegion이 변경될 때마다 검색 실행 (수정된 부분)
  useEffect(() => {
    if (isInitialMount.current) {
      // 컴포넌트가 처음 마운트될 때는 이 useEffect가 바로 실행되지 않도록 합니다.
      // 초기 데이터 로드는 loadInitialData 또는 다른 로직에서 처리합니다.
      isInitialMount.current = false;
    } else {
      // selectedRegion이 사용자에 의해 변경된 경우에만 검색을 실행합니다.
      handleSearch(null); // 인자 없이 호출하면 내부적으로 현재 searchQuery와 selectedRegion을 사용합니다.
    }
  }, [selectedRegion]);

  const handlePageChange = async (page) => {
    setCurrentPage(page);
    try {
      setLoading(true);

      const apiParams = {
        query: searchQuery,
        region: selectedRegion,
        page: page,
        limit: itemsPerPage
      };

      if (locationBased && userLocation.x !== null && userLocation.y !== null) {
        apiParams.x = userLocation.x;
        apiParams.y = userLocation.y;
        apiParams.distance = selectedDistance;
      }

      const response = await searchPharmacies(apiParams);
      
      if (response && response.data) {
        setPharmacies(response.data);
        setTotalPages(response.totalPages);
        setTotalCount(response.totalCount);
      }
    } catch (error) {
      console.error('페이지 변경 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = () => {
    if (navigator.geolocation) {
      setLoading(true); // 로딩 시작
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ x: longitude, y: latitude });
          setLocationBased(true);
          
          // 위치 정보를 가져온 후 즉시 검색 실행
          searchPharmacies({
            x: longitude,
            y: latitude,
            distance: selectedDistance,
            page: 1,
            limit: itemsPerPage
          }).then(response => {
            if (response && response.data) {
              console.log('약국 검색 결과:', response.data); // 디버깅용 로그
              // 거리 정보가 있는지 확인
              const pharmaciesWithDistance = response.data.map(pharmacy => {
                console.log('약국 거리 정보:', pharmacy.yadmNm, pharmacy.distance); // 디버깅용 로그
                return pharmacy;
              });
              setPharmacies(pharmaciesWithDistance);
              setTotalPages(response.totalPages);
              setTotalCount(response.totalCount);
            }
          }).catch(error => {
            console.error('위치 기반 약국 검색 중 오류 발생:', error);
            alert('약국 검색 중 오류가 발생했습니다. 다시 시도해주세요.');
          }).finally(() => {
            setLoading(false); // 로딩 종료
          });

          // URL 업데이트
          const params = new URLSearchParams();
          params.append("x", longitude);
          params.append("y", latitude);
          navigate(`/pharmacies?${params.toString()}`);
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error);
          alert('위치 정보를 가져올 수 없습니다. 위치 서비스를 허용해주세요.');
          setLoading(false); // 로딩 종료
        }
      );
    } else {
      alert('이 브라우저는 위치 정보를 지원하지 않습니다.');
      setLoading(false); // 로딩 종료
    }
  };

  // 페이지네이션 버튼 생성 함수
  const getPagination = (current, total) => {
    const delta = 2; // 현재 페이지 기준 앞뒤로 몇 개 보여줄지
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l > 2) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  return (
    <div className="sticky top-16 z-50 bg-gray-50">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 shadow-md">
        <div className="container mx-auto flex flex-col items-center">
          <h1 className="text-2xl font-bold">약국 찾기</h1>
          <p className="text-lg mt-2">선택한 지역의 약국을 쉽게 찾아보세요</p>
          
          {/* 검색 섹션 */}
          <div className="w-full max-w-2xl mt-4">
            <PharmacyAutoComplete 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery}
              onSearch={(query) => handleSearch({ preventDefault: () => {} }, query)}
            />
            
            {/* 위치 기반 검색 버튼 */}
            <button
              onClick={handleLocationSearch}
              className="mt-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>📍</span>
              <span>내 주변 약국 찾기</span>
            </button>
          </div>

          {/* 검색 결과 표시 */}
          {searchQuery && (
            <p className="text-md mt-2">
              검색어: <strong>{searchQuery}</strong>
            </p>
          )}
          {locationBased && userLocation.x !== null && userLocation.y !== null && (
            <p className="text-md mt-2">내 주변 약국 검색 중...</p>
          )}
        </div>
      </header>

      {/* 필터 컨테이너 */}
      <div className="top-0 z-50 bg-white shadow-md py-4">
        <div className="container mx-auto mt-6 p-2 px-4 md:px-40">
          <div className="container mx-auto flex justify-center">
            <FilterDropdown
              categories={filterCategories}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>
      </div>

      {/* 약국 리스트 */}
      <section className="container mx-auto mt-10 p-6 px-4 md:px-40">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pharmacies.map((pharmacy) => {
            // 거리 계산
            const distance = pharmacy.distance;            
            return (
              <div key={pharmacy.ykiho} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">{pharmacy.yadmNm}</h3>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {pharmacy.clCdNm}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">{pharmacy.addr}</p>
                    {typeof distance === 'number' && (
                      <p className="text-sm text-blue-600 mt-1 flex items-center">
                        <span className="mr-1">📍</span>
                        {distance <= 1000 
                          ? `${distance}m 거리`
                          : `${(distance / 1000).toFixed(1)}km 거리`
                        }
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-500">{pharmacy.telno}</span>
                      <a
                        href={`https://map.naver.com/v5/search/${encodeURIComponent(pharmacy.sidoCdNm + ' ' + pharmacy.yadmNm)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 text-sm px-2 py-1 border border-blue-300 rounded-md flex items-center gap-x-1 hover:bg-blue-100"
                      >
                        지도보기 🗺️
                      </a>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {pharmacy.sidoCdNm} {pharmacy.sgguCdNm}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              {getPagination(currentPage, totalPages).map((page, idx) =>
                page === '...'
                  ? <span key={`ellipsis-${idx}`} className="px-3 py-1 text-gray-400">...</span>
                  : <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === page
                          ? 'bg-blue-500 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </nav>
          </div>
        )}

        {/* 검색 결과 정보 */}
        <div className="mt-4 text-center text-gray-600">
          총 {totalCount}개의 약국이 검색되었습니다.
        </div>
      </section>
    </div>
  );
};

export default PharmaciesList; 