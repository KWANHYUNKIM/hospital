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
import axios from 'axios';

// TypeScript 인터페이스 정의
interface Category {
  id: number;
  category_name: string;
  parent_id?: number;
}

interface Tag {
  id: number;
  name: string;
}

const CreateBoardPage: React.FC = () => {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // 카테고리 목록 로드
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/boards/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('카테고리 로딩 실패:', error);
        Alert.alert('오류', '카테고리를 불러오는데 실패했습니다.');
      }
    };

    fetchCategories();
  }, []);

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId);
    setShowCategoryDropdown(false);
  };

  const handleTagInputChange = (text: string) => {
    setTagInput(text);
  };

  const handleTagAdd = () => {
    const trimmedTag = tagInput.trim();
    if (!trimmedTag) return;

    if (selectedTags.length >= 5) {
      Alert.alert('알림', '태그는 최대 5개까지 입력 가능합니다.');
      return;
    }

    const newTag = `#${trimmedTag}`;
    if (selectedTags.includes(newTag)) {
      Alert.alert('알림', '이미 존재하는 태그입니다.');
      return;
    }

    setSelectedTags([...selectedTags, newTag]);
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !selectedCategory) {
      Alert.alert('알림', '제목, 내용, 카테고리를 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        title: title.trim(),
        summary: content.trim(),
        categoryId: selectedCategory,
        status: 'published',
        isNotice: false,
        metaFields: null,
        tags: selectedTags.map(tag => tag.substring(1)) // # 제거
      };

      console.log('게시글 생성 요청 데이터:', requestData);

      // 게시글 생성
      const response = await axios.post('http://localhost:8080/api/boards', requestData, {
        withCredentials: true
      });

      // 태그 처리
      if (selectedTags.length > 0) {
        const tagNames = selectedTags.map(tag => tag.substring(1));
        await axios.post(`http://localhost:8080/api/boards/${response.data.id}/tags`, {
          tags: tagNames
        }, { withCredentials: true });
      }

      Alert.alert('성공', '게시글이 작성되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            console.log('게시글 상세 페이지로 이동:', response.data.id);
            // navigation.navigate('BoardDetail', { id: response.data.id });
          }
        }
      ]);
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      Alert.alert('오류', '게시글 작성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryName = categories.find(cat => cat.id === selectedCategory)?.category_name || '카테고리 선택';

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>게시글 작성</Text>
        <TouchableOpacity 
          style={[styles.headerButton, styles.submitButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>완료</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 카테고리 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>카테고리</Text>
          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Text style={[styles.categoryText, selectedCategory ? styles.categoryTextSelected : null]}>
              {selectedCategoryName}
            </Text>
            <Text style={styles.expandIcon}>
              {showCategoryDropdown ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {showCategoryDropdown && (
            <View style={styles.categoryDropdown}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryOption}
                  onPress={() => handleCategorySelect(category.id)}
                >
                  <Text style={styles.categoryOptionText}>{category.category_name}</Text>
                  {selectedCategory === category.id && (
                    <Text style={styles.checkIcon}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 제목 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제목</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력하세요"
            placeholderTextColor="#9CA3AF"
            multiline={false}
          />
        </View>

        {/* 내용 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내용</Text>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="내용을 입력하세요"
            placeholderTextColor="#9CA3AF"
            multiline={true}
            textAlignVertical="top"
          />
        </View>

        {/* 태그 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>태그 ({selectedTags.length}/5)</Text>
          
          {/* 선택된 태그들 */}
          {selectedTags.length > 0 && (
            <View style={styles.selectedTags}>
              {selectedTags.map((tag, index) => (
                <View key={index} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{tag}</Text>
                  <TouchableOpacity
                    style={styles.tagRemoveButton}
                    onPress={() => removeTag(tag)}
                  >
                    <Text style={styles.removeIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* 태그 입력 */}
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              value={tagInput}
              onChangeText={handleTagInputChange}
              placeholder="태그 입력"
              placeholderTextColor="#9CA3AF"
              editable={selectedTags.length < 5}
            />
            <TouchableOpacity
              style={[styles.tagAddButton, (!tagInput.trim() || selectedTags.length >= 5) && styles.tagAddButtonDisabled]}
              onPress={handleTagAdd}
              disabled={!tagInput.trim() || selectedTags.length >= 5}
            >
              <Text style={styles.addIcon}>+</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  categoryTextSelected: {
    color: '#111827',
  },
  categoryDropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  titleInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  contentInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 200,
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  tagChipText: {
    fontSize: 14,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  tagRemoveButton: {
    padding: 2,
  },
  tagInputContainer: {
    flexDirection: 'row',
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
  tagAddButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagAddButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  bottomSpacing: {
    height: 40,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  expandIcon: {
    fontSize: 24,
    color: '#6B7280',
  },
  checkIcon: {
    fontSize: 20,
    color: '#3B82F6',
  },
  removeIcon: {
    fontSize: 16,
    color: '#3B82F6',
  },
  addIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
});

export default CreateBoardPage; 