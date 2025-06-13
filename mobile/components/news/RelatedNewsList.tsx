import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 타입 정의
interface RelatedNews {
  id: number;
  title: string;
  image_url?: string;
  created_at?: string;
}

interface RelatedNewsListProps {
  categoryId: number;
  excludeId: number;
}

const RelatedNewsList: React.FC<RelatedNewsListProps> = ({
  categoryId,
  excludeId,
}) => {
  const navigation = useNavigation();
  const [relatedNews, setRelatedNews] = useState<RelatedNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (categoryId) {
      fetchRelated();
    }
  }, [categoryId, excludeId]);

  const fetchRelated = async () => {
    try {
      setLoading(true);
      
      // Mock API 호출 (실제로는 getRelatedNews 호출)
      const data = await mockGetRelatedNews(categoryId, excludeId, 3);
      
      setRelatedNews(data);
      setLoading(false);
    } catch (err: any) {
      setError('관련 기사 불러오기 실패');
      setLoading(false);
    }
  };

  // Mock API 함수
  const mockGetRelatedNews = async (
    categoryId: number,
    excludeId: number,
    limit: number
  ): Promise<RelatedNews[]> => {
    // 실제 API 호출로 대체해야 함
    return [
      {
        id: excludeId + 1,
        title: '비슷한 주제의 건강 정보',
        image_url: 'https://placehold.co/300x200/3b82f6/ffffff?text=Related+1',
        created_at: new Date().toISOString(),
      },
      {
        id: excludeId + 2,
        title: '관련된 의료 뉴스',
        image_url: 'https://placehold.co/300x200/10b981/ffffff?text=Related+2',
        created_at: new Date().toISOString(),
      },
      {
        id: excludeId + 3,
        title: '추가 참고 자료',
        image_url: 'https://placehold.co/300x200/f59e0b/ffffff?text=Related+3',
        created_at: new Date().toISOString(),
      },
    ];
  };

  const handleNewsPress = (newsId: number) => {
    navigation.navigate('NewsDetail' as never, { id: newsId.toString() } as never);
  };

  const renderRelatedNewsItem = ({ item }: { item: RelatedNews }) => (
    <TouchableOpacity
      style={styles.newsItem}
      onPress={() => handleNewsPress(item.id)}
      activeOpacity={0.7}
    >
      {item.image_url && (
        <Image
          source={{ uri: item.image_url }}
          style={styles.newsImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.newsDate}>
          {item.created_at
            ? new Date(item.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) return null;

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!relatedNews || relatedNews.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>관련 기사 더 보기</Text>
      
      <FlatList
        data={relatedNews}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRelatedNewsItem}
        horizontal={false}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  newsItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  newsImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#F3F4F6',
  },
  newsContent: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 22,
    marginBottom: 8,
  },
  newsDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  separator: {
    height: 16,
  },
});

export default RelatedNewsList; 