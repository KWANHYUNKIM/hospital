import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNewsDetail } from '../../service/newsApi';
import RelatedNewsList from './RelatedNewsList';

export default function NewsDetailList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        const response = await getNewsDetail(id);
        setNews(response);
        setLoading(false);
      } catch (err) {
        setError('뉴스를 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id]);

  const renderContent = (content) => {
    if (!content) return null;
    
    try {
      const parsedContent = JSON.parse(content);
      return parsedContent.map((block, index) => {
        if (block.type === 'paragraph' && block.content && block.content.length > 0) {
          return (
            <p key={block.id} className="mb-4">
              {block.content.map((item, i) => (
                <span key={i} className={item.styles ? Object.entries(item.styles).map(([key, value]) => `${key}-${value}`).join(' ') : ''}>
                  {item.text}
                </span>
              ))}
            </p>
          );
        }
        return null;
      });
    } catch (e) {
      console.error('Content parsing error:', e);
      return <p className="text-gray-700">{content}</p>;
    }
  };

  if (loading) return <div className="p-4">로딩중...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!news) return <div className="p-4">뉴스를 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6">
      {/* 목록으로 돌아가기 버튼 */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← 목록으로
        </button>
      </div>

      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
            {news.category_name || '전체'}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(news.created_at).toLocaleDateString()}
          </span>
          <span className="text-sm text-gray-500">
            조회수 {news.view_count}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {news.title}
        </h1>
        {news.summary && (
          <p className="text-gray-600 mb-6">
            {news.summary}
          </p>
        )}
      </div>

      {/* 이미지 */}
      {news.image_url && (
        <div className="mb-6">
          <img
            src={news.image_url}
            alt={news.title}
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}

      {/* 본문 */}
      <div className="prose max-w-none">
        {news.content && renderContent(news.content)}
      </div>

      {/* 관련 기사 */}
      <RelatedNewsList categoryId={news.category_id} excludeId={news.id} />
    </div>
  );
} 