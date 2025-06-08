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
  const [contentImages, setContentImages] = useState([]);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        const response = await getNewsDetail(id);
        if (!response) {
          throw new Error('뉴스 데이터를 찾을 수 없습니다.');
        }
        setNews(response);
        
        // 본문에서 이미지 URL 추출
        if (response.content) {
          try {
            const parsedContent = JSON.parse(response.content);
            const images = [];
            parsedContent.forEach(block => {
              if (block.type === 'image' && block.props?.url) {
                images.push(block.props.url);
              }
            });
            setContentImages(images);
          } catch (e) {
            console.error('Content parsing error:', e);
          }
        }
        
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
        } else if (block.type === 'image' && block.props?.url) {
          // 이미지 크기 정보 추출
          const { url, alt, width, height } = block.props;
          const imageStyle = {
            maxWidth: '100%',
            height: 'auto'
          };
          
          // 크기 정보가 있는 경우 적용
          if (width) {
            if (typeof width === 'number') {
              imageStyle.width = `${width}px`;
              imageStyle.maxWidth = 'none'; // 특정 크기가 지정된 경우 maxWidth 제한 해제
            } else if (typeof width === 'string') {
              imageStyle.width = width;
              if (width.includes('px') || width.includes('%')) {
                imageStyle.maxWidth = 'none';
              }
            }
          }
          
          if (height) {
            if (typeof height === 'number') {
              imageStyle.height = `${height}px`;
            } else if (typeof height === 'string') {
              imageStyle.height = height;
            }
          }
          
          console.log('이미지 블록 props:', block.props); // 디버깅용
          console.log('적용될 스타일:', imageStyle); // 디버깅용
          
          return (
            <div key={block.id || index} className="my-6 flex justify-center">
              <img
                src={url}
                alt={alt || '이미지'}
                style={{
                  ...imageStyle,
                  userSelect: 'none',
                  WebkitUserDrag: 'none',
                  MozUserDrag: 'none'
                }}
                className="rounded-lg"
                draggable={false}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/default-news.png';
                }}
              />
            </div>
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