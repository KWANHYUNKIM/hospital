import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// TypeScript 인터페이스 정의
interface HealthCenter {
  _id: string;
  yadmNm: string;
  clCdNm: string;
  addr: string;
  telno: string;
  startTime: string;
  endTime: string;
  operOrgNm: string;
  jibunAddr: string;
  mgrOrgNm: string;
  mgrTelno: string;
  buildingArea: string;
  drTotCnt: string;
  pnursCnt: string;
  socialWorkerCnt: string;
  nutritionistCnt: string;
  etcPersonnelStatus: string;
  holidayInfo: string;
  etcUseInfo: string;
  bizCont: string;
}

interface FetchParams {
  page: number;
  limit: number;
  keyword?: string;
  type?: string;
  sido?: string;
}

interface ApiResponse {
  content: HealthCenter[];
  totalPages: number;
}

interface HealthCenterListProps {
  initialSearchTerm?: string;
  initialType?: string;
  initialRegion?: string;
}

const HealthCenterList: React.FC<HealthCenterListProps> = ({
  initialSearchTerm = '',
  initialType = 'all',
  initialRegion = 'all'
}) => {
  const navigation = useNavigation();
  
  // 상태 관리
  const [centers, setCenters] = useState<HealthCenter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const itemsPerPage = 10;

  // 지역 목록
  const regions = [
    { value: 'all', label: '전체 지역' },
    { value: '서울', label: '서울' },
    { value: '경기', label: '경기' },
    { value: '인천', label: '인천' },
    { value: '부산', label: '부산' },
    { value: '대구', label: '대구' },
    { value: '광주', label: '광주' },
    { value: '대전', label: '대전' },
    { value: '울산', label: '울산' },
    { value: '세종', label: '세종' },
    { value: '강원', label: '강원' },
    { value: '충북', label: '충북' },
    { value: '충남', label: '충남' },
    { value: '전북', label: '전북' },
    { value: '전남', label: '전남' },
    { value: '경북', label: '경북' },
    { value: '경남', label: '경남' },
    { value: '제주', label: '제주' },
  ];

  // 타입 목록
  const types = [
    { value: 'all', label: '전체 유형' },
    { value: '건강증진', label: '건강증진' },
    { value: '정신보건', label: '정신보건' },
  ];

  // Mock API 함수
  const fetchHealthCenters = async (params: FetchParams): Promise<ApiResponse> => {
    // Mock 데이터 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockCenters: HealthCenter[] = [
      {
        _id: '1',
        yadmNm: '서울시 건강증진센터',
        clCdNm: '건강증진',
        addr: '서울특별시 중구 세종대로 110',
        telno: '02-1234-5678',
        startTime: '09:00',
        endTime: '18:00',
        operOrgNm: '서울시청',
        jibunAddr: '서울특별시 중구 태평로1가 31',
        mgrOrgNm: '서울시 보건소',
        mgrTelno: '02-1234-5679',
        buildingArea: '1000㎡',
        drTotCnt: '5',
        pnursCnt: '10',
        socialWorkerCnt: '3',
        nutritionistCnt: '2',
        etcPersonnelStatus: '기타 직원 5명',
        holidayInfo: '토요일, 일요일 휴무',
        etcUseInfo: '예약제 운영',
        bizCont: '건강상담, 건강검진, 건강교육 프로그램 운영'
      },
      {
        _id: '2',
        yadmNm: '강남구 정신건강증진센터',
        clCdNm: '정신보건',
        addr: '서울특별시 강남구 테헤란로 123',
        telno: '02-2345-6789',
        startTime: '09:00',
        endTime: '17:00',
        operOrgNm: '강남구청',
        jibunAddr: '서울특별시 강남구 역삼동 456',
        mgrOrgNm: '강남구 보건소',
        mgrTelno: '02-2345-6790',
        buildingArea: '800㎡',
        drTotCnt: '3',
        pnursCnt: '8',
        socialWorkerCnt: '5',
        nutritionistCnt: '1',
        etcPersonnelStatus: '기타 직원 3명',
        holidayInfo: '토요일, 일요일 휴무',
        etcUseInfo: '상담 예약 필수',
        bizCont: '정신건강상담, 스트레스 관리, 심리치료 프로그램'
      }
    ];

    // 필터링 로직
    let filteredCenters = mockCenters;
    
    if (params.keyword) {
      filteredCenters = filteredCenters.filter(center => 
        center.yadmNm.includes(params.keyword!) || 
        center.addr.includes(params.keyword!)
      );
    }
    
    if (params.type && params.type !== 'all') {
      filteredCenters = filteredCenters.filter(center => 
        center.clCdNm.includes(params.type!)
      );
    }
    
    if (params.sido && params.sido !== 'all') {
      filteredCenters = filteredCenters.filter(center => 
        center.addr.includes(params.sido!)
      );
    }

    return {
      content: filteredCenters,
      totalPages: Math.ceil(filteredCenters.length / params.limit)
    };
  };

  // 데이터 로딩 함수
  const fetchCenters = useCallback(async (page = 1, showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      setError(null);

      const params: FetchParams = {
        page,
        limit: itemsPerPage,
        keyword: searchTerm || undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        sido: selectedRegion !== 'all' ? selectedRegion : undefined
      };
      
      const data: ApiResponse = await fetchHealthCenters(params);
      
      if (data && data.content) {
        setCenters(data.content);
        setTotalPages(data.totalPages);
      } else {
        setCenters([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('건강증진센터 데이터 로딩 오류:', err);
      setError('데이터를 불러오는데 실패했습니다.');
      setCenters([]);
      setTotalPages(1);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, [searchTerm, selectedType, selectedRegion]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchCenters(1);
  }, [fetchCenters]);

  // 검색 실행
  const handleSearch = () => {
    setCurrentPage(1);
    fetchCenters(1);
  };

  // 센터 클릭 핸들러
  const handleCenterPress = (center: HealthCenter) => {
    console.log('건강증진센터 상세 보기:', center.yadmNm, center._id);
    // navigation.navigate('HealthCenterDetail', { 
    //   centerId: center._id,
    //   centerName: center.yadmNm 
    // });
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCenters(page);
  };

  // 새로고침
  const handleRefresh = () => {
    setRefreshing(true);
    fetchCenters(currentPage, false);
  };

  // 필터 모달 토글
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // 필터 적용
  const applyFilters = (type: string, region: string) => {
    setSelectedType(type);
    setSelectedRegion(region);
    setCurrentPage(1);
    setShowFilters(false);
  };

  // 페이지네이션 렌더링
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 이전 페이지 버튼
    if (currentPage > 1) {
      pages.push(
        <TouchableOpacity
          key="prev"
          style={styles.pageButton}
          onPress={() => handlePageChange(currentPage - 1)}
        >
          <Text style={styles.pageButtonText}>‹</Text>
        </TouchableOpacity>
      );
    }

    // 페이지 번호
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.pageButton,
            currentPage === i && styles.activePageButton
          ]}
          onPress={() => handlePageChange(i)}
        >
          <Text style={[
            styles.pageButtonText,
            currentPage === i && styles.activePageButtonText
          ]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    // 다음 페이지 버튼
    if (currentPage < totalPages) {
      pages.push(
        <TouchableOpacity
          key="next"
          style={styles.pageButton}
          onPress={() => handlePageChange(currentPage + 1)}
        >
          <Text style={styles.pageButtonText}>›</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.paginationContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.paginationContent}
        >
          {pages}
        </ScrollView>
      </View>
    );
  };

  // 건강증진센터 카드 렌더링
  const renderCenterItem = ({ item }: { item: HealthCenter }) => (
    <TouchableOpacity
      style={styles.centerCard}
      onPress={() => handleCenterPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.centerHeader}>
        <Text style={styles.centerName} numberOfLines={2}>{item.yadmNm}</Text>
        <View style={styles.centerTypeBadge}>
          <Text style={styles.centerTypeText}>{item.clCdNm}</Text>
        </View>
      </View>
      
      <View style={styles.centerInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📍</Text>
          <Text style={styles.infoText} numberOfLines={2}>{item.addr}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📞</Text>
          <Text style={styles.infoText}>{item.telno}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🕐</Text>
          <Text style={styles.infoText}>{item.startTime} - {item.endTime}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>🏢</Text>
          <Text style={styles.infoText} numberOfLines={1}>{item.operOrgNm}</Text>
        </View>
      </View>

      {/* 추가 정보 */}
      <View style={styles.additionalInfo}>
        <Text style={styles.additionalInfoTitle}>상세 정보</Text>
        <Text style={styles.additionalInfoText} numberOfLines={3}>
          의사 {item.drTotCnt}명 · 간호사 {item.pnursCnt}명 · 
          사회복지사 {item.socialWorkerCnt}명 · 영양사 {item.nutritionistCnt}명
        </Text>
        {item.bizCont && (
          <Text style={styles.bizContent} numberOfLines={2}>
            {item.bizCont}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // 필터 모달 렌더링
  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      transparent
      animationType="slide"
      onRequestClose={toggleFilters}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>필터</Text>
            <TouchableOpacity onPress={toggleFilters}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {/* 타입 선택 */}
            <Text style={styles.filterLabel}>센터 유형</Text>
            <View style={styles.filterOptions}>
              {types.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.filterOption,
                    selectedType === type.value && styles.activeFilterOption
                  ]}
                  onPress={() => setSelectedType(type.value)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedType === type.value && styles.activeFilterOptionText
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 지역 선택 */}
            <Text style={styles.filterLabel}>지역</Text>
            <View style={styles.filterOptions}>
              {regions.map((region) => (
                <TouchableOpacity
                  key={region.value}
                  style={[
                    styles.filterOption,
                    selectedRegion === region.value && styles.activeFilterOption
                  ]}
                  onPress={() => setSelectedRegion(region.value)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedRegion === region.value && styles.activeFilterOptionText
                  ]}>
                    {region.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => applyFilters(selectedType, selectedRegion)}
            >
              <Text style={styles.applyButtonText}>적용</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>건강증진센터를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>💚 건강증진센터 찾기</Text>
      </View>
      
      {/* 검색 및 필터 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="건강증진센터명 또는 주소로 검색"
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>🔍</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.filterButton} onPress={toggleFilters}>
          <Text style={styles.filterButtonText}>필터</Text>
        </TouchableOpacity>
      </View>

      {/* 결과 목록 */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchCenters(currentPage)}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : centers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={centers}
            renderItem={renderCenterItem}
            keyExtractor={(item) => item._id}
            style={styles.centerList}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListFooterComponent={renderPagination}
          />
        </>
      )}

      {/* 필터 모달 */}
      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 18,
  },
  filterButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  centerList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  centerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  centerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  centerTypeBadge: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  centerTypeText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  centerInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  additionalInfo: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  additionalInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  additionalInfoText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  bizContent: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  paginationContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  paginationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  activePageButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  pageButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  activePageButtonText: {
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalCloseButton: {
    fontSize: 18,
    color: '#6B7280',
  },
  modalBody: {
    padding: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    marginTop: 16,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
  },
  activeFilterOption: {
    backgroundColor: '#3B82F6',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  activeFilterOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  applyButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HealthCenterList; 