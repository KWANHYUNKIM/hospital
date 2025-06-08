import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createNews, updateNews, getNewsDetail, getNewsCategories, uploadNewsMedia } from '../../service/newsApi';
import { useAuth } from '../../contexts/AuthContext';
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";

// 이미지 크기 조정을 위한 CSS 스타일
const imageResizeStyles = `
  .bn-editor .bn-block-content img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    user-select: none;
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
  }
  
  .bn-editor .bn-block-content img:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: box-shadow 0.3s ease;
  }
  
  .bn-editor .bn-selected img {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
  
  .bn-editor .bn-block-content {
    position: relative;
  }
  
  .bn-editor [data-content-type="image"] {
    position: relative;
    display: inline-block;
  }
  
  .bn-editor .bn-image-resize-handle {
    position: absolute;
    background: #3b82f6;
    border: 2px solid white;
    border-radius: 50%;
    width: 10px;
    height: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    cursor: resize;
    z-index: 10;
  }
  
  .bn-editor .bn-image-resize-handle:hover {
    background: #2563eb;
    transform: scale(1.1);
    transition: all 0.2s ease;
  }
`;

export default function NewsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    category_id: '',
    representative_image_url: null,
    images: [],
    author_id: user?.id
  });
  const [availableImages, setAvailableImages] = useState([]);
  
  // 이미지 크기 조정 스타일 추가
  useEffect(() => {
    // 기존 스타일이 있다면 제거
    const existingStyle = document.getElementById('blocknote-image-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = 'blocknote-image-styles';
    styleElement.textContent = imageResizeStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      const styleToRemove = document.getElementById('blocknote-image-styles');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, []);
  
  // BlockNote 에디터 초기화
  const editor = useCreateBlockNote({
    uploadFile: async (file) => {
      try {
        const response = await uploadNewsMedia(file);
        return response.url; // 서버에서 반환하는 이미지 URL
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        throw new Error("이미지 업로드 실패");
      }
    }
  });

  // 에디터 내용 변경 감지
  useEffect(() => {
    const handleEditorChange = () => {
      const content = editor.document;
      const images = content.filter(block => block.type === 'image' && block.props?.url);
      const imageUrls = images.map(block => block.props.url);
      setAvailableImages(imageUrls);
      
      // 기존 대표 이미지가 에디터에서 삭제된 경우 처리
      if (formData.representative_image_url && !imageUrls.includes(formData.representative_image_url)) {
        // 첫 번째 이미지를 새로운 대표 이미지로 설정
        if (imageUrls.length > 0) {
          setFormData(prev => ({
            ...prev,
            representative_image_url: imageUrls[0],
            images: imageUrls.slice(1)
          }));
        } else {
          // 이미지가 모두 삭제된 경우
          setFormData(prev => ({
            ...prev,
            representative_image_url: null,
            images: []
          }));
        }
      } else {
        // 대표 이미지를 제외한 나머지 이미지들을 추가 이미지로 설정
        setFormData(prev => ({
          ...prev,
          images: imageUrls.filter(url => url !== prev.representative_image_url)
        }));
      }
    };

    editor.onEditorContentChange(handleEditorChange);
    return () => {
      editor.off('editorContentChange', handleEditorChange);
    };
  }, [editor]);

  // 이미지 선택 핸들러
  const handleImageSelect = (selectedImageUrl) => {
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

  // 이미지 삭제 핸들러
  const handleImageDelete = (imageUrl) => {
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
      } else {
        // 추가 이미지가 없는 경우
        setFormData(prev => ({
          ...prev,
          representative_image_url: null
        }));
      }
    } else {
      // 추가 이미지가 삭제된 경우
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(url => url !== imageUrl)
      }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await getNewsCategories();
        setCategories(categoriesResponse);

        if (id) {
          const newsResponse = await getNewsDetail(id);
          setFormData({
            title: newsResponse.title,
            summary: newsResponse.summary,
            category_id: newsResponse.category_id,
            representative_image_url: newsResponse.representative_image_url || null,
            images: newsResponse.images || [],
            author_id: newsResponse.author_id
          });
          
          // 에디터에 기존 내용 설정
          if (newsResponse.content) {
            editor.replaceBlocks(editor.document, JSON.parse(newsResponse.content));
          }
        }
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 대표 이미지가 설정되어 있지 않은 경우 처리
      if (!formData.representative_image_url && availableImages.length > 0) {
        setFormData(prev => ({
          ...prev,
          representative_image_url: availableImages[0],
          images: availableImages.slice(1)
        }));
      }

      // 에디터 내용을 JSON으로 변환 (이미지 크기 정보 포함)
      const editorContent = editor.document;
      console.log('에디터 내용 (이미지 크기 포함):', editorContent); // 디버깅용

      const newsData = {
        ...formData,
        content: JSON.stringify(editorContent),
        author_id: user.id,
        representative_image_url: formData.representative_image_url || null
      };

      console.log('전송할 데이터:', newsData); // 데이터 전송 전 로깅

      if (id) {
        await updateNews(id, newsData);
      } else {
        await createNews(newsData);
      }
      navigate('/admin/news');
    } catch (err) {
      console.error('뉴스 저장 중 오류:', err);
      setError('뉴스 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {id ? '뉴스 수정' : '새 뉴스 작성'}
        </h1>
        <p className="text-gray-600">
          {id ? '기존 뉴스 내용을 수정합니다.' : '새로운 뉴스를 작성합니다.'}
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-2">제목</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="뉴스 제목을 입력하세요"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-2">요약</label>
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleInputChange}
            rows="3"
            placeholder="뉴스의 간단한 요약을 입력하세요"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-2">카테고리</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">카테고리 선택</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {availableImages.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <label className="block text-sm font-semibold text-gray-700 mb-2">이미지 관리</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availableImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                    formData.representative_image_url === imageUrl ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <img
                    src={imageUrl}
                    alt={`이미지 ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-1 text-sm">
                    {formData.representative_image_url === imageUrl ? '대표 이미지' : '추가 이미지'}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-2">
                    {formData.representative_image_url !== imageUrl && (
                      <button
                        type="button"
                        onClick={() => handleImageSelect(imageUrl)}
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                      >
                        대표로 설정
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleImageDelete(imageUrl)}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-6 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-2">내용</label>
          <div className="mt-2 border border-gray-300 rounded-lg overflow-hidden" style={{ height: '600px' }}>
            <BlockNoteView 
              editor={editor}
              theme="light"
            />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <p>💡 이미지 크기 조정 팁:</p>
            <ul className="list-disc list-inside mt-1">
              <li>이미지를 클릭하면 모서리에 크기 조정 핸들이 나타납니다</li>
              <li>핸들을 드래그하여 이미지 크기를 조정할 수 있습니다</li>
              <li>Shift를 누르고 드래그하면 비율을 유지하며 크기 조정됩니다</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate('/admin/news')}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  );
} 