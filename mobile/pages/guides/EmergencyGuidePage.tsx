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

const EmergencyGuidePage: React.FC = () => {
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
        <Text style={styles.headerTitle}>응급실 이용 가이드</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={styles.mainTitle}>응급실 이용 가이드</Text>
          
          {/* 응급실 이용이 필요한 경우 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>응급실 이용이 필요한 경우</Text>
            <View style={styles.listContainer}>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>심한 통증이나 급성 질환</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>중상이나 심각한 부상</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>의식이 없는 경우</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>호흡이 곤란한 경우</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>심한 출혈이 있는 경우</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>중독이나 과다 복용</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>뇌졸중이나 심장마비 의심</Text>
              </View>
            </View>
          </View>

          {/* 준비물 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>준비물</Text>
            <View style={styles.listContainer}>
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
                <Text style={styles.listText}>과거 병력 기록</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>현금 또는 카드</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>간단한 간식과 음료수</Text>
              </View>
            </View>
          </View>

          {/* 응급실 이용 절차 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>응급실 이용 절차</Text>
            <View style={styles.orderedList}>
              <View style={styles.orderedItem}>
                <Text style={styles.orderedNumber}>1.</Text>
                <Text style={styles.orderedText}>119에 전화하여 응급 상황 신고</Text>
              </View>
              <View style={styles.orderedItem}>
                <Text style={styles.orderedNumber}>2.</Text>
                <Text style={styles.orderedText}>가능한 경우 가까운 응급실로 직접 내원</Text>
              </View>
              <View style={styles.orderedItem}>
                <Text style={styles.orderedNumber}>3.</Text>
                <Text style={styles.orderedText}>응급실 접수 및 초기 진료</Text>
              </View>
              <View style={styles.orderedItem}>
                <Text style={styles.orderedNumber}>4.</Text>
                <Text style={styles.orderedText}>필요한 검사 및 치료 진행</Text>
              </View>
              <View style={styles.orderedItem}>
                <Text style={styles.orderedNumber}>5.</Text>
                <Text style={styles.orderedText}>입원 또는 퇴원 결정</Text>
              </View>
            </View>
          </View>

          {/* 주의사항 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>주의사항</Text>
            <View style={styles.listContainer}>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>응급실은 진료 순서가 아닌 응급도에 따라 진료 순서가 결정됩니다</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>가능한 한 보호자가 동행하세요</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>증상과 병력을 미리 정리해두세요</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>필요한 경우 다음 날 평일 진료 예약을 하세요</Text>
              </View>
            </View>
          </View>

          {/* 응급실 비용 안내 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>응급실 비용 안내</Text>
            <View style={styles.costInfoContainer}>
              <View style={styles.costInfoItem}>
                <Text style={styles.costInfoBullet}>•</Text>
                <Text style={styles.costInfoText}>응급실 진료는 일반 진료보다 비용이 높을 수 있습니다</Text>
              </View>
              <View style={styles.costInfoItem}>
                <Text style={styles.costInfoBullet}>•</Text>
                <Text style={styles.costInfoText}>의료보험 적용이 가능합니다</Text>
              </View>
              <View style={styles.costInfoItem}>
                <Text style={styles.costInfoBullet}>•</Text>
                <Text style={styles.costInfoText}>입원이 필요한 경우 추가 비용이 발생할 수 있습니다</Text>
              </View>
            </View>
          </View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </View>
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
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  listContainer: {
    paddingLeft: 16,
    gap: 12,
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
    fontWeight: '600',
  },
  listText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    lineHeight: 24,
  },
  orderedList: {
    paddingLeft: 16,
    gap: 12,
  },
  orderedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  orderedNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    minWidth: 20,
  },
  orderedText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    lineHeight: 24,
  },
  costInfoContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  costInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  costInfoBullet: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '600',
  },
  costInfoText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default EmergencyGuidePage; 