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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createNews, updateNews, getNewsDetail, getNewsCategories, uploadNewsMedia } from '../../service/newsApi';
import { useAuth } from '../../contexts/AuthContext';

// TypeScript 인터페이스 정의
interface Category {
  id: number;
  name: string;
}

interface FormData {
  title: string;
  summary: string;
  category_id: string;
  representative_image_url: string | null;
  images: string[];
  author_id: number;
  content: string;
}

interface RouteParams {
  id?: string;
}

const NewsForm: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as RouteParams;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    summary: '',
    category_id: '',
    representative_image_url: null,
    images: [],
    author_id: user?.id || 0,
    content: ''
  });
  const [availableImages, setAvailableImages] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchNewsDetail();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await getNewsCategories();
      setCategories(response);
    } catch (err: any) {
      setError('카테고리를 불러오는데 실패했습니다.');
      Alert.alert('오류', '카테고리를 불러오는데 실패했습니다.');
    }
  };

  const fetchNewsDetail = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await getNewsDetail(id);
      setFormData({
        title: response.title,
        summary: response.summary,
        category_id: response.category_id,
        representative_image_url: response.representative_image_url || null,
        images: response.images || [],
        author_id: response.author_id,
        content: response.content || ''
      });
      
      // 기존 이미지들을 availableImages에 추가
      const allImages = [];
      if (response.representative_image_url) {
        allImages.push(response.representative_image_url);
      }
      if (response.images) {
        allImages.push(...response.images);
      }
      setAvailableImages(allImages);
    } catch (err: any) {
      setError('뉴스 데이터를 불러오는데 실패했습니다.');
      Alert.alert('오류', '뉴스 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUrlAdd = () => {
    Alert.prompt(
      '이미지 추가',
      '이미지 URL을 입력하세요',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '추가',
          onPress: (url?: string) => {
            if (url && url.trim()) {
              const newImages = [...availableImages, url.trim()];
              setAvailableImages(newImages);
              
              // 대표 이미지가 없으면 첫 번째 이미지를 대표 이미지로 설정
              if (!formData.representative_image_url) {
                setFormData(prev => ({
                  ...prev,
                  representative_image_url: url.trim(),
                  images: newImages.slice(1)
                }));
              } else {
                setFormData(prev => ({
                  ...prev,
                  images: newImages.filter(img => img !== prev.representative_image_url)
                }));
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleImageSelect = (selectedImageUrl: string) => {
    const currentImages = [...formData.images];
    const oldRepresentativeImage = formData.representative_image_url;

    // 이전 대표 이미지를 추가 이미지 목록에 추가
    if (oldRepresentativeImage) {
      currentImages.push(oldRepresentativeImage);
    }

    // 선택된 이미지를 대표 이미지로 설정하고, 해당 이미지를 추가 이미지 목록에서 제거
    setFormData(prev => ({
      ...prev,
      representative_image_url: selectedImageUrl,
      images: currentImages.filter(url => url !== selectedImageUrl)
    }));
  };

  const handleImageDelete = (imageUrl: string) => {
    if (imageUrl === formData.representative_image_url) {
      // 대표 이미지가 삭제된 경우
      if (formData.images.length > 0) {
        // 첫 번째 추가 이미지를 새로운 대표 이미지로 설정
        const [newRepresentative, ...remainingImages] = formData.images;
        setFormData(prev => ({
          ...prev,
          representative_image_url: newRepresentative,
          images: remainingImages
        }));
        setAvailableImages(prev => prev.filter(url => url !== imageUrl));
      } else {
        // 추가 이미지가 없는 경우
        setFormData(prev => ({
          ...prev,
          representative_image_url: null
        }));
        setAvailableImages(prev => prev.filter(url => url !== imageUrl));
      }
    } else {
      // 추가 이미지가 삭제된 경우
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(url => url !== imageUrl)
      }));
      setAvailableImages(prev => prev.filter(url => url !== imageUrl));
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    if (!formData.category_id) {
      Alert.alert('알림', '카테고리를 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const newsData = {
        ...formData,
        author_id: user?.id || 0,
        representative_image_url: formData.representative_image_url || null
      };

      if (id) {
        await updateNews(id, newsData);
      } else {
        await createNews(newsData);
      }
      
      Alert.alert(
        '성공',
        id ? '뉴스가 수정되었습니다.' : '뉴스가 등록되었습니다.',
        [
          {
            text: '확인',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (err: any) {
      console.error('뉴스 저장 중 오류:', err);
      setError('뉴스 저장에 실패했습니다.');
      Alert.alert('오류', '뉴스 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
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
        <Text style={styles.headerTitle}>
          {id ? '뉴스 수정' : '새 뉴스 작성'}
        </Text>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>저장</Text>
          )}
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* 제목 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>제목</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              placeholder="뉴스 제목을 입력하세요"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* 요약 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>요약</Text>
            <TextInput
              style={styles.textArea}
              value={formData.summary}
              onChangeText={(value) => handleInputChange('summary', value)}
              placeholder="뉴스의 간단한 요약을 입력하세요"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* 카테고리 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>카테고리</Text>
            <View style={styles.pickerContainer}>
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  !formData.category_id && styles.pickerItemSelected
                ]}
                onPress={() => handleInputChange('category_id', '')}
              >
                <Text style={[
                  styles.pickerItemText,
                  !formData.category_id && styles.pickerItemTextSelected
                ]}>
                  카테고리 선택
                </Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.pickerItem,
                    formData.category_id === category.id.toString() && styles.pickerItemSelected
                  ]}
                  onPress={() => handleInputChange('category_id', category.id.toString())}
                >
                  <Text style={[
                    styles.pickerItemText,
                    formData.category_id === category.id.toString() && styles.pickerItemTextSelected
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 이미지 관리 */}
          <View style={styles.inputContainer}>
            <View style={styles.imageHeader}>
              <Text style={styles.inputLabel}>이미지 관리</Text>
              <TouchableOpacity style={styles.addImageButton} onPress={handleImageUrlAdd}>
                <Icon name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addImageButtonText}>이미지 추가</Text>
              </TouchableOpacity>
            </View>
            
            {availableImages.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.imageScrollView}
              >
                {availableImages.map((imageUrl, index) => (
                  <View key={index} style={styles.imageItem}>
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                    <View style={styles.imageOverlay}>
                      <View style={styles.imageLabel}>
                        <Text style={styles.imageLabelText}>
                          {formData.representative_image_url === imageUrl ? '대표' : '추가'}
                        </Text>
                      </View>
                      <View style={styles.imageActions}>
                        {formData.representative_image_url !== imageUrl && (
                          <TouchableOpacity
                            style={styles.imageActionButton}
                            onPress={() => handleImageSelect(imageUrl)}
                          >
                            <Text style={styles.imageActionText}>대표로</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={[styles.imageActionButton, styles.deleteButton]}
                          onPress={() => handleImageDelete(imageUrl)}
                        >
                          <Text style={styles.imageActionText}>삭제</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noImageContainer}>
                <Icon name="image" size={48} color="#9CA3AF" />
                <Text style={styles.noImageText}>등록된 이미지가 없습니다</Text>
              </View>
            )}
          </View>

          {/* 내용 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>내용</Text>
            <TextInput
              style={styles.contentTextArea}
              value={formData.content}
              onChangeText={(value) => handleInputChange('content', value)}
              placeholder="뉴스 내용을 입력하세요"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={10}
            />
            <Text style={styles.helperText}>
              💡 이미지는 마크다운 문법으로 삽입할 수 있습니다: ![설명](이미지URL)
            </Text>
          </View>
        </View>

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
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  content: {
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
  contentTextArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 200,
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
  imageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addImageButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  addImageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  imageScrollView: {
    marginBottom: 8,
  },
  imageItem: {
    width: 120,
    height: 160,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-between',
    padding: 8,
  },
  imageLabel: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  imageLabelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  imageActions: {
    gap: 4,
  },
  imageActionButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
  },
  imageActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  noImageContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 32,
    alignItems: 'center',
  },
  noImageText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 16,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default NewsForm; 