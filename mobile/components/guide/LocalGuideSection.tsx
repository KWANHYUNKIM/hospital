import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// TypeScript 인터페이스 정의
interface LocalGuide {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  searchType: string;
}

interface LocalGuideSectionProps {
  onGuidePress?: (searchType: string, useCurrentLocation: boolean) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - 48) / 2; // 양쪽 여백 16*2 + 카드 간격 16

const LocalGuideSection: React.FC<LocalGuideSectionProps> = ({ onGuidePress }) => {
  const navigation = useNavigation();

  const localGuides: LocalGuide[] = [
    {
      id: 1,
      title: "내 주변 응급실",
      description: "가까운 응급실을 찾아보세요",
      icon: "🏥",
      color: "#EF4444",
      bgColor: "#FEE2E2",
      searchType: "emergency"
    },
    {
      id: 2,
      title: "내 주변 야간진료",
      description: "야간에 운영하는 병원을 찾아보세요",
      icon: "🌙",
      color: "#3B82F6",
      bgColor: "#DBEAFE",
      searchType: "night"
    },
    {
      id: 3,
      title: "내 주변 주말진료",
      description: "주말에 운영하는 병원을 찾아보세요",
      icon: "📅",
      color: "#10B981",
      bgColor: "#D1FAE5",
      searchType: "weekend"
    },
    {
      id: 4,
      title: "내 주변 요양병원",
      description: "가까운 요양병원을 찾아보세요",
      icon: "🏛️",
      color: "#8B5CF6",
      bgColor: "#EDE9FE",
      searchType: "nursing"
    }
  ];

  // 가이드 카드 클릭 핸들러
  const handleGuidePress = (guide: LocalGuide) => {
    if (onGuidePress) {
      onGuidePress(guide.searchType, true);
    } else {
      // 기본 네비게이션 처리
      console.log('Navigate to HospitalSearch:', guide.searchType);
      // navigation.navigate('HospitalSearch', {
      //   searchType: guide.searchType,
      //   useCurrentLocation: true,
      //   title: guide.title
      // });
    }
  };

  // 전체 의료시설 보기 핸들러
  const handleViewAllPress = () => {
    if (onGuidePress) {
      onGuidePress('all', true);
    } else {
      console.log('Navigate to HospitalSearch: all');
      // navigation.navigate('HospitalSearch', {
      //   useCurrentLocation: true,
      //   title: '내 주변 의료시설'
      // });
    }
  };

  // 가이드 카드 렌더링
  const renderGuideItem = ({ item }: { item: LocalGuide }) => (
    <TouchableOpacity
      style={[styles.guideCard, { backgroundColor: item.bgColor }]}
      onPress={() => handleGuidePress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardIcon}>{item.icon}</Text>
        <Text style={[styles.cardTitle, { color: item.color }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>내 주변 안내</Text>
        <Text style={styles.subtitle}>
          현재 위치 기반으로 가까운 의료 시설을 찾아보세요
        </Text>
      </View>

      {/* 가이드 그리드 */}
      <FlatList
        data={localGuides}
        renderItem={renderGuideItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.guideRow}
        style={styles.guideGrid}
        scrollEnabled={false}
      />

      {/* 더 보기 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={handleViewAllPress}
          activeOpacity={0.8}
        >
          <Text style={styles.viewAllButtonText}>
            더 많은 내 주변 의료시설 보기
          </Text>
        </TouchableOpacity>
      </View>

      {/* 위치 안내 */}
      <View style={styles.locationNotice}>
        <Text style={styles.locationNoticeIcon}>📍</Text>
        <Text style={styles.locationNoticeText}>
          정확한 검색을 위해 위치 권한을 허용해주세요
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 24,
    marginVertical: 16,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  guideGrid: {
    paddingHorizontal: 16,
  },
  guideRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  guideCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  cardDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  viewAllButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  viewAllButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  locationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
  },
  locationNoticeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  locationNoticeText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    flex: 1,
  },
});

export default LocalGuideSection; 