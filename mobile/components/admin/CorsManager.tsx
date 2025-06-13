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
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../utils/api';

// TypeScript 인터페이스 정의
interface Origin {
  id: number;
  originUrl: string;
  environment: 'development' | 'staging' | 'production';
  isActive: boolean;
  description: string;
  createdBy?: number;
  updatedBy?: number;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  originUrl: string;
  environment: 'development' | 'staging' | 'production';
  isActive: boolean;
  description: string;
  createdBy?: number;
  updatedBy?: number;
}

const CorsManager: React.FC = () => {
  const navigation = useNavigation();
  const [origins, setOrigins] = useState<Origin[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [editingOrigin, setEditingOrigin] = useState<Origin | null>(null);
  const [formData, setFormData] = useState<FormData>({
    originUrl: '',
    environment: 'development',
    isActive: true,
    description: '',
    createdBy: undefined,
    updatedBy: undefined
  });

  const fetchOrigins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/origins');
      setOrigins(response.data);
    } catch (error: any) {
      console.error('Origin 목록 조회 실패:', error);
      Alert.alert('오류', 'Origin 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrigins();
  }, []);

  const handleOpen = (origin: Origin | null = null) => {
    if (origin) {
      setEditingOrigin(origin);
      setFormData(origin);
    } else {
      setEditingOrigin(null);
      setFormData({
        originUrl: '',
        environment: 'development',
        isActive: true,
        description: '',
        createdBy: undefined,
        updatedBy: undefined
      });
    }
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingOrigin(null);
    setFormData({
      originUrl: '',
      environment: 'development',
      isActive: true,
      description: '',
      createdBy: undefined,
      updatedBy: undefined
    });
  };

  const handleDelete = async (id: number) => {
    const origin = origins.find(origin => origin.id === id);
    setEditingOrigin(origin || null);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!editingOrigin) return;

    try {
      await api.delete(`/api/origins/${editingOrigin.id}/delete`);
      fetchOrigins();
      setDeleteDialogOpen(false);
      Alert.alert('성공', 'Origin이 삭제되었습니다.');
    } catch (error: any) {
      console.error('Origin 삭제 실패:', error);
      Alert.alert('오류', 'Origin 삭제에 실패했습니다.');
    }
  };

  const handleActivate = async (id: number) => {
    const origin = origins.find(origin => origin.id === id);
    setEditingOrigin(origin || null);
    setActivateDialogOpen(true);
  };

  const confirmActivate = async () => {
    if (!editingOrigin) return;

    try {
      await api.put(`/api/origins/${editingOrigin.id}`, {
        ...editingOrigin,
        isActive: true
      });
      fetchOrigins();
      setActivateDialogOpen(false);
      Alert.alert('성공', 'Origin이 활성화되었습니다.');
    } catch (error: any) {
      console.error('Origin 활성화 실패:', error);
      Alert.alert('오류', 'Origin 활성화에 실패했습니다.');
    }
  };

  const handleSubmit = async () => {
    if (!formData.originUrl.trim()) {
      Alert.alert('알림', 'Origin URL을 입력해주세요.');
      return;
    }

    try {
      const submitData = {
        originUrl: formData.originUrl,
        environment: formData.environment,
        isActive: formData.isActive === true,
        description: formData.description
      };

      console.log('Submitting data:', submitData);

      if (editingOrigin) {
        await api.put(`/api/origins/${editingOrigin.id}`, submitData);
      } else {
        await api.post('/api/origins', submitData);
      }
      
      fetchOrigins();
      handleClose();
      Alert.alert('성공', editingOrigin ? 'Origin이 수정되었습니다.' : '새로운 Origin이 추가되었습니다.');
    } catch (error: any) {
      console.error('Origin 저장 실패:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('오류', 'Origin 저장에 실패했습니다.');
    }
  };

  const handleDeactivate = async (id: number) => {
    Alert.alert(
      '확인',
      '이 Origin을 비활성화하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '비활성화',
          onPress: async () => {
            try {
              await api.delete(`/api/origins/${id}`);
              fetchOrigins();
              Alert.alert('성공', 'Origin이 비활성화되었습니다.');
            } catch (error: any) {
              console.error('Origin 비활성화 실패:', error);
              Alert.alert('오류', 'Origin 비활성화에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  const getEnvironmentText = (env: string) => {
    switch (env) {
      case 'development': return '개발';
      case 'staging': return '스테이징';
      case 'production': return '운영';
      default: return env;
    }
  };

  const renderOriginItem = ({ item }: { item: Origin }) => (
    <View style={styles.originCard}>
      <View style={styles.originInfo}>
        <Text style={styles.originUrl}>{item.originUrl}</Text>
        <Text style={styles.originEnv}>{getEnvironmentText(item.environment)}</Text>
        <Text style={[styles.originStatus, item.isActive ? styles.active : styles.inactive]}>
          {item.isActive ? '활성' : '비활성'}
        </Text>
        <Text style={styles.originDescription}>{item.description}</Text>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>생성: {new Date(item.createdAt).toLocaleDateString()}</Text>
          <Text style={styles.dateText}>수정: {new Date(item.updatedAt).toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.originActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleOpen(item)}
        >
          <Text style={styles.actionButtonText}>✏️</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.actionButtonText}>❌</Text>
        </TouchableOpacity>
        
        {item.isActive ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeactivate(item.id)}
          >
            <Text style={styles.actionButtonText}>🚫</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleActivate(item.id)}
          >
            <Text style={styles.actionButtonText}>✅</Text>
          </TouchableOpacity>
        )}
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

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CORS Origin 관리</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => handleOpen()}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Origin 목록 */}
      <FlatList
        data={origins}
        renderItem={renderOriginItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>등록된 Origin이 없습니다</Text>
          </View>
        }
      />

      {/* Origin 추가/수정 모달 */}
      <Modal
        visible={modalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.cancelButton}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingOrigin ? 'Origin 설정 변경' : '새로운 Origin 추가'}
            </Text>
            <TouchableOpacity onPress={handleSubmit}>
              <Text style={styles.saveButton}>
                {editingOrigin ? '변경' : '추가'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Origin URL</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.originUrl}
                  onChangeText={(value) => setFormData({ ...formData, originUrl: value })}
                  placeholder="https://example.com"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>환경</Text>
                <View style={styles.pickerContainer}>
                  {[
                    { value: 'development', label: '개발' },
                    { value: 'staging', label: '스테이징' },
                    { value: 'production', label: '운영' }
                  ].map((env) => (
                    <TouchableOpacity
                      key={env.value}
                      style={[
                        styles.pickerItem,
                        formData.environment === env.value && styles.pickerItemSelected
                      ]}
                      onPress={() => setFormData({ ...formData, environment: env.value as any })}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        formData.environment === env.value && styles.pickerItemTextSelected
                      ]}>
                        {env.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>상태</Text>
                <View style={styles.pickerContainer}>
                  {[
                    { value: true, label: '활성' },
                    { value: false, label: '비활성' }
                  ].map((status) => (
                    <TouchableOpacity
                      key={status.value.toString()}
                      style={[
                        styles.pickerItem,
                        formData.isActive === status.value && styles.pickerItemSelected
                      ]}
                      onPress={() => setFormData({ ...formData, isActive: status.value })}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        formData.isActive === status.value && styles.pickerItemTextSelected
                      ]}>
                        {status.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>설명</Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.description}
                  onChangeText={(value) => setFormData({ ...formData, description: value })}
                  placeholder="Origin에 대한 설명을 입력하세요"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        visible={deleteDialogOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteDialogOpen(false)}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogContainer}>
            <Text style={styles.dialogTitle}>Origin 삭제</Text>
            <Text style={styles.dialogMessage}>
              정말로 이 Origin을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.dialogCancelButton}
                onPress={() => setDeleteDialogOpen(false)}
              >
                <Text style={styles.dialogCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dialogDeleteButton}
                onPress={confirmDelete}
              >
                <Text style={styles.dialogDeleteText}>삭제</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 활성화 확인 모달 */}
      <Modal
        visible={activateDialogOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setActivateDialogOpen(false)}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogContainer}>
            <Text style={styles.dialogTitle}>Origin 활성화</Text>
            <Text style={styles.dialogMessage}>
              이 Origin을 활성화하시겠습니까? 활성화된 Origin은 CORS 설정에 포함됩니다.
            </Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.dialogCancelButton}
                onPress={() => setActivateDialogOpen(false)}
              >
                <Text style={styles.dialogCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dialogActivateButton}
                onPress={confirmActivate}
              >
                <Text style={styles.dialogActivateText}>활성화</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  backButtonText: {
    fontSize: 24,
    color: '#111827',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  originCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  originInfo: {
    flex: 1,
    marginRight: 12,
  },
  originUrl: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  originEnv: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  originStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  active: {
    color: '#10B981',
  },
  inactive: {
    color: '#6B7280',
  },
  originDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  dateContainer: {
    gap: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  originActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  actionButtonText: {
    fontSize: 20,
    color: '#111827',
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
  saveButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemSelected: {
    backgroundColor: '#EBF8FF',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#111827',
  },
  pickerItemTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  dialogMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  dialogCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dialogCancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  dialogDeleteButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  dialogDeleteText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dialogActivateButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  dialogActivateText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default CorsManager; 