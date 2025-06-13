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
import { fetchHospitalDetail } from '../../service/hospitalApi';

const { width } = Dimensions.get('window');

// 타입 정의
interface HospitalLocation {
  lat: number;
  lon: number;
}

interface HospitalTimes {
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
  noTrmtSun?: string;
  noTrmtHoli?: string;
  lunchWeek?: string;
  emyNgtYn?: string;
  parkQty?: string;
  parkEtc?: string;
  plcNm?: string;
  plcDir?: string;
  plcDist?: string;
}

interface Equipment {
  typeCd: string;
  typeCdNm: string;
  typeCnt: number;
}

interface NursingGrade {
  typeCd: string;
  typeCdNm: string;
  nursingRt: string;
}

interface Personnel {
  pharmCd: string;
  pharmCdNm: string;
  pharmCnt: number;
}

interface Speciality {
  typeCd: string;
  typeCdNm: string;
}

interface FoodTreatment {
  typeCdNm: string;
  psnlCnt: number;
}

interface IntensiveCare {
  typeCdNm: string;
}

interface NearbyPharmacy {
  _id: string;
  yadmNm: string;
  addr: string;
  telno: string;
  Xpos?: number;
  Ypos?: number;
  distance?: number;
}

interface Hospital {
  _id: string;
  yadmNm: string;
  addr: string;
  category: string;
  region: string;
  telno?: string;
  hospUrl?: string;
  major?: string[];
  location?: HospitalLocation;
  times?: HospitalTimes;
  equipment?: Equipment[];
  nursing_grade?: NursingGrade[];
  personnel?: Personnel[];
  speciality?: Speciality[];
  food_treatment?: FoodTreatment[];
  intensive_care?: IntensiveCare[];
  nearby_pharmacies?: NearbyPharmacy[];
}

interface RouteParams {
  id: string;
}

type HospitalDetailRouteProp = RouteProp<{ params: RouteParams }, 'params'>;

// 시간 포맷팅 함수
const formatTime = (time?: string): string => {
  if (!time || time === 'null') return "정보 없음";
  if (/[시분]/.test(time)) return time;
  const timeStr = time.toString().padStart(4, '0');
  return `${timeStr.slice(0, 2)}:${timeStr.slice(2)}`;
};

// 운영 시간 표시 함수
const displayOperatingTime = (openTime?: string, closeTime?: string): string => {
  if (!openTime || openTime === "-") return "알수 없음";
  if (!closeTime || closeTime === "-") return `${formatTime(openTime)} ~ 알수 없음`;
  return `${formatTime(openTime)} ~ ${formatTime(closeTime)}`;
};

const HospitalDetailPage: React.FC = () => {
  const route = useRoute<HospitalDetailRouteProp>();
  const navigation = useNavigation();
  const { id } = route.params;

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHospitalDetail();
  }, [id]);

  const loadHospitalDetail = async () => {
    try {
      setLoading(true);
      const data = await fetchHospitalDetail(id);
      setHospital(data);
    } catch (error) {
      console.error('병원 상세 정보 로딩 실패:', error);
      setError('병원 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneCall = (phoneNumber?: string) => {
    if (phoneNumber && phoneNumber !== '정보없음') {
      const cleanNumber = phoneNumber.replace(/[^\d-+]/g, '');
      Linking.openURL(`tel:${cleanNumber}`).catch(() => {
        Alert.alert('오류', '전화 앱을 열 수 없습니다.');
      });
    }
  };

  const handleWebsiteOpen = (url?: string) => {
    if (url && url !== '-') {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      Linking.openURL(formattedUrl).catch(() => {
        Alert.alert('오류', '웹사이트를 열 수 없습니다.');
      });
    }
  };

  const handleMapOpen = (hospitalName: string, lat?: number, lon?: number) => {
    if (lat && lon) {
      const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(hospitalName)}/place/${lat},${lon}`;
      const googleMapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
      
      Alert.alert(
        '지도 앱 선택',
        '어떤 지도 앱으로 열까요?',
        [
          { text: '네이버 지도', onPress: () => Linking.openURL(naverMapUrl) },
          { text: '구글 지도', onPress: () => Linking.openURL(googleMapUrl) },
          { text: '취소', style: 'cancel' }
        ]
      );
    }
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
          <Text style={styles.errorButtonText}>돌아가기</Text>
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
          <Text style={styles.errorButtonText}>돌아가기</Text>
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
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
          <Text style={styles.backButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>

      {/* 병원 헤더 */}
      <View style={styles.hospitalHeader}>
        <Text style={styles.hospitalName}>{hospital.yadmNm}</Text>
        <Text style={styles.hospitalAddress}>{hospital.addr}</Text>
        <TouchableOpacity 
          style={styles.mapButton}
          onPress={() => handleMapOpen(hospital.yadmNm, hospital.location?.lat, hospital.location?.lon)}
        >
          <Icon name="map" size={16} color="#FFFFFF" />
          <Text style={styles.mapButtonText}>지도 보기</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 기본 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기본 정보</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>병원 유형</Text>
              <Text style={styles.infoValue}>{hospital.category}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>지역</Text>
              <Text style={styles.infoValue}>{hospital.region}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>전화번호</Text>
              <TouchableOpacity onPress={() => handlePhoneCall(hospital.telno)}>
                <Text style={[styles.infoValue, styles.phoneNumber]}>
                  {hospital.telno || "정보 없음"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>홈페이지</Text>
              {hospital.hospUrl !== "-" ? (
                <TouchableOpacity onPress={() => handleWebsiteOpen(hospital.hospUrl)}>
                  <Text style={[styles.infoValue, styles.websiteLink]}>방문하기</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.infoValue}>정보 없음</Text>
              )}
            </View>
          </View>
        </View>

        {/* 진료과 정보 */}
        {hospital.major && hospital.major.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>진료과 정보</Text>
            <View style={styles.tagContainer}>
              {hospital.major.map((subject, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{subject}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 운영 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>운영 정보</Text>
          
          {/* 운영 시간 */}
          <View style={styles.operatingSection}>
            <Text style={styles.subsectionTitle}>운영 시간</Text>
            <View style={styles.operatingTimes}>
              <View style={styles.operatingRow}>
                <Text style={styles.dayLabel}>월요일</Text>
                <Text style={styles.timeText}>
                  {displayOperatingTime(hospital.times?.trmtMonStart, hospital.times?.trmtMonEnd)}
                </Text>
              </View>
              <View style={styles.operatingRow}>
                <Text style={styles.dayLabel}>화요일</Text>
                <Text style={styles.timeText}>
                  {displayOperatingTime(hospital.times?.trmtTueStart, hospital.times?.trmtTueEnd)}
                </Text>
              </View>
              <View style={styles.operatingRow}>
                <Text style={styles.dayLabel}>수요일</Text>
                <Text style={styles.timeText}>
                  {displayOperatingTime(hospital.times?.trmtWedStart, hospital.times?.trmtWedEnd)}
                </Text>
              </View>
              <View style={styles.operatingRow}>
                <Text style={styles.dayLabel}>목요일</Text>
                <Text style={styles.timeText}>
                  {displayOperatingTime(hospital.times?.trmtThuStart, hospital.times?.trmtThuEnd)}
                </Text>
              </View>
              <View style={styles.operatingRow}>
                <Text style={styles.dayLabel}>금요일</Text>
                <Text style={styles.timeText}>
                  {displayOperatingTime(hospital.times?.trmtFriStart, hospital.times?.trmtFriEnd)}
                </Text>
              </View>
              <View style={styles.operatingRow}>
                <Text style={styles.dayLabel}>토요일</Text>
                <Text style={styles.timeText}>
                  {displayOperatingTime(hospital.times?.trmtSatStart, hospital.times?.trmtSatEnd)}
                </Text>
              </View>
              <View style={styles.operatingRow}>
                <Text style={styles.dayLabel}>일요일</Text>
                <Text style={styles.timeText}>{hospital.times?.noTrmtSun || "알수 없음"}</Text>
              </View>
              <View style={styles.operatingRow}>
                <Text style={styles.dayLabel}>공휴일</Text>
                <Text style={styles.timeText}>{hospital.times?.noTrmtHoli || "알수 없음"}</Text>
              </View>
              <View style={styles.operatingRow}>
                <Text style={styles.dayLabel}>점심시간</Text>
                <Text style={styles.timeText}>{hospital.times?.lunchWeek || "알수 없음"}</Text>
              </View>
            </View>
          </View>

          {/* 진료 서비스 */}
          <View style={styles.serviceSection}>
            <View style={styles.serviceItem}>
              <Icon 
                name={hospital.times?.emyNgtYn === "Y" ? "check-circle" : "cancel"} 
                size={20} 
                color={hospital.times?.emyNgtYn === "Y" ? "#10B981" : "#EF4444"} 
              />
              <Text style={styles.serviceText}>
                야간진료: {hospital.times?.emyNgtYn === "Y" ? "가능" : "불가능"}
              </Text>
            </View>
            <View style={styles.serviceItem}>
              <Icon 
                name={hospital.times?.trmtSatStart ? "check-circle" : "cancel"} 
                size={20} 
                color={hospital.times?.trmtSatStart ? "#10B981" : "#EF4444"} 
              />
              <Text style={styles.serviceText}>
                주말진료: {hospital.times?.trmtSatStart ? "가능" : "불가능"}
              </Text>
            </View>
          </View>

          {/* 주차 정보 */}
          {hospital.times?.parkQty && (
            <View style={styles.parkingSection}>
              <Text style={styles.subsectionTitle}>주차 정보</Text>
              <View style={styles.parkingInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>주차 가능 대수</Text>
                  <Text style={styles.infoValue}>{hospital.times.parkQty}대</Text>
                </View>
                {hospital.times.parkEtc && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>주차 요금</Text>
                    <Text style={styles.infoValue}>{hospital.times.parkEtc}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* 위치 안내 */}
          {hospital.times?.plcNm && (
            <View style={styles.locationSection}>
              <Text style={styles.subsectionTitle}>위치 안내</Text>
              <View style={styles.locationInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>가까운 지하철역</Text>
                  <Text style={styles.infoValue}>{hospital.times.plcNm}</Text>
                </View>
                {hospital.times.plcDir && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>출구 안내</Text>
                    <Text style={styles.infoValue}>{hospital.times.plcDir}</Text>
                  </View>
                )}
                {hospital.times.plcDist && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>도보 거리</Text>
                    <Text style={styles.infoValue}>{hospital.times.plcDist}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* 장비 정보 */}
        {hospital.equipment && hospital.equipment.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>장비 정보</Text>
            <View style={styles.equipmentList}>
              {hospital.equipment.map((equip) => (
                <View key={equip.typeCd} style={styles.equipmentItem}>
                  <Text style={styles.equipmentName}>{equip.typeCdNm}</Text>
                  <Text style={styles.equipmentCount}>{equip.typeCnt}개</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 간호등급 정보 */}
        {hospital.nursing_grade && hospital.nursing_grade.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>간호등급 정보</Text>
            <View style={styles.gradeList}>
              {hospital.nursing_grade.map((grade) => (
                <View key={grade.typeCd} style={styles.gradeItem}>
                  <Text style={styles.gradeName}>{grade.typeCdNm}</Text>
                  <Text style={styles.gradeLevel}>등급: {grade.nursingRt}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 인력 정보 */}
        {hospital.personnel && hospital.personnel.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>인력 정보</Text>
            <View style={styles.personnelList}>
              {hospital.personnel.map((person) => (
                <View key={person.pharmCd} style={styles.personnelItem}>
                  <Text style={styles.personnelName}>{person.pharmCdNm}</Text>
                  <Text style={styles.personnelCount}>{person.pharmCnt}명</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 전문과목 정보 */}
        {hospital.speciality && hospital.speciality.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>전문과목 정보</Text>
            <View style={styles.tagContainer}>
              {hospital.speciality.map((spec) => (
                <View key={spec.typeCd} style={[styles.tag, styles.specialityTag]}>
                  <Text style={[styles.tagText, styles.specialityTagText]}>{spec.typeCdNm}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 식이치료 정보 */}
        {hospital.food_treatment && hospital.food_treatment.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>식이치료 정보</Text>
            <View style={styles.foodTreatmentList}>
              {hospital.food_treatment.map((food, index) => (
                <View key={index} style={styles.foodTreatmentItem}>
                  <Text style={styles.foodTreatmentName}>{food.typeCdNm}</Text>
                  <Text style={styles.foodTreatmentCount}>인원: {food.psnlCnt}명</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 중환자실 정보 */}
        {hospital.intensive_care && hospital.intensive_care.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>중환자실 및 특수치료 정보</Text>
            <View style={styles.tagContainer}>
              {hospital.intensive_care.map((care, index) => (
                <View key={index} style={[styles.tag, styles.intensiveCareTag]}>
                  <Text style={[styles.tagText, styles.intensiveCareTagText]}>{care.typeCdNm}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 주변 약국 */}
        {hospital.nearby_pharmacies && hospital.nearby_pharmacies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>주변 약국</Text>
            <View style={styles.pharmacyList}>
              {hospital.nearby_pharmacies.map((pharmacy) => (
                <View key={pharmacy._id} style={styles.pharmacyItem}>
                  <View style={styles.pharmacyInfo}>
                    <Text style={styles.pharmacyName}>{pharmacy.yadmNm}</Text>
                    <Text style={styles.pharmacyAddress}>{pharmacy.addr}</Text>
                    <View style={styles.pharmacyDetails}>
                      <Text style={styles.pharmacyPhone}>📞 {pharmacy.telno}</Text>
                      {pharmacy.distance !== undefined && (
                        <Text style={styles.pharmacyDistance}>
                          📍 {pharmacy.distance === 0 ? "건물 내부" :
                            pharmacy.distance < 1000 
                              ? `${Math.round(pharmacy.distance)}m`
                              : `${(pharmacy.distance / 1000).toFixed(1)}km`
                          }
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

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
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  hospitalHeader: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 20,
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
    marginBottom: 12,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  phoneNumber: {
    color: '#3B82F6',
  },
  websiteLink: {
    color: '#3B82F6',
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
  specialityTag: {
    backgroundColor: '#D1FAE5',
  },
  specialityTagText: {
    color: '#065F46',
  },
  intensiveCareTag: {
    backgroundColor: '#FEE2E2',
  },
  intensiveCareTagText: {
    color: '#991B1B',
  },
  operatingSection: {
    marginBottom: 20,
  },
  operatingTimes: {
    gap: 4,
  },
  operatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 2,
    textAlign: 'right',
  },
  serviceSection: {
    gap: 12,
    marginBottom: 20,
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
  parkingSection: {
    marginBottom: 20,
  },
  parkingInfo: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  locationSection: {
    marginBottom: 20,
  },
  locationInfo: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  equipmentList: {
    gap: 8,
  },
  equipmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  equipmentCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  gradeList: {
    gap: 8,
  },
  gradeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  gradeName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  gradeLevel: {
    fontSize: 14,
    color: '#6B7280',
  },
  personnelList: {
    gap: 8,
  },
  personnelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  personnelName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  personnelCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  foodTreatmentList: {
    gap: 8,
  },
  foodTreatmentItem: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  foodTreatmentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  foodTreatmentCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  pharmacyList: {
    gap: 12,
  },
  pharmacyItem: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  pharmacyAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  pharmacyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pharmacyPhone: {
    fontSize: 12,
    color: '#374151',
  },
  pharmacyDistance: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default HospitalDetailPage; 