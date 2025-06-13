import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 타입 정의
interface News {
  id: number;
  title: string;
  summary?: string;
  category_name?: string;
  created_at?: string;
  view_count?: number;
  representative_image_url?: string;
  media?: Array<{
    media_type: 'image' | 'video';
    file_path: string;
  }>;
}

interface NewsResponse {
  content: News[];
  totalPages: number;
}

interface HealingNewsFrameProps {
  category?: string | null;
}

const HealingNewsFrame: React.FC<HealingNewsFrameProps> = ({
  category = null,
}) => {
  const navigation = useNavigation();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNews();
  }, [currentPage, category]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      
      // Mock API 호출 (실제로는 getNewsList 호출)
      const response = await mockGetNewsList(currentPage, 6, category);
      
      const newsData = response.content || [];
      const totalPagesData = response.totalPages || 1;
      
      setNews(newsData);
      setTotalPages(totalPagesData);
      setLoading(false);
    } catch (err: any) {
      setError('뉴스를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  // Mock API 함수
  const mockGetNewsList = async (
    page: number,
    size: number,
    category?: string | null
  ): Promise<NewsResponse> => {
    return {
      content: [
        {
          id: 1,
          title: '건강한 겨울나기 방법',
          summary: '추운 겨울을 건강하게 보내는 방법을 알아봅시다.',
          category_name: '건강',
          created_at: new Date().toISOString(),
          view_count: 150,
          representative_image_url: 'https://placehold.co/400x200/3b82f6/ffffff?text=News+1',
          media: [
            {
              media_type: 'image',
              file_path: 'https://placehold.co/400x200/3b82f6/ffffff?text=News+1',
            },
          ],
        },
        {
          id: 2,
          title: '독감 예방 수칙',
          summary: '독감 시즌에 꼭 알아야 할 예방 수칙입니다.',
          category_name: '예방',
          created_at: new Date().toISOString(),
          view_count: 89,
          representative_image_url: 'https://placehold.co/400x200/10b981/ffffff?text=News+2',
          media: [
            {
              media_type: 'image',
              file_path: 'https://placehold.co/400x200/10b981/ffffff?text=News+2',
            },
          ],
        },
      ],
      totalPages: 1,
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

  const handleNewsPress = (id: number) => {
    navigation.navigate('NewsDetail' as never, { id: id.toString() } as never);
  };

  const renderNewsItem = ({ item }: { item: News }) => {
    const imageUrl = 
      item.representative_image_url ||
      (item.media && item.media.length > 0 && item.media[0].media_type === 'image' 
        ? item.media[0].file_path 
        : null);

    return (
      <TouchableOpacity
        style={styles.newsCard}
        onPress={() => handleNewsPress(item.id)}
        activeOpacity={0.7}
      >
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.newsImage}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.newsContent}>
          <Text style={styles.newsTitle} numberOfLines={2}>
            {item.title}
          </Text>
          
          {item.summary && (
            <Text style={styles.newsSummary} numberOfLines={2}>
              {item.summary}
            </Text>
          )}
          
          <View style={styles.newsFooter}>
            <Text style={styles.newsDate}>
              {item.created_at ? new Date(item.created_at).toLocaleDateString('ko-KR') : ''}
            </Text>
            <Text style={styles.newsViewCount}>
              조회수: {item.view_count || 0}
            </Text>
          </View>
        </View>

        {/* 관리자 액션 버튼들 (임시로 비활성화) */}
        {false && (
          <View style={styles.adminActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEdit(item.id)}
            >
              <Text style={styles.actionButtonText}>수정</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.actionButtonText}>삭제</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>로딩중...</Text>
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

  if (!news || news.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>표시할 뉴스가 없습니다.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={news}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderNewsItem}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.newsGrid}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      columnWrapperStyle={styles.row}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  newsGrid: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  separator: {
    height: 16,
  },
  newsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3F4F6',
  },
  newsContent: {
    padding: 12,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 20,
    marginBottom: 8,
  },
  newsSummary: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 8,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsDate: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  newsViewCount: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  adminActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
});

export default HealingNewsFrame; 