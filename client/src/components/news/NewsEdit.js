import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNewsDetail, updateNews } from '../../service/newsApi';
import { getNewsCategories } from '../../service/newsApi';
import { useAuth } from '../../contexts/AuthContext';

export default function NewsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [news, setNews] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category_id: '',
    image_url: '',
    author_id: user?.id
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [newsData, categoriesData] = await Promise.all([
          getNewsDetail(id),
          getNewsCategories()
        ]);
        
        if (newsData.author_id !== user.id) {
          navigate('/news');
          return;
        }

        setNews(newsData);
        setCategories(categoriesData);
        setFormData({
          title: newsData.title,
          summary: newsData.summary || '',
          content: newsData.content,
          category_id: newsData.category_id,
          image_url: newsData.image_url || '',
          author_id: newsData.author_id
        });
        setLoading(false);
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user.id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newsData = {
        ...formData,
        author_id: user.id
      };
      await updateNews(id, newsData);
      navigate(`/news/${id}`);
    } catch (err) {
      setError('뉴스 수정에 실패했습니다.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div className="p-4">로딩중...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!news) return <div className="p-4">뉴스를 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-6">뉴스 수정</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            요약
          </label>
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            카테고리
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이미지 URL
          </label>
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내용
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="10"
            required
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/news/${id}`)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            수정하기
          </button>
        </div>
      </form>
    </div>
  );
} 