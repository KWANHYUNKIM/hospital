import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
  Linking,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { searchPharmacies, fetchAllPharmacies } from '../../service/pharmacyApi';
import Geolocation from '@react-native-community/geolocation';

const { width } = Dimensions.get('window');

// 타입 정의
interface FilterRegion {
  label: string;
  icon: string;
}

interface Pharmacy {
  ykiho: string;
  yadmNm: string;
  addr: string;
  clCdNm: string;
  telno: string;
  sidoCdNm: string;
  sgguCdNm: string;
  distance?: number;
}

interface PharmaciesResponse {
  data: Pharmacy[];
  totalPages: number;
  totalCount: number;
}

interface UserLocation {
  x: number | null;
  y: number | null;
}

interface RouteParams {
  query?: string;
  x?: string;
  y?: string;
}

type PharmaciesListRouteProp = RouteProp<{ params: RouteParams }, 'params'>;

const filterRegions: FilterRegion[] = [
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

const PharmaciesListPage: React.FC = () => {
  const route = useRoute<PharmaciesListRouteProp>();
  const navigation = useNavigation();
  
  const [selectedRegion, setSelectedRegion] = useState<string>("전국");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [locationBased, setLocationBased] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<UserLocation>({ x: null, y: null });
  const [selectedDistance] = useState<number>(10000);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [showRegionFilter, setShowRegionFilter] = useState<boolean>(false);
  
  const itemsPerPage = 10;
  const isInitialMount = useRef(true);

  // URL 파라미터 처리
  useEffect(() => {
    const params = route.params;
    if (params?.query) {
      setSearchQuery(params.query);
    }
    if (params?.x && params?.y) {
      setUserLocation({ x: parseFloat(params.x), y: parseFloat(params.y) });
      setLocationBased(true);
    }
  }, [route.params]);

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, [currentPage]);

  // 검색 실행
  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    }
  }, [searchQuery]);

  // 지역 필터 변경 시 검색
  useEffect(() => {
    if (!isInitialMount.current) {
      handleSearch();
    } else {
      isInitialMount.current = false;
    }
  }, [selectedRegion]);

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
      Alert.alert('오류', '약국 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setCurrentPage(1);
      
      const apiParams: any = {
        query: searchQuery,
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
      Alert.alert('오류', '약국 검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    try {
      setLoading(true);

      const apiParams: any = {
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
      Alert.alert('오류', '페이지 변경 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = () => {
    setLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ x: longitude, y: latitude });
        setLocationBased(true);
        
        // 위치 정보를 가져온 후 즉시 검색 실행
        const apiParams = {
          x: longitude,
          y: latitude,
          distance: selectedDistance,
          page: 1,
          limit: itemsPerPage
        };

        searchPharmacies(apiParams).then(response => {
          if (response && response.data) {
            setPharmacies(response.data);
            setTotalPages(response.totalPages);
            setTotalCount(response.totalCount);
          }
        }).catch(error => {
          console.error('위치 기반 약국 검색 중 오류 발생:', error);
          Alert.alert('오류', '약국 검색 중 오류가 발생했습니다.');
        }).finally(() => {
          setLoading(false);
        });
      },
      (error) => {
        console.error('위치 정보를 가져올 수 없습니다:', error);
        Alert.alert('오류', '위치 정보를 가져올 수 없습니다. 위치 서비스를 허용해주세요.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleMapOpen = (pharmacyName: string, addr: string) => {
    const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(addr + ' ' + pharmacyName)}`;
    Linking.openURL(naverMapUrl).catch(() => {
      Alert.alert('오류', '지도 앱을 열 수 없습니다.');
    });
  };

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
    setLocationBased(false);
    setUserLocation({ x: null, y: null });
    setShowRegionFilter(false);
  };

  // 페이지네이션 버튼 생성
  const getPagination = (current: number, total: number) => {
    const delta = 2;
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
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>약국 찾기</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* 서브 헤더 */}
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderTitle}>선택한 지역의 약국을 쉽게 찾아보세요</Text>
        
        {/* 검색 결과 표시 */}
        {searchQuery && (
          <Text style={styles.searchResultText}>
            검색어: <Text style={styles.searchResultBold}>{searchQuery}</Text>
          </Text>
        )}
        {locationBased && userLocation.x !== null && userLocation.y !== null && (
          <Text style={styles.searchResultText}>내 주변 약국 검색 중...</Text>
        )}
      </View>

      {/* 검색 및 필터 섹션 */}
      <View style={styles.searchSection}>
        {/* 검색 입력 */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="약국명을 검색하세요"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="clear" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* 위치 기반 검색 버튼 */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleLocationSearch}
          disabled={loading}
        >
          <Icon name="my-location" size={16} color="#FFFFFF" />
          <Text style={styles.locationButtonText}>내 주변 약국 찾기</Text>
        </TouchableOpacity>

        {/* 지역 필터 버튼 */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowRegionFilter(!showRegionFilter)}
        >
          <Text style={styles.filterButtonText}>{selectedRegion}</Text>
          <Icon name="keyboard-arrow-down" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* 지역 필터 드롭다운 */}
      {showRegionFilter && (
        <View style={styles.regionFilterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.regionFilterRow}>
              {filterRegions.map((region) => (
                <TouchableOpacity
                  key={region.label}
                  style={[
                    styles.regionFilterItem,
                    selectedRegion === region.label && styles.regionFilterItemActive
                  ]}
                  onPress={() => handleRegionSelect(region.label)}
                >
                  <Text style={styles.regionFilterIcon}>{region.icon}</Text>
                  <Text style={[
                    styles.regionFilterText,
                    selectedRegion === region.label && styles.regionFilterTextActive
                  ]}>
                    {region.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* 약국 리스트 */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>약국 정보를 불러오는 중...</Text>
          </View>
        ) : (
          <>
            {/* 결과 카운트 */}
            <View style={styles.resultHeader}>
              <Text style={styles.resultCount}>총 {totalCount}개의 약국</Text>
            </View>

            {/* 약국 목록 */}
            <View style={styles.pharmacyList}>
              {pharmacies.map((pharmacy) => (
                <View key={pharmacy.ykiho} style={styles.pharmacyCard}>
                  <View style={styles.pharmacyHeader}>
                    <Text style={styles.pharmacyName}>{pharmacy.yadmNm}</Text>
                    <View style={styles.pharmacyCategory}>
                      <Text style={styles.pharmacyCategoryText}>{pharmacy.clCdNm}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.pharmacyAddress}>{pharmacy.addr}</Text>
                  
                  {typeof pharmacy.distance === 'number' && (
                    <Text style={styles.pharmacyDistance}>
                      📍 {pharmacy.distance <= 1000 
                        ? `${pharmacy.distance}m 거리`
                        : `${(pharmacy.distance / 1000).toFixed(1)}km 거리`
                      }
                    </Text>
                  )}
                  
                  <View style={styles.pharmacyFooter}>
                    <Text style={styles.pharmacyPhone}>📞 {pharmacy.telno}</Text>
                    <TouchableOpacity
                      style={styles.mapButton}
                      onPress={() => handleMapOpen(pharmacy.yadmNm, pharmacy.addr)}
                    >
                      <Icon name="map" size={16} color="#10B981" />
                      <Text style={styles.mapButtonText}>지도보기</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.pharmacyLocation}>
                    <Text style={styles.pharmacyLocationText}>
                      {pharmacy.sidoCdNm} {pharmacy.sgguCdNm}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                  onPress={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <Text style={styles.paginationButtonText}>이전</Text>
                </TouchableOpacity>
                
                {getPagination(currentPage, totalPages).map((page, idx) =>
                  page === '...'
                    ? <Text key={`ellipsis-${idx}`} style={styles.paginationEllipsis}>...</Text>
                    : <TouchableOpacity
                        key={page}
                        style={[
                          styles.paginationButton,
                          currentPage === page && styles.paginationButtonActive
                        ]}
                        onPress={() => handlePageChange(page as number)}
                      >
                        <Text style={[
                          styles.paginationButtonText,
                          currentPage === page && styles.paginationButtonTextActive
                        ]}>
                          {page}
                        </Text>
                      </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                  onPress={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <Text style={styles.paginationButtonText}>다음</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 하단 여백 */}
            <View style={styles.bottomSpacing} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#10B981',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  subHeader: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  subHeaderTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  searchResultText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  searchResultBold: {
    fontWeight: 'bold',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  regionFilterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
  },
  regionFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  regionFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    gap: 4,
  },
  regionFilterItemActive: {
    backgroundColor: '#10B981',
  },
  regionFilterIcon: {
    fontSize: 16,
  },
  regionFilterText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  regionFilterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  resultHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  pharmacyList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  pharmacyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pharmacyName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  pharmacyCategory: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pharmacyCategoryText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '500',
  },
  pharmacyAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  pharmacyDistance: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
    marginBottom: 8,
  },
  pharmacyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pharmacyPhone: {
    fontSize: 14,
    color: '#374151',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
    gap: 4,
  },
  mapButtonText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  pharmacyLocation: {
    alignSelf: 'flex-start',
  },
  pharmacyLocationText: {
    fontSize: 12,
    color: '#9CA3AF',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paginationButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  paginationButtonTextActive: {
    color: '#FFFFFF',
  },
  paginationEllipsis: {
    fontSize: 14,
    color: '#9CA3AF',
    paddingHorizontal: 8,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default PharmaciesListPage; 