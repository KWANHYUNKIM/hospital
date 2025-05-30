import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';

const NursingHospitalBannerSlider = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([
    {
      id: 1,
      title: "요양병원 찾기",
      description: "전문적인 요양 서비스를 제공하는 요양병원을 찾아보세요",
      image: "/images/nursing-home-1.jpg",
      link: "/nursing-hospitals"
    },
    {
      id: 2,
      title: "장기요양 시설",
      description: "장기요양 시설에 대한 상세 정보를 확인하세요",
      image: "/images/nursing-home-2.jpg",
      link: "/nursing-hospitals"
    },
    {
      id: 3,
      title: "요양 서비스 안내",
      description: "요양 서비스 이용 방법과 절차를 알아보세요",
      image: "/images/nursing-home-3.jpg",
      link: "/nursing-hospitals"
    }
  ]);

  const handleClick = (link) => {
    navigate(link);
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">요양병원 안내</h2>
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={30}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        className="w-full"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="relative h-[200px] rounded-lg overflow-hidden shadow-lg">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${banner.image})`,
                  backgroundColor: '#f3f4f6' // 이미지 로딩 전 배경색
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6">
                  <h3 className="text-2xl font-bold mb-2">{banner.title}</h3>
                  <p className="text-center text-lg">{banner.description}</p>
                  <button 
                    onClick={() => handleClick(banner.link)}
                    className="mt-4 px-6 py-2 bg-white text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    자세히 보기
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default NursingHospitalBannerSlider;
