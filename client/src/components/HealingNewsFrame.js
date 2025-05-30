import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getNewsList, deleteNews } from '../service/newsApi';

export default function HealingNewsFrame({ category = null }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await getNewsList(currentPage, 6, category);
      setNews(response.items);
      setTotalPages(response.totalPages);
      setLoading(false);
    } catch (err) {
      setError('뉴스를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [currentPage, category]);

  const handleEdit = (id) => {
    navigate(`/news/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말로 이 뉴스를 삭제하시겠습니까?')) {
      try {
        await deleteNews(id);
        fetchNews();
      } catch (err) {
        setError('뉴스 삭제에 실패했습니다.');
      }
    }
  };

  if (loading) return <div className="p-4">로딩중...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {news.map(item => (
        <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <Link to={`/news/${item.id}`}>
            {item.media && item.media.length > 0 && item.media[0].media_type === 'image' && (
              <div className="relative h-48">
                <img
                  src={item.media[0].file_path}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">{item.title}</h3>
              {item.summary && (
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.summary}</p>
              )}
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                <span>조회수: {item.view_count}</span>
              </div>
            </div>
          </Link>
          <div className="px-4 pb-4 flex justify-end gap-2">
            <button
              onClick={() => handleEdit(item.id)}
              className="text-blue-500 hover:text-blue-700"
            >
              수정
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              className="text-red-500 hover:text-red-700"
            >
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 