import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// TypeScript 인터페이스 정의
interface HeaderProps {
  onSearch?: (searchTerm: string) => void;
  placeholder?: string;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onSearch,
  placeholder = '무엇을 찾으시나요?',
  showSearch = true
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      Alert.alert('알림', '검색어를 입력해주세요.');
      return;
    }

    if (onSearch) {
      onSearch(searchTerm.trim());
    } else {
      Alert.alert('검색', `검색어: ${searchTerm.trim()}`);
    }
    
    // 검색 후 입력 초기화
    setSearchTerm('');
  };

  const handleSubmitEditing = () => {
    handleSearch();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {/* 앱 제목 */}
        <Text style={styles.title}>삐뽀삐뽀119</Text>

        {/* 검색 영역 */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Icon name="search" size={20} color="#6B7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                onSubmitEditing={handleSubmitEditing}
                returnKeyType="search"
                maxLength={100}
              />
              {searchTerm.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setSearchTerm('')}
                >
                  <Icon name="clear" size={20} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={!searchTerm.trim()}
            >
              <Text style={[
                styles.searchButtonText,
                !searchTerm.trim() && styles.searchButtonTextDisabled
              ]}>
                검색
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#EF4444',
  },
  header: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  searchButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchButtonTextDisabled: {
    opacity: 0.5,
  },
});

export default Header; 