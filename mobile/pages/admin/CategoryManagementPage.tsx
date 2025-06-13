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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { getApiUrl } from '../../utils/api';

// TypeScript 인터페이스 정의
interface Category {
  id: number;
  category_name: string;
  description: string;
  parent_id: number | null;
  category_type_id: number;
  order_sequence: number;
  path: string;
}

interface CategoryType {
  id: number;
  type_name: string;
}

interface FormData {
  category_name: string;
  description: string;
  parent_id: number | null;
  category_type_id: number | string;
  order_sequence: number;
  path: string;
}

const CategoryManagementPage: React.FC = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<FormData>({
    category_name: '',
    description: '',
    parent_id: null,
    category_type_id: '',
    order_sequence: 0,
    path: ''
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${getApiUrl()}/api/boards/categories`, { withCredentials: true });
      setCategories(response.data);
    } catch (error: any) {
      console.error('카테고리 목록 조회 실패:', error);
      Alert.alert('오류', '카테고리 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryTypes = async () => {
    try {
      const response = await axios.get(`${getApiUrl()}/api/boards/category-types`, { withCredentials: true });
      setCategoryTypes(response.data);
    } catch (error: any) {
      console.error('카테고리 타입 목록 조회 실패:', error);
      Alert.alert('오류', '카테고리 타입 목록을 불러오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCategoryTypes();
  }, []);

  const handleOpen = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        category_name: category.category_name,
        description: category.description,
        parent_id: category.parent_id,
        category_type_id: category.category_type_id,
        order_sequence: category.order_sequence,
        path: category.path
      });
    } else {
      setEditingCategory(null);
      setFormData({
        category_name: '',
        description: '',
        parent_id: null,
        category_type_id: '',
        order_sequence: 0,
        path: ''
      });
    }
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setFormData({
      category_name: '',
      description: '',
      parent_id: null,
      category_type_id: '',
      order_sequence: 0,
      path: ''
    });
  };

  const handleDelete = async (id: number) => {
    const category = categories.find(cat => cat.id === id);
    setEditingCategory(category || null);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!editingCategory) return;

    try {
      setSubmitting(true);
      await axios.delete(`${getApiUrl()}/api/boards/categories/${editingCategory.id}`, { withCredentials: true });
      fetchCategories();
      setDeleteDialogOpen(false);
      Alert.alert('성공', '카테고리가 삭제되었습니다.');
    } catch (error: any) {
      console.error('카테고리 삭제 실패:', error);
      Alert.alert('오류', '카테고리 삭제에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.category_name.trim()) {
      Alert.alert('알림', '카테고리 이름을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      const requestData = {
        name: formData.category_name,
        description: formData.description,
        typeId: formData.category_type_id,
        parentId: formData.parent_id || null,
        orderSequence: formData.order_sequence,
        allowComments: true,
        isSecretDefault: false,
        isActive: true,
        config: null
      };

      if (editingCategory) {
        await axios.put(
          `${getApiUrl()}/api/boards/categories/${editingCategory.id}`,
          requestData,
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${getApiUrl()}/api/boards/categories`,
          requestData,
          { withCredentials: true }
        );
      }
      fetchCategories();
      handleClose();
      Alert.alert('성공', editingCategory ? '카테고리가 수정되었습니다.' : '새로운 카테고리가 추가되었습니다.');
    } catch (error: any) {
      console.error('카테고리 저장 실패:', error);
      Alert.alert('오류', '카테고리 저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string | number) => {
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
        <Text style={styles.headerTitle}>카테고리 관리</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => handleOpen()}>
          <Icon name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 카테고리 목록 */}
        <View style={styles.listContainer}>
          {categories.map((category) => (
            <View key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.category_name}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
                
                <View style={styles.metaContainer}>
                  <Text style={styles.metaText}>
                    타입: {categoryTypes.find(type => type.id === category.category_type_id)?.type_name || '없음'}
                  </Text>
                  <Text style={styles.metaText}>
                    상위: {category.parent_id ? 
                      categories.find(c => c.id === category.parent_id)?.category_name : 
                      '없음'}
                  </Text>
                  <Text style={styles.metaText}>순서: {category.order_sequence}</Text>
                </View>
              </View>
              
              <View style={styles.categoryActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleOpen(category)}
                >
                  <Icon name="edit" size={20} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(category.id)}
                >
                  <Icon name="delete" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 카테고리 추가/수정 모달 */}
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
              {editingCategory ? '카테고리 수정' : '새로운 카테고리 추가'}
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
                  {editingCategory ? '수정' : '추가'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formContainer}>
              {/* 카테고리 이름 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>카테고리 이름</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.category_name}
                  onChangeText={(value) => handleChange('category_name', value)}
                  placeholder="카테고리 이름을 입력하세요"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* 설명 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>설명</Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.description}
                  onChangeText={(value) => handleChange('description', value)}
                  placeholder="카테고리 설명을 입력하세요"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* 카테고리 타입 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>카테고리 타입</Text>
                <View style={styles.pickerContainer}>
                  {categoryTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.pickerItem,
                        formData.category_type_id === type.id && styles.pickerItemSelected
                      ]}
                      onPress={() => handleChange('category_type_id', type.id)}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        formData.category_type_id === type.id && styles.pickerItemTextSelected
                      ]}>
                        {type.type_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 상위 카테고리 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>상위 카테고리</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={[
                      styles.pickerItem,
                      formData.parent_id === null && styles.pickerItemSelected
                    ]}
                    onPress={() => handleChange('parent_id', null)}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      formData.parent_id === null && styles.pickerItemTextSelected
                    ]}>
                      없음
                    </Text>
                  </TouchableOpacity>
                  {categories
                    .filter(category => category.id !== editingCategory?.id)
                    .map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.pickerItem,
                          formData.parent_id === category.id && styles.pickerItemSelected
                        ]}
                        onPress={() => handleChange('parent_id', category.id)}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          formData.parent_id === category.id && styles.pickerItemTextSelected
                        ]}>
                          {category.category_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>

              {/* 순서 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>순서</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.order_sequence.toString()}
                  onChangeText={(value) => handleChange('order_sequence', parseInt(value) || 0)}
                  placeholder="순서를 입력하세요"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>

              {/* 경로 */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>경로</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.path}
                  onChangeText={(value) => handleChange('path', value)}
                  placeholder="/hospital/notice"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.helperText}>
                  카테고리의 URL 경로를 입력하세요 (예: /hospital/notice)
                </Text>
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
            <Text style={styles.dialogTitle}>카테고리 삭제</Text>
            <Text style={styles.dialogMessage}>
              이 카테고리를 삭제하시겠습니까? 삭제된 카테고리는 복구할 수 없습니다.
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
  categoryCard: {
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
  categoryInfo: {
    flex: 1,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  metaContainer: {
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  categoryActions: {
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
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
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

export default CategoryManagementPage; 