import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HealingNewsFrame from './HealingNewsFrame';
import RecommendChannels from './RecommendChannels';
import RecommendPlaylist from './RecommendPlaylist';
import RecommendHotNews from './RecommendHotNews';
import { getNewsCategories } from '../service/newsApi';

export default function NewsSection() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getNewsCategories();
        setCategories(response);
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
          {categories.map((category) => (
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
        {/* 뉴스 카드 리스트 */}
        <HealingNewsFrame 
          className="flex-1" 
          category={selectedCategory !== 'all' ? selectedCategory : null}
        />
        {/* 사이드 추천/플레이리스트 등 부가 영역 */}
        <div className="w-full md:w-72">
          <RecommendPlaylist />
          <RecommendHotNews />
          <RecommendChannels />
        </div>
      </div>
    </div>
  );
} 