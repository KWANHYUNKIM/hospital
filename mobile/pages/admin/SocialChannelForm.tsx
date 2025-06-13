import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { getApiUrl } from '../../utils/api';

// TypeScript 인터페이스 정의
interface SocialChannel {
  id?: number;
  name: string;
  description: string;
  platform: string;
  url: string;
  category: string;
  subscriber_count: number;
  average_views: number;
  is_active: boolean;
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  tags: string[];
  contact_email?: string;
  contact_phone?: string;
  admin_notes?: string;
}

interface FormData {
  name: string;
  description: string;
  platform: string;
  url: string;
  category: string;
  subscriber_count: string;
  average_views: string;
  is_active: boolean;
  verification_status: string;
  tags: string[];
  contact_email: string;
  contact_phone: string;
  admin_notes: string;
}

interface RouteParams {
  id?: string;
}

const PLATFORMS = [
  { value: 'YouTube', label: 'YouTube', icon: 'play-circle-filled' },
  { value: 'Twitch', label: 'Twitch', icon: 'videocam' },
  { value: 'Instagram', label: 'Instagram', icon: 'photo-camera' },
  { value: 'TikTok', label: 'TikTok', icon: 'music-note' },
  { value: 'Facebook', label: 'Facebook', icon: 'facebook' },
  { value: 'Twitter', label: 'Twitter', icon: 'alternate-email' },
  { value: 'Discord', label: 'Discord', icon: 'chat' },
  { value: 'Other', label: '기타', icon: 'public' },
];

const CATEGORIES = [
  '의료/건강',
  '교육',
  '엔터테인먼트',
  '뉴스/미디어',
  '기술/IT',
  '라이프스타일',
  '스포츠',
  '음악',
  '게임',
  '기타'
];

const VERIFICATION_STATUS = [
  { value: 'PENDING', label: '대기중', color: '#F59E0B' },
  { value: 'VERIFIED', label: '인증됨', color: '#10B981' },
  { value: 'REJECTED', label: '거부됨', color: '#EF4444' },
];

const SocialChannelForm: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as RouteParams;
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [platformModalVisible, setPlatformModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    platform: '',
    url: '',
    category: '',
    subscriber_count: '',
    average_views: '',
    is_active: true,
    verification_status: 'PENDING',
    tags: [],
    contact_email: '',
    contact_phone: '',
    admin_notes: ''
  });

  useEffect(() => {
    if (id) {
      fetchChannelData();
    }
  }, [id]);

  const fetchChannelData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${getApiUrl()}/api/admin/social-channels/${id}`,
        { withCredentials: true }
      );
      
      const data: SocialChannel = response.data;
      setFormData({
        name: data.name,
        description: data.description,
        platform: data.platform,
        url: data.url,
        category: data.category,
        subscriber_count: data.subscriber_count.toString(),
        average_views: data.average_views.toString(),
        is_active: data.is_active,
        verification_status: data.verification_status,
        tags: data.tags || [],
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        admin_notes: data.admin_notes || ''
      });
    } catch (err: any) {
      console.error('채널 데이터 로딩 실패:', err);
      Alert.alert('오류', '채널 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('알림', '채널명을 입력해주세요.');
      return false;
    }
    
    if (!formData.platform) {
      Alert.alert('알림', '플랫폼을 선택해주세요.');
      return false;
    }
    
    if (!formData.url.trim()) {
      Alert.alert('알림', 'URL을 입력해주세요.');
      return false;
    }
    
    if (!formData.category) {
      Alert.alert('알림', '카테고리를 선택해주세요.');
      return false;
    }

    // URL 형식 검증
    try {
      new URL(formData.url);
    } catch {
      Alert.alert('알림', '올바른 URL 형식을 입력해주세요.');
      return false;
    }

    // 이메일 형식 검증 (선택사항)
    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      Alert.alert('알림', '올바른 이메일 형식을 입력해주세요.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const submitData: Partial<SocialChannel> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        platform: formData.platform,
        url: formData.url.trim(),
        category: formData.category,
        subscriber_count: parseInt(formData.subscriber_count) || 0,
        average_views: parseInt(formData.average_views) || 0,
        is_active: formData.is_active,
        verification_status: formData.verification_status as 'PENDING' | 'VERIFIED' | 'REJECTED',
        tags: formData.tags,
        contact_email: formData.contact_email.trim() || undefined,
        contact_phone: formData.contact_phone.trim() || undefined,
        admin_notes: formData.admin_notes.trim() || undefined
      };

      if (id) {
        await axios.put(
          `${getApiUrl()}/api/admin/social-channels/${id}`,
          submitData,
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${getApiUrl()}/api/admin/social-channels`,
          submitData,
          { withCredentials: true }
        );
      }

      Alert.alert(
        '성공',
        id ? '채널이 수정되었습니다.' : '새로운 채널이 등록되었습니다.',
        [
          {
            text: '확인',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (err: any) {
      console.error('채널 저장 실패:', err);
      Alert.alert('오류', '채널 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderPlatformModal = () => (
    <Modal
      visible={platformModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setPlatformModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>플랫폼 선택</Text>
            <TouchableOpacity onPress={() => setPlatformModalVisible(false)}>
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {PLATFORMS.map((platform) => (
              <TouchableOpacity
                key={platform.value}
                style={[
                  styles.modalItem,
                  formData.platform === platform.value && styles.modalItemSelected
                ]}
                onPress={() => {
                  handleInputChange('platform', platform.value);
                  setPlatformModalVisible(false);
                }}
              >
                <Icon name={platform.icon} size={20} color="#6B7280" />
                <Text style={styles.modalItemText}>{platform.label}</Text>
                {formData.platform === platform.value && (
                  <Icon name="check" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderCategoryModal = () => (
    <Modal
      visible={categoryModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setCategoryModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>카테고리 선택</Text>
            <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.modalItem,
                  formData.category === category && styles.modalItemSelected
                ]}
                onPress={() => {
                  handleInputChange('category', category);
                  setCategoryModalVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>{category}</Text>
                {formData.category === category && (
                  <Icon name="check" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderStatusModal = () => (
    <Modal
      visible={statusModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setStatusModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>인증 상태 선택</Text>
            <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
              <Icon name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {VERIFICATION_STATUS.map((status) => (
              <TouchableOpacity
                key={status.value}
                style={[
                  styles.modalItem,
                  formData.verification_status === status.value && styles.modalItemSelected
                ]}
                onPress={() => {
                  handleInputChange('verification_status', status.value);
                  setStatusModalVisible(false);
                }}
              >
                <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                <Text style={styles.modalItemText}>{status.label}</Text>
                {formData.verification_status === status.value && (
                  <Icon name="check" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {id ? '채널 수정' : '새 채널 등록'}
        </Text>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>저장</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* 기본 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>기본 정보</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>채널명 *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="채널명을 입력하세요"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>설명</Text>
              <TextInput
                style={styles.textArea}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="채널에 대한 설명을 입력하세요"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>플랫폼 *</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setPlatformModalVisible(true)}
              >
                <Text style={[
                  styles.selectText,
                  !formData.platform && styles.selectPlaceholder
                ]}>
                  {formData.platform || '플랫폼을 선택하세요'}
                </Text>
                <Icon name="keyboard-arrow-down" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>URL *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.url}
                onChangeText={(value) => handleInputChange('url', value)}
                placeholder="https://..."
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>카테고리 *</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setCategoryModalVisible(true)}
              >
                <Text style={[
                  styles.selectText,
                  !formData.category && styles.selectPlaceholder
                ]}>
                  {formData.category || '카테고리를 선택하세요'}
                </Text>
                <Icon name="keyboard-arrow-down" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 통계 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>통계 정보</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>구독자 수</Text>
              <TextInput
                style={styles.textInput}
                value={formData.subscriber_count}
                onChangeText={(value) => handleInputChange('subscriber_count', value)}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>평균 조회수</Text>
              <TextInput
                style={styles.textInput}
                value={formData.average_views}
                onChangeText={(value) => handleInputChange('average_views', value)}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* 태그 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>태그</Text>
            
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                value={newTag}
                onChangeText={setNewTag}
                placeholder="태그를 입력하고 추가 버튼을 누르세요"
                placeholderTextColor="#9CA3AF"
                onSubmitEditing={addTag}
              />
              <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                <Icon name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {formData.tags.length > 0 && (
              <View style={styles.tagsList}>
                {formData.tags.map((tag, index) => (
                  <View key={index} style={styles.tagItem}>
                    <Text style={styles.tagText}>{tag}</Text>
                    <TouchableOpacity onPress={() => removeTag(tag)}>
                      <Icon name="close" size={16} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* 연락처 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>연락처 정보</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>이메일</Text>
              <TextInput
                style={styles.textInput}
                value={formData.contact_email}
                onChangeText={(value) => handleInputChange('contact_email', value)}
                placeholder="contact@example.com"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>전화번호</Text>
              <TextInput
                style={styles.textInput}
                value={formData.contact_phone}
                onChangeText={(value) => handleInputChange('contact_phone', value)}
                placeholder="010-0000-0000"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* 관리 설정 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>관리 설정</Text>
            
            <View style={styles.switchContainer}>
              <Text style={styles.inputLabel}>활성화 상태</Text>
              <Switch
                value={formData.is_active}
                onValueChange={(value) => handleInputChange('is_active', value)}
                trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                thumbColor={formData.is_active ? "#FFFFFF" : "#9CA3AF"}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>인증 상태</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setStatusModalVisible(true)}
              >
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: VERIFICATION_STATUS.find(s => s.value === formData.verification_status)?.color || '#6B7280' }
                  ]} />
                  <Text style={styles.selectText}>
                    {VERIFICATION_STATUS.find(s => s.value === formData.verification_status)?.label || '상태 선택'}
                  </Text>
                </View>
                <Icon name="keyboard-arrow-down" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>관리자 메모</Text>
              <TextInput
                style={styles.textArea}
                value={formData.admin_notes}
                onChangeText={(value) => handleInputChange('admin_notes', value)}
                placeholder="관리자 전용 메모를 입력하세요"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {renderPlatformModal()}
      {renderCategoryModal()}
      {renderStatusModal()}
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
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selectInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
    color: '#111827',
  },
  selectPlaceholder: {
    color: '#9CA3AF',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  addTagButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagItem: {
    backgroundColor: '#EBF8FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#1E40AF',
  },
  bottomSpacing: {
    height: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalContent: {
    paddingHorizontal: 20,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  modalItemSelected: {
    backgroundColor: '#F8FAFC',
  },
  modalItemText: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
});

export default SocialChannelForm; 