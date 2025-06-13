import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NewsCategory from './NewsCategory';
import NewsList from './NewsList';
import RecommendedChannels from './RecommendedChannels';
import RecommendedVideos from './RecommendedVideos';

// 타입 정의
interface User {
  id: number;
  role?: string;
}

const NewsPage: React.FC = () => {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // 임시 사용자 정보 (실제로는 Auth Context에서 가져와야 함)
  const user: User | null = null; // useAuth hook으로 대체
  const isLoggedIn = !!user;
  const userRole = user?.role;

  const handleCreateNews = () => {
    navigation.navigate('AdminNewsCreate' as never);
  };

  const handleManageCategories = () => {
    navigation.navigate('AdminNewsCategories' as never);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const isAdmin = isLoggedIn && userRole === 'ADMIN';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 섹션 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>뉴스</Text>
          
          {isAdmin && (
            <View style={styles.adminActions}>
              <TouchableOpacity
                style={styles.categoryManageButton}
                onPress={handleManageCategories}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryManageButtonText}>
                  카테고리 관리
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.createNewsButton}
                onPress={handleCreateNews}
                activeOpacity={0.7}
              >
                <Text style={styles.createNewsButtonText}>
                  뉴스 작성
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 카테고리 바 */}
        <NewsCategory
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />

        {/* 메인 콘텐츠 */}
        <View style={styles.mainContent}>
          {/* 뉴스 목록 섹션 */}
          <View style={styles.newsSection}>
            <NewsList selectedCategory={selectedCategory} />
          </View>

          {/* 추천 영상 섹션 */}
          <View style={styles.videosSection}>
            <RecommendedVideos />
          </View>

          {/* 추천 채널 섹션 */}
          <View style={styles.channelsSection}>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  adminActions: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryManageButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  categoryManageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  createNewsButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createNewsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
  },
  newsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  videosSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  channelsSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default NewsPage; 