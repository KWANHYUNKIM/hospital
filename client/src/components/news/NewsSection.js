import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HealingNewsFrame from './HealingNewsFrame';
import RecommendChannels from '../recommend/RecommendChannels';
import RecommendPlaylist from '../recommend/RecommendPlaylist';
import RecommendHotNews from './RecommendHotNews';
import { getNewsCategories } from '../../service/newsApi';

export default function NewsSection() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getNewsCategories();
        const categoriesData = Array.isArray(response) ? response : [];
        setCategories(categoriesData);
      } catch (error) {
        console.error('카테고리 로딩 실패:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleCreateNews = () => {
    navigate('/admin/news');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 카테고리 및 생성 버튼 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          {categories && categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        <button
          onClick={handleCreateNews}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          새 소식 작성
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* 메인 컨텐츠 영역 */}
        <div className="flex-1 space-y-6">
          {/* 뉴스 카드 리스트 */}
          <div className="min-h-[400px]">
            <HealingNewsFrame 
              category={selectedCategory !== 'all' ? selectedCategory : null}
            />
          </div>
          
          {/* 추천 채널 섹션 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <RecommendChannels />
          </div>
        </div>

        {/* 사이드바 영역 */}
        <div className="w-full md:w-72 space-y-4">
          <RecommendPlaylist />
          <RecommendHotNews />
        </div>
      </div>
    </div>
  );
} 