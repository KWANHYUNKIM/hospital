import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';

// 타입 정의
interface NewsContent {
  type: string;
  content?: ContentItem[];
  props?: ImageProps;
  id?: string;
}

interface ContentItem {
  text?: string;
  styles?: Record<string, any>;
}

interface ImageProps {
  url: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
}

interface News {
  id: number;
  title: string;
  content?: string;
  summary?: string;
  category_name?: string;
  created_at?: string;
  view_count?: number;
  author_id?: number;
  category_id?: number;
}

interface User {
  id: number;
  role?: string;
}

interface RouteParams {
  id: string;
}

const { width: screenWidth } = Dimensions.get('window');

const NewsDetailList: React.FC = () => {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation();
  const { id } = route.params;
  
  // 임시 사용자 정보 (실제로는 Auth Context에서 가져와야 함)
  const user: User | null = null; // useAuth hook으로 대체
  
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentImages, setContentImages] = useState<string[]>([]);

  useEffect(() => {
    fetchNewsDetail();
  }, [id]);

  const fetchNewsDetail = async () => {
    try {
      setLoading(true);
      // API 호출 대신 임시 데이터 (실제로는 getNewsDetail(id) 호출)
      const response = await mockGetNewsDetail(id);
      
      if (!response) {
        throw new Error('뉴스 데이터를 찾을 수 없습니다.');
      }
      
      setNews(response);
      
      // 본문에서 이미지 URL 추출
      if (response.content) {
        try {
          const parsedContent = JSON.parse(response.content);
          const images: string[] = [];
          
          parsedContent.forEach((block: NewsContent) => {
            if (block.type === 'image' && block.props?.url) {
              images.push(block.props.url);
            }
          });
          
          setContentImages(images);
        } catch (e) {
          console.error('Content parsing error:', e);
        }
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('뉴스 상세 조회 실패:', err);
      setError(err?.message || '뉴스를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  // Mock API 함수 (실제로는 API 모듈에서 가져와야 함)
  const mockGetNewsDetail = async (id: string): Promise<News> => {
    // 실제 API 호출로 대체해야 함
    return {
      id: parseInt(id),
      title: '샘플 뉴스 제목',
      content: JSON.stringify([
        {
          type: 'paragraph',
          content: [{ text: '뉴스 본문 내용입니다.' }]
        }
      ]),
      summary: '뉴스 요약',
      category_name: '건강',
      created_at: new Date().toISOString(),
      view_count: 100,
      author_id: 1,
      category_id: 1,
    };
  };

  const renderContent = (content: string) => {
    if (!content) return null;
    
    try {
      const parsedContent = JSON.parse(content);
      if (!Array.isArray(parsedContent)) {
        return <Text style={styles.contentText}>{content}</Text>;
      }
      
      return parsedContent.map((block: NewsContent, index: number) => {
        if (!block || !block.type) return null;
        
        if (block.type === 'paragraph' && block.content && Array.isArray(block.content)) {
          return (
            <Text key={block.id || index} style={styles.paragraphText}>
              {block.content.map((item: ContentItem, i: number) => (
                <Text key={i} style={getTextStyles(item.styles)}>
                  {item.text || ''}
                </Text>
              ))}
            </Text>
          );
        } else if (block.type === 'image' && block.props?.url) {
          const { url, alt, width, height } = block.props;
          
          return (
            <View key={block.id || index} style={styles.imageContainer}>
              <Image
                source={{ uri: url }}
                style={[
                  styles.contentImage,
                  width && { width: typeof width === 'number' ? width : screenWidth - 32 },
                  height && { height: typeof height === 'number' ? height : 200 },
                ]}
                resizeMode="contain"
                onError={() => {
                  console.log('이미지 로드 실패:', url);
                }}
              />
            </View>
          );
        }
        return null;
      });
    } catch (e) {
      console.error('Content parsing error:', e);
      return <Text style={styles.contentText}>{content}</Text>;
    }
  };

  const getTextStyles = (styles?: Record<string, any>) => {
    const textStyles: any = {};
    
    if (styles?.bold) textStyles.fontWeight = 'bold';
    if (styles?.italic) textStyles.fontStyle = 'italic';
    if (styles?.underline) textStyles.textDecorationLine = 'underline';
    
    return textStyles;
  };

  const handleDelete = async () => {
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
              navigation.goBack();
            } catch (err) {
              console.error('뉴스 삭제 실패:', err);
              Alert.alert('오류', '뉴스 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate('NewsEdit' as never, { id } as never);
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
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchNewsDetail}
        >
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!news) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>뉴스를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* 상단 버튼들 */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← 목록으로</Text>
          </TouchableOpacity>
          
          {/* 작성자일 경우에만 수정/삭제 버튼 표시 */}
          {user && user.id === news.author_id && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEdit}
              >
                <Text style={styles.editButtonText}>수정</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <Text style={styles.deleteButtonText}>삭제</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 뉴스 헤더 */}
        <View style={styles.newsHeader}>
          <View style={styles.metaInfo}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {news.category_name || '전체'}
              </Text>
            </View>
            <Text style={styles.dateText}>
              {news.created_at
                ? new Date(news.created_at).toLocaleDateString('ko-KR')
                : ''}
            </Text>
            <Text style={styles.viewCountText}>
              조회수 {news.view_count || 0}
            </Text>
          </View>
          
          <Text style={styles.title}>{news.title || ''}</Text>
          
          {news.summary && (
            <Text style={styles.summary}>{news.summary}</Text>
          )}
        </View>

        {/* 본문 */}
        <View style={styles.newsContent}>
          {news.content && renderContent(news.content)}
        </View>

        {/* 관련 기사 섹션 (추후 구현) */}
        {news.category_id && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>관련 기사</Text>
            <Text style={styles.relatedPlaceholder}>
              관련 기사 컴포넌트가 여기에 표시됩니다.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
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
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  newsHeader: {
    marginBottom: 24,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  viewCountText: {
    fontSize: 12,
    color: '#6B7280',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 32,
    marginBottom: 16,
  },
  summary: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  newsContent: {
    marginBottom: 24,
  },
  contentText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  paragraphText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  contentImage: {
    width: screenWidth - 32,
    height: 200,
    borderRadius: 8,
  },
  relatedSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  relatedPlaceholder: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

export default NewsDetailList; 