import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';

// TypeScript 인터페이스 정의
interface Post {
  id: number;
  title: string;
  user_name: string;
  created_at: string;
  view_count: number;
  comment_count: number;
  category_name: string;
  profile_image?: string;
  tags?: Array<{ name: string }>;
  hospital_info?: {
    name: string;
    address: string;
  };
}

interface Category {
  id: number;
  category_name: string;
  parent_id?: number;
}

const CommunityPage: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 게시글 목록 조회
  const fetchPosts = async (categoryId?: number, search?: string, page: number = 1) => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/boards', {
        params: {
          page: page,
          limit: 10,
          categoryId: categoryId,
          search: search,
        },
      });
      setPosts(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.number || 0);
    } catch (error) {
      console.error('게시글 목록 로딩 실패:', error);
      setPosts([]);
      Alert.alert('오류', '게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 목록 조회
  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/boards/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('카테고리 목록 로딩 실패:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPosts(selectedCategory || undefined, searchQuery);
      fetchCategories();
    }, [selectedCategory, searchQuery])
  );

  const handleWritePress = () => {
    console.log('게시글 작성 페이지로 이동');
    // navigation.navigate('CreateBoard');
  };

  const handlePostPress = (postId: number) => {
    console.log('게시글 상세 페이지로 이동:', postId);
    // navigation.navigate('BoardDetail', { id: postId });
  };

  const handleCategoryPress = (categoryId: number) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const handleSearch = () => {
    fetchPosts(selectedCategory || undefined, searchQuery);
  };

  const getProfileImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8080${imagePath}`;
  };

  const getRandomColor = (username: string) => {
    const colors = [
      '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
      '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
      '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
    ];
    const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const getInitials = (username: string) => {
    return username ? username.charAt(0).toUpperCase() : '?';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  const ProfileImage: React.FC<{ profileImage?: string; username: string }> = ({ profileImage, username }) => {
    if (profileImage) {
      return (
        <View style={styles.profileImageContainer}>
          {/* React Native에서는 Image 컴포넌트 사용해야 함 */}
          <View style={[styles.profileInitial, { backgroundColor: getRandomColor(username) }]}>
            <Text style={styles.profileInitialText}>{getInitials(username)}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.profileInitial, { backgroundColor: getRandomColor(username) }]}>
        <Text style={styles.profileInitialText}>{getInitials(username)}</Text>
      </View>
    );
  };

  const renderPostCard = (post: Post) => (
    <TouchableOpacity
      key={post.id}
      style={styles.postCard}
      onPress={() => handlePostPress(post.id)}
      activeOpacity={0.7}
    >
      <View style={styles.postHeader}>
        <View style={styles.postAuthor}>
          <ProfileImage profileImage={post.profile_image} username={post.user_name} />
          <View style={styles.postAuthorInfo}>
            <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>
            <Text style={styles.postAuthorName}>{post.user_name || '익명'}</Text>
          </View>
        </View>
        <Text style={styles.postDate}>{formatDate(post.created_at)}</Text>
      </View>
      
      <View style={styles.postMeta}>
        <View style={styles.postTags}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{post.category_name}</Text>
          </View>
          {post.tags && post.tags.length > 0 && post.tags[0]?.name && (
            <View style={styles.hashTag}>
              <Text style={styles.hashTagText}>#{post.tags[0].name}</Text>
            </View>
          )}
          {post.hospital_info && (
            <View style={styles.hospitalTag}>
              <Text style={styles.hospitalTagText}>@{post.hospital_info.name}</Text>
            </View>
          )}
        </View>
        <View style={styles.postStats}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>👁️</Text>
            <Text style={styles.statText}>{post.view_count}</Text>
          </View>
          {post.comment_count > 0 && (
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💬</Text>
              <Text style={[styles.statText, { color: '#3B82F6' }]}>{post.comment_count}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
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

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>커뮤니티</Text>
        <TouchableOpacity style={styles.writeButton} onPress={handleWritePress}>
          <Text style={styles.writeButtonIcon}>➕</Text>
          <Text style={styles.writeButtonText}>글쓰기</Text>
        </TouchableOpacity>
      </View>

      {/* 검색 바 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="게시글 검색..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>검색</Text>
        </TouchableOpacity>
      </View>

      {/* 카테고리 필터 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        <TouchableOpacity
          style={[styles.categoryChip, selectedCategory === null && styles.categoryChipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.categoryChipText, selectedCategory === null && styles.categoryChipTextActive]}>
            전체
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryChip, selectedCategory === category.id && styles.categoryChipActive]}
            onPress={() => handleCategoryPress(category.id)}
          >
            <Text style={[styles.categoryChipText, selectedCategory === category.id && styles.categoryChipTextActive]}>
              {category.category_name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 최신 글 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.sectionDot, { backgroundColor: '#22C55E' }]} />
              <Text style={styles.sectionTitle}>최신 글</Text>
            </View>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>
                {posts.filter(p => new Date(p.created_at) > new Date(Date.now() - 24*60*60*1000)).length}
              </Text>
            </View>
          </View>
          <View style={styles.sectionContent}>
            {posts
              .filter(p => new Date(p.created_at) > new Date(Date.now() - 24*60*60*1000))
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 5)
              .map(renderPostCard)
            }
          </View>
        </View>

        {/* 인기 글 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.sectionDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.sectionTitle}>인기 글</Text>
            </View>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>
                {posts.filter(p => p.view_count >= 100).length}
              </Text>
            </View>
          </View>
          <View style={styles.sectionContent}>
            {posts
              .filter(p => p.view_count >= 100)
              .sort((a, b) => b.view_count - a.view_count)
              .slice(0, 5)
              .map(renderPostCard)
            }
          </View>
        </View>

        {/* 전체 게시글 목록 */}
        <View style={styles.section}>
          <Text style={styles.allPostsTitle}>전체 게시글 ({posts.length}개)</Text>
          <View style={styles.sectionContent}>
            {posts.map(renderPostCard)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    fontWeight: '600',
    color: '#111827',
  },
  writeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  writeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  writeButtonIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    color: '#111827',
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  searchIcon: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  categoryContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  categoryChipActive: {
    backgroundColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sectionBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  sectionContent: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  profileImageContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileInitial: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitialText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  postAuthorInfo: {
    flex: 1,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  postAuthorName: {
    fontSize: 12,
    color: '#6B7280',
  },
  postDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postTags: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  categoryTag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTagText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  hashTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hashTagText: {
    fontSize: 12,
    color: '#374151',
  },
  hospitalTag: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hospitalTagText: {
    fontSize: 12,
    color: '#065F46',
    fontWeight: '500',
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  allPostsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
});

export default CommunityPage; 