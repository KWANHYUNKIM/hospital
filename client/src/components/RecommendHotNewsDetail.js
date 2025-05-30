import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RecommendPlaylist from './RecommendPlaylist';
import RecommendChannels from './RecommendChannels';

const hotNews = [
  {
    id: 1,
    title: '불치병 극복 사례 모음',
    detail: '여러 환자들이 불치병을 극복한 감동적인 사례를 모았습니다. 희망과 용기를 얻으세요!\n\n- A씨: 희귀병 진단 후 꾸준한 치료와 긍정적인 마음으로 건강을 되찾음\n- B씨: 가족과 의료진의 도움으로 삶의 질을 높임\n- C씨: 새로운 치료법 도전으로 증상 완화\n\n이 외에도 다양한 극복 스토리가 있습니다.'
  },
  {
    id: 2,
    title: '정신건강 전문가 인터뷰',
    detail: '정신건강 전문가와의 인터뷰를 통해 마음 건강을 지키는 방법을 알아봅니다.\n\n- 스트레스 관리법\n- 일상 속 명상 팁\n- 상담의 중요성\n\n전문가의 조언을 통해 더 건강한 삶을 시작해보세요.'
  }
];

export default function RecommendHotNewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const news = hotNews.find(n => String(n.id) === String(id));

  if (!news) {
    return <div className="p-8 text-center text-red-500">뉴스를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* 본문 */}
        <div className="flex-1">
          <div className="bg-white rounded shadow p-10">
            <button className="mb-6 text-blue-600 hover:underline text-lg" onClick={() => navigate(-1)}>
              ← 목록으로
            </button>
            <div className="text-3xl font-bold mb-6">{news.title}</div>
            <div className="whitespace-pre-line text-gray-700 text-xl leading-relaxed">{news.detail}</div>
          </div>
        </div>
        {/* 사이드바 */}
        <div className="w-full md:w-72">
          <RecommendPlaylist />
          <RecommendChannels />
        </div>
      </div>
    </div>
  );
} 