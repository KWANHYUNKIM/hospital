import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// TypeScript 인터페이스 정의
interface Post {
  id: number | string;
  title: string;
  author: string;
  date: string;
  category: string;
  content?: string;
}

interface BoardProps {
  posts: Post[];
  isLoggedIn: boolean;
  onCreatePost?: () => void;
  onPostPress?: (post: Post) => void;
}

const Board: React.FC<BoardProps> = ({ 
  posts, 
  isLoggedIn, 
  onCreatePost,
  onPostPress 
}) => {
  // 날짜 포맷팅 함수
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // 게시글 항목 렌더링
  const renderPostItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.postItem}
      onPress={() => onPostPress?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.postRow}>
        <Text style={styles.postId}>{item.id}</Text>
        <Text style={styles.postTitle} numberOfLines={1} ellipsizeMode="tail">
          {item.title}
        </Text>
        <Text style={styles.postAuthor}>{item.author}</Text>
        <Text style={styles.postDate}>{formatDate(item.date)}</Text>
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // 헤더 컴포넌트
  const renderHeader = () => (
    <View style={styles.headerRow}>
      <Text style={styles.headerCell}>번호</Text>
      <Text style={[styles.headerCell, styles.titleHeader]}>제목</Text>
      <Text style={styles.headerCell}>작성자</Text>
      <Text style={styles.headerCell}>날짜</Text>
      <Text style={styles.headerCell}>카테고리</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>게시판</Text>
        {isLoggedIn && (
          <TouchableOpacity
            style={styles.writeButton}
            onPress={onCreatePost}
          >
            <Icon name="edit" size={18} color="#FFFFFF" style={styles.writeIcon} />
            <Text style={styles.writeButtonText}>글쓰기</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 게시글 목록 */}
      <View style={styles.tableContainer}>
        {renderHeader()}
        
        {posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="article" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>게시글이 없습니다.</Text>
          </View>
        ) : (
          <FlatList
            data={posts}
            renderItem={renderPostItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            style={styles.postList}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    margin: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  writeButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  writeIcon: {
    marginRight: 4,
  },
  writeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tableContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerCell: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    textAlign: 'center',
    flex: 1,
  },
  titleHeader: {
    flex: 2,
    textAlign: 'left',
  },
  postList: {
    maxHeight: 400,
  },
  postItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  postRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 50,
  },
  postId: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    flex: 1,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 2,
    marginRight: 8,
  },
  postAuthor: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    flex: 1,
  },
  postDate: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    flex: 1,
  },
  categoryContainer: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default Board; 