import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { fetchHospitals } from '../../utils/api';

// TypeScript 인터페이스 정의
interface Hospital {
  id: string;
  name: string;
  address: string;
  phone?: string;
  type?: string;
}

interface HospitalMentionProps {
  onSelect: (hospital: Hospital) => void;
  onClose: () => void;
  visible: boolean;
  placeholder?: string;
  maxResults?: number;
}

const HospitalMention: React.FC<HospitalMentionProps> = ({
  onSelect,
  onClose,
  visible,
  placeholder = '병원 검색...',
  maxResults = 50,
}) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      loadHospitals();
      // 모달이 열리면 검색창에 포커스
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } else {
      // 모달이 닫히면 검색어 초기화
      setSearchTerm('');
      setFilteredHospitals([]);
      setError(null);
    }
  }, [visible]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = hospitals.filter(hospital =>
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.address.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, maxResults);
      setFilteredHospitals(filtered);
    } else {
      setFilteredHospitals(hospitals.slice(0, maxResults));
    }
  }, [searchTerm, hospitals, maxResults]);

  const loadHospitals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchHospitals({ limit: 100 });
      const hospitalsData = Array.isArray(response.data) ? response.data : 
                          Array.isArray(response) ? response : [];
      setHospitals(hospitalsData);
      setFilteredHospitals(hospitalsData.slice(0, maxResults));
    } catch (err) {
      console.error('병원 데이터 로딩 오류:', err);
      setError('병원 데이터를 불러오는데 실패했습니다.');
      setHospitals([]);
      setFilteredHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (hospital: Hospital) => {
    onSelect(hospital);
    onClose();
  };

  const renderHospitalItem = ({ item }: { item: Hospital }) => (
    <TouchableOpacity
      style={styles.hospitalItem}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.hospitalInfo}>
        <Text style={styles.hospitalName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.hospitalAddress} numberOfLines={1}>
          {item.address}
        </Text>
        {item.type && (
          <View style={styles.hospitalTypeContainer}>
            <Text style={styles.hospitalType}>{item.type}</Text>
          </View>
        )}
      </View>
      <Text style={styles.selectIcon}>→</Text>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.emptyText}>검색 중...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadHospitals}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (searchTerm.trim() && filteredHospitals.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>'{searchTerm}'에 대한 검색 결과가 없습니다.</Text>
        </View>
      );
    }

    if (hospitals.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>병원 데이터가 없습니다.</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>병원 선택</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 검색 입력 */}
          <View style={styles.searchContainer}>
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>

          {/* 병원 목록 */}
          <FlatList
            data={filteredHospitals}
            renderItem={renderHospitalItem}
            keyExtractor={(item) => item.id}
            style={styles.hospitalList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyComponent}
            keyboardShouldPersistTaps="handled"
          />

          {/* 결과 개수 표시 */}
          {!loading && !error && filteredHospitals.length > 0 && (
            <View style={styles.resultCount}>
              <Text style={styles.resultCountText}>
                {filteredHospitals.length}개의 병원을 찾았습니다
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  hospitalList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  hospitalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  hospitalInfo: {
    flex: 1,
    marginRight: 12,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  hospitalTypeContainer: {
    alignSelf: 'flex-start',
  },
  hospitalType: {
    fontSize: 12,
    color: '#3B82F6',
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectIcon: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resultCount: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  resultCountText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default HospitalMention; 