import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';

// 타입 정의
interface News {
  id: number;
  title: string;
  summary?: string;
  content?: string;
  category_id?: number;
  representative_image_url?: string | null;
  images?: string[];
  author_id?: number;
}

interface Category {
  id: number;
  name: string;
}

interface User {
  id: number;
  role?: string;
}

interface RouteParams {
  id: string;
}

const NewsEdit: React.FC = () => {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation();
  const { id } = route.params;
  
  // 임시 사용자 정보 (실제로는 Auth Context에서 가져와야 함)
  const user: User = { id: 1, role: 'ADMIN' }; // useAuth hook으로 대체
  
  const [news, setNews] = useState<News | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category_id: '',
    representative_image_url: null as string | null,
    images: [] as string[],
    author_id: user?.id || 1,
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Mock API 호출들 (실제로는 getNewsDetail, getNewsCategories 호출)
      const [newsData, categoriesData] = await Promise.all([
        mockGetNewsDetail(id),
        mockGetNewsCategories(),
      ]);
      
      if (newsData.author_id !== user.id) {
        Alert.alert('오류', '수정 권한이 없습니다.');
        navigation.goBack();
        return;
      }

      setNews(newsData);
      setCategories(categoriesData);
      setFormData({
        title: newsData.title,
        summary: newsData.summary || '',
        content: newsData.content || '',
        category_id: newsData.category_id?.toString() || '',
        representative_image_url: newsData.representative_image_url || null,
        images: newsData.images || [],
        author_id: newsData.author_id || user.id,
      });
      
      setLoading(false);
    } catch (err: any) {
      setError('데이터를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  // Mock API 함수들
  const mockGetNewsDetail = async (id: string): Promise<News> => {
    return {
      id: parseInt(id),
      title: '샘플 뉴스 제목',
      summary: '뉴스 요약',
      content: '뉴스 본문 내용입니다.',
      category_id: 1,
      representative_image_url: null,
      images: [],
      author_id: 1,
    };
  };

  const mockGetNewsCategories = async (): Promise<Category[]> => {
    return [
      { id: 1, name: '건강' },
      { id: 2, name: '의료' },
      { id: 3, name: '생활' },
      { id: 4, name: '복지' },
    ];
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('오류', '제목을 입력해주세요.');
      return;
    }

    if (!formData.content.trim()) {
      Alert.alert('오류', '내용을 입력해주세요.');
      return;
    }

    if (!formData.category_id) {
      Alert.alert('오류', '카테고리를 선택해주세요.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const newsData = {
        ...formData,
        category_id: parseInt(formData.category_id),
        author_id: user.id,
      };

      console.log('뉴스 수정 데이터:', newsData);
      
      // await updateNews(id, newsData);
      
      Alert.alert('성공', '뉴스가 수정되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.navigate('NewsDetail' as never, { id } as never),
        },
      ]);
    } catch (err: any) {
      console.error('뉴스 수정 중 오류:', err);
      setError('뉴스 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>로딩중...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!news) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>뉴스를 찾을 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>뉴스 수정</Text>
            <Text style={styles.headerSubtitle}>기존 뉴스 내용을 수정합니다.</Text>
          </View>
          
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}
          
          {/* 폼 */}
          <View style={styles.form}>
            {/* 제목 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>제목</Text>
              <TextInput
                style={styles.textInput}
                value={formData.title}
                onChangeText={(text) => handleInputChange('title', text)}
                placeholder="뉴스 제목을 입력하세요"
                multiline={false}
              />
            </View>

            {/* 요약 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>요약</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={formData.summary}
                onChangeText={(text) => handleInputChange('summary', text)}
                placeholder="뉴스의 간단한 요약을 입력하세요"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* 카테고리 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>카테고리</Text>
              <View style={styles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      formData.category_id === category.id.toString() &&
                        styles.categoryButtonSelected,
                    ]}
                    onPress={() => handleInputChange('category_id', category.id.toString())}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        formData.category_id === category.id.toString() &&
                          styles.categoryButtonTextSelected,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 내용 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>내용</Text>
              <TextInput
                style={[styles.textInput, styles.contentInput]}
                value={formData.content}
                onChangeText={(text) => handleInputChange('content', text)}
                placeholder="뉴스 본문을 입력하세요"
                multiline
                numberOfLines={10}
                textAlignVertical="top"
              />
              <Text style={styles.helpText}>
                💡 현재는 간단한 텍스트 편집만 지원됩니다.
              </Text>
            </View>

            {/* 버튼들 */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.submitButton, saving && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>수정하기</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  errorBannerText: {
    color: '#DC2626',
    fontSize: 14,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  contentInput: {
    height: 200,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryButtonTextSelected: {
    color: '#FFFFFF',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NewsEdit; 