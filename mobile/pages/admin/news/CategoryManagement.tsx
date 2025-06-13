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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  getNewsCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../../../service/newsApi';

// TypeScript 인터페이스 정의
interface Category {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

const CategoryManagement: React.FC = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getNewsCategories();
      setCategories(response);
    } catch (err: any) {
      console.error('카테고리 조회 오류:', err);
      setError('카테고리를 불러오는데 실패했습니다.');
      Alert.alert('오류', '카테고리를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) {
      Alert.alert('알림', '카테고리 이름을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      await createCategory(newCategory.trim());
      setNewCategory('');
      await fetchCategories();
      Alert.alert('성공', '카테고리가 생성되었습니다.');
    } catch (err: any) {
      console.error('카테고리 생성 오류:', err);
      const message = err.response?.data?.message || '카테고리 생성에 실패했습니다.';
      Alert.alert('오류', message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingCategory(category.id);
    setEditCategoryName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditCategoryName('');
  };

  const handleUpdateCategory = async (id: number) => {
    if (!editCategoryName.trim()) {
      Alert.alert('알림', '카테고리 이름을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      await updateCategory(id, editCategoryName.trim());
      setEditingCategory(null);
      setEditCategoryName('');
      await fetchCategories();
      Alert.alert('성공', '카테고리가 수정되었습니다.');
    } catch (err: any) {
      console.error('카테고리 수정 오류:', err);
      const message = err.response?.data?.message || '카테고리 수정에 실패했습니다.';
      Alert.alert('오류', message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = (id: number) => {
    Alert.alert(
      '카테고리 삭제',
      '정말로 이 카테고리를 삭제하시겠습니까?',
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
              setSubmitting(true);
              await deleteCategory(id);
              await fetchCategories();
              Alert.alert('성공', '카테고리가 삭제되었습니다.');
            } catch (err: any) {
              console.error('카테고리 삭제 오류:', err);
              const message = err.response?.data?.message || '카테고리 삭제에 실패했습니다.';
              Alert.alert('오류', message);
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const handleGoBack = () => {
    console.log('관리자 뉴스 페이지로 이동');
    // navigation.navigate('AdminNews');
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
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>카테고리 관리</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 새 카테고리 생성 섹션 */}
        <View style={styles.createSection}>
          <Text style={styles.sectionTitle}>새 카테고리 추가</Text>
          <View style={styles.createForm}>
            <TextInput
              style={styles.categoryInput}
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="새 카테고리 이름을 입력하세요"
              placeholderTextColor="#9CA3AF"
              editable={!submitting}
            />
            <TouchableOpacity
              style={[styles.addButton, submitting && styles.addButtonDisabled]}
              onPress={handleCreateCategory}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.addButtonText}>+</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 카테고리 목록 */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>카테고리 목록 ({categories.length}개)</Text>
          
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
                <Text style={styles.retryButtonText}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          ) : categories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>등록된 카테고리가 없습니다.</Text>
              <Text style={styles.emptySubText}>새 카테고리를 추가해보세요.</Text>
            </View>
          ) : (
            <View style={styles.categoryList}>
              {categories.map((category) => (
                <View key={category.id} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    {editingCategory === category.id ? (
                      <TextInput
                        style={styles.editInput}
                        value={editCategoryName}
                        onChangeText={setEditCategoryName}
                        placeholder="카테고리 이름"
                        placeholderTextColor="#9CA3AF"
                        autoFocus
                        editable={!submitting}
                      />
                    ) : (
                      <Text style={styles.categoryName}>{category.name}</Text>
                    )}
                  </View>
                  
                  <View style={styles.categoryActions}>
                    {editingCategory === category.id ? (
                      <>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.saveButton]}
                          onPress={() => handleUpdateCategory(category.id)}
                          disabled={submitting}
                        >
                          <Text style={styles.saveButtonText}>✔</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.cancelButton]}
                          onPress={handleCancelEdit}
                          disabled={submitting}
                        >
                          <Text style={styles.cancelButtonText}>✗</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.editButton]}
                          onPress={() => handleStartEdit(category)}
                          disabled={submitting}
                        >
                          <Text style={styles.editButtonText}>✏</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.deleteButton]}
                          onPress={() => handleDeleteCategory(category.id)}
                          disabled={submitting}
                        >
                          <Text style={styles.deleteButtonText}>✗</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
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
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  createSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  createForm: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  categoryList: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryInfo: {
    flex: 1,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  editInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#111827',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#F59E0B',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  saveButton: {
    backgroundColor: '#22C55E',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default CategoryManagement; 