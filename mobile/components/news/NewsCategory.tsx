import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';

// 타입 정의
interface Category {
  id: string | number;
  name: string;
}

interface NewsCategoryProps {
  selectedCategory?: string | null;
  onCategorySelect?: (categoryId: string | null) => void;
}

const NewsCategory: React.FC<NewsCategoryProps> = ({
  selectedCategory = null,
  onCategorySelect = () => {},
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Mock API 호출 (실제로는 getNewsCategories 호출)
      const response = await mockGetNewsCategories();
      
      const categoriesData = Array.isArray(response) ? response : [];
      setCategories([{ id: 'all', name: '전체' }, ...categoriesData]);
      setLoading(false);
    } catch (err: any) {
      setError('카테고리를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  // Mock API 함수
  const mockGetNewsCategories = async (): Promise<Category[]> => {
    // 실제 API 호출로 대체해야 함
    return [
      { id: 1, name: '건강' },
      { id: 2, name: '의료' },
      { id: 3, name: '생활' },
      { id: 4, name: '복지' },
      { id: 5, name: '정책' },
      { id: 6, name: '응급의료' },
      { id: 7, name: '예방접종' },
    ];
  };

  const handleCategoryPress = (categoryId: string | number) => {
    const selectedId = categoryId === 'all' ? null : categoryId.toString();
    onCategorySelect(selectedId);
  };

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isActive = 
      (selectedCategory === null && item.id === 'all') ||
      (selectedCategory === item.id.toString());

    return (
      <TouchableOpacity
        style={[
          styles.categoryButton,
          isActive && styles.categoryButtonActive,
        ]}
        onPress={() => handleCategoryPress(item.id)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.categoryButtonText,
            isActive && styles.categoryButtonTextActive,
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text style={styles.loadingText}>카테고리 로딩중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchCategories}
        >
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCategoryItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  separator: {
    width: 8,
  },
});

export default NewsCategory; 