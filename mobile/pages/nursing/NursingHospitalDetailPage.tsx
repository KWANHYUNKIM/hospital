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
  Linking,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchNursingHospitalDetail } from '../../service/nursingHospitalApi';

const { width } = Dimensions.get('window');

// 타입 정의
interface NursingHospital {
  id: number;
  yadmNm: string;
  addr: string;
  telno: string;
  beds?: number;
  doctors?: number;
  nurses?: number;
  category?: string;
  veteran_hospital?: boolean;
  major?: string[];
  hospUrl?: string;
  nightCare?: boolean;
  weekendCare?: boolean;
  times?: {
    trmtMonStart?: string;
    trmtMonEnd?: string;
    trmtTueStart?: string;
    trmtTueEnd?: string;
    trmtWedStart?: string;
    trmtWedEnd?: string;
    trmtThuStart?: string;
    trmtThuEnd?: string;
    trmtFriStart?: string;
    trmtFriEnd?: string;
    trmtSatStart?: string;
    trmtSatEnd?: string;
    trmtSunStart?: string;
    trmtSunEnd?: string;
    lunchWeek?: string;
  };
}

interface RouteParams {
  id: string;
}

type NursingHospitalDetailRouteProp = RouteProp<{ params: RouteParams }, 'params'>;

// 시간 포맷팅 함수
const formatTime = (time?: string): string => {
  if (!time) return "정보 없음";
  const timeStr = time.toString().padStart(4, '0');
  return `${timeStr.slice(0, 2)}:${timeStr.slice(2)}`;
};

// 점심시간 포맷팅 함수
const formatLunchTime = (lunchTime?: string): string => {
  if (!lunchTime) return "정보 없음";
  const parts = lunchTime.split('~');
  if (parts.length !== 2) return "정보 없음";
  const [start, end] = parts.map(time => time.trim());
  return `${formatTime(start)} ~ ${formatTime(end)}`;
};

// 운영 시간 표시 함수
const displayOperatingTime = (startTime?: string, endTime?: string): string => {
  if (!startTime || !endTime) return "정보 없음";
  return `${formatTime(startTime)} ~ ${formatTime(endTime)}`;
};

const NursingHospitalDetailPage: React.FC = () => {
  const route = useRoute<NursingHospitalDetailRouteProp>();
  const navigation = useNavigation();
  const { id } = route.params;

  const [hospital, setHospital] = useState<NursingHospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const hospitalData = await fetchNursingHospitalDetail(parseInt(id));
      
      if (hospitalData) {
        setHospital(hospitalData);
      } else {
        throw new Error('병원 정보를 찾을 수 없습니다.');
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneCall = (phoneNumber: string) => {
    if (phoneNumber && phoneNumber !== '정보없음') {
      const cleanNumber = phoneNumber.replace(/[^\d-+]/g, '');
      Linking.openURL(`tel:${cleanNumber}`).catch(() => {
        Alert.alert('오류', '전화 앱을 열 수 없습니다.');
      });
    }
  };

  const handleWebsiteOpen = (url: string) => {
    if (url && url !== '-') {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      Linking.openURL(formattedUrl).catch(() => {
        Alert.alert('오류', '웹사이트를 열 수 없습니다.');
      });
    }
  };

  const handleReviewNavigation = () => {
    navigation.navigate('NursingHospitalReview', { id });
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
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.errorButtonText}>목록으로 돌아가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!hospital) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="local-hospital" size={64} color="#9CA3AF" />
        <Text style={styles.errorText}>병원 정보를 찾을 수 없습니다.</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.errorButtonText}>목록으로 돌아가기</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const operatingDays = [
    { label: '월요일', start: hospital.times?.trmtMonStart, end: hospital.times?.trmtMonEnd },
    { label: '화요일', start: hospital.times?.trmtTueStart, end: hospital.times?.trmtTueEnd },
    { label: '수요일', start: hospital.times?.trmtWedStart, end: hospital.times?.trmtWedEnd },
    { label: '목요일', start: hospital.times?.trmtThuStart, end: hospital.times?.trmtThuEnd },
    { label: '금요일', start: hospital.times?.trmtFriStart, end: hospital.times?.trmtFriEnd },
    { label: '토요일', start: hospital.times?.trmtSatStart, end: hospital.times?.trmtSatEnd },
    { label: '일요일', start: hospital.times?.trmtSunStart, end: hospital.times?.trmtSunEnd },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#374151" />
          <Text style={styles.backButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 병원 기본 정보 헤더 */}
        <View style={styles.hospitalHeader}>
          <Text style={styles.hospitalName}>{hospital.yadmNm}</Text>
          <Text style={styles.hospitalAddress}>{hospital.addr}</Text>
        </View>

        {/* 핵심 정보 카드 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>병원 정보</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Icon name="hotel" size={24} color="#3B82F6" />
              <Text style={styles.infoLabel}>병상</Text>
              <Text style={styles.infoValue}>{hospital.beds || '정보없음'}</Text>
            </View>
            <View style={styles.infoCard}>
              <Icon name="person" size={24} color="#10B981" />
              <Text style={styles.infoLabel}>의사</Text>
              <Text style={styles.infoValue}>{hospital.doctors || '정보없음'}</Text>
            </View>
            <View style={styles.infoCard}>
              <Icon name="local-hospital" size={24} color="#8B5CF6" />
              <Text style={styles.infoLabel}>간호사</Text>
              <Text style={styles.infoValue}>{hospital.nurses || '정보없음'}</Text>
            </View>
            <TouchableOpacity 
              style={styles.infoCard}
              onPress={() => handlePhoneCall(hospital.telno)}
            >
              <Icon name="phone" size={24} color="#EF4444" />
              <Text style={styles.infoLabel}>전화</Text>
              <Text style={[styles.infoValue, styles.phoneNumber]}>
                {hospital.telno || '정보없음'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 병원 유형 */}
          {(hospital.category || hospital.veteran_hospital) && (
            <View style={styles.categorySection}>
              <Text style={styles.categoryTitle}>병원 유형</Text>
              <View style={styles.tagContainer}>
                {hospital.category && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{hospital.category}</Text>
                  </View>
                )}
                {hospital.veteran_hospital && (
                  <View style={[styles.tag, styles.veteranTag]}>
                    <Text style={[styles.tagText, styles.veteranTagText]}>위탁병원</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* 진료과 정보 */}
          {hospital.major && hospital.major.length > 0 && (
            <View style={styles.categorySection}>
              <Text style={styles.categoryTitle}>진료과</Text>
              <View style={styles.tagContainer}>
                {hospital.major.map((major, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{major}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 홈페이지 */}
          {hospital.hospUrl && hospital.hospUrl !== '-' && (
            <View style={styles.categorySection}>
              <Text style={styles.categoryTitle}>홈페이지</Text>
              <TouchableOpacity onPress={() => handleWebsiteOpen(hospital.hospUrl!)}>
                <Text style={styles.websiteLink}>{hospital.hospUrl}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 운영 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>운영 정보</Text>
          
          <View style={styles.operatingSection}>
            <Text style={styles.operatingTitle}>운영 시간</Text>
            {operatingDays.map((day, index) => (
              <View key={index} style={styles.operatingRow}>
                <Text style={styles.dayLabel}>{day.label}</Text>
                <Text style={styles.timeText}>
                  {displayOperatingTime(day.start, day.end)}
                </Text>
              </View>
            ))}
            <View style={styles.operatingRow}>
              <Text style={styles.dayLabel}>점심시간</Text>
              <Text style={styles.timeText}>
                {formatLunchTime(hospital.times?.lunchWeek)}
              </Text>
            </View>
          </View>

          <View style={styles.serviceSection}>
            <View style={styles.serviceItem}>
              <Icon 
                name={hospital.nightCare ? "check-circle" : "cancel"} 
                size={20} 
                color={hospital.nightCare ? "#10B981" : "#EF4444"} 
              />
              <Text style={styles.serviceText}>
                야간진료: {hospital.nightCare ? "가능" : "불가능"}
              </Text>
            </View>
            <View style={styles.serviceItem}>
              <Icon 
                name={hospital.weekendCare ? "check-circle" : "cancel"} 
                size={20} 
                color={hospital.weekendCare ? "#10B981" : "#EF4444"} 
              />
              <Text style={styles.serviceText}>
                주말진료: {hospital.weekendCare ? "가능" : "불가능"}
              </Text>
            </View>
          </View>
        </View>

        {/* 리뷰 버튼 */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.reviewButton}
            onPress={handleReviewNavigation}
          >
            <Icon name="rate-review" size={24} color="#FFFFFF" />
            <Text style={styles.reviewButtonText}>리뷰 보기 / 작성하기</Text>
            <Icon name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
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
  hospitalHeader: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  hospitalName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  hospitalAddress: {
    fontSize: 16,
    color: '#DBEAFE',
  },
  section: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    width: (width - 64) / 2,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  phoneNumber: {
    color: '#3B82F6',
  },
  categorySection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
  },
  veteranTag: {
    backgroundColor: '#FECACA',
  },
  veteranTagText: {
    color: '#B91C1C',
  },
  websiteLink: {
    fontSize: 16,
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  operatingSection: {
    marginBottom: 16,
  },
  operatingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  operatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  serviceSection: {
    gap: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceText: {
    fontSize: 14,
    color: '#374151',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  reviewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default NursingHospitalDetailPage; 