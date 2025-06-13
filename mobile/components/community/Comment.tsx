import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Alert,
  Keyboard,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

// TypeScript 인터페이스 정의
interface Hospital {
  id: number;
  name: string;
  address: string;
  ykiho?: string;
}

interface HospitalTag {
  id: number;
  name: string;
  typeId: number;
}

interface HospitalDetail {
  [key: string]: any;
}

interface CommentData {
  id?: number;
  status?: string;
}

interface CommentProps {
  onSubmit: (comment: any) => void;
  boardId: number | string;
  comment?: CommentData;
  placeholder?: string;
}

const Comment: React.FC<CommentProps> = ({ 
  onSubmit, 
  boardId, 
  comment,
  placeholder = '댓글을 입력하세요...'
}) => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const textInputRef = useRef<TextInput>(null);
  
  const [content, setContent] = useState<string>('');
  const [showMention, setShowMention] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<Hospital[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [taggedHospitals, setTaggedHospitals] = useState<HospitalTag[]>([]);
  const [hospitalDetails, setHospitalDetails] = useState<HospitalDetail>({});
  const [showLoginAlert, setShowLoginAlert] = useState<boolean>(false);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isDeleted = comment?.status === 'deleted';

  // 병원 검색 자동완성
  useEffect(() => {
    if (!searchTerm) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await api.get(`/api/comment/autocomplete/search?query=${encodeURIComponent(searchTerm)}`);
        setSuggestions(response.data.hospitals || []);
      } catch (error) {
        console.error('병원 검색 실패:', error);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 병원 상세 정보 가져오기
  const fetchHospitalDetails = async (ykiho: string) => {
    try {
      const response = await api.get(`/api/hospitals/${ykiho}`);
      return response.data;
    } catch (error) {
      console.error('병원 정보 조회 실패:', error);
      return null;
    }
  };

  // 태그된 병원들의 상세 정보 로딩
  useEffect(() => {
    const fetchDetails = async () => {
      const details: HospitalDetail = {};
      for (const hospital of taggedHospitals) {
        if (hospital.id) {
          // ID를 기반으로 병원 정보 조회 로직 추가
          details[hospital.id] = { name: hospital.name };
        }
      }
      setHospitalDetails(details);
    };

    if (taggedHospitals.length > 0) {
      fetchDetails();
    }
  }, [taggedHospitals]);

  // 텍스트 입력 처리
  const handleInput = (value: string) => {
    setContent(value);
    
    // @ 입력 감지
    const lastAtSymbol = value.lastIndexOf('@');
    if (lastAtSymbol !== -1) {
      const textAfterAt = value.substring(lastAtSymbol + 1);
      
      // 스페이스가 없고 @ 이후의 텍스트가 있을 때
      if (!textAfterAt.includes(' ') && textAfterAt.length >= 0) {
        setSearchTerm(textAfterAt);
        setShowMention(true);
        return;
      }
    }
    setShowMention(false);
  };

  // 멘션 병원 선택
  const handleMentionSelect = (hospital: Hospital) => {
    const lastAtSymbol = content.lastIndexOf('@');
    if (lastAtSymbol !== -1) {
      const beforeAt = content.substring(0, lastAtSymbol);
      const afterAt = content.substring(lastAtSymbol);
      const afterSpace = afterAt.indexOf(' ');
      
      const newContent = afterSpace === -1 
        ? `${beforeAt}@${hospital.name} `
        : `${beforeAt}@${hospital.name}${afterAt.substring(afterSpace)}`;
      
      setContent(newContent);
      setShowMention(false);
      
      // 태그된 병원 목록에 추가 (중복 체크)
      if (!taggedHospitals.some(h => h.id === hospital.id)) {
        setTaggedHospitals(prev => [...prev, {
          id: hospital.id,
          name: hospital.name,
          typeId: 1
        }]);
      }
      
      // 텍스트 입력에 포커스 복원
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
    }
  };

  // 태그된 병원 제거
  const removeTaggedHospital = (hospitalId: number) => {
    setTaggedHospitals(prev => prev.filter(h => h.id !== hospitalId));
    
    // 컨텐츠에서도 제거
    const updatedContent = content.replace(new RegExp(`@${taggedHospitals.find(h => h.id === hospitalId)?.name}`, 'g'), '');
    setContent(updatedContent);
  };

  // 댓글 제출
  const handleSubmit = async () => {
    // 로그인 체크
    if (!user) {
      setShowLoginAlert(true);
      return;
    }
    
    // 댓글 내용이 비어있는지 확인
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      Alert.alert('알림', '댓글 내용을 입력해주세요.');
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      Keyboard.dismiss();
      
      // @ 태그된 병원 정보 추출
      const hospitalTags = taggedHospitals.map(hospital => ({
        hospitalId: hospital.id,
        hospitalName: hospital.name
      }));

      const response = await api.post(`/api/boards/${boardId}/comments`, {
        comment: trimmedContent,
        hospitalTags: hospitalTags,
        parentId: comment?.id || null
      });

      if (response.data.success) {
        onSubmit(response.data.comment);
        setContent('');
        setTaggedHospitals([]);
        Alert.alert('성공', '댓글이 작성되었습니다.');
      }
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      Alert.alert('오류', '댓글 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로그인 페이지로 이동
  const handleLoginPress = () => {
    setShowLoginAlert(false);
    navigation.navigate('Login' as never);
  };

  // 멘션 제안 항목 렌더링
  const renderSuggestionItem = ({ item }: { item: Hospital }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleMentionSelect(item)}
    >
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionName}>{item.name}</Text>
        <Text style={styles.suggestionAddress} numberOfLines={1}>{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isDeleted) {
    return (
      <View style={styles.deletedContainer}>
        <Text style={styles.deletedText}>삭제된 댓글입니다</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.commentForm}>
        {/* 사용자 프로필 */}
        <View style={styles.userProfile}>
          {user?.profile_image ? (
            <View style={styles.profileImageContainer}>
              {/* 프로필 이미지 구현 */}
              <View style={[styles.profilePlaceholder, { backgroundColor: '#4F46E5' }]}>
                <Text style={styles.profileInitial}>
                  {user.username?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={[styles.profilePlaceholder, { backgroundColor: '#4F46E5' }]}>
              <Text style={styles.profileInitial}>
                {user?.username?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
        </View>

        {/* 댓글 입력 영역 */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            value={content}
            onChangeText={handleInput}
            onSelectionChange={(event) => {
              setCursorPosition(event.nativeEvent.selection.start);
            }}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={1000}
            textAlignVertical="top"
          />
          
          {/* 태그된 병원 미리보기 */}
          {taggedHospitals.length > 0 && (
            <View style={styles.taggedHospitalsContainer}>
              <Text style={styles.taggedHospitalsLabel}>태그된 병원:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {taggedHospitals.map(hospital => (
                  <View key={hospital.id} style={styles.taggedHospitalItem}>
                    <Text style={styles.taggedHospitalText}>@{hospital.name}</Text>
                    <TouchableOpacity
                      onPress={() => removeTaggedHospital(hospital.id)}
                      style={styles.removeTagButton}
                    >
                      <Icon name="close" size={16} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 제출 버튼 */}
          <View style={styles.actionContainer}>
            <Text style={styles.charCount}>{content.length}/1000</Text>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!content.trim() || isSubmitting) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Text style={styles.submitButtonText}>전송 중...</Text>
              ) : (
                <>
                  <Icon name="send" size={16} color="#FFFFFF" style={styles.submitIcon} />
                  <Text style={styles.submitButtonText}>댓글 작성</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 멘션 제안 모달 */}
      <Modal
        visible={showMention}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMention(false)}
      >
        <TouchableOpacity
          style={styles.mentionOverlay}
          activeOpacity={1}
          onPress={() => setShowMention(false)}
        >
          <View style={styles.mentionModal}>
            <View style={styles.mentionHeader}>
              <Text style={styles.mentionTitle}>병원 검색</Text>
              <TouchableOpacity
                onPress={() => setShowMention(false)}
                style={styles.mentionCloseButton}
              >
                <Icon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.mentionSearchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="병원 이름을 검색하세요..."
              placeholderTextColor="#9CA3AF"
              autoFocus
            />
            
            <FlatList
              data={suggestions}
              renderItem={renderSuggestionItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.suggestionsList}
              ListEmptyComponent={
                <View style={styles.emptySuggestions}>
                  <Text style={styles.emptySuggestionsText}>
                    {searchTerm ? '검색 결과가 없습니다.' : '병원 이름을 입력하세요.'}
                  </Text>
                </View>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 로그인 알림 모달 */}
      <Modal
        visible={showLoginAlert}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLoginAlert(false)}
      >
        <View style={styles.loginAlertOverlay}>
          <View style={styles.loginAlertModal}>
            <Text style={styles.loginAlertTitle}>로그인이 필요합니다</Text>
            <Text style={styles.loginAlertMessage}>
              댓글을 작성하려면 로그인이 필요합니다.
            </Text>
            <View style={styles.loginAlertButtons}>
              <TouchableOpacity
                style={styles.loginAlertCancelButton}
                onPress={() => setShowLoginAlert(false)}
              >
                <Text style={styles.loginAlertCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.loginAlertConfirmButton}
                onPress={handleLoginPress}
              >
                <Text style={styles.loginAlertConfirmText}>로그인</Text>
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
    backgroundColor: '#FFFFFF',
  },
  deletedContainer: {
    padding: 16,
    alignItems: 'center',
  },
  deletedText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  commentForm: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  userProfile: {
    marginTop: 4,
  },
  profileImageContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  profilePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  inputContainer: {
    flex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    minHeight: 80,
    maxHeight: 120,
  },
  taggedHospitalsContainer: {
    marginTop: 8,
  },
  taggedHospitalsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  taggedHospitalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  taggedHospitalText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  removeTagButton: {
    marginLeft: 4,
    padding: 2,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitIcon: {
    marginRight: 4,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mentionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mentionModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '60%',
    overflow: 'hidden',
  },
  mentionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  mentionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  mentionCloseButton: {
    padding: 4,
  },
  mentionSearchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionContent: {},
  suggestionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  suggestionAddress: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptySuggestions: {
    padding: 24,
    alignItems: 'center',
  },
  emptySuggestionsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginAlertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginAlertModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  loginAlertTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  loginAlertMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  loginAlertButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  loginAlertCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  loginAlertCancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  loginAlertConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  loginAlertConfirmText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default Comment; 