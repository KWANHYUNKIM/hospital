import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 타입 정의
interface News {
  id: number;
  title: string;
  summary?: string;
  category_name?: string;
  category_id?: number;
  created_at?: string;
  view_count?: number;
  representative_image_url?: string;
  content?: string;
  author_id?: number;
}

interface NewsResponse {
  content: News[];
  totalPages: number;
  currentPage: number;
  totalElements: number;
}

interface Category {
  id: string | number;
  name: string;
}

const { width: screenWidth } = Dimensions.get('window');
const DEFAULT_THUMBNAIL = 'https://placehold.co/150x150/e2e8f0/64748b?text=No+Image';

const NewsList: React.FC = () => {
  const navigation = useNavigation();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories] = useState<Category[]>([
    { id: 'all', name: '전체' },
    { id: 1, name: '건강' },
    { id: 2, name: '의료' },
    { id: 3, name: '생활' },
  ]);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock API 호출 (실제로는 getNewsList 호출)
      const response = await mockGetNewsList(currentPage, 6, selectedCategory);
      
      setNews(response.content || []);
      setTotalPages(response.totalPages || 1);
      setLoading(false);
    } catch (err: any) {
      setError('뉴스를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  }, [currentPage, selectedCategory]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Mock API 함수
  const mockGetNewsList = async (
    page: number,
    size: number,
    category?: string | null
  ): Promise<NewsResponse> => {
    // 실제 API 호출로 대체해야 함
    const mockNews: News[] = [
      {
        id: 1,
        title: '코로나19 백신 접종 안내',
        summary: '코로나19 백신 접종에 대한 최신 안내사항입니다.',
        category_name: '건강',
        category_id: 1,
        created_at: new Date().toISOString(),
        view_count: 1500,
        representative_image_url: 'https://placehold.co/300x200/3b82f6/ffffff?text=News+1',
        author_id: 1,
      },
      {
        id: 2,
        title: '겨울철 건강관리 방법',
        summary: '추운 겨울철 건강을 지키는 효과적인 방법들을 소개합니다.',
        category_name: '건강',
        category_id: 1,
        created_at: new Date().toISOString(),
        view_count: 1200,
        representative_image_url: 'https://placehold.co/300x200/10b981/ffffff?text=News+2',
        author_id: 1,
      },
      {
        id: 3,
        title: '의료진 감사 인사',
        summary: '코로나19 대응에 힘쓴 의료진들께 감사의 인사를 전합니다.',
        category_name: '의료',
        category_id: 2,
        created_at: new Date().toISOString(),
        view_count: 800,
        representative_image_url: 'https://placehold.co/300x200/f59e0b/ffffff?text=News+3',
        author_id: 1,
      },
    ];

    return {
      content: mockNews,
      totalPages: 1,
      currentPage: page,
      totalElements: mockNews.length,
    };
  };

  const handleEdit = (id: number) => {
    navigation.navigate('NewsEdit' as never, { id: id.toString() } as never);
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      '뉴스 삭제',
      '정말로 이 뉴스를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              // await deleteNews(id);
              fetchNews();
            } catch (err) {
              Alert.alert('오류', '뉴스 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleNewsPress = (newsId: number) => {
    navigation.navigate('NewsDetail' as never, { id: newsId.toString() } as never);
  };

  const handleCategoryPress = (categoryId: string | number) => {
    setSelectedCategory(categoryId === 'all' ? null : categoryId.toString());
    setCurrentPage(1);
  };

  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const isActive = 
            (selectedCategory === null && item.id === 'all') ||
            (selectedCategory === item.id.toString());
          
          return (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                isActive && styles.categoryButtonActive,
              ]}
              onPress={() => handleCategoryPress(item.id)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  isActive && styles.categoryButtonTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  const renderNewsItem = ({ item, index }: { item: News; index: number }) => {
    const thumbnailUrl = item.representative_image_url || DEFAULT_THUMBNAIL;
    
    return (
      <TouchableOpacity
        style={styles.newsItem}
        onPress={() => handleNewsPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.newsContent}>
          {/* 순위 및 카테고리 */}
          <View style={styles.newsHeader}>
            <Text style={[
              styles.rankText,
              index === 0 && styles.rank1,
              index === 1 && styles.rank2,
              index === 2 && styles.rank3,
            ]}>
              {index + 1}
            </Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {item.category_name || '전체'}
              </Text>
            </View>
          </View>

          {/* 제목 */}
          <Text style={styles.newsTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* 요약 */}
          {item.summary && (
            <Text style={styles.newsSummary} numberOfLines={1}>
              {item.summary}
            </Text>
          )}

          {/* 메타 정보 */}
          <View style={styles.newsMetaInfo}>
            <Text style={styles.newsDate}>
              {item.created_at
                ? new Date(item.created_at).toLocaleDateString('ko-KR')
                : ''}
            </Text>
            <Text style={styles.newsViewCount}>
              조회수 {item.view_count || 0}
            </Text>
          </View>
        </View>

        {/* 썸네일 */}
        <Image
          source={{ uri: thumbnailUrl }}
          style={styles.newsThumbnail}
          onError={() => {
            console.log('썸네일 로드 실패:', thumbnailUrl);
          }}
        />
      </TouchableOpacity>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <TouchableOpacity
            key={page}
            style={[
              styles.paginationButton,
              currentPage === page && styles.paginationButtonActive,
            ]}
            onPress={() => setCurrentPage(page)}
          >
            <Text
              style={[
                styles.paginationButtonText,
                currentPage === page && styles.paginationButtonTextActive,
              ]}
            >
              {page}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>뉴스를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchNews}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 카테고리 필터 */}
      {renderCategoryFilter()}

      {/* 뉴스 목록 */}
      <FlatList
        data={news.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNewsItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.newsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>표시할 뉴스가 없습니다.</Text>
          </View>
        }
      />

      {/* 페이지네이션 */}
      {renderPagination()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  categoryContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
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
  newsList: {
    paddingHorizontal: 16,
  },
  newsItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  newsContent: {
    flex: 1,
    marginRight: 16,
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginRight: 8,
    minWidth: 24,
  },
  rank1: {
    color: '#EF4444',
  },
  rank2: {
    color: '#F97316',
  },
  rank3: {
    color: '#EAB308',
  },
  categoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '500',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 22,
    marginBottom: 4,
  },
  newsSummary: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  newsMetaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  newsViewCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  newsThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  paginationButtonActive: {
    backgroundColor: '#3B82F6',
  },
  paginationButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  paginationButtonTextActive: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default NewsList; 