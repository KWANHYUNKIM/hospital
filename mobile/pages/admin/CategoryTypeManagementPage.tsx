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
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { getApiUrl } from '../../utils/api';

// TypeScript 인터페이스 정의
interface CategoryType {
  id: number;
  type_name: string;
  type_code: string;
  description: string;
  order_sequence: number;
  is_active: boolean;
}

interface FormData {
  type_name: string;
  type_code: string;
  description: string;
  order_sequence: number;
  is_active: boolean;
}

const CategoryTypeManagementPage: React.FC = () => {
  const navigation = useNavigation();
  const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<CategoryType | null>(null);
  const [formData, setFormData] = useState<FormData>({
    type_name: '',
    type_code: '',
    description: '',
    order_sequence: 1,
    is_active: true
  });

  const fetchCategoryTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${getApiUrl()}/api/boards/category-types/admin`, { withCredentials: true });
      setCategoryTypes(response.data);
    } catch (error: any) {
      console.error('카테고리 타입 목록 조회 실패:', error);
      Alert.alert('오류', '카테고리 타입 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryTypes();
  }, []);

  const handleOpen = (type: CategoryType | null = null) => {
    if (type) {
      setEditingType(type);
      setFormData({
        type_name: type.type_name,
        type_code: type.type_code,
        description: type.description,
        order_sequence: type.order_sequence,
        is_active: type.is_active
      });
    } else {
      setEditingType(null);
      setFormData({
        type_name: '',
        type_code: '',
        description: '',
        order_sequence: 1,
        is_active: true
      });
    }
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingType(null);
    setFormData({
      type_name: '',
      type_code: '',
      description: '',
      order_sequence: 1,
      is_active: true
    });
  };

  const handleDelete = async (id: number) => {
    const type = categoryTypes.find(t => t.id === id);
    setEditingType(type || null);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!editingType) return;

    try {
      setSubmitting(true);
      await axios.delete(`${getApiUrl()}/api/boards/category-types/${editingType.id}`, { withCredentials: true });
      fetchCategoryTypes();
      setDeleteDialogOpen(false);
      Alert.alert('성공', '카테고리 타입이 삭제되었습니다.');
    } catch (error: any) {
      console.error('카테고리 타입 삭제 실패:', error);
      Alert.alert('오류', '카테고리 타입 삭제에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.type_name.trim()) {
      Alert.alert('알림', '타입 이름을 입력해주세요.');
      return;
    }

    if (!formData.type_code.trim()) {
      Alert.alert('알림', '타입 코드를 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);

      if (editingType) {
        await axios.put(
          `${getApiUrl()}/api/boards/category-types/${editingType.id}`,
          formData,
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${getApiUrl()}/api/boards/category-types`,
          formData,
          { withCredentials: true }
        );
      }
      fetchCategoryTypes();
      handleClose();
      Alert.alert('성공', editingType ? '카테고리 타입이 수정되었습니다.' : '새로운 카테고리 타입이 추가되었습니다.');
    } catch (error: any) {
      console.error('카테고리 타입 저장 실패:', error);
      Alert.alert('오류', '카테고리 타입 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
        <Text style={styles.headerTitle}>카테고리 타입 관리</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => handleOpen()}>
          <Icon name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 카테고리 타입 목록 */}
        <View style={styles.listContainer}>
          {categoryTypes.map((type) => (
            <View key={type.id} style={styles.typeCard}>
              <View style={styles.typeInfo}>
                <View style={styles.typeHeader}>
                  <Text style={styles.typeName}>{type.type_name}</Text>
                  <View style={[
                    styles.statusBadge,
                    type.is_active ? styles.activeBadge : styles.inactiveBadge
                  ]}>
                    <Text style={[
                      styles.statusText,
                      type.is_active ? styles.activeText : styles.inactiveText
                    ]}>
                      {type.is_active ? '활성' : '비활성'}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.typeCode}>코드: {type.type_code}</Text>
                <Text style={styles.typeDescription}>{type.description}</Text>
                
                <Text style={styles.typeOrder}>순서: {type.order_sequence}</Text>
              </View>
              
              <View style={styles.typeActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleOpen(type)}
                >
                  <Icon name="edit" size={20} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(type.id)}
                >
                  <Icon name="delete" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 카테고리 타입 추가/수정 모달 */}
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
              {editingType ? '카테고리 타입 수정' : '새로운 카테고리 타입 추가'}
            </Text>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              style={[styles.saveButton, submitting && styles.saveButtonDisabled]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {editingType ? '수정' : '추가'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formContainer}>
              {/* 타입 이름 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>타입 이름</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.type_name}
                  onChangeText={(value) => handleChange('type_name', value)}
                  placeholder="타입 이름을 입력하세요"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* 타입 코드 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>타입 코드</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.type_code}
                  onChangeText={(value) => handleChange('type_code', value)}
                  placeholder="타입 코드를 입력하세요"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                />
              </View>

              {/* 설명 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>설명</Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.description}
                  onChangeText={(value) => handleChange('description', value)}
                  placeholder="타입 설명을 입력하세요"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* 순서 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>순서</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.order_sequence.toString()}
                  onChangeText={(value) => handleChange('order_sequence', parseInt(value) || 1)}
                  placeholder="순서를 입력하세요"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>

              {/* 활성화 상태 */}
              <View style={styles.switchContainer}>
                <Text style={styles.inputLabel}>활성화</Text>
                <Switch
                  value={formData.is_active}
                  onValueChange={(value) => handleChange('is_active', value)}
                  trackColor={{ false: "#E5E7EB", true: "#3B82F6" }}
                  thumbColor={formData.is_active ? "#FFFFFF" : "#9CA3AF"}
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 삭제 확인 다이얼로그 */}
      <Modal
        visible={deleteDialogOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteDialogOpen(false)}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogContainer}>
            <Text style={styles.dialogTitle}>카테고리 타입 삭제</Text>
            <Text style={styles.dialogMessage}>
              이 카테고리 타입을 삭제하시겠습니까? 삭제된 카테고리 타입은 복구할 수 없습니다.
            </Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.dialogCancelButton}
                onPress={() => setDeleteDialogOpen(false)}
              >
                <Text style={styles.dialogCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogDeleteButton, submitting && styles.dialogDeleteButtonDisabled]}
                onPress={confirmDelete}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.dialogDeleteText}>삭제</Text>
                )}
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
  typeCard: {
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
    alignItems: 'flex-start',
  },
  typeInfo: {
    flex: 1,
    marginRight: 12,
  },
  typeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
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
  typeCode: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  typeOrder: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  typeActions: {
    flexDirection: 'row',
    gap: 8,
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    minWidth: 60,
    alignItems: 'center',
  },
  dialogDeleteButtonDisabled: {
    opacity: 0.5,
  },
  dialogDeleteText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default CategoryTypeManagementPage; 