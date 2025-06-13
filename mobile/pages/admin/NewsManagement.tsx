import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getNewsList, deleteNews, getNewsCategories, updateNewsStatus } from '../../service/newsApi';

// TypeScript 인터페이스 정의
interface NewsItem {
  id: number;
  title: string;
  summary: string;
  image_url: string;
  content: string;
  category_name: string;
  status: string;
  created_at: string;
  view_count: number;
  representative_image_url?: string;
}

interface Category {
  id: number;
  name: string;
}

interface NewsResponse {
  content: NewsItem[];
  totalPages: number;
  number: number;
}

const NewsManagement: React.FC = () => {
  const navigation = useNavigation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE');
  const [refreshing, setRefreshing] = useState(false);

  // 뉴스 내용에서 첫 번째 이미지 URL을 추출하는 함수
  const extractFirstImageUrl = (content: string): string | null => {
    try {
      const contentArray = JSON.parse(content);
      for (const block of contentArray) {
        if (block.type === 'image' && block.props?.url) {
          return block.props.url;
        }
      }
    } catch (error) {
      console.error('이미지 URL 추출 실패:', error);
    }
    return null;
  };

  const fetchNews = async (page: number = 1, showLoading: boolean = true) => {
    try {
      if (showLoading) setLoading(true);
      const response: NewsResponse = await getNewsList(page, 10, selectedCategory || null, selectedStatus);
      
      if (response && response.content) {
        const newsWithImages = response.content.map(item => ({
          ...item,
          image_url: item.representative_image_url || 
                     extractFirstImageUrl(item.content) || 
                     'https://via.placeholder.com/300x200?text=No+Image'
        }));
        setNews(newsWithImages);
        setTotalPages(response.totalPages || 1);
        setCurrentPage(response.number + 1 || page);
      } else {
        setNews([]);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (err: any) {
      console.error('뉴스 로딩 실패:', err);
      setError('뉴스를 불러오는데 실패했습니다.');
      setNews([]);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getNewsCategories();
      const categoriesData = Array.isArray(response) ? response : [];
      setCategories(categoriesData);
    } catch (err: any) {
      console.error('카테고리 로딩 실패:', err);
    }
  };

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, [selectedCategory, selectedStatus]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    Alert.alert(
      '상태 변경',
      `뉴스 상태를 ${newStatus === 'ACTIVE' ? '활성화' : '비활성화'} 하시겠습니까?`,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: async () => {
            try {
              await updateNewsStatus(id, newStatus);
              fetchNews(currentPage, false);
              Alert.alert('성공', '뉴스 상태가 변경되었습니다.');
            } catch (err: any) {
              Alert.alert('오류', '뉴스 상태 변경에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (id: number) => {
    navigation.navigate('NewsForm' as never, { id: id.toString() } as never);
  };

  const handleCreate = () => {
    navigation.navigate('NewsForm' as never);
  };

  const handleCategoryManage = () => {
    navigation.navigate('CategoryManagement' as never);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews(1, false);
  };

  const loadNextPage = () => {
    if (currentPage < totalPages && !loading) {
      fetchNews(currentPage + 1, false);
    }
  };

  const loadPreviousPage = () => {
    if (currentPage > 1 && !loading) {
      fetchNews(currentPage - 1, false);
    }
  };

  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <View style={styles.newsCard}>
      <Image
        source={{ uri: item.image_url }}
        style={styles.newsImage}
        resizeMode="cover"
        onError={(e) => {
          // 이미지 로드 실패 시 플레이스홀더로 교체
          e.currentTarget.source = { uri: 'https://via.placeholder.com/300x200?text=No+Image' };
        }}
      />
      
      <View style={styles.statusBadgeContainer}>
        <View style={[
          styles.statusBadge,
          item.status === 'ACTIVE' ? styles.activeBadge : styles.inactiveBadge
        ]}>
          <Text style={[
            styles.statusText,
            item.status === 'ACTIVE' ? styles.activeText : styles.inactiveText
          ]}>
            {item.status}
          </Text>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category_name}</Text>
        </View>
      </View>

      <View style={styles.newsContent}>
        <Text style={styles.newsTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        {item.summary && (
          <Text style={styles.newsSummary} numberOfLines={2}>
            {item.summary}
          </Text>
        )}
        
        <View style={styles.newsMetadata}>
          <Text style={styles.newsDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
          <Text style={styles.viewCount}>
            조회수: {item.view_count}
          </Text>
        </View>
        
        <View style={styles.newsActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEdit(item.id)}
          >
            <Text style={styles.editButtonText}>수정</Text>
          </TouchableOpacity>
          
          {item.status === 'ACTIVE' ? (
            <TouchableOpacity
              style={styles.deactivateButton}
              onPress={() => handleStatusChange(item.id, 'INACTIVE')}
            >
              <Text style={styles.deactivateButtonText}>비활성화</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.activateButton}
              onPress={() => handleStatusChange(item.id, 'ACTIVE')}
            >
              <Text style={styles.activateButtonText}>활성화</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchNews()}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>뉴스 관리</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.categoryButton} onPress={handleCategoryManage}>
            <Icon name="category" size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
            <Icon name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 필터 섹션 */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedCategory === '' && styles.filterButtonActive
            ]}
            onPress={() => setSelectedCategory('')}
          >
            <Text style={[
              styles.filterButtonText,
              selectedCategory === '' && styles.filterButtonTextActive
            ]}>
              전체 카테고리
            </Text>
          </TouchableOpacity>
          
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterButton,
                selectedCategory === category.id.toString() && styles.filterButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id.toString())}
            >
              <Text style={[
                styles.filterButtonText,
                selectedCategory === category.id.toString() && styles.filterButtonTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilter}>
          {[
            { value: 'ACTIVE', label: '활성화된 뉴스' },
            { value: 'INACTIVE', label: '비활성화된 뉴스' },
            { value: 'DRAFT', label: '임시저장 뉴스' },
            { value: 'ARCHIVED', label: '보관된 뉴스' }
          ].map((status) => (
            <TouchableOpacity
              key={status.value}
              style={[
                styles.filterButton,
                selectedStatus === status.value && styles.filterButtonActive
              ]}
              onPress={() => setSelectedStatus(status.value)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedStatus === status.value && styles.filterButtonTextActive
              ]}>
                {status.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 뉴스 목록 */}
      <FlatList
        data={news}
        renderItem={renderNewsItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.newsRow}
        contentContainerStyle={styles.newsList}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="article" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>등록된 뉴스가 없습니다</Text>
            <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
              <Text style={styles.createButtonText}>새 뉴스 작성</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
            onPress={loadPreviousPage}
            disabled={currentPage === 1 || loading}
          >
            <Icon name="chevron-left" size={24} color={currentPage === 1 ? "#9CA3AF" : "#374151"} />
          </TouchableOpacity>
          
          <Text style={styles.pageInfo}>
            {currentPage} / {totalPages}
          </Text>
          
          <TouchableOpacity
            style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
            onPress={loadNextPage}
            disabled={currentPage === totalPages || loading}
          >
            <Icon name="chevron-right" size={24} color={currentPage === totalPages ? "#9CA3AF" : "#374151"} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 8,
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryFilter: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statusFilter: {
    paddingHorizontal: 16,
  },
  filterButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  newsList: {
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  newsRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  newsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 120,
  },
  statusBadgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#D1FAE5',
  },
  inactiveBadge: {
    backgroundColor: '#F3F4F6',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  activeText: {
    color: '#065F46',
  },
  inactiveText: {
    color: '#6B7280',
  },
  categoryBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  newsContent: {
    padding: 12,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 18,
  },
  newsSummary: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 16,
  },
  newsMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  newsDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  viewCount: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  newsActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  deactivateButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deactivateButtonText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
  activateButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activateButtonText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  pageButton: {
    padding: 8,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageInfo: {
    fontSize: 16,
    color: '#374151',
    marginHorizontal: 20,
    fontWeight: '500',
  },
});

export default NewsManagement; 