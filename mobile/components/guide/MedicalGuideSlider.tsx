import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// TypeScript 인터페이스 정의
interface MedicalGuide {
  id: number;
  title: string;
  content: string;
  image: string;
  link: string;
  icon: string;
}

interface MedicalGuideSliderProps {
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth - 80;

const MedicalGuideSlider: React.FC<MedicalGuideSliderProps> = ({ 
  autoPlay = true,
  autoPlayInterval = 5000 
}) => {
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);

  const medicalGuides: MedicalGuide[] = [
    {
      id: 1,
      title: "응급실 이용 가이드",
      content: "응급실은 생명이 위급한 상황에서만 이용해야 합니다. 응급실 이용 시 준비물과 절차를 알아보세요.",
      image: "/images/emergency-guide.jpg",
      link: "/guides/emergency",
      icon: "🚑"
    },
    {
      id: 2,
      title: "야간진료 찾는 방법",
      content: "야간에 갑자기 아플 때! 야간진료 병원 찾는 방법과 주의사항을 알려드립니다.",
      image: "/images/night-care.jpg",
      link: "/guides/night-care",
      icon: "🌙"
    },
    {
      id: 3,
      title: "주말진료 병원 찾기",
      content: "주말에도 진료하는 병원을 쉽게 찾을 수 있습니다. 주말진료 병원 찾는 방법을 알아보세요.",
      image: "/images/weekend-care.jpg",
      link: "/guides/weekend-care",
      icon: "📅"
    },
    {
      id: 4,
      title: "응급상황 대처법",
      content: "갑작스러운 응급상황 발생 시 대처 방법과 응급실 이용 시기, 준비물을 알아보세요.",
      image: "/images/emergency-care.jpg",
      link: "/guides/emergency-care",
      icon: "⚡"
    }
  ];

  // 가이드 카드 클릭 핸들러
  const handleGuidePress = (guide: MedicalGuide) => {
    // 네비게이션 라우트명을 적절히 수정하세요
    console.log('Guide pressed:', guide.title);
    // navigation.navigate('GuideDetail', { 
    //   guideId: guide.id,
    //   guideType: guide.link.replace('/guides/', ''),
    //   title: guide.title 
    // });
  };

  // 가이드 카드 렌더링
  const renderGuideItem = ({ item }: { item: MedicalGuide }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleGuidePress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>{item.icon}</Text>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
        </View>

        <Text style={styles.cardDescription} numberOfLines={3}>
          {item.content}
        </Text>

        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>자세히 보기</Text>
            <Text style={styles.readMoreIcon}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 이미지 플레이스홀더 */}
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderIcon}>{item.icon}</Text>
          <Text style={styles.imagePlaceholderText}>의료 가이드</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>의료 가이드</Text>
        <Text style={styles.subtitle}>필수 의료 정보를 확인하세요</Text>
      </View>

      {/* 슬라이더 */}
      <FlatList
        ref={flatListRef}
        data={medicalGuides}
        renderItem={renderGuideItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        contentContainerStyle={styles.sliderContent}
        style={styles.slider}
      />

      {/* 페이지 인디케이터 */}
      <View style={styles.indicators}>
        {medicalGuides.map((_, index) => (
          <View key={index} style={styles.indicator} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  slider: {
    paddingVertical: 8,
  },
  sliderContent: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: CARD_WIDTH,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
    flex: 1,
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  readMoreText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
    marginRight: 4,
  },
  readMoreIcon: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  imageContainer: {
    height: 120,
    backgroundColor: '#F9FAFB',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  imagePlaceholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
});

export default MedicalGuideSlider; 