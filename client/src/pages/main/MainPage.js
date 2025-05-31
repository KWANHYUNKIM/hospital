import React, { useState} from "react";
import AppTour from '../../components/guide/AppTour';
import AutoComplete from '../../components/search/AutoComplete';
import MedicalGuideSlider from '../../components/guide/MedicalGuideSlider';
import NursingHospitalBannerSlider from '../../components/nursing/NursingHospitalBannerSlider';
import BigChatModal from "../../components/chat/BigChatModal";
import MedicalInfoSection from '../../components/guide/MedicalInfoSection';
//import WeatherSection from '../components/WeatherSection';
// import NavigationBar from '../components/NavigationBar';

const MainPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="bg-gray-50 min-h-screen">
      {/* 첫 방문 시 자동 투어 실행 */}
      <AppTour />

      {/* 헤더 섹션 */}
      <header className="bg-gradient-to-r from-blue-400 to-purple-500 text-white py-10 shadow-md">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col items-center space-y-4">
            <h1 className="text-4xl font-bold">삐뽀삐뽀119</h1>
            <p className="text-xl text-center max-w-3xl">
              당신의 근처에서 운영 중인 병원을 쉽게 찾아보세요
            </p>
            <div className="w-full max-w-3xl mt-6">
              <AutoComplete searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-6 md:px-12 py-12 space-y-16">
        {/* 주요 의료 정보 섹션 */}
        <section className="max-w-7xl mx-auto">
          <MedicalInfoSection />
        </section>

        {/* 의료 가이드 슬라이더 섹션 */}
        <section className="max-w-7xl mx-auto">
          <MedicalGuideSlider />
        </section>

        {/* 요양병원 배너 슬라이더 */}
        <section className="max-w-7xl mx-auto">
          <NursingHospitalBannerSlider />
        </section>
      </main>

      { <BigChatModal />}
    </section>
  );
};

export default MainPage;
