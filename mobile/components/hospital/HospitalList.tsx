import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HospitalCard from './HospitalCard';
import DistanceInfo from './DistanceInfo';

// TypeScript 인터페이스 정의
interface Hospital {
  id: string;
  name: string;
  address: string;
  phone?: string;
  services?: string[];
  schedule?: { [key: string]: string };
  location?: {
    lat: number;
    lon: number;
  };
  type?: string;
  distance?: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface Filters {
  type?: string;
  region?: string;
  keyword?: string;
}

interface HospitalListProps {
  hospitals: Hospital[];
  filters?: Filters;
  userLocation?: UserLocation;
  loading?: boolean;
  onHospitalPress?: (hospital: Hospital) => void;
  showDistanceInfo?: boolean;
}

const HospitalList: React.FC<HospitalListProps> = ({
  hospitals,
  filters,
  userLocation,
  loading = false,
  onHospitalPress,
  showDistanceInfo = true,
}) => {
  const navigation = useNavigation();

  const handleDetailClick = (hospital: Hospital) => {
    if (onHospitalPress) {
      onHospitalPress(hospital);
      return;
    }

    const params: any = {
      hospitalId: hospital.id,
      hospitalName: hospital.name,
    };
    
    // 현재 위치 정보 추가
    if (userLocation?.latitude && userLocation?.longitude) {
      params.userLat = userLocation.latitude;
      params.userLng = userLocation.longitude;
    }
    
    // 필터 정보 추가
    if (filters?.type) {
      params.filterType = filters.type;
    }
    
    navigation.navigate('HospitalDetail' as never, params as never);
  };

  const renderHospitalItem = ({ item }: { item: Hospital }) => (
    <View style={styles.hospitalItemContainer}>
      <TouchableOpacity
        style={styles.hospitalItem}
        onPress={() => handleDetailClick(item)}
        activeOpacity={0.7}
      >
        <View style={styles.hospitalHeader}>
          <View style={styles.hospitalInfo}>
            <Text style={styles.hospitalName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.hospitalAddress} numberOfLines={2}>
              {item.address}
            </Text>
            
            {/* 거리 정보 */}
            {showDistanceInfo && item.location && (
              <DistanceInfo hospitalLocation={item.location} />
            )}
            
            {/* 추가 정보 */}
            {item.phone && (
              <View style={styles.additionalInfo}>
                <Text style={styles.additionalInfoIcon}>📞</Text>
                <Text style={styles.additionalInfoText}>{item.phone}</Text>
              </View>
            )}
            
            {item.services && item.services.length > 0 && (
              <View style={styles.additionalInfo}>
                <Text style={styles.additionalInfoIcon}>🏥</Text>
                <Text style={styles.additionalInfoText} numberOfLines={2}>
                  {item.services.slice(0, 3).join(', ')}
                  {item.services.length > 3 && ` 외 ${item.services.length - 3}개`}
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() => handleDetailClick(item)}
          >
            <Text style={styles.detailButtonText}>자세히</Text>
            <Text style={styles.detailButtonIcon}>→</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🏥</Text>
      <Text style={styles.emptyTitle}>병원을 찾을 수 없습니다</Text>
      <Text style={styles.emptyDescription}>
        다른 검색 조건을 시도해보세요.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>병원 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {hospitals.length > 0 && (
        <View style={styles.resultHeader}>
          <Text style={styles.resultCount}>
            총 {hospitals.length}개의 병원을 찾았습니다
          </Text>
        </View>
      )}
      
      <FlatList
        data={hospitals}
        renderItem={renderHospitalItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={[
          styles.listContainer,
          hospitals.length === 0 && styles.emptyListContainer
        ]}
      />
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
    fontSize: 16,
    color: '#6B7280',
  },
  resultHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyListContainer: {
    flex: 1,
  },
  hospitalItemContainer: {
    marginVertical: 4,
  },
  hospitalItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  hospitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  hospitalInfo: {
    flex: 1,
    marginRight: 12,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 24,
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  additionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  additionalInfoIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  additionalInfoText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  detailButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 70,
    justifyContent: 'center',
  },
  detailButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  detailButtonIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HospitalList; 