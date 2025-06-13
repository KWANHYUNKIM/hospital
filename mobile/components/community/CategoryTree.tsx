import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { api } from '../../utils/api';

// TypeScript 인터페이스 정의
interface CategoryType {
  id: number;
  type_name: string;
  description?: string;
}

interface Category {
  id: number;
  category_name: string;
  category_type_id: number;
  description?: string;
}

interface CategoryTreeProps {
  onSelectCategory?: (categoryId: number | null) => void;
  selectedCategoryId?: number | null;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface LoadingState {
  types: boolean;
  categories: boolean;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({ 
  onSelectCategory,
  selectedCategoryId = null,
  isCollapsed = false,
  onToggleCollapse 
}) => {
  const navigation = useNavigation();
  const [categoryTypes, setCategoryTypes] = useState<CategoryType[]>([]);
  const [currentCategories, setCurrentCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    types: true,
    categories: false
  });
  const [error, setError] = useState<string | null>(null);

  // 카테고리 타입 로딩
  const loadCategoryTypes = async () => {
    try {
      setLoading(prev => ({ ...prev, types: true }));
      setError(null);
      
      const response = await api.get('/api/boards/category-types');
      setCategoryTypes(response.data);
    } catch (error) {
      console.error('카테고리 타입 로딩 오류:', error);
      setError('카테고리 타입을 불러오는데 실패했습니다.');
      Alert.alert('오류', '카테고리 타입을 불러오는데 실패했습니다.');
    } finally {
      setLoading(prev => ({ ...prev, types: false }));
    }
  };

  // 카테고리 로딩
  const loadCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }));
      setError(null);
      
      const response = await api.get('/api/boards/categories');
      setCurrentCategories(response.data);
    } catch (error) {
      console.error('카테고리 로딩 오류:', error);
      setError('카테고리를 불러오는데 실패했습니다.');
      Alert.alert('오류', '카테고리를 불러오는데 실패했습니다.');
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    loadCategoryTypes();
    loadCategories();
  }, []);

  // 화면 포커스시 데이터 새로고침
  useFocusEffect(
    React.useCallback(() => {
      loadCategories();
    }, [])
  );

  // 카테고리 선택 핸들러
  const handleCategorySelect = (category: Category) => {
    if (onSelectCategory) {
      onSelectCategory(category.id);
    } else {
      navigation.navigate('CommunityCategory' as never, { 
        categoryId: category.id,
        categoryName: category.category_name 
      } as never);
    }
  };

  // 전체 게시글 선택 핸들러
  const handleAllPostsSelect = () => {
    if (onSelectCategory) {
      onSelectCategory(null);
    } else {
      navigation.navigate('Community' as never);
    }
  };

  // 타입별 카테고리 그룹화
  const getCategoriesByType = (typeId: number): Category[] => {
    return currentCategories.filter(category => category.category_type_id === typeId);
  };

  if (loading.types) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>카테고리를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            loadCategoryTypes();
            loadCategories();
          }}
        >
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      isCollapsed && styles.containerCollapsed
    ]}>
      {/* 헤더 */}
      <View style={styles.header}>
        {!isCollapsed && (
          <TouchableOpacity
            style={styles.headerTitle}
            onPress={handleAllPostsSelect}
          >
            <Text style={styles.headerTitleText}>카테고리</Text>
          </TouchableOpacity>
        )}
        {onToggleCollapse && (
          <TouchableOpacity
            style={styles.collapseButton}
            onPress={onToggleCollapse}
          >
            <Icon 
              name={isCollapsed ? "chevron-right" : "chevron-left"} 
              size={20} 
              color="#6B7280" 
            />
          </TouchableOpacity>
        )}
      </View>

      {!isCollapsed && (
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* 전체 게시글 */}
          <TouchableOpacity
            style={[
              styles.allPostsItem,
              selectedCategoryId === null && styles.selectedItem
            ]}
            onPress={handleAllPostsSelect}
          >
            <Icon 
              name="view-list" 
              size={20} 
              color={selectedCategoryId === null ? '#4F46E5' : '#6B7280'} 
              style={styles.itemIcon}
            />
            <Text style={[
              styles.itemText,
              selectedCategoryId === null && styles.selectedItemText
            ]}>
              전체 게시글
            </Text>
          </TouchableOpacity>

          {/* 카테고리 타입별 그룹 */}
          {categoryTypes.map(type => {
            const typeCategoriesCount = getCategoriesByType(type.id);
            
            if (typeCategoriesCount.length === 0) return null;

            return (
              <View key={type.id} style={styles.typeSection}>
                <View style={styles.typeHeader}>
                  <Text style={styles.typeTitle}>{type.type_name}</Text>
                </View>
                
                <View style={styles.categoryGroup}>
                  {getCategoriesByType(type.id).map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryItem,
                        selectedCategoryId === category.id && styles.selectedItem
                      ]}
                      onPress={() => handleCategorySelect(category)}
                    >
                      <View style={styles.categoryContent}>
                        <Text style={[
                          styles.categoryText,
                          selectedCategoryId === category.id && styles.selectedItemText
                        ]}>
                          {category.category_name}
                        </Text>
                      </View>
                      {selectedCategoryId === category.id && (
                        <Icon name="chevron-right" size={16} color="#4F46E5" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            );
          })}

          {loading.categories && (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="small" color="#4F46E5" />
              <Text style={styles.loadingSmallText}>카테고리 업데이트 중...</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    margin: 16,
    maxHeight: 600,
  },
  containerCollapsed: {
    width: 64,
    alignItems: 'center',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    flex: 1,
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  collapseButton: {
    padding: 8,
    borderRadius: 6,
  },
  content: {
    flex: 1,
  },
  allPostsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  typeSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  typeHeader: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryGroup: {
    paddingVertical: 4,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryContent: {
    flex: 1,
  },
  selectedItem: {
    backgroundColor: '#EEF2FF',
  },
  itemIcon: {
    marginRight: 12,
  },
  itemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  selectedItemText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  loadingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingSmallText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CategoryTree; 