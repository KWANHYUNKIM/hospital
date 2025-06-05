import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NewsCategory from './NewsCategory';
import NewsList from './NewsList';
import RecommendedChannels from './RecommendedChannels';
import RecommendedVideos from './RecommendedVideos';

export default function NewsPage() {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useAuth();

  const handleCreateNews = () => {
    navigate('/admin/news/create');
  };

  const handleManageCategories = () => {
    navigate('/admin/news/categories');
  };

  const isAdmin = isLoggedIn && userRole === 'ADMIN';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 섹션 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">뉴스</h1>
        {isAdmin && (
          <div className="flex gap-4">
            <button
              onClick={handleManageCategories}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              카테고리 관리
            </button>
            <button
              onClick={handleCreateNews}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              뉴스 작성
            </button>
          </div>
        )}
      </div>

      {/* ✅ 상단 카테고리 바 */}
      <NewsCategory />

      {/* ✅ 메인 콘텐츠: 뉴스 + 추천 채널 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-4">
        {/* 뉴스 목록 (3/4) */}
        <div className="lg:col-span-3">
          <NewsList />
          <div className="mt-8">
            <RecommendedVideos />
          </div>
        </div>

        {/* 추천 채널 (1/4) */}
        <div className="lg:col-span-1">
          <RecommendedChannels />
        </div>
      </div>
    </div>
  );
}