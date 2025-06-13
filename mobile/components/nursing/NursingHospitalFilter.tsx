import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 타입 정의
interface FilterRegion {
  label: string;
  icon: string;
}

interface NursingHospital {
  id: string;
  name: string;
  address: string;
}

interface AutoCompleteResponse {
  hospital: NursingHospital[];
}

interface NursingHospitalFilterProps {
  selectedRegion?: string;
  setSelectedRegion?: (region: string) => void;
  onSearch?: (query: string) => void;
  onLocationSearch?: (results: any[]) => void;
}

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

const NursingHospitalFilter: React.FC<NursingHospitalFilterProps> = ({
  selectedRegion = "전국",
  setSelectedRegion = () => {},
  onSearch = () => {},
  onLocationSearch = () => {},
}) => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutoCompleteResponse>({ hospital: [] });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (queryParam = searchQuery) => {
    const trimmedQuery = queryParam.trim();
    if (trimmedQuery) {
      console.log('검색 실행:', trimmedQuery);
      onSearch(trimmedQuery);
      setIsDropdownOpen(false);
    }
  };

  const handleLocationSearch = async () => {
    // React Native에서는 @react-native-community/geolocation 사용
    try {
      setIsSearching(true);
      
      // Mock 위치 기반 검색 (실제로는 Geolocation API 사용)
      const mockLocationResults = await mockLocationBasedSearch();
      
      onLocationSearch(mockLocationResults);
      Alert.alert('성공', '내 주변 요양병원을 찾았습니다.');
    } catch (error) {
      console.error("위치 기반 검색 오류:", error);
      Alert.alert('오류', '위치 기반 검색 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSearching(false);
    }
  };

  // Mock API 함수들
  const mockLocationBasedSearch = async () => {
    return [
      { id: '1', name: '근처 요양병원 1', address: '서울시 강남구' },
      { id: '2', name: '근처 요양병원 2', address: '서울시 서초구' },
    ];
  };

  const fetchNursingHospitalAutoComplete = async (query: string): Promise<AutoCompleteResponse> => {
    // Mock 자동완성 API
    return {
      hospital: [
        { id: '1', name: `${query} 요양병원`, address: '서울시 강남구' },
        { id: '2', name: `${query} 의료센터`, address: '서울시 서초구' },
      ].filter(item => item.name.includes(query))
    };
  };

  const handleFilterChange = (region: FilterRegion) => {
    setSelectedRegion(region.label);
    console.log('지역 변경:', region.label);
  };

  useEffect(() => {
    if (!searchQuery) {
      setSuggestions({ hospital: [] });
      setSelectedIndex(-1);
      setIsDropdownOpen(false);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setIsSearching(true);
      fetchNursingHospitalAutoComplete(searchQuery)
        .then(data => {
          setSuggestions(data);
          setIsSearching(false);
          setIsDropdownOpen(true);
          setSelectedIndex(-1);
        })
        .catch(error => {
          console.error('자동완성 에러:', error);
          setSuggestions({ hospital: [] });
          setIsSearching(false);
          setIsDropdownOpen(false);
        });
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  const handleSuggestionClick = (hospital: NursingHospital) => {
    setSearchQuery(hospital.name);
    setSuggestions({ hospital: [] });
    setIsDropdownOpen(false);
    handleSearch(hospital.name);
  };

  const renderRegionItem = ({ item }: { item: FilterRegion }) => (
    <TouchableOpacity
      style={[
        styles.regionButton,
        selectedRegion === item.label && styles.regionButtonSelected,
      ]}
      onPress={() => handleFilterChange(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.regionIcon}>{item.icon}</Text>
      <Text
        style={[
          styles.regionText,
          selectedRegion === item.label && styles.regionTextSelected,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderSuggestionItem = ({ item, index }: { item: NursingHospital; index: number }) => (
    <TouchableOpacity
      style={[
        styles.suggestionItem,
        index === selectedIndex && styles.suggestionItemSelected,
      ]}
      onPress={() => handleSuggestionClick(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.suggestionName}>{item.name}</Text>
      <Text style={styles.suggestionAddress}>{item.address}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 섹션 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>요양병원 찾기</Text>
        <Text style={styles.headerSubtitle}>선택한 지역의 요양병원을 쉽게 찾아보세요</Text>
        
        {/* 검색 섹션 */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setSelectedIndex(-1);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="어떤 요양병원을 찾으시나요?"
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
              onSubmitEditing={() => handleSearch()}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => handleSearch()}
              activeOpacity={0.7}
            >
              <Text style={styles.searchButtonText}>검색</Text>
            </TouchableOpacity>
          </View>

          {/* 자동완성 드롭다운 */}
          {isDropdownOpen && searchQuery && (
            <View style={styles.dropdown}>
              {isSearching ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#3B82F6" />
                  <Text style={styles.loadingText}>검색 중...</Text>
                </View>
              ) : suggestions.hospital.length === 0 ? (
                <Text style={styles.noResultsText}>❌ 검색 결과 없음</Text>
              ) : (
                <FlatList
                  data={suggestions.hospital}
                  keyExtractor={(item) => item.id}
                  renderItem={renderSuggestionItem}
                  style={styles.suggestionsList}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          )}
          
          {/* 위치 기반 검색 버튼 */}
          <TouchableOpacity
            style={[
              styles.locationButton,
              isSearching && styles.locationButtonDisabled,
            ]}
            onPress={handleLocationSearch}
            disabled={isSearching}
            activeOpacity={0.7}
          >
            <Text style={styles.locationButtonIcon}>📍</Text>
            <Text style={styles.locationButtonText}>
              {isSearching ? '검색 중...' : '내 주변 요양병원 찾기'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 필터 섹션 */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>지역 선택</Text>
        <FlatList
          data={filterRegions}
          keyExtractor={(item) => item.label}
          renderItem={renderRegionItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.regionsList}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F6F8FC',
  },
  header: {
    backgroundColor: 'linear-gradient(90deg, #36D1C4 0%, #3A8DDE 100%)', // LinearGradient 컴포넌트로 대체 필요
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchContainer: {
    position: 'relative',
  },
  searchInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  searchButton: {
    backgroundColor: '#3A8DDE',
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 240,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  noResultsText: {
    textAlign: 'center',
    paddingVertical: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  suggestionsList: {
    maxHeight: 240,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionItemSelected: {
    backgroundColor: '#F3F4F6',
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    marginBottom: 4,
  },
  suggestionAddress: {
    fontSize: 12,
    color: '#6B7280',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#36D1C4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  locationButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  locationButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  regionsList: {
    gap: 8,
  },
  regionButton: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    minWidth: 60,
  },
  regionButtonSelected: {
    backgroundColor: '#36D1C4',
  },
  regionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  regionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  regionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default NursingHospitalFilter; 