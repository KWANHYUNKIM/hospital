import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createNews, updateNews, getNewsDetail, getNewsCategories } from '../../service/newsApi';
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";

export default function NewsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    category_id: '',
    image_url: ''
  });
  const [availableImages, setAvailableImages] = useState([]);
  
  // BlockNote 에디터 초기화
  const editor = useCreateBlockNote();

  // 에디터 내용 변경 감지
  useEffect(() => {
    const handleEditorChange = () => {
      const content = editor.document;
      const images = content.filter(block => block.type === 'image' && block.props?.url);
      setAvailableImages(images.map(block => block.props.url));
      
      // 첫 번째 이미지를 자동으로 대표 이미지로 설정 (이미 설정된 이미지가 없는 경우에만)
      if (images.length > 0 && !formData.image_url) {
        setFormData(prev => ({
          ...prev,
          image_url: images[0].props.url
        }));
      }
    };

    editor.onEditorContentChange(handleEditorChange);
    return () => {
      editor.off('editorContentChange', handleEditorChange);
    };
  }, [editor]);

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
            image_url: newsResponse.image_url || ''
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
      const newsData = {
        ...formData,
        content: JSON.stringify(editor.document)
      };

      if (id) {
        await updateNews(id, newsData);
      } else {
        await createNews(newsData);
      }
      navigate('/admin/news');
    } catch (err) {
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">대표 이미지 선택</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availableImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                    formData.image_url === imageUrl ? 'border-blue-500' : 'border-transparent'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, image_url: imageUrl }))}
                >
                  <img
                    src={imageUrl}
                    alt={`대표 이미지 ${index + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-1 text-sm">
                    이미지 {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-6 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 mb-2">내용</label>
          <div className="mt-2 border border-gray-300 rounded-lg overflow-hidden" style={{ height: '600px' }}>
            <BlockNoteView editor={editor} />
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