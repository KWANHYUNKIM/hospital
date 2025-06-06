import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRelatedNews } from '../../service/newsApi';

export default function RelatedNewsList({ categoryId, excludeId }) {
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        setLoading(true);
        const data = await getRelatedNews(categoryId, excludeId, 3);
        setRelatedNews(data);
        setLoading(false);
      } catch (err) {
        setError('관련 기사 불러오기 실패');
        setLoading(false);
      }
    };
    if (categoryId) fetchRelated();
  }, [categoryId, excludeId]);

  if (loading) return null;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!relatedNews || relatedNews.length === 0) return null;

  return (
    <div className="bg-gray-50 py-10 px-2 mt-16 rounded-xl">
      <h2 className="text-2xl font-bold mb-8 text-center">관련 기사 더 보기</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {relatedNews.map((news) => (
          <div
            key={news.id}
            className="bg-white rounded-lg shadow hover:shadow-md cursor-pointer overflow-hidden"
            onClick={() => navigate(`/news/${news.id}`)}
          >
            {news.image_url && (
              <img
                src={news.image_url}
                alt={news.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <div className="font-semibold text-lg mb-2">{news.title}</div>
              <div className="text-gray-500 text-sm">
                {new Date(news.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 