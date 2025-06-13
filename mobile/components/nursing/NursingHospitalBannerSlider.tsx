import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 타입 정의
interface Banner {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
}

const { width: screenWidth } = Dimensions.get('window');

const NursingHospitalBannerSlider: React.FC = () => {
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList<Banner>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners] = useState<Banner[]>([
    {
      id: 1,
      title: "요양병원 찾기",
      description: "전문적인 요양 서비스를 제공하는 요양병원을 찾아보세요",
      image: "https://placehold.co/400x200/3b82f6/ffffff?text=Nursing+Care",
      link: "NursingHospitals"
    },
    {
      id: 2,
      title: "장기요양 시설",
      description: "장기요양 시설에 대한 상세 정보를 확인하세요",
      image: "https://placehold.co/400x200/10b981/ffffff?text=Long+Term+Care",
      link: "NursingHospitals"
    },
    {
      id: 3,
      title: "요양 서비스 안내",
      description: "요양 서비스 이용 방법과 절차를 알아보세요",
      image: "https://placehold.co/400x200/f59e0b/ffffff?text=Care+Service",
      link: "NursingHospitals"
    }
  ]);

  // 자동 슬라이드를 위한 useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex === banners.length - 1 ? 0 : prevIndex + 1;
        if (flatListRef.current) {
          flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
        }
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const handleBannerPress = (link: string) => {
    navigation.navigate(link as never);
  };

  const handlePaginationPress = (index: number) => {
    setCurrentIndex(index);
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
  };

  const renderBannerItem = ({ item }: { item: Banner }) => (
    <TouchableOpacity
      style={styles.bannerContainer}
      onPress={() => handleBannerPress(item.link)}
      activeOpacity={0.8}
    >
      <View style={styles.bannerContent}>
        <Image
          source={{ uri: item.image }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
        <View style={styles.textContainer}>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <Text style={styles.bannerDescription}>{item.description}</Text>
          <View style={styles.buttonContainer}>
            <Text style={styles.buttonText}>자세히 보기</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPaginationDots = () => (
    <View style={styles.paginationContainer}>
      {banners.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.paginationDot,
            index === currentIndex && styles.paginationDotActive,
          ]}
          onPress={() => handlePaginationPress(index)}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>요양병원 안내</Text>
      
      <View style={styles.sliderContainer}>
        <FlatList
          ref={flatListRef}
          data={banners}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBannerItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const slideIndex = Math.round(
              event.nativeEvent.contentOffset.x / screenWidth
            );
            setCurrentIndex(slideIndex);
          }}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
        />
        
        {renderPaginationDots()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sliderContainer: {
    position: 'relative',
  },
  bannerContainer: {
    width: screenWidth,
    paddingHorizontal: 16,
  },
  bannerContent: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  textContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  bannerDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  buttonContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  paginationDotActive: {
    backgroundColor: '#3B82F6',
    width: 24,
  },
});

export default NursingHospitalBannerSlider; 