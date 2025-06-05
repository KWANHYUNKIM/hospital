import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNewsList } from '../../service/newsApi';

export default function RecommendHotNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await getNewsList(1, 5); // 상위 5개 뉴스만 표시
        // response가 배열인 경우 직접 사용, 객체인 경우 items 속성 사용
        const newsData = Array.isArray(response) ? response : (response.items || []);
        setNews(newsData);
        setLoading(false);
      } catch (err) {
        setError('뉴스를 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) return <div className="bg-gray-50 rounded p-4 mb-4">로딩중...</div>;
  if (error) return <div className="bg-gray-50 rounded p-4 mb-4 text-red-500">{error}</div>;
  if (!news || news.length === 0) return <div className="bg-gray-50 rounded p-4 mb-4">표시할 뉴스가 없습니다.</div>;

  return (
    <div className="bg-gray-50 rounded p-4 mb-4">
      <div className="font-bold mb-2">실시간 인기 뉴스</div>
      <ul className="text-sm">
        {news.map(item => (
          <li key={item.id} className="mb-2">
            <Link
              to={`/news/${item.id}`}
              className="cursor-pointer hover:underline hover:text-blue-600"
            >
              {item.title}
            </Link>
            {item.summary && (
              <p className="text-gray-600 text-xs mt-1">{item.summary}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
} 