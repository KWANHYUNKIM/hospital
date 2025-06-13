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
  Image,
  Modal,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { format } from 'date-fns';
import { getApiUrl } from '../../utils/api';

// TypeScript 인터페이스 정의
interface Announcement {
  id: number;
  title: string;
  content: string;
  image_url: string;
  link_url: string;
  startDate: string;
  endDate: string;
  priority: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface FormData {
  title: string;
  content: string;
  image_url: string;
  link_url: string;
  start_date: string;
  end_date: string;
  priority: number;
  is_active: boolean;
}

const AnnouncementManagementPage: React.FC = () => {
  const navigation = useNavigation();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    image_url: '',
    link_url: '',
    start_date: '',
    end_date: '',
    priority: 0,
    is_active: true
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${getApiUrl()}/api/announcements`, { withCredentials: true });
      setAnnouncements(response.data);
    } catch (error: any) {
      console.error('공지사항 목록 조회 실패:', error);
      Alert.alert('오류', '공지사항 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
    setPreviewUrl(url);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      
      const submitData = {
        title: formData.title,
        content: formData.content,
        linkUrl: formData.link_url,
        startDate: formData.start_date ? format(new Date(formData.start_date), 'yyyy-MM-dd HH:mm:ss') : format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        endDate: formData.end_date ? format(new Date(formData.end_date), 'yyyy-MM-dd HH:mm:ss') : format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd HH:mm:ss'),
        priority: formData.priority || 0,
        isActive: formData.is_active,
        imageUrl: formData.image_url
      };

      if (selectedAnnouncement) {
        await axios.put(
          `${getApiUrl()}/api/announcements/${selectedAnnouncement.id}`, 
          submitData,
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${getApiUrl()}/api/announcements`, 
          submitData,
          { withCredentials: true }
        );
      }

      setIsModalOpen(false);
      setSelectedAnnouncement(null);
      resetForm();
      fetchAnnouncements();
      Alert.alert('성공', selectedAnnouncement ? '공지사항이 수정되었습니다.' : '공지사항이 등록되었습니다.');
    } catch (error: any) {
      console.error('공지사항 저장 실패:', error);
      Alert.alert('오류', '공지사항 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content || '',
      image_url: announcement.image_url || '',
      link_url: announcement.link_url || '',
      start_date: announcement.startDate ? format(new Date(announcement.startDate), 'yyyy-MM-dd\'T\'HH:mm') : '',
      end_date: announcement.endDate ? format(new Date(announcement.endDate), 'yyyy-MM-dd\'T\'HH:mm') : '',
      priority: announcement.priority || 0,
      is_active: announcement.isActive
    });
    if (announcement.image_url) {
      setPreviewUrl(announcement.image_url);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      '공지사항 삭제',
      '정말 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${getApiUrl()}/api/announcements/${id}`, { withCredentials: true });
              fetchAnnouncements();
              Alert.alert('성공', '공지사항이 삭제되었습니다.');
            } catch (error: any) {
              console.error('공지사항 삭제 실패:', error);
              Alert.alert('오류', '공지사항 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      image_url: '',
      link_url: '',
      start_date: '',
      end_date: '',
      priority: 0,
      is_active: true
    });
    setPreviewUrl('');
  };

  const handleAddNew = () => {
    setSelectedAnnouncement(null);
    resetForm();
    setIsModalOpen(true);
  };

  const togglePreview = () => {
    setIsPreviewOpen(!isPreviewOpen);
  };

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
        <Text style={styles.headerTitle}>공지사항 관리</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
          <Icon name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 공지사항 목록 */}
        <View style={styles.listContainer}>
          {announcements.map((announcement) => (
            <View key={announcement.id} style={styles.announcementCard}>
              <View style={styles.cardContent}>
                {announcement.image_url ? (
                  <Image
                    source={{ uri: announcement.image_url }}
                    style={styles.announcementImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Icon name="image" size={32} color="#9CA3AF" />
                  </View>
                )}
                
                <View style={styles.announcementInfo}>
                  <Text style={styles.announcementTitle} numberOfLines={2}>
                    {announcement.title}
                  </Text>
                  
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>
                      {announcement.startDate ? format(new Date(announcement.startDate), 'yyyy-MM-dd') : ''} ~{' '}
                      {announcement.endDate ? format(new Date(announcement.endDate), 'yyyy-MM-dd') : ''}
                    </Text>
                  </View>
                  
                  <View style={styles.statusContainer}>
                    <View style={[
                      styles.statusBadge,
                      announcement.isActive ? styles.activeBadge : styles.inactiveBadge
                    ]}>
                      <Text style={[
                        styles.statusText,
                        announcement.isActive ? styles.activeText : styles.inactiveText
                      ]}>
                        {announcement.isActive ? '활성' : '비활성'}
                      </Text>
                    </View>
                    <Text style={styles.priorityText}>우선순위: {announcement.priority}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(announcement)}
                >
                  <Icon name="edit" size={20} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(announcement.id)}
                >
                  <Icon name="delete" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 공지사항 등록/수정 모달 */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsModalOpen(false)}>
              <Text style={styles.cancelButton}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedAnnouncement ? '공지사항 수정' : '새 공지사항 등록'}
            </Text>
            <TouchableOpacity onPress={togglePreview}>
              <Icon name="visibility" size={24} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formContainer}>
              {/* 제목 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>제목</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.title}
                  onChangeText={(value) => setFormData({...formData, title: value})}
                  placeholder="공지사항 제목을 입력하세요"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* 이미지 URL */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>배너 이미지 URL</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.image_url}
                  onChangeText={handleImageUrlChange}
                  placeholder="이미지 URL을 입력하세요"
                  placeholderTextColor="#9CA3AF"
                />
                {previewUrl ? (
                  <Image
                    source={{ uri: previewUrl }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                ) : null}
              </View>

              {/* 내용 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>내용</Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.content}
                  onChangeText={(value) => setFormData({...formData, content: value})}
                  placeholder="공지사항 내용을 입력하세요"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* 링크 URL */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>링크 URL</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.link_url}
                  onChangeText={(value) => setFormData({...formData, link_url: value})}
                  placeholder="/events/spring2024"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* 날짜 설정 */}
              <View style={styles.dateContainer}>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.inputLabel}>시작일</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.start_date}
                    onChangeText={(value) => setFormData({...formData, start_date: value})}
                    placeholder="YYYY-MM-DDTHH:MM"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.inputLabel}>종료일</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.end_date}
                    onChangeText={(value) => setFormData({...formData, end_date: value})}
                    placeholder="YYYY-MM-DDTHH:MM"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* 우선순위 및 상태 */}
              <View style={styles.settingsContainer}>
                <View style={styles.priorityContainer}>
                  <Text style={styles.inputLabel}>우선순위</Text>
                  <TextInput
                    style={styles.priorityInput}
                    value={formData.priority.toString()}
                    onChangeText={(value) => setFormData({...formData, priority: parseInt(value) || 0})}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.statusContainer}>
                  <Text style={styles.inputLabel}>활성 상태</Text>
                  <Switch
                    value={formData.is_active}
                    onValueChange={(value) => setFormData({...formData, is_active: value})}
                    trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                    thumbColor={formData.is_active ? "#FFFFFF" : "#9CA3AF"}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {selectedAnnouncement ? '수정' : '등록'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* 미리보기 모달 */}
          {isPreviewOpen && (
            <Modal
              visible={isPreviewOpen}
              animationType="fade"
              transparent={true}
              onRequestClose={togglePreview}
            >
              <View style={styles.previewOverlay}>
                <View style={styles.previewContainer}>
                  <TouchableOpacity style={styles.previewCloseButton} onPress={togglePreview}>
                    <Icon name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                  
                  <View style={styles.previewContent}>
                    {previewUrl ? (
                      <Image
                        source={{ uri: previewUrl }}
                        style={styles.previewImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.previewPlaceholder}>
                        <Text style={styles.previewPlaceholderText}>이미지 없음</Text>
                      </View>
                    )}
                    
                    <View style={styles.previewTextContainer}>
                      <Text style={styles.previewTitle}>{formData.title}</Text>
                      <Text style={styles.previewContentText}>{formData.content}</Text>
                    </View>
                    
                    <View style={styles.previewButtonContainer}>
                      <TouchableOpacity style={styles.previewButton}>
                        <Text style={styles.previewButtonText}>오늘 하루 닫기</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.previewButton}>
                        <Text style={styles.previewButtonText}>닫기</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </Modal>
          )}
        </SafeAreaView>
      </Modal>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingTop: 16,
  },
  announcementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
  },
  announcementImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderImage: {
    width: 80,
    height: 60,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  announcementInfo: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  dateContainer: {
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#065F46',
  },
  inactiveText: {
    color: '#6B7280',
  },
  priorityText: {
    fontSize: 12,
    color: '#6B7280',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 12,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  bottomSpacing: {
    height: 32,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formContainer: {
    paddingTop: 16,
  },
  inputContainer: {
    marginBottom: 20,
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 12,
  },
  dateInputContainer: {
    flex: 1,
  },
  settingsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  priorityContainer: {
    flex: 1,
  },
  priorityInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
    zIndex: 1,
  },
  previewContent: {
    width: '100%',
  },
  previewImage: {
    width: '100%',
    height: 300,
  },
  previewPlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewPlaceholderText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  previewTextContainer: {
    padding: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  previewContentText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  previewButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  previewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  previewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default AnnouncementManagementPage; 