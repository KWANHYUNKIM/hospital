import React, { useState, useEffect } from 'react';
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
import { fetchHospitals, fetchHospitalDetail } from '../../service/hospitalApi';
import Geolocation from '@react-native-community/geolocation';

const { width } = Dimensions.get('window');

// 타입 정의
interface FilterOption {
  label: string;
  icon: string;
}

interface HospitalLocation {
  lat: number;
  lon: number;
}

interface HospitalTimes {
  trmtMonStart?: string;
  trmtMonEnd?: string;
  trmtSatStart?: string;
  emyNgtYn?: string;
}

interface Hospital {
  _id: string;
  yadmNm: string;
  addr: string;
  category: string;
  telno?: string;
  major?: string[];
  location?: HospitalLocation;
  times?: HospitalTimes;
  distance?: number;
}

interface HospitalsResponse {
  data: Hospital[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

interface UserLocation {
  x: number | null;
  y: number | null;
}

interface RouteParams {
  category?: string;
  query?: string;
  x?: string;
  y?: string;
}

type HospitalListRouteProp = RouteProp<{ params: RouteParams }, 'params'>;

const filterRegions: FilterOption[] = [
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

const filterSubjects: FilterOption[] = [
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

const popularMajor: FilterOption[] = [
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

const HospitalListPage: React.FC = () => {
  const route = useRoute<HospitalListRouteProp>();
  const navigation = useNavigation();
  
  const [selectedRegion, setSelectedRegion] = useState<string>("전국");
  const [selectedSubject, setSelectedSubject] = useState<string>("전체");
  const [selectedMajor, setSelectedMajor] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [locationBased, setLocationBased] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<UserLocation>({ x: null, y: null });
  const [selectedDistance] = useState<number>(10000);
  
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  
  const [showRegionFilter, setShowRegionFilter] = useState<boolean>(false);
  const [showSubjectFilter, setShowSubjectFilter] = useState<boolean>(false);

  // URL 파라미터 처리
  useEffect(() => {
    const params = route.params;
    if (params?.category) {
      setSelectedSubject(params.category);
    }
    if (params?.query) {
      setSearchQuery(params.query);
      setLocationBased(false);
    }
    if (params?.x && params?.y) {
      setUserLocation({ x: parseFloat(params.x), y: parseFloat(params.y) });
      setLocationBased(true);
      setSelectedRegion("전국");
      setSelectedSubject("전체");
      setSelectedMajor("전체");
    }
    setInitialized(true);
  }, [route.params]);

  // 서버 데이터 불러오기
  const fetchHospitalsFromServer = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: limit,
      };

      if (searchQuery.trim() !== "") {
        params.query = searchQuery.trim();
      }

      if (locationBased && userLocation.x !== null && userLocation.y !== null) {
        params.x = userLocation.x;
        params.y = userLocation.y;
        params.distance = `${selectedDistance}m`;
      }

      if (selectedRegion !== "전국") {
        params.region = selectedRegion;
      }

      if (selectedSubject !== "전체") {
        params.category = selectedSubject;
      }

      if (selectedMajor !== "전체") {
        params.major = selectedMajor;
      }
    
      const response = await fetchHospitals(params);
      const {
        data,
        totalCount: fetchedTotalCount,
        totalPages: fetchedTotalPages,
        currentPage: fetchedCurrentPage,
      } = response;
      
      setHospitals(data);
      setTotalCount(fetchedTotalCount);
      setTotalPages(fetchedTotalPages);
      setCurrentPage(fetchedCurrentPage);
    } catch (err) {
      console.error(err);
      setError("서버에서 병원 목록을 불러오는 중 오류가 발생했습니다.");
      Alert.alert('오류', '병원 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 필터/페이지 변경 시마다 재요청
  useEffect(() => {
    if (initialized) {
      fetchHospitalsFromServer();
    }
  }, [initialized, selectedRegion, selectedSubject, selectedMajor, currentPage, limit, searchQuery, locationBased, userLocation, selectedDistance]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchHospitalsFromServer();
  };

  const handleLocationSearch = () => {
    setLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ x: longitude, y: latitude });
        setLocationBased(true);
        setSelectedRegion("전국");
        setSelectedSubject("전체");
        setSelectedMajor("전체");
        setCurrentPage(1);
      },
      (error) => {
        console.error('위치 정보를 가져올 수 없습니다:', error);
        Alert.alert('오류', '위치 정보를 가져올 수 없습니다. 위치 서비스를 허용해주세요.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleDetailClick = async (hospitalId: string) => {
    try {
      navigation.navigate('HospitalDetail', { id: hospitalId });
    } catch (error) {
      console.error("Error navigating to hospital details:", error);
      Alert.alert('오류', '병원 상세 정보를 열 수 없습니다.');
    }
  };

  const handlePhoneCall = (phoneNumber?: string) => {
    if (phoneNumber) {
      const cleanNumber = phoneNumber.replace(/[^\d-+]/g, '');
      Linking.openURL(`tel:${cleanNumber}`).catch(() => {
        Alert.alert('오류', '전화 앱을 열 수 없습니다.');
      });
    }
  };

  const handleMapOpen = (hospitalName: string, addr: string) => {
    const addressPart = addr ? addr.split(' ')[0] : '';
    const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(addressPart + " " + hospitalName)}`;
    Linking.openURL(naverMapUrl).catch(() => {
      Alert.alert('오류', '지도 앱을 열 수 없습니다.');
    });
  };

  const getOperatingStatus = (times?: HospitalTimes): { text: string; color: string } => {
    if (!times) return { text: "정보 없음", color: "#9CA3AF" };
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 100 + currentMinute;
    
    // 간단한 영업시간 체크 (월요일 기준)
    if (times.trmtMonStart && times.trmtMonEnd) {
      const startTime = parseInt(times.trmtMonStart);
      const endTime = parseInt(times.trmtMonEnd);
      
      if (currentTime >= startTime && currentTime <= endTime) {
        return { text: "영업중", color: "#10B981" };
      } else {
        return { text: "영업종료", color: "#EF4444" };
      }
    }
    
    return { text: "정보 없음", color: "#9CA3AF" };
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
        <Text style={styles.headerTitle}>삐뽀삐뽀119</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* 서브 헤더 */}
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderTitle}>선택한 지역의 병원을 쉽게 찾아보세요</Text>
        
        {/* 검색 결과 표시 */}
        {searchQuery && (
          <Text style={styles.searchResultText}>
            검색어: <Text style={styles.searchResultBold}>{searchQuery}</Text>
          </Text>
        )}
        {locationBased && userLocation.x !== null && userLocation.y !== null && (
          <Text style={styles.searchResultText}>내 주변 병원 검색 중...</Text>
        )}
      </View>

      {/* 검색 섹션 */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="병원명, 진료과목을 검색하세요"
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

        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleLocationSearch}
          disabled={loading}
        >
          <Icon name="my-location" size={16} color="#FFFFFF" />
          <Text style={styles.locationButtonText}>내 주변 병원 찾기</Text>
        </TouchableOpacity>
      </View>

      {/* 자주 찾는 진료과목 */}
      <View style={styles.popularMajorSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.popularMajorRow}>
            {popularMajor.map((major) => (
              <TouchableOpacity
                key={major.label}
                style={[
                  styles.popularMajorItem,
                  selectedMajor === major.label && styles.popularMajorItemActive
                ]}
                onPress={() => {
                  setSelectedMajor(major.label);
                  setCurrentPage(1);
                }}
              >
                <Text style={styles.popularMajorIcon}>{major.icon}</Text>
                <Text style={[
                  styles.popularMajorText,
                  selectedMajor === major.label && styles.popularMajorTextActive
                ]}>
                  {major.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 필터 섹션 */}
      <View style={styles.filterSection}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowRegionFilter(!showRegionFilter)}
        >
          <Text style={styles.filterButtonText}>지역: {selectedRegion}</Text>
          <Icon name="keyboard-arrow-down" size={20} color="#374151" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowSubjectFilter(!showSubjectFilter)}
        >
          <Text style={styles.filterButtonText}>타입: {selectedSubject}</Text>
          <Icon name="keyboard-arrow-down" size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* 지역 필터 드롭다운 */}
      {showRegionFilter && (
        <View style={styles.filterDropdown}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterDropdownRow}>
              {filterRegions.map((region) => (
                <TouchableOpacity
                  key={region.label}
                  style={[
                    styles.filterDropdownItem,
                    selectedRegion === region.label && styles.filterDropdownItemActive
                  ]}
                  onPress={() => {
                    setSelectedRegion(region.label);
                    setLocationBased(false);
                    setUserLocation({ x: null, y: null });
                    setShowRegionFilter(false);
                    setCurrentPage(1);
                  }}
                >
                  <Text style={styles.filterDropdownIcon}>{region.icon}</Text>
                  <Text style={[
                    styles.filterDropdownText,
                    selectedRegion === region.label && styles.filterDropdownTextActive
                  ]}>
                    {region.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* 타입 필터 드롭다운 */}
      {showSubjectFilter && (
        <View style={styles.filterDropdown}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterDropdownRow}>
              {filterSubjects.map((subject) => (
                <TouchableOpacity
                  key={subject.label}
                  style={[
                    styles.filterDropdownItem,
                    selectedSubject === subject.label && styles.filterDropdownItemActive
                  ]}
                  onPress={() => {
                    setSelectedSubject(subject.label);
                    setShowSubjectFilter(false);
                    setCurrentPage(1);
                  }}
                >
                  <Text style={styles.filterDropdownIcon}>{subject.icon}</Text>
                  <Text style={[
                    styles.filterDropdownText,
                    selectedSubject === subject.label && styles.filterDropdownTextActive
                  ]}>
                    {subject.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* 병원 리스트 */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>병원 정보를 불러오는 중...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            {/* 결과 카운트 */}
            <View style={styles.resultHeader}>
              <Text style={styles.resultCount}>총 {totalCount}개의 병원</Text>
            </View>

            {/* 병원 목록 */}
            {hospitals && hospitals.length > 0 ? (
              <View style={styles.hospitalList}>
                {hospitals.map((hospital) => {
                  const operatingStatus = getOperatingStatus(hospital.times);
                  return (
                    <TouchableOpacity
                      key={hospital._id}
                      style={styles.hospitalCard}
                      onPress={() => handleDetailClick(hospital._id)}
                    >
                      {/* 병원 헤더 */}
                      <View style={styles.hospitalHeader}>
                        {hospital.category && (
                          <Text style={styles.hospitalCategory}>{hospital.category}</Text>
                        )}
                        <View style={[styles.operatingStatus, { backgroundColor: `${operatingStatus.color}20` }]}>
                          <Text style={[styles.operatingStatusText, { color: operatingStatus.color }]}>
                            {operatingStatus.text}
                          </Text>
                        </View>
                      </View>

                      {/* 병원명 */}
                      <Text style={styles.hospitalName}>{hospital.yadmNm}</Text>

                      {/* 주소 및 지도 버튼 */}
                      <View style={styles.hospitalAddressRow}>
                        <Text style={styles.hospitalAddress} numberOfLines={1}>
                          {hospital.addr}
                        </Text>
                        <TouchableOpacity
                          style={styles.mapButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleMapOpen(hospital.yadmNm, hospital.addr);
                          }}
                        >
                          <Icon name="map" size={16} color="#3B82F6" />
                          <Text style={styles.mapButtonText}>지도</Text>
                        </TouchableOpacity>
                      </View>

                      {/* 거리 정보 */}
                      {typeof hospital.distance === 'number' && (
                        <Text style={styles.hospitalDistance}>
                          📍 {hospital.distance < 1000 
                            ? `${Math.round(hospital.distance)}m`
                            : `${(hospital.distance / 1000).toFixed(1)}km`
                          }
                        </Text>
                      )}

                      {/* 진료과 정보 */}
                      {hospital.major && hospital.major.length > 0 && (
                        <View style={styles.majorContainer}>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.majorRow}>
                              {hospital.major.slice(0, 5).map((major, index) => (
                                <View key={index} style={styles.majorTag}>
                                  <Text style={styles.majorTagText}>{major}</Text>
                                </View>
                              ))}
                              {hospital.major.length > 5 && (
                                <View style={styles.majorTag}>
                                  <Text style={styles.majorTagText}>+{hospital.major.length - 5}</Text>
                                </View>
                              )}
                            </View>
                          </ScrollView>
                        </View>
                      )}

                      {/* 전화번호 */}
                      {hospital.telno && (
                        <View style={styles.phoneSection}>
                          <Text style={styles.phoneLabel}>📞 전화번호:</Text>
                          <View style={styles.phoneContainer}>
                            <Text style={styles.phoneNumber}>{hospital.telno}</Text>
                            <TouchableOpacity
                              style={styles.callButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                handlePhoneCall(hospital.telno);
                              }}
                            >
                              <Icon name="call" size={16} color="#FFFFFF" />
                              <Text style={styles.callButtonText}>바로통화</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="local-hospital" size={64} color="#9CA3AF" />
                <Text style={styles.emptyText}>선택한 조건에 맞는 병원이 없습니다.</Text>
              </View>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                  onPress={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <Text style={styles.paginationButtonText}>이전</Text>
                </TouchableOpacity>

                {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                  const page = Math.max(1, currentPage - 5) + i;
                  if (page > totalPages) return null;

                  return (
                    <TouchableOpacity
                      key={page}
                      style={[
                        styles.paginationButton,
                        page === currentPage && styles.paginationButtonActive
                      ]}
                      onPress={() => setCurrentPage(page)}
                    >
                      <Text style={[
                        styles.paginationButtonText,
                        page === currentPage && styles.paginationButtonTextActive
                      ]}>
                        {page}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                <TouchableOpacity
                  style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                  onPress={() => setCurrentPage(currentPage + 1)}
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
    backgroundColor: '#3B82F6',
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
    backgroundColor: '#3B82F6',
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
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  popularMajorSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  popularMajorRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  popularMajorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    gap: 4,
  },
  popularMajorItemActive: {
    backgroundColor: '#3B82F6',
  },
  popularMajorIcon: {
    fontSize: 16,
  },
  popularMajorText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  popularMajorTextActive: {
    color: '#FFFFFF',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  filterDropdown: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
  },
  filterDropdownRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  filterDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    gap: 4,
  },
  filterDropdownItemActive: {
    backgroundColor: '#3B82F6',
  },
  filterDropdownIcon: {
    fontSize: 16,
  },
  filterDropdownText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  filterDropdownTextActive: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 16,
  },
  resultHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  hospitalList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  hospitalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hospitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hospitalCategory: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  operatingStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  operatingStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  hospitalAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    marginRight: 8,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3B82F6',
    gap: 4,
  },
  mapButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  hospitalDistance: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
    marginBottom: 8,
  },
  majorContainer: {
    marginBottom: 12,
  },
  majorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  majorTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  majorTagText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
  },
  phoneSection: {
    marginTop: 8,
  },
  phoneLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
    flex: 1,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  callButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
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
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
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
  bottomSpacing: {
    height: 32,
  },
});

export default HospitalListPage; 