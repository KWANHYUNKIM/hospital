import React, { useState, useEffect, useRef } from 'react';
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
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';

// TypeScript 인터페이스 정의
interface Hospital {
  id: number;
  name: string;
  address: string;
  phone: string;
}

interface Comment {
  id: number;
  comment: string;
  username: string;
  userId: number;
  createdAt: string;
  parentId?: number;
  authorProfileImage?: string;
  hospitals?: Hospital[];
  status?: string;
}

interface Board {
  id: number;
  title: string;
  summary: string;
  authorName: string;
  userId: number;
  createdAt: string;
  viewCount: number;
  categoryName: string;
  profileImage?: string;
  tags?: Array<{ name: string }>;
}

interface RouteParams {
  id: number;
}

const BoardDetailPage: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as RouteParams;
  
  const [board, setBoard] = useState<Board | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  // 게시글 및 댓글 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [boardResponse, commentsResponse] = await Promise.all([
          axios.get(`http://localhost:8080/api/boards/${id}`, { withCredentials: true }),
          axios.get(`http://localhost:8080/api/comment/${id}/list`, { withCredentials: true })
        ]);

        setBoard(boardResponse.data);
        
        // 댓글 데이터 처리
        const commentsData = commentsResponse.data.content || [];
        setComments(commentsData);

        // 조회수 증가
        await axios.post(`http://localhost:8080/api/boards/${id}/increment-view`, {}, { 
          withCredentials: true 
        });
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
        Alert.alert('오류', '게시글을 불러오는데 실패했습니다.', [
          { text: '확인', onPress: () => navigation.goBack() }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigation]);

  const handleEditBoard = () => {
    navigation.navigate('EditBoard' as never, { id } as never);
  };

  const handleDeleteBoard = async () => {
    Alert.alert(
      '게시글 삭제',
      '정말로 이 게시글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`http://localhost:8080/api/boards/${id}`, { 
                withCredentials: true 
              });
              navigation.navigate('Community' as never);
            } catch (error) {
              console.error('게시글 삭제 실패:', error);
              Alert.alert('오류', '게시글 삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      Alert.alert('알림', '댓글 내용을 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/api/comment/${id}/create`,
        { comment: commentText.trim() },
        { withCredentials: true }
      );

      if (response.data.success) {
        // 댓글 목록 새로고침
        const commentsResponse = await axios.get(`http://localhost:8080/api/comment/${id}/list`, { 
          withCredentials: true 
        });
        setComments(commentsResponse.data.content || []);
        setCommentText('');
      }
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      Alert.alert('오류', '댓글 작성에 실패했습니다.');
    }
  };

  const handleReplySubmit = async (parentId: number) => {
    if (!replyText.trim()) {
      Alert.alert('알림', '답글 내용을 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/api/boards/${id}/comments`,
        { 
          comment: replyText.trim(),
          parentId: parentId 
        },
        { withCredentials: true }
      );

      // 댓글 목록 새로고침
      const commentsResponse = await axios.get(`http://localhost:8080/api/comment/${id}/list`, { 
        withCredentials: true 
      });
      setComments(commentsResponse.data.content || []);
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('답글 작성 실패:', error);
      Alert.alert('오류', '답글 작성에 실패했습니다.');
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editCommentText.trim()) {
      Alert.alert('알림', '댓글 내용을 입력해주세요.');
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8080/api/boards/${id}/comments/${commentId}`,
        { comment: editCommentText.trim() },
        { withCredentials: true }
      );

      if (response.data.success) {
        // 댓글 목록 새로고침
        const commentsResponse = await axios.get(`http://localhost:8080/api/comment/${id}/list`, { 
          withCredentials: true 
        });
        setComments(commentsResponse.data.content || []);
        setEditingComment(null);
        setEditCommentText('');
      }
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      Alert.alert('오류', '댓글 수정에 실패했습니다.');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    Alert.alert(
      '댓글 삭제',
      '정말로 이 댓글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`http://localhost:8080/api/boards/${id}/comments/${commentId}`, { 
                withCredentials: true 
              });
              
              // 댓글 목록 새로고침
              const commentsResponse = await axios.get(`http://localhost:8080/api/comment/${id}/list`, { 
                withCredentials: true 
              });
              setComments(commentsResponse.data.content || []);
            } catch (error) {
              console.error('댓글 삭제 실패:', error);
              Alert.alert('오류', '댓글 삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '날짜 정보 없음';
    try {
      const date = new Date(dateString.replace('T', ' ').split('.')[0]);
      if (isNaN(date.getTime())) return '날짜 정보 없음';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return '날짜 정보 없음';
    }
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

  const renderComment = (comment: Comment) => {
    const isDeleted = comment.status === 'deleted';
    const hasReplies = comments.some(c => c.parentId === comment.id);

    return (
      <View key={comment.id} style={styles.commentContainer}>
        <View style={styles.commentHeader}>
          <View style={styles.commentAuthor}>
            <View style={[styles.authorAvatar, { backgroundColor: getRandomColor(comment.username) }]}>
              <Text style={styles.authorAvatarText}>{getInitials(comment.username)}</Text>
            </View>
            <View style={styles.commentAuthorInfo}>
              <Text style={styles.commentAuthorName}>
                {isDeleted ? '삭제됨' : comment.username}
              </Text>
              <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
            </View>
          </View>
          
          {!isDeleted && (
            <View style={styles.commentActions}>
              <TouchableOpacity
                style={styles.commentActionButton}
                onPress={() => setReplyingTo(comment.id)}
              >
                <Text style={styles.commentActionText}>답글</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.commentActionButton}
                onPress={() => {
                  setEditingComment(comment.id);
                  setEditCommentText(comment.comment);
                }}
              >
                <Text style={styles.commentActionText}>수정</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.commentActionButton}
                onPress={() => handleDeleteComment(comment.id)}
              >
                <Text style={[styles.commentActionText, { color: '#EF4444' }]}>삭제</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.commentContent}>
          {editingComment === comment.id ? (
            <View style={styles.editCommentContainer}>
              <TextInput
                style={styles.editCommentInput}
                value={editCommentText}
                onChangeText={setEditCommentText}
                multiline
                placeholder="댓글 수정..."
                placeholderTextColor="#9CA3AF"
              />
              <View style={styles.editCommentActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditingComment(null);
                    setEditCommentText('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => handleEditComment(comment.id)}
                >
                  <Text style={styles.saveButtonText}>저장</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.commentText}>
              {isDeleted ? '삭제된 댓글입니다.' : comment.comment}
            </Text>
          )}
        </View>

        {/* 답글 입력 폼 */}
        {replyingTo === comment.id && (
          <View style={styles.replyContainer}>
            <TextInput
              style={styles.replyInput}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              placeholder="답글을 입력하세요..."
              placeholderTextColor="#9CA3AF"
            />
            <View style={styles.replyActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setReplyingTo(null);
                  setReplyText('');
                }}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => handleReplySubmit(comment.id)}
              >
                <Text style={styles.saveButtonText}>답글 작성</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 대댓글 표시 */}
        {hasReplies && (
          <View style={styles.repliesContainer}>
            {comments
              .filter(reply => reply.parentId === comment.id)
              .map(reply => renderComment(reply))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>게시글을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!board) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>게시글을 찾을 수 없습니다.</Text>
          <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
            <Text style={styles.goBackButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>게시글</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionButton} onPress={handleEditBoard}>
            <Text style={styles.headerActionText}>수정</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton} onPress={handleDeleteBoard}>
            <Text style={[styles.headerActionText, { color: '#EF4444' }]}>삭제</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 게시글 내용 */}
        <View style={styles.boardContainer}>
          <View style={styles.boardHeader}>
            <Text style={styles.boardTitle}>{board.title}</Text>
            <View style={styles.boardMeta}>
              <View style={styles.boardAuthor}>
                <View style={[styles.authorAvatar, { backgroundColor: getRandomColor(board.authorName) }]}>
                  <Text style={styles.authorAvatarText}>{getInitials(board.authorName)}</Text>
                </View>
                <View>
                  <Text style={styles.boardAuthorName}>{board.authorName}</Text>
                  <Text style={styles.boardDate}>{formatDate(board.createdAt)}</Text>
                </View>
              </View>
              <View style={styles.boardStats}>
                <Text style={styles.boardStatsText}>조회 {board.viewCount}</Text>
                <Text style={styles.boardStatsText}>카테고리: {board.categoryName}</Text>
              </View>
            </View>
          </View>

          <View style={styles.boardContent}>
            <Text style={styles.boardText}>{board.summary}</Text>
          </View>

          {/* 태그 섹션 */}
          {board.tags && board.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {board.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 댓글 섹션 */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsSectionTitle}>
            댓글 ({comments.filter(c => !c.parentId).length})
          </Text>

          {/* 댓글 작성 */}
          <View style={styles.newCommentContainer}>
            <TextInput
              style={styles.newCommentInput}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              placeholder="댓글을 입력하세요..."
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity style={styles.submitCommentButton} onPress={handleCommentSubmit}>
              <Text style={styles.submitCommentButtonText}>작성</Text>
            </TouchableOpacity>
          </View>

          {/* 댓글 목록 */}
          <View style={styles.commentsContainer}>
            {comments
              .filter(comment => !comment.parentId)
              .map(comment => renderComment(comment))}
          </View>
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  goBackButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goBackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionButton: {
    padding: 8,
  },
  headerActionText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  boardContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  boardHeader: {
    marginBottom: 20,
  },
  boardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    lineHeight: 32,
  },
  boardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boardAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  boardAuthorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  boardDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  boardStats: {
    alignItems: 'flex-end',
  },
  boardStatsText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  boardContent: {
    marginBottom: 20,
  },
  boardText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  commentsSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentsSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  newCommentContainer: {
    marginBottom: 24,
  },
  newCommentInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  submitCommentButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  submitCommentButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  commentsContainer: {
    gap: 16,
  },
  commentContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  commentAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentAuthorInfo: {
    flex: 1,
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  commentDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  commentActionButton: {
    padding: 4,
  },
  commentActionText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  commentContent: {
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  editCommentContainer: {
    gap: 8,
  },
  editCommentInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  editCommentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
  saveButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  replyContainer: {
    marginTop: 12,
    paddingLeft: 16,
    gap: 8,
  },
  replyInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  repliesContainer: {
    marginTop: 12,
    marginLeft: 16,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#E5E7EB',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default BoardDetailPage; 