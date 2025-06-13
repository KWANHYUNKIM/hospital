import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 타입 정의 및 export
export interface Pharmacy {
  name: string;
  address: string;
  id?: string;
}

export interface PharmacySuggestions {
  pharmacy: Pharmacy[];
}

export interface PharmacyAutoCompleteProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  style?: any;
}

const PharmacyAutoComplete: React.FC<PharmacyAutoCompleteProps> = ({
  searchQuery = '',
  setSearchQuery = () => {},
  onSearch = () => {},
  placeholder = "어떤 약국을 찾으시나요?",
  style,
}) => {
  const [suggestions, setSuggestions] = useState<PharmacySuggestions>({ pharmacy: [] });
  const [inputValue, setInputValue] = useState(searchQuery);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<number | null>(null);
  const navigation = useNavigation();

  // Mock API 함수
  const fetchPharmacyAutoComplete = async (query: string): Promise<PharmacySuggestions> => {
    // 실제로는 API 호출: axios.get(`${getApiUrl()}/api/pharmacy-autocomplete?query=${encodeURIComponent(query)}`)
    await new Promise(resolve => setTimeout(resolve, 300)); // 네트워크 지연 시뮬레이션
    
    const mockPharmacies: Pharmacy[] = [
      { id: '1', name: `${query} 약국`, address: '서울시 강남구 테헤란로 123' },
      { id: '2', name: `${query} 온누리약국`, address: '서울시 서초구 반포대로 456' },
      { id: '3', name: `${query} 24시약국`, address: '서울시 송파구 올림픽로 789' },
      { id: '4', name: `${query} 건강약국`, address: '서울시 마포구 홍익로 321' },
      { id: '5', name: `${query} 메디팜약국`, address: '서울시 영등포구 여의대로 654' },
    ].filter(item => item.name.toLowerCase().includes(query.toLowerCase()));

    return { pharmacy: mockPharmacies };
  };

  useEffect(() => {
    if (!inputValue) {
      setSuggestions({ pharmacy: [] });
      setSelectedIndex(-1);
      setIsDropdownOpen(false);
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await fetchPharmacyAutoComplete(inputValue);
        setSuggestions(response);
        setIsDropdownOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('자동완성 오류:', error);
        setSuggestions({ pharmacy: [] });
        setIsDropdownOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [inputValue]);

  const handleSearch = (queryParam = inputValue) => {
    const trimmedQuery = queryParam.trim();
    if (!trimmedQuery) return;
    
    setSuggestions({ pharmacy: [] });
    setSearchQuery(trimmedQuery);
    setInputValue(trimmedQuery);
    setIsDropdownOpen(false);
    onSearch(trimmedQuery);
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    setSelectedIndex(-1);
  };

  const handleSuggestionPress = (pharmacy: Pharmacy) => {
    handleSearch(pharmacy.name);
  };

  const handleInputFocus = () => {
    if (inputValue && suggestions.pharmacy.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  const handleInputBlur = () => {
    // 약간의 지연을 두어 터치 이벤트가 처리될 시간을 줌
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150);
  };

  const renderSuggestionItem = ({ item, index }: { item: Pharmacy; index: number }) => (
    <TouchableOpacity
      style={[
        styles.suggestionItem,
        index === selectedIndex && styles.suggestionItemSelected,
      ]}
      onPress={() => handleSuggestionPress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.suggestionName}>{item.name}</Text>
      <Text style={styles.suggestionAddress}>{item.address}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={inputValue}
          onChangeText={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
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
      {isDropdownOpen && inputValue && (
        <View style={styles.dropdown}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#10B981" />
              <Text style={styles.loadingText}>검색 중...</Text>
            </View>
          ) : suggestions.pharmacy.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>❌ 검색 결과 없음</Text>
            </View>
          ) : (
            <FlatList
              data={suggestions.pharmacy}
              keyExtractor={(item, index) => `${item.name}-${item.address}-${index}`}
              renderItem={renderSuggestionItem}
              style={styles.suggestionsList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
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
    backgroundColor: '#FFFFFF',
  },
  searchButton: {
    backgroundColor: '#10B981',
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
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: 1,
    maxHeight: 240,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
  noResultsContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  noResultsText: {
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
    color: '#10B981',
    marginBottom: 4,
  },
  suggestionAddress: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default PharmacyAutoComplete; 