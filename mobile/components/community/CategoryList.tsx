import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// TypeScript 인터페이스 정의
interface Category {
  id: number | string;
  category_name: string;
  description?: string;
  icon?: string;
  color?: string;
}

interface CategoryListProps {
  categories: Category[];
  categoryId?: string | number | null;
  onCategorySelect?: (categoryId: string | number | null) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ 
  categories, 
  categoryId,
  onCategorySelect 
}) => {
  const navigation = useNavigation();

  // 카테고리 선택 핸들러
  const handleCategoryPress = (category: Category | null) => {
    if (category === null) {
      // 전체 게시글
      if (onCategorySelect) {
        onCategorySelect(null);
      } else {
        navigation.navigate('Community' as never);
      }
    } else {
      if (onCategorySelect) {
        onCategorySelect(category.id);
      } else {
        navigation.navigate('CommunityCategory' as never, { categoryId: category.id } as never);
      }
    }
  };

  // 카테고리 항목 렌더링
  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = categoryId === item.id.toString();
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          isSelected && styles.categoryItemSelected
        ]}
        onPress={() => handleCategoryPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.categoryContent}>
          {item.icon && (
            <Icon 
              name={item.icon} 
              size={20} 
              color={isSelected ? '#4F46E5' : '#6B7280'} 
              style={styles.categoryIcon}
            />
          )}
          <Text style={[
            styles.categoryText,
            isSelected && styles.categoryTextSelected
          ]}>
            {item.category_name}
          </Text>
        </View>
        {isSelected && (
          <Icon name="chevron-right" size={20} color="#4F46E5" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="category" size={20} color="#374151" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>카테고리</Text>
      </View>
      
      <View style={styles.categoryList}>
        {/* 전체 게시글 항목 */}
        <TouchableOpacity
          style={[
            styles.categoryItem,
            !categoryId && styles.categoryItemSelected
          ]}
          onPress={() => handleCategoryPress(null)}
          activeOpacity={0.7}
        >
          <View style={styles.categoryContent}>
            <Icon 
              name="view-list" 
              size={20} 
              color={!categoryId ? '#4F46E5' : '#6B7280'} 
              style={styles.categoryIcon}
            />
            <Text style={[
              styles.categoryText,
              !categoryId && styles.categoryTextSelected
            ]}>
              전체 게시글
            </Text>
          </View>
          {!categoryId && (
            <Icon name="chevron-right" size={20} color="#4F46E5" />
          )}
        </TouchableOpacity>

        {/* 카테고리 목록 */}
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
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
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  categoryList: {
    paddingVertical: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 6,
  },
  categoryItemSelected: {
    backgroundColor: '#EEF2FF',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    marginRight: 12,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  categoryTextSelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
});

export default CategoryList; 