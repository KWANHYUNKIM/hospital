import React from 'react';
import MotionGraphic from './motion/MotionGraphic';
import './DownloadSection.css';

const DownloadSection = () => (
  <section className="download-section">
    {/* 왼쪽 정보 영역 */}
    <div className="download-section__info">
      <h2 className="download-section__title">
        나만의 스마트한 앱<br />
        <span className="download-section__highlight">
          삐뽀삐뽀119로<br />
          일상을 바꿔보세요.
        </span>
      </h2>
      <p className="download-section__desc">
        더 가볍고, 더 편하게, 내 일상에 딱 맞는 앱이 여기 있습니다.<br />
        새로운 건강정보와 서비스를 경험해보세요.<br />
        작지만 큰 변화가 시작됩니다.
      </p>
      <a href="" className="download-section__btn">
        <span className="download-section__btn-icon">🚀</span>
        <span className="download-section__btn-text">
          앱 출시 예정
        </span>
        <span className="download-section__btn-arrow">→</span>
      </a>
    </div>

    {/* 오른쪽 모션그래픽/이미지 영역 */}
    <div className="download-section__visual">
      {/* MotionGraphic 컴포넌트 */}
      <div className="download-section__motion">
        <MotionGraphic style={{ width: 340, height: 340 }} />
      </div>

     
    </div>
  </section>
);

export default DownloadSection;