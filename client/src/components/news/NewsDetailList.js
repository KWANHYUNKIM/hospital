import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNewsDetail, deleteNews } from '../../service/newsApi';
import RelatedNewsList from './RelatedNewsList';
import { useAuth } from '../../contexts/AuthContext';

export default function NewsDetailList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        const response = await getNewsDetail(id);
        if (!response) {
          throw new Error('뉴스 데이터를 찾을 수 없습니다.');
        }
        setNews(response);
        setLoading(false);
      } catch (err) {
        console.error('뉴스 상세 조회 실패:', err);
        setError(err.response?.data?.message || '뉴스를 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id]);

  const renderContent = (content) => {
    if (!content) return null;
    
    try {
      const parsedContent = JSON.parse(content);
      if (!Array.isArray(parsedContent)) {
        return <p className="text-gray-700">{content}</p>;
      }
      
      return parsedContent.map((block, index) => {
        if (!block || !block.type) return null;
        
        if (block.type === 'paragraph' && block.content && Array.isArray(block.content)) {
          return (
            <p key={block.id || index} className="mb-4">
              {block.content.map((item, i) => (
                <span 
                  key={i} 
                  className={item.styles ? Object.entries(item.styles).map(([key, value]) => `${key}-${value}`).join(' ') : ''}
                >
                  {item.text || ''}
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

  const handleDelete = async () => {
    if (window.confirm('정말로 이 뉴스를 삭제하시겠습니까?')) {
      try {
        await deleteNews(id);
        navigate('/news');
      } catch (err) {
        console.error('뉴스 삭제 실패:', err);
        setError('뉴스 삭제에 실패했습니다.');
      }
    }
  };

  const handleEdit = () => {
    navigate(`/news/edit/${id}`);
  };

  if (loading) return <div className="p-4">로딩중...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!news) return <div className="p-4">뉴스를 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6">
      {/* 목록으로 돌아가기 버튼 */}
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← 목록으로
        </button>
        
        {/* 작성자일 경우에만 수정/삭제 버튼 표시 */}
        {user && user.id === news.author_id && (
          <div className="flex gap-2">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded-full">
            {news.category_name || '전체'}
          </span>
          <span className="text-sm text-gray-500">
            {news.created_at ? new Date(news.created_at).toLocaleDateString() : ''}
          </span>
          <span className="text-sm text-gray-500">
            조회수 {news.view_count || 0}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {news.title || ''}
        </h1>
        {news.summary && (
          <p className="text-gray-600 mb-6">
            {news.summary}
          </p>
        )}
      </div>

      {/* 대표 이미지 */}
      {news.representative_image_url && (
        <div className="mb-6">
          <img
            src={news.representative_image_url}
            alt={news.title || '대표 이미지'}
            className="w-full h-auto rounded-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/default-news.png';
            }}
          />
        </div>
      )}

      {/* 추가 이미지들 */}
      {news.images && news.images.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">추가 이미지</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {news.images.map((imageUrl, index) => (
              <div key={index} className="rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`추가 이미지 ${index + 1}`}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/default-news.png';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 본문 */}
      <div className="prose max-w-none">
        {news.content && renderContent(news.content)}
      </div>

      {/* 관련 기사 */}
      {news.category_id && (
        <RelatedNewsList categoryId={news.category_id} excludeId={news.id} />
      )}
    </div>
  );
} 