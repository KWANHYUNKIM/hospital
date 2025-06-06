import React, { useState, useEffect } from 'react';
import { getNewsList, deleteNews, getNewsCategories } from '../../service/newsApi';
import { useNavigate } from 'react-router-dom';

export default function NewsManagement() {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();

  // 뉴스 내용에서 첫 번째 이미지 URL을 추출하는 함수
  const extractFirstImageUrl = (content) => {
    try {
      const contentArray = JSON.parse(content);
      for (const block of contentArray) {
        if (block.type === 'image' && block.props?.url) {
          return block.props.url;
        }
      }
    } catch (error) {
      console.error('이미지 URL 추출 실패:', error);
    }
    return null;
  };

  const fetchNews = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getNewsList(page, 10, selectedCategory || null);
      if (response && response.content) {
        // 각 뉴스 항목에 대표 이미지 URL 추가
        const newsWithImages = response.content.map(item => ({
          ...item,
          image_url: item.image_url || extractFirstImageUrl(item.content) || '/images/default-news.png'
        }));
        setNews(newsWithImages);
        setTotalPages(response.totalPages || 1);
        setCurrentPage(response.number + 1 || page);
      } else {
        setNews([]);
        setTotalPages(1);
        setCurrentPage(1);
      }
      setLoading(false);
    } catch (err) {
      console.error('뉴스 로딩 실패:', err);
      setError('뉴스를 불러오는데 실패했습니다.');
      setLoading(false);
      setNews([]);
      setTotalPages(1);
      setCurrentPage(1);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getNewsCategories();
      const categoriesData = Array.isArray(response) ? response : [];
      setCategories(categoriesData);
    } catch (err) {
      console.error('카테고리 로딩 실패:', err);
    }
  };

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, [selectedCategory]);

  const handleDelete = async (id) => {
    if (window.confirm('정말로 이 뉴스를 삭제하시겠습니까?')) {
      try {
        await deleteNews(id);
        fetchNews(currentPage);
      } catch (err) {
        setError('뉴스 삭제에 실패했습니다.');
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/news/edit/${id}`);
  };

  const handleCreate = () => {
    navigate('/admin/news/create');
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="p-4 text-red-500 bg-red-50 rounded-lg">
      {error}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">뉴스 관리</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin/news/categories')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            카테고리 관리
          </button>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            새 뉴스 작성
          </button>
        </div>
      </div>

      <div className="mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-64 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">전체 카테고리</option>
          {categories && categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative h-48 bg-gray-200">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/default-news.png';
                }}
              />
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm">
                {item.category_name}
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2 line-clamp-2">{item.title}</h3>
              {item.summary && (
                <p className="text-gray-600 mb-4 line-clamp-2">{item.summary}</p>
              )}
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                <span>조회수: {item.view_count}</span>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleEdit(item.id)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  수정
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => fetchNews(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 rounded-l-md border text-sm font-medium ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => fetchNews(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === page
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => fetchNews(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-4 py-2 rounded-r-md border text-sm font-medium ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              다음
            </button>
          </nav>
        </div>
      )}
    </div>
  );
} 