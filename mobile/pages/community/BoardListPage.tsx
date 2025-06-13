import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface Board {
  id: number;
  title: string;
  username: string;
  createdAt: string;
  viewCount: number;
  commentCount: number;
}

interface BoardListPageProps {
  boards: Board[];
}

const BoardListPage: React.FC<BoardListPageProps> = ({ boards }) => {
  const navigation = useNavigation();

  const formatDate = (dateString: string): string => {
    if (!dateString) return '날짜 정보 없음';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '날짜 정보 없음';
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(/\. /g, '. ').replace(/\./g, '-').replace(/,/g, '');
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return '날짜 정보 없음';
    }
  };

  const handleBoardPress = (id: number) => {
    (navigation as any).navigate('BoardDetail', { id });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tableContainer}>
        {/* 헤더 */}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, styles.titleColumn]}>제목</Text>
          <Text style={[styles.headerText, styles.authorColumn]}>작성자</Text>
          <Text style={[styles.headerText, styles.dateColumn]}>작성일</Text>
          <Text style={[styles.headerText, styles.viewColumn]}>조회수</Text>
          <Text style={[styles.headerText, styles.commentColumn]}>댓글</Text>
        </View>

        {/* 데이터 목록 */}
        {boards.map((board) => (
          <TouchableOpacity
            key={board.id}
            style={styles.tableRow}
            onPress={() => handleBoardPress(board.id)}
            activeOpacity={0.7}
          >
            <View style={styles.titleColumn}>
              <Text style={styles.titleText} numberOfLines={1}>
                {board.title}
              </Text>
            </View>
            <View style={styles.authorColumn}>
              <Text style={styles.dataText}>{board.username}</Text>
            </View>
            <View style={styles.dateColumn}>
              <Text style={styles.dataText}>
                {formatDate(board.createdAt)}
              </Text>
            </View>
            <View style={styles.viewColumn}>
              <Text style={styles.dataText}>{board.viewCount || 0}</Text>
            </View>
            <View style={styles.commentColumn}>
              <Text style={styles.dataText}>{board.commentCount || 0}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {boards.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>게시글이 없습니다.</Text>
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
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  titleColumn: {
    flex: 4,
    paddingRight: 8,
  },
  authorColumn: {
    flex: 2,
    paddingRight: 8,
  },
  dateColumn: {
    flex: 2,
    paddingRight: 8,
  },
  viewColumn: {
    flex: 1,
    alignItems: 'center',
  },
  commentColumn: {
    flex: 1,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  dataText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default BoardListPage; 