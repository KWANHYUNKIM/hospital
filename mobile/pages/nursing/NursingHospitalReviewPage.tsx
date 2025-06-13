import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState } from '../../redux/store';
import { fetchNursingHospitalDetail } from '../../service/nursingHospitalApi';
import HospitalReview from '../../components/hospital/HospitalReview';

// 타입 정의
interface NursingHospital {
  id: number;
  yadmNm: string;
  addr: string;
  telno: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

interface RouteParams {
  id: string;
}

type NursingHospitalReviewRouteProp = RouteProp<{ params: RouteParams }, 'params'>;

const NursingHospitalReviewPage: React.FC = () => {
  const route = useRoute<NursingHospitalReviewRouteProp>();
  const navigation = useNavigation();
  const { id } = route.params;
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);

  const [hospital, setHospital] = useState<NursingHospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHospital();
  }, [id]);

  const fetchHospital = async () => {
    try {
      setLoading(true);
      const response = await fetchNursingHospitalDetail(parseInt(id));
      
      if (response) {
        setHospital(response);
      } else {
        throw new Error('병원 정보를 찾을 수 없습니다.');
      }
    } catch (err: any) {
      console.error('Error fetching hospital:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDetail = () => {
    navigation.goBack();
  };

  const handleBackToList = () => {
    navigation.navigate('NursingHospitalList');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>병원 정보를 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="error-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>오류가 발생했습니다: {error}</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={handleBackToDetail}
        >
          <Icon name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.errorButtonText}>뒤로 가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!hospital) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="local-hospital" size={64} color="#9CA3AF" />
        <Text style={styles.errorText}>병원을 찾을 수 없습니다.</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={handleBackToList}
        >
          <Icon name="list" size={20} color="#FFFFFF" />
          <Text style={styles.errorButtonText}>목록으로 돌아가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToDetail}
        >
          <Icon name="arrow-back" size={24} color="#374151" />
          <Text style={styles.backButtonText}>병원 상세 정보로 돌아가기</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 병원 정보 카드 */}
        <View style={styles.hospitalCard}>
          <View style={styles.hospitalInfo}>
            <Icon name="local-hospital" size={24} color="#3B82F6" />
            <View style={styles.hospitalDetails}>
              <Text style={styles.hospitalName}>
                {hospital.yadmNm || '병원 이름 없음'}
              </Text>
              <Text style={styles.hospitalAddress}>{hospital.addr}</Text>
              {hospital.category && (
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>{hospital.category}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* 리뷰 섹션 */}
        <View style={styles.reviewSection}>
          <View style={styles.reviewHeader}>
            <Icon name="rate-review" size={24} color="#374151" />
            <Text style={styles.reviewTitle}>병원 리뷰</Text>
          </View>
          
          {/* 로그인 안내 */}
          {!isLoggedIn && (
            <View style={styles.loginNotice}>
              <Icon name="info" size={20} color="#F59E0B" />
              <Text style={styles.loginNoticeText}>
                리뷰를 작성하려면 로그인이 필요합니다.
              </Text>
            </View>
          )}

          {/* HospitalReview 컴포넌트 */}
          <View style={styles.reviewComponent}>
            <HospitalReview 
              hospitalId={parseInt(id)} 
              hospitalType="nursing" 
            />
          </View>
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
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
    backgroundColor: '#F9FAFB',
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
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    marginVertical: 16,
  },
  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  scrollView: {
    flex: 1,
  },
  hospitalCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hospitalInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  hospitalDetails: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTagText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '500',
  },
  reviewSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  loginNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  loginNoticeText: {
    fontSize: 14,
    color: '#92400E',
    flex: 1,
  },
  reviewComponent: {
    minHeight: 200,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default NursingHospitalReviewPage; 