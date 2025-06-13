import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// 웹에서 사용했던 컴포넌트들을 모바일용으로 대체하는 임시 컴포넌트들
// 실제 개발에서는 각각을 별도로 구현해야 합니다.

const { width, height } = Dimensions.get('window');

// 타입 정의
interface AppFeature {
  id: number;
  title: string;
  description: string;
  iconName: string;
  color: string;
}

// 모바일용 AutoComplete 컴포넌트 (임시)
const MobileAutoComplete: React.FC<{ searchQuery: string; setSearchQuery: (query: string) => void }> = ({ 
  searchQuery, 
  setSearchQuery 
}) => {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchBox}>
        <Icon name="search" size={20} color="#9CA3AF" />
        <Text style={styles.searchPlaceholder}>병원명, 진료과목을 검색하세요</Text>
      </View>
    </View>
  );
};

// 앱 기능 소개 섹션
const AppFeaturesSection: React.FC = () => {
  const features: AppFeature[] = [
    {
      id: 1,
      title: '병원 찾기',
      description: '현재 위치 기반으로 가까운 병원을 찾아보세요',
      iconName: 'local-hospital',
      color: '#3B82F6'
    },
    {
      id: 2,
      title: '응급실 현황',
      description: '실시간 응급실 현황을 확인하세요',
      iconName: 'emergency',
      color: '#EF4444'
    },
    {
      id: 3,
      title: '약국 찾기',
      description: '24시간 운영 약국을 쉽게 찾아보세요',
      iconName: 'medical-services',
      color: '#10B981'
    },
    {
      id: 4,
      title: '의료 정보',
      description: '유용한 의료 정보와 건강 가이드',
      iconName: 'info',
      color: '#8B5CF6'
    }
  ];

  return (
    <View style={styles.featuresSection}>
      <Text style={styles.featuresSectionTitle}>주요 기능</Text>
      <View style={styles.featuresGrid}>
        {features.map((feature) => (
          <View key={feature.id} style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
              <Icon name={feature.iconName} size={24} color={feature.color} />
            </View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// 다운로드 섹션 (모바일용으로 단순화)
const MobileDownloadSection: React.FC = () => {
  return (
    <View style={styles.downloadSection}>
      <Icon name="smartphone" size={48} color="#3B82F6" />
      <Text style={styles.downloadTitle}>삐뽀삐뽀119 앱</Text>
      <Text style={styles.downloadDescription}>
        더 편리한 병원 찾기를 위해 모바일 앱을 이용해보세요
      </Text>
      <View style={styles.downloadButtons}>
        <View style={styles.downloadButton}>
          <Icon name="phone-android" size={20} color="#FFFFFF" />
          <Text style={styles.downloadButtonText}>Android</Text>
        </View>
        <View style={styles.downloadButton}>
          <Icon name="phone-iphone" size={20} color="#FFFFFF" />
          <Text style={styles.downloadButtonText}>iOS</Text>
        </View>
      </View>
    </View>
  );
};

// 의료 가이드 섹션 (단순화된 버전)
const MobileMedicalGuideSection: React.FC = () => {
  const guides = [
    {
      id: 1,
      title: '응급상황 대처법',
      description: '응급상황 발생 시 올바른 대처 방법을 알아보세요',
      color: '#EF4444'
    },
    {
      id: 2,
      title: '건강검진 가이드',
      description: '연령별 필수 건강검진 항목을 확인하세요',
      color: '#10B981'
    },
    {
      id: 3,
      title: '예방접종 일정',
      description: '성인 및 아동 예방접종 일정을 확인하세요',
      color: '#F59E0B'
    }
  ];

  return (
    <View style={styles.guideSection}>
      <Text style={styles.guideSectionTitle}>의료 가이드</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.guideScrollView}>
        {guides.map((guide) => (
          <View key={guide.id} style={[styles.guideCard, { borderTopColor: guide.color }]}>
            <Text style={styles.guideTitle}>{guide.title}</Text>
            <Text style={styles.guideDescription}>{guide.description}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const MainPage: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState<string>('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 헤더 섹션 */}
        <View style={styles.headerSection}>
          <ImageBackground
            source={require('../../assets/main-bg.jpg')} // 배경 이미지 (실제 파일이 있다고 가정)
            style={styles.headerBackground}
            imageStyle={styles.headerBackgroundImage}
          >
            <View style={styles.headerOverlay}>
              <View style={styles.headerContent}>
                <Text style={styles.appTitle}>삐뽀삐뽀119</Text>
                <Text style={styles.appSubtitle}>
                  당신의 근처에서 운영 중인 병원을 쉽게 찾아보세요
                </Text>
                
                {/* 검색 섹션 */}
                <MobileAutoComplete 
                  searchQuery={searchQuery} 
                  setSearchQuery={setSearchQuery} 
                />
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* 메인 컨텐츠 */}
        <View style={styles.mainContent}>
          {/* 앱 기능 소개 */}
          <AppFeaturesSection />

          {/* 다운로드 섹션 */}
          <MobileDownloadSection />

          {/* 의료 가이드 섹션 */}
          <MobileMedicalGuideSection />

          {/* 요양병원 정보 섹션 */}
          <View style={styles.nursingSection}>
            <Text style={styles.nursingSectionTitle}>요양병원 정보</Text>
            <Text style={styles.nursingSectionDescription}>
              전국 요양병원 정보와 리뷰를 확인하고, 필요한 정보를 얻어보세요.
            </Text>
            <View style={styles.nursingCard}>
              <Icon name="elderly" size={32} color="#8B5CF6" />
              <Text style={styles.nursingCardTitle}>요양병원 찾기</Text>
              <Text style={styles.nursingCardDescription}>
                지역별 요양병원 검색 및 상세 정보
              </Text>
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
  scrollView: {
    flex: 1,
  },
  headerSection: {
    height: height * 0.4,
    minHeight: 300,
  },
  headerBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  headerBackgroundImage: {
    opacity: 0.7,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 18,
    color: '#E5F3FF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  searchContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
    flex: 1,
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featuresSectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  downloadSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  downloadTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  downloadDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  downloadButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  guideSection: {
    marginBottom: 32,
  },
  guideSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  guideScrollView: {
    paddingLeft: 0,
  },
  guideCard: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  guideDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  nursingSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nursingSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  nursingSectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  nursingCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  nursingCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  nursingCardDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default MainPage; 