import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EmergencyCarePage: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>응급 상황 대처법</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 기본 응급 대처법 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기본 응급 대처법</Text>
          
          <View style={[styles.guideCard, styles.emergencyCard]}>
            <View style={styles.guideHeader}>
              <Icon name="emergency" size={24} color="#DC2626" />
              <Text style={[styles.guideTitle, styles.emergencyTitle]}>1. 119 신고</Text>
            </View>
            <Text style={styles.guideDescription}>응급 상황 발생 시 즉시 119에 신고하세요.</Text>
            <View style={styles.guideList}>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>정확한 위치 알리기</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>환자의 상태 설명하기</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>응급차 도착 전 대기하기</Text>
              </View>
            </View>
          </View>

          <View style={[styles.guideCard, styles.basicCard]}>
            <View style={styles.guideHeader}>
              <Icon name="medical-services" size={24} color="#2563EB" />
              <Text style={[styles.guideTitle, styles.basicTitle]}>2. 기본 응급 처치</Text>
            </View>
            <View style={styles.guideList}>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>환자의 의식 확인</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>호흡 상태 확인</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>출혈이 있는 경우 지혈</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>체온 유지</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 주요 응급 상황별 대처법 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>주요 응급 상황별 대처법</Text>
          
          {/* 심정지 */}
          <View style={styles.emergencyTypeCard}>
            <Text style={styles.emergencyTypeTitle}>1. 심정지</Text>
            <View style={styles.emergencyTypeContent}>
              <Text style={styles.emergencyTypeDescription}>
                심정지 발생 시 즉시 심폐소생술을 시작하세요.
              </Text>
              <View style={styles.orderedList}>
                <View style={styles.orderedItem}>
                  <Text style={styles.orderedNumber}>1.</Text>
                  <Text style={styles.orderedText}>환자의 의식 확인</Text>
                </View>
                <View style={styles.orderedItem}>
                  <Text style={styles.orderedNumber}>2.</Text>
                  <Text style={styles.orderedText}>호흡 확인</Text>
                </View>
                <View style={styles.orderedItem}>
                  <Text style={styles.orderedNumber}>3.</Text>
                  <Text style={styles.orderedText}>가슴 압박 30회 (분당 100-120회)</Text>
                </View>
                <View style={styles.orderedItem}>
                  <Text style={styles.orderedNumber}>4.</Text>
                  <Text style={styles.orderedText}>인공호흡 2회</Text>
                </View>
                <View style={styles.orderedItem}>
                  <Text style={styles.orderedNumber}>5.</Text>
                  <Text style={styles.orderedText}>반복 (30:2 비율)</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 대형 출혈 */}
          <View style={styles.emergencyTypeCard}>
            <Text style={styles.emergencyTypeTitle}>2. 대형 출혈</Text>
            <View style={styles.emergencyTypeContent}>
              <Text style={styles.emergencyTypeDescription}>
                출혈이 심한 경우 즉시 지혈하세요.
              </Text>
              <View style={styles.orderedList}>
                <View style={styles.orderedItem}>
                  <Text style={styles.orderedNumber}>1.</Text>
                  <Text style={styles.orderedText}>깨끗한 천으로 상처 부위 직접 압박</Text>
                </View>
                <View style={styles.orderedItem}>
                  <Text style={styles.orderedNumber}>2.</Text>
                  <Text style={styles.orderedText}>상처 부위를 심장보다 높게 올리기</Text>
                </View>
                <View style={styles.orderedItem}>
                  <Text style={styles.orderedNumber}>3.</Text>
                  <Text style={styles.orderedText}>지혈대 사용 (필요한 경우)</Text>
                </View>
                <View style={styles.orderedItem}>
                  <Text style={styles.orderedNumber}>4.</Text>
                  <Text style={styles.orderedText}>환자의 체온 유지</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 화상 */}
          <View style={styles.emergencyTypeCard}>
            <Text style={styles.emergencyTypeTitle}>3. 화상</Text>
            <View style={styles.emergencyTypeContent}>
              <Text style={styles.emergencyTypeDescription}>
                화상 발생 시 즉시 응급 처치를 하세요.
              </Text>
              <View style={styles.orderedList}>
                <View style={styles.orderedItem}>
                  <Text style={styles.orderedNumber}>1.</Text>
                  <Text style={styles.orderedText}>화상 부위를 흐르는 물에 10-20분간 담그기</Text>
                </View>
                <View style={styles.orderedItem}>
                  <Text style={styles.orderedNumber}>2.</Text>
                  <Text style={styles.orderedText}>화상 부위를 깨끗한 천으로 덮기</Text>
                </View>
                <View style={styles.orderedItem}>
                  <Text style={styles.orderedNumber}>3.</Text>
                  <Text style={styles.orderedText}>화상 부위를 심장보다 높게 올리기</Text>
                </View>
                <View style={styles.orderedItem}>
                  <Text style={styles.orderedNumber}>4.</Text>
                  <Text style={styles.orderedText}>환자의 체온 유지</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 중독 */}
          <View style={styles.emergencyTypeCard}>
            <Text style={styles.emergencyTypeTitle}>4. 중독</Text>
            <View style={styles.emergencyTypeContent}>
              <Text style={styles.emergencyTypeDescription}>
                중독 발생 시 즉시 응급 처치를 하세요.
              </Text>
              <View style={styles.orderedList}>
                <View style={styles.orderedItem}>
                  <Text style={styles.orderedNumber}>1.</Text>
                  <Text style={styles.orderedText}>중독 물질 확인</Text>
                </View>
                <View style={styles.orderedItem}>
                  <Text style={styles.orderedNumber}>2.</Text>
                  <Text style={styles.orderedText}>의식 확인</Text>
                </View>
                <View style={styles.orderedItem}>
                  <Text style={styles.orderedNumber}>3.</Text>
                  <Text style={styles.orderedText}>구토 유도 (의식이 있는 경우에만)</Text>
                </View>
                <View style={styles.orderedItem}>
                  <Text style={styles.orderedNumber}>4.</Text>
                  <Text style={styles.orderedText}>환자의 체온 유지</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 응급실 이용 안내 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>응급실 이용 안내</Text>
          
          <View style={[styles.guideCard, styles.warningCard]}>
            <View style={styles.guideHeader}>
              <Icon name="backpack" size={24} color="#D97706" />
              <Text style={[styles.guideTitle, styles.warningTitle]}>응급실 이용 시 준비물</Text>
            </View>
            <View style={styles.guideList}>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>신분증</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>의료보험증</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>현재 복용 중인 약 목록</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>알레르기 정보</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>기저질환 정보</Text>
              </View>
            </View>
          </View>

          <View style={[styles.guideCard, styles.successCard]}>
            <View style={styles.guideHeader}>
              <Icon name="warning" size={24} color="#059669" />
              <Text style={[styles.guideTitle, styles.successTitle]}>응급실 이용 시 주의사항</Text>
            </View>
            <View style={styles.guideList}>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>응급실은 진정한 응급 상황에서만 이용</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>환자의 상태 변화를 주의 깊게 관찰</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>의료진의 지시를 정확히 따르기</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>다른 환자의 프라이버시 존중</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 응급 상황 예방 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>응급 상황 예방</Text>
          
          <View style={[styles.guideCard, styles.preventionCard]}>
            <View style={styles.guideHeader}>
              <Icon name="health-and-safety" size={24} color="#7C3AED" />
              <Text style={[styles.guideTitle, styles.preventionTitle]}>일상적인 예방 수칙</Text>
            </View>
            <View style={styles.guideList}>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>정기적인 건강검진</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>응급 처치 교육 참여</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>응급 의료 정보 앱 설치</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>가정 내 응급 의료 키트 준비</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>응급 연락처 저장</Text>
              </View>
            </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#DC2626',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  basicCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  warningCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
    backgroundColor: '#FFFBEB',
  },
  successCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  preventionCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  emergencyTitle: {
    color: '#DC2626',
  },
  basicTitle: {
    color: '#2563EB',
  },
  warningTitle: {
    color: '#D97706',
  },
  successTitle: {
    color: '#059669',
  },
  preventionTitle: {
    color: '#7C3AED',
  },
  guideDescription: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 24,
  },
  guideList: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 2,
  },
  listText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  emergencyTypeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyTypeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  emergencyTypeContent: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  emergencyTypeDescription: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 24,
  },
  orderedList: {
    gap: 8,
  },
  orderedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  orderedNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    minWidth: 20,
  },
  orderedText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default EmergencyCarePage; 