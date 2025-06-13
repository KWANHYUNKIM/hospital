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

const NightCareGuidePage: React.FC = () => {
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
        <Text style={styles.headerTitle}>야간진료 이용 가이드</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={styles.mainTitle}>야간진료 이용 가이드</Text>
          
          {/* 야간진료란? */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>야간진료란?</Text>
            <Text style={styles.description}>
              야간진료는 저녁 시간대(보통 18:00~23:00)에 운영되는 의료 서비스입니다. 
              평일에는 바빠서 병원에 갈 수 없는 직장인이나 학생들을 위해 마련된 제도입니다.
            </Text>
          </View>

          {/* 야간진료 이용이 필요한 경우 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>야간진료 이용이 필요한 경우</Text>
            <View style={styles.listContainer}>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>급성 통증이나 불편감이 있는 경우</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>만성 질환의 급성 악화</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>처방전 발급이나 약 처방이 필요한 경우</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>간단한 상담이나 진료가 필요한 경우</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>예방접종이나 건강검진이 필요한 경우</Text>
              </View>
            </View>
          </View>

          {/* 야간진료 찾는 방법 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>야간진료 찾는 방법</Text>
            <View style={styles.orderedList}>
              <View style={styles.orderedItem}>
                <Text style={styles.orderedNumber}>1.</Text>
                <Text style={styles.orderedText}>삐뽀삐뽀119 앱/웹사이트에서 '야간진료' 필터 선택</Text>
              </View>
              <View style={styles.orderedItem}>
                <Text style={styles.orderedNumber}>2.</Text>
                <Text style={styles.orderedText}>현재 위치 기반으로 가까운 야간진료 병원 검색</Text>
              </View>
              <View style={styles.orderedItem}>
                <Text style={styles.orderedNumber}>3.</Text>
                <Text style={styles.orderedText}>운영 시간과 진료과목 확인</Text>
              </View>
              <View style={styles.orderedItem}>
                <Text style={styles.orderedNumber}>4.</Text>
                <Text style={styles.orderedText}>전화로 예약 가능 여부 확인</Text>
              </View>
              <View style={styles.orderedItem}>
                <Text style={styles.orderedNumber}>5.</Text>
                <Text style={styles.orderedText}>필요한 경우 미리 예약 진행</Text>
              </View>
            </View>
          </View>

          {/* 야간진료 이용 시 준비물 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>야간진료 이용 시 준비물</Text>
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

          {/* 야간진료 이용 시 주의사항 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>야간진료 이용 시 주의사항</Text>
            <View style={styles.listContainer}>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>운영 시간이 제한적이므로 미리 확인하세요</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>진료과목이 제한적일 수 있으니 확인이 필요합니다</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>예약이 필요한 경우가 있으니 미리 확인하세요</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>증상이 심각한 경우 응급실을 이용하세요</Text>
              </View>
              <View style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>의료진의 지시사항을 정확히 따라주세요</Text>
              </View>
            </View>
          </View>

          {/* 야간진료 비용 안내 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>야간진료 비용 안내</Text>
            <View style={styles.costInfoContainer}>
              <View style={styles.costInfoItem}>
                <Text style={styles.costInfoBullet}>•</Text>
                <Text style={styles.costInfoText}>야간진료는 평일 진료와 동일한 비용이 적용됩니다</Text>
              </View>
              <View style={styles.costInfoItem}>
                <Text style={styles.costInfoBullet}>•</Text>
                <Text style={styles.costInfoText}>의료보험 적용이 가능합니다</Text>
              </View>
              <View style={styles.costInfoItem}>
                <Text style={styles.costInfoBullet}>•</Text>
                <Text style={styles.costInfoText}>일부 특수 진료의 경우 추가 비용이 발생할 수 있습니다</Text>
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
    backgroundColor: '#1E3A8A',
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
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
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
    color: '#1E3A8A',
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

export default NightCareGuidePage; 