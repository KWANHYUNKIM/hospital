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
    category_id: ''
  });
  
  // BlockNote 에디터 초기화
  const editor = useCreateBlockNote();

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
            category_id: newsResponse.category_id
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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{id ? '뉴스 수정' : '새 뉴스 작성'}</h1>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">제목</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">요약</label>
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleInputChange}
            rows="3"
            placeholder="뉴스의 간단한 요약을 입력하세요"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">카테고리</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">카테고리 선택</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">내용</label>
          <div className="mt-1 border rounded-md" style={{ height: '600px' }}>
            <BlockNoteView editor={editor} />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate('/admin/news')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
} 