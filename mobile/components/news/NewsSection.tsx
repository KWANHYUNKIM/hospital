import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HealingNewsFrame from './HealingNewsFrame';
import RecommendedChannels from './RecommendedChannels';
import RecommendedVideos from './RecommendedVideos';

// 타입 정의
interface Category {
  id: string | number;
  name: string;
}

const NewsSection: React.FC = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Mock API 호출 (실제로는 getNewsCategories 호출)
      const response = await mockGetNewsCategories();
      
      const categoriesData = Array.isArray(response) ? response : [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('카테고리 로딩 실패:', error);
    }
  };

  // Mock API 함수
  const mockGetNewsCategories = async (): Promise<Category[]> => {
    return [
      { id: 1, name: '건강' },
      { id: 2, name: '의료' },
      { id: 3, name: '생활' },
      { id: 4, name: '복지' },
      { id: 5, name: '정책' },
    ];
  };

  const handleCreateNews = () => {
    navigation.navigate('AdminNews' as never);
  };

  const handleCategoryPress = (categoryId: string | number) => {
    setSelectedCategory(categoryId.toString());
  };

  const renderCategoryButton = (category: Category) => {
    const isActive = selectedCategory === category.id.toString();
    
    return (
      <TouchableOpacity
        key={category.id.toString()}
        style={[
          styles.categoryButton,
          isActive && styles.categoryButtonActive,
        ]}
        onPress={() => handleCategoryPress(category.id)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.categoryButtonText,
            isActive && styles.categoryButtonTextActive,
          ]}
        >
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 섹션 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>뉴스 섹션</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateNews}
            activeOpacity={0.7}
          >
            <Text style={styles.createButtonText}>새 소식 작성</Text>
          </TouchableOpacity>
        </View>

        {/* 카테고리 필터 */}
        <View style={styles.categorySection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === 'all' && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory('all')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === 'all' && styles.categoryButtonTextActive,
                ]}
              >
                전체
              </Text>
            </TouchableOpacity>
            
            {categories.map(renderCategoryButton)}
          </ScrollView>
        </View>

        {/* 메인 콘텐츠 영역 */}
        <View style={styles.mainContent}>
          {/* 뉴스 카드 리스트 */}
          <View style={styles.newsSection}>
            <HealingNewsFrame 
              category={selectedCategory !== 'all' ? selectedCategory : null}
            />
          </View>
          
          {/* 추천 영상 섹션 */}
          <View style={styles.videoSection}>
            <RecommendedVideos />
          </View>

          {/* 추천 채널 섹션 */}
          <View style={styles.channelSection}>
            <RecommendedChannels />
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  createButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  categorySection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#3B82F6',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  newsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  videoSection: {
    marginBottom: 16,
  },
  channelSection: {
    marginBottom: 16,
  },
});

export default NewsSection; 