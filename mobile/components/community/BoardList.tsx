import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';

// TypeScript 인터페이스 정의
interface BoardItem {
  id: number | string;
  title: string;
  summary?: string;
  category_name: string;
  username: string;
  created_at: string;
  user_id: number;
  content?: string;
  views?: number;
  likes?: number;
}

interface BoardListProps {
  boards: BoardItem[];
  isLoggedIn: boolean;
  onDeleteBoard: (boardId: number | string) => void;
  onSelectBoard: (boardId: number | string) => void;
}

const BoardList: React.FC<BoardListProps> = ({ 
  boards, 
  isLoggedIn, 
  onDeleteBoard, 
  onSelectBoard 
}) => {
  const { user } = useAuth();

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  };

  // 삭제 확인 알림
  const handleDeletePress = (boardId: number | string) => {
    Alert.alert(
      '게시글 삭제',
      '정말로 이 게시글을 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => onDeleteBoard(boardId),
        },
      ],
      { cancelable: true }
    );
  };

  // 게시글 항목 렌더링
  const renderBoardItem = ({ item }: { item: BoardItem }) => {
    const canDelete = isLoggedIn && user && user.id === item.user_id;

    return (
      <TouchableOpacity
        style={styles.boardItem}
        onPress={() => onSelectBoard(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.boardContent}>
          <View style={styles.mainContent}>
            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
              {item.title}
            </Text>
            {item.summary && (
              <Text style={styles.summary} numberOfLines={2} ellipsizeMode="tail">
                {item.summary}
              </Text>
            )}
            <View style={styles.metaInfo}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category_name}</Text>
              </View>
              <Text style={styles.metaText}>•</Text>
              <Text style={styles.metaText}>{item.username}</Text>
              <Text style={styles.metaText}>•</Text>
              <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
            </View>
          </View>
          
          {canDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeletePress(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="delete" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // 빈 목록 컴포넌트
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="article" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>게시글이 없습니다</Text>
      <Text style={styles.emptyDescription}>
        첫 번째 게시글을 작성해보세요!
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {boards.length === 0 ? (
        renderEmptyList()
      ) : (
        <FlatList
          data={boards}
          renderItem={renderBoardItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
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
  listContainer: {
    padding: 16,
  },
  boardItem: {
    paddingVertical: 12,
  },
  boardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 22,
    marginBottom: 4,
  },
  summary: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryBadge: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 4,
  },
  deleteButton: {
    padding: 4,
    alignSelf: 'flex-start',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default BoardList; 