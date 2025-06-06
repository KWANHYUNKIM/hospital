import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getNewsCategories } from '../../service/newsApi';
import { ChevronRight } from 'lucide-react'; // 아이콘 라이브러리 사용

export default function NewsCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';
  const scrollRef = useRef(null);
  const [showScrollRight, setShowScrollRight] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await getNewsCategories();
        const categoriesData = Array.isArray(response) ? response : [];
        setCategories([{ id: 'all', name: '전체' }, ...categoriesData]);
        setLoading(false);
      } catch (error) {
        setError('카테고리를 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      setShowScrollRight(container.scrollWidth > container.clientWidth);
    }
  }, [categories]);

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };

  if (loading) return <div className="p-4">로딩중...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="relative overflow-hidden mb-4">
      <div
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto scrollbar-hide px-2"
      >
        {categories.map((category) => {
          const isActive = currentCategory === category.id;
          return (
            <Link
              key={category.id}
              to={`/news?category=${category.id}`}
              className={`flex items-center whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'text-black font-bold underline underline-offset-4'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              {category.name}
            </Link>
          );
        })}
      </div>

      {showScrollRight && (
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-white to-transparent px-2"
          onClick={scrollRight}
        >
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>
      )}
    </div>
  );
}