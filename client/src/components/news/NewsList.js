import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getNewsList, deleteNews } from '../../service/newsApi';

const DEFAULT_THUMBNAIL = 'https://placehold.co/150x150/e2e8f0/64748b?text=No+Image';

const getYouTubeThumbnail = (content) => {
  if (!content) {
    console.log('Content is null or undefined');
    return null;
  }
  
  try {
    console.log('Parsing content:', content);
    const parsedContent = JSON.parse(content);
    console.log('Parsed content:', parsedContent);

    // content 배열에서 YouTube URL 찾기
    for (const block of parsedContent) {
      console.log('Checking block:', block);
      if (block.type === 'paragraph' && block.content) {
        for (const item of block.content) {
          console.log('Checking content item:', item);
          if (item.text) {
            console.log('Found text:', item.text);
            // YouTube URL에서 비디오 ID 추출
            const videoId = item.text.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
            if (videoId) {
              console.log('Found YouTube ID:', videoId);
              // 여러 해상도의 썸네일 URL 생성
              const thumbnailUrls = [
                `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,  // 최고 해상도
                `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,      // 고해상도
                `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,      // 중간 해상도
                `https://img.youtube.com/vi/${videoId}/default.jpg`         // 기본 해상도
              ];
              console.log('Generated thumbnail URLs:', thumbnailUrls);
              return thumbnailUrls[0]; // 최고 해상도 반환
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('Content 파싱 실패:', e);
  }
  console.log('No YouTube URL found in content');
  return null;
};

export default function NewsList() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const navigate = useNavigate();

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await getNewsList(currentPage, 6, category);
      setNews(response.content || []);
      setTotalPages(response.totalPages || 1);
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
    navigate(`/admin/news/edit/${id}`);
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
  if (!news || news.length === 0) return <div className="p-4">표시할 뉴스가 없습니다.</div>;

  return (
    <div className="space-y-4">
      {news
        .sort((a, b) => b.view_count - a.view_count)
        .map((item, index) => {
          console.log('Processing news item:', item);
          // YouTube 썸네일 추출
          const thumbnailUrl = getYouTubeThumbnail(item.content) || 
                             item.media?.[0]?.file_path || 
                             item.image_url || 
                             DEFAULT_THUMBNAIL;
          
          console.log('Final thumbnail URL:', thumbnailUrl);

          return (
            <div
              key={item.id}
              className="flex justify-between bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden px-4 py-3"
            >
              {/* 왼쪽: 텍스트 섹션 */}
              <div className="flex flex-col flex-grow pr-4">
                {/* 순위 및 카테고리 */}
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${
                    index === 0 ? 'text-red-500' : 
                    index === 1 ? 'text-orange-500' : 
                    index === 2 ? 'text-yellow-500' : 
                    'text-gray-400'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                    {item.category_name || '전체'}
                  </span>
                </div>

                {/* 제목 */}
                <Link to={`/news/${item.id}`}>
                  <h3 className="text-lg font-bold text-black mt-1 line-clamp-1">
                    {item.title}
                  </h3>
                </Link>

                {/* 요약 (한 줄 제한) */}
                {item.summary && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{item.summary}</p>
                )}
              </div>

              {/* 오른쪽: 썸네일 */}
              <Link to={`/news/${item.id}`} className="w-24 h-24 flex-shrink-0">
                <img
                  src={thumbnailUrl}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-md"
                />
              </Link>
            </div>
          );
        })}

      {/* 페이지네이션 */}
      <div className="flex justify-center space-x-2 mt-6">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded ${
              currentPage === page
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}
