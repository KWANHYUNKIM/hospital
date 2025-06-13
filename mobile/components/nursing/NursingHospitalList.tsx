import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NursingHospitalFilter from './NursingHospitalFilter';

// 타입 정의
interface NursingHospital {
  _id: string;
  id: string;
  yadmNm: string;
  addr: string;
  telno?: string;
  category?: string;
  veteran_hospital?: boolean;
  major?: string[];
  location?: {
    lat: number;
    lng: number;
  };
  times?: Array<{
    day: string;
    hours: string;
  }>;
  image?: string;
}

interface HospitalResponse {
  data: NursingHospital[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

const NursingHospitalList: React.FC = () => {
  const navigation = useNavigation();
  
  // 상태 관리
  const [hospitals, setHospitals] = useState<NursingHospital[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 필터 상태
  const [selectedRegion, setSelectedRegion] = useState("전국");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock API 함수
  const fetchNursingHospitals = async (params: any): Promise<HospitalResponse> => {
    return {
      data: [
        {
          _id: '1',
          id: '1',
          yadmNm: '서울요양병원',
          addr: '서울특별시 강남구 테헤란로 123',
          telno: '02-1234-5678',
          category: '요양병원',
          veteran_hospital: false,
          major: ['내과', '정형외과', '재활의학과'],
          location: { lat: 37.5665, lng: 126.9780 },
          times: [
            { day: '월-금', hours: '09:00-18:00' },
            { day: '토', hours: '09:00-13:00' },
          ],
        },
        {
          _id: '2',
          id: '2',
          yadmNm: '부산요양병원',
          addr: '부산광역시 해운대구 해운대로 456',
          telno: '051-9876-5432',
          category: '요양병원',
          veteran_hospital: true,
          major: ['신경외과', '재활의학과', '가정의학과'],
          location: { lat: 35.1796, lng: 129.0756 },
          times: [
            { day: '월-금', hours: '08:30-17:30' },
            { day: '토', hours: '08:30-12:30' },
          ],
        },
      ],
      totalCount: 2,
      totalPages: 1,
      currentPage: 1,
    };
  };

  // 데이터 가져오기 함수
  const fetchHospitalsData = useCallback(async (locationParams = null) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: limit,
        region: selectedRegion !== "전국" ? selectedRegion : undefined,
        query: searchQuery || undefined,
        ...locationParams,
      };

      const response = await fetchNursingHospitals(params);
      
      setHospitals(response.data);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
    } catch (err) {
      console.error(err);
      setError("요양병원 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, selectedRegion, searchQuery]);

  // 초기 로드 및 필터 변경시 데이터 다시 가져오기
  useEffect(() => {
    fetchHospitalsData();
  }, [fetchHospitalsData]);

  // 위치 기반 검색 결과 처리
  const handleLocationSearch = (searchResults: any[]) => {
    setHospitals(searchResults);
    setTotalCount(searchResults.length);
    setTotalPages(1);
    setCurrentPage(1);
  };

  // 페이지네이션 핸들러
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleHospitalPress = (hospitalId: string) => {
    navigation.navigate('NursingHospitalDetail' as never, { id: hospitalId } as never);
  };

  const handlePhoneCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const renderOperatingStatus = (times?: Array<{ day: string; hours: string }>) => {
    if (!times || times.length === 0) {
      return <Text style={styles.operatingHours}>운영시간 정보 없음</Text>;
    }

    return (
      <View>
        {times.map((time, index) => (
          <Text key={index} style={styles.operatingHours}>
            {time.day}: {time.hours}
          </Text>
        ))}
      </View>
    );
  };

  const renderMajorList = (majors?: string[]) => {
    if (!majors || majors.length === 0) {
      return <Text style={styles.majorText}>진료과 정보 없음</Text>;
    }

    return (
      <View style={styles.majorContainer}>
        {majors.slice(0, 3).map((major, index) => (
          <View key={index} style={styles.majorBadge}>
            <Text style={styles.majorText}>{major}</Text>
          </View>
        ))}
        {majors.length > 3 && (
          <Text style={styles.majorMoreText}>+{majors.length - 3}</Text>
        )}
      </View>
    );
  };

  const renderHospitalItem = ({ item }: { item: NursingHospital }) => (
    <TouchableOpacity
      style={styles.hospitalCard}
      onPress={() => handleHospitalPress(item.id)}
      activeOpacity={0.7}
    >
      {/* 병원 정보 */}
      <View style={styles.hospitalInfo}>
        {/* 병원 유형 및 위탁병원 정보 */}
        <View style={styles.hospitalMeta}>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
          {item.veteran_hospital && (
            <View style={styles.veteranBadge}>
              <Text style={styles.veteranText}>위탁병원</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.hospitalName}>{item.yadmNm}</Text>
        <Text style={styles.hospitalAddress}>{item.addr}</Text>

        {/* 진료과 정보 */}
        {renderMajorList(item.major)}

        {/* 운영 정보 */}
        <View style={styles.operatingSection}>
          <Text style={styles.sectionLabel}>🕒 영업 여부:</Text>
          {renderOperatingStatus(item.times)}
        </View>

        {/* 전화번호 */}
        <View style={styles.phoneSection}>
          <Text style={styles.sectionLabel}>📞 전화번호:</Text>
          {item.telno ? (
            <View style={styles.phoneContainer}>
              <Text style={styles.phoneNumber}>{item.telno}</Text>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handlePhoneCall(item.telno!)}
                activeOpacity={0.7}
              >
                <Text style={styles.callButtonText}>📞 바로통화</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.noPhoneText}>전화번호 정보 없음</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
        onPress={handlePrevPage}
        disabled={currentPage === 1}
      >
        <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>
          이전
        </Text>
      </TouchableOpacity>
      
      <View style={styles.pageInfo}>
        <Text style={styles.pageInfoText}>
          {currentPage} / {totalPages}
        </Text>
      </View>
      
      <TouchableOpacity
        style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
        onPress={handleNextPage}
        disabled={currentPage === totalPages}
      >
        <Text style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}>
          다음
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 필터 컴포넌트 */}
      <NursingHospitalFilter 
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        onSearch={handleSearch}
        onLocationSearch={handleLocationSearch}
      />

      {/* 병원 리스트 */}
      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>로딩 중...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchHospitalsData()}>
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <View style={styles.resultsBadge}>
                <Text style={styles.resultsText}>총 {totalCount}개의 요양병원</Text>
              </View>
            </View>

            <FlatList
              data={hospitals}
              keyExtractor={(item) => item._id}
              renderItem={renderHospitalItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.hospitalList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>요양병원이 없습니다.</Text>
                </View>
              }
            />

            {/* 페이지네이션 */}
            {renderPagination()}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  resultsText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  hospitalList: {
    paddingBottom: 20,
  },
  hospitalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  hospitalInfo: {
    padding: 16,
  },
  hospitalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  veteranBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  veteranText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  majorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  majorBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  majorText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  majorMoreText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  operatingSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  operatingHours: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  phoneSection: {
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  callButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  noPhoneText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 16,
  },
  paginationButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  paginationButtonTextDisabled: {
    color: '#9CA3AF',
  },
  pageInfo: {
    paddingHorizontal: 16,
  },
  pageInfoText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default NursingHospitalList; 