import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  fetchHospitalReviews,
  submitHospitalReview,
  updateHospitalReview,
  deleteHospitalReview 
} from '../../utils/api';

// TypeScript 인터페이스 정의
interface User {
  id: string;
  username: string;
}

interface ReviewKeyword {
  label: string;
  score?: number;
}

interface Review {
  id: string;
  content: string;
  visit_date?: string;
  created_at: string;
  updated_at?: string;
  user_id: string;
  username?: string;
  keywords?: ReviewKeyword[];
  image_urls?: string[];
  likes_count?: number;
  is_liked?: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface NewReview {
  content: string;
  visitDate: string;
  images: string[];
}

interface HospitalReviewProps {
  hospitalId: string;
  hospitalType?: 'hospital' | 'nursing';
  user?: User | null;
}

const HospitalReview: React.FC<HospitalReviewProps> = ({
  hospitalId,
  hospitalType = 'hospital',
  user
}) => {
  const navigation = useNavigation();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [sort, setSort] = useState<'latest' | 'likes'>('latest');
  const [isWriting, setIsWriting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [newReview, setNewReview] = useState<NewReview>({
    content: '',
    visitDate: '',
    images: []
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [showLoginAlert, setShowLoginAlert] = useState<boolean>(false);

  // 리뷰 목록 조회
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await fetchHospitalReviews(
        hospitalId, 
        pagination.page, 
        pagination.limit, 
        sort
      );
      setReviews(data.reviews || []);
      setTotalReviews(data.total || 0);
      setPagination(prev => ({
        ...prev,
        totalPages: Math.ceil((data.total || 0) / pagination.limit)
      }));
    } catch (error) {
      console.error('리뷰 조회 중 오류:', error);
      Alert.alert('오류', '리뷰를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [hospitalId, pagination.page, sort]);

  // 리뷰 작성/수정
  const handleSubmitReview = async () => {
    if (!user) {
      setShowLoginAlert(true);
      return;
    }

    if (!newReview.content.trim()) {
      Alert.alert('알림', '리뷰 내용을 입력해주세요.');
      return;
    }

    if (!newReview.visitDate) {
      Alert.alert('알림', '방문일을 선택해주세요.');
      return;
    }

    try {
      const reviewData = {
        content: newReview.content,
        visitDate: newReview.visitDate,
        images: newReview.images
      };

      if (isEditing && editingReviewId) {
        await updateHospitalReview(hospitalId, editingReviewId, reviewData);
        Alert.alert('완료', '리뷰가 수정되었습니다.');
      } else {
        await submitHospitalReview(hospitalId, reviewData);
        Alert.alert('완료', '리뷰가 작성되었습니다.');
      }

      setIsWriting(false);
      setIsEditing(false);
      setEditingReviewId(null);
      setNewReview({ content: '', visitDate: '', images: [] });
      fetchReviews();
    } catch (error) {
      console.error('리뷰 처리 중 오류:', error);
      if (error.message === '로그인이 필요합니다.') {
        setShowLoginAlert(true);
      } else {
        Alert.alert('오류', '리뷰 처리 중 오류가 발생했습니다.');
      }
    }
  };

  // 리뷰 수정 시작
  const handleStartEdit = (review: Review) => {
    setEditingReviewId(review.id);
    setIsEditing(true);
    setIsWriting(true);
    setNewReview({
      content: review.content,
      visitDate: review.visit_date ? review.visit_date.split('T')[0] : '',
      images: review.image_urls || []
    });
  };

  // 리뷰 삭제
  const handleDeleteReview = (reviewId: string) => {
    Alert.alert(
      '리뷰 삭제',
      '정말로 이 리뷰를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHospitalReview(hospitalId, reviewId);
              Alert.alert('완료', '리뷰가 삭제되었습니다.');
              fetchReviews();
            } catch (error) {
              console.error('리뷰 삭제 중 오류:', error);
              Alert.alert('오류', '리뷰 삭제 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  const handleStartWriting = () => {
    if (!user) {
      setShowLoginAlert(true);
      return;
    }
    setIsWriting(true);
  };

  // 날짜 포맷팅
  const formatDate = (dateString?: string, includeTime = false): string => {
    if (!dateString) return '날짜 정보 없음';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '날짜 정보 없음';
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      if (includeTime) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}.${month}.${day} ${hours}:${minutes}`;
      }
      return `${year}.${month}.${day}`;
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return '날짜 정보 없음';
    }
  };

  // 페이지네이션
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  // 리뷰 아이템 렌더링
  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewCard}>
      {/* 상단 영역: 사용자 정보 및 날짜 */}
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {item.username ? item.username.charAt(0).toUpperCase() : '익'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.username}>{item.username || '익명'}</Text>
            <Text style={styles.visitDate}>
              방문: {formatDate(item.visit_date)}
            </Text>
          </View>
        </View>
        <View style={styles.reviewActions}>
          <Text style={styles.createdDate}>
            {formatDate(item.created_at)}
          </Text>
          {user && user.id === item.user_id && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => handleStartEdit(item)}
                style={styles.actionButton}
              >
                <Text style={styles.editButtonText}>수정</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteReview(item.id)}
                style={styles.actionButton}
              >
                <Text style={styles.deleteButtonText}>삭제</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* 리뷰 내용 */}
      <View style={styles.reviewContent}>
        <Text style={styles.reviewText}>{item.content || '내용 없음'}</Text>
      </View>

      {/* 키워드 태그 */}
      {item.keywords && item.keywords.length > 0 && (
        <View style={styles.keywordsContainer}>
          {item.keywords.map((keyword, index) => (
            <View key={index} style={styles.keywordTag}>
              <Text style={styles.keywordText}>#{keyword.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>🏥 병원 리뷰 ({totalReviews})</Text>
        {user && !isWriting && (
          <TouchableOpacity
            style={styles.writeButton}
            onPress={handleStartWriting}
          >
            <Text style={styles.writeButtonText}>리뷰 작성</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 정렬 옵션 */}
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[styles.sortButton, sort === 'latest' && styles.activeSortButton]}
          onPress={() => setSort('latest')}
        >
          <Text style={[styles.sortButtonText, sort === 'latest' && styles.activeSortButtonText]}>
            최신순
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sort === 'likes' && styles.activeSortButton]}
          onPress={() => setSort('likes')}
        >
          <Text style={[styles.sortButtonText, sort === 'likes' && styles.activeSortButtonText]}>
            좋아요순
          </Text>
        </TouchableOpacity>
      </View>

      {/* 리뷰 목록 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>리뷰를 불러오는 중...</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>아직 작성된 리뷰가 없습니다.</Text>
              <Text style={styles.emptySubText}>첫 번째 리뷰를 작성해보세요!</Text>
            </View>
          }
        />
      )}

      {/* 리뷰 작성 모달 */}
      <Modal
        visible={isWriting}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsWriting(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setIsWriting(false);
                setIsEditing(false);
                setEditingReviewId(null);
                setNewReview({ content: '', visitDate: '', images: [] });
              }}
            >
              <Text style={styles.modalCancelText}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {isEditing ? '리뷰 수정' : '리뷰 작성'}
            </Text>
            <TouchableOpacity onPress={handleSubmitReview}>
              <Text style={styles.modalSaveText}>저장</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>방문일</Text>
              <TextInput
                style={styles.dateInput}
                value={newReview.visitDate}
                onChangeText={(text) => setNewReview(prev => ({ ...prev, visitDate: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>상세 후기</Text>
              <TextInput
                style={styles.contentInput}
                value={newReview.content}
                onChangeText={(text) => setNewReview(prev => ({ ...prev, content: text }))}
                placeholder="병원에 대한 상세한 후기를 작성해주세요."
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* 로그인 알림 모달 */}
      <Modal
        visible={showLoginAlert}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLoginAlert(false)}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertContainer}>
            <Text style={styles.alertTitle}>로그인이 필요합니다</Text>
            <Text style={styles.alertMessage}>
              리뷰를 작성하려면 먼저 로그인해주세요.
            </Text>
            <View style={styles.alertButtons}>
              <TouchableOpacity
                style={styles.alertCancelButton}
                onPress={() => setShowLoginAlert(false)}
              >
                <Text style={styles.alertCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.alertConfirmButton}
                onPress={() => {
                  setShowLoginAlert(false);
                  navigation.navigate('Login' as never);
                }}
              >
                <Text style={styles.alertConfirmText}>로그인하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  writeButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  writeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  activeSortButton: {
    backgroundColor: '#3B82F6',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  activeSortButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1D4ED8',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  visitDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  reviewActions: {
    alignItems: 'flex-end',
  },
  createdDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 12,
  },
  editButtonText: {
    fontSize: 12,
    color: '#3B82F6',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#EF4444',
  },
  reviewContent: {
    marginBottom: 12,
  },
  reviewText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  keywordTag: {
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  keywordText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    height: 120,
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alertCancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  alertConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  alertCancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  alertConfirmText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default HospitalReview; 