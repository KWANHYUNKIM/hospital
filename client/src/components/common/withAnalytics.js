import React from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';

// 이벤트 수집을 위한 고차 컴포넌트
export const withAnalytics = (WrappedComponent, options = {}) => {
  return function WithAnalyticsComponent(props) {
    const { sendClickEvent, sendPageViewEvent } = useAnalytics();

    // 클릭 이벤트를 자동으로 감지하고 전송하는 함수
    const handleClick = async (event, additionalData = {}) => {
      try {
        // 클릭된 요소에서 데이터 추출
        const target = event.currentTarget;
        const hospitalId = target.dataset.hospitalId || target.getAttribute('data-hospital-id');
        const clickType = target.dataset.clickType || 'GENERAL_CLICK';
        const pageType = options.pageType || 'UNKNOWN_PAGE';
        
        // 병원 관련 클릭인 경우에만 이벤트 전송
        if (hospitalId) {
          await sendClickEvent(hospitalId, 'AUTO_DETECTED', {
            pageType,
            clickType,
            elementType: target.tagName.toLowerCase(),
            elementClass: target.className,
            ...additionalData
          });
        }
      } catch (error) {
        console.error('자동 클릭 이벤트 전송 실패:', error);
      }
    };

    // 페이지 뷰 이벤트 자동 전송
    React.useEffect(() => {
      if (options.autoPageView !== false) {
        const sendPageView = async () => {
          try {
            await sendPageViewEvent(options.pageType || 'UNKNOWN_PAGE', {
              pageTitle: document.title,
              referrer: document.referrer,
              ...options.pageViewData
            });
          } catch (error) {
            console.error('페이지 뷰 이벤트 전송 실패:', error);
          }
        };
        
        sendPageView();
      }
    }, [sendPageViewEvent]);

    // 클릭 이벤트 리스너 추가
    React.useEffect(() => {
      if (options.autoClickTracking !== false) {
        const handleGlobalClick = (event) => {
          // 병원 관련 요소인지 확인
          const hospitalElement = event.target.closest('[data-hospital-id]');
          if (hospitalElement) {
            handleClick(event);
          }
        };

        document.addEventListener('click', handleGlobalClick);
        return () => document.removeEventListener('click', handleGlobalClick);
      }
    }, []);

    return <WrappedComponent {...props} />;
  };
};

// 특정 이벤트 타입별 고차 컴포넌트들
export const withHospitalAnalytics = (WrappedComponent, options = {}) => {
  return withAnalytics(WrappedComponent, {
    pageType: 'HOSPITAL_PAGE',
    autoClickTracking: true,
    autoPageView: true,
    ...options
  });
};

export const withSearchAnalytics = (WrappedComponent, options = {}) => {
  return withAnalytics(WrappedComponent, {
    pageType: 'SEARCH_PAGE',
    autoClickTracking: true,
    autoPageView: true,
    ...options
  });
};

export const withMainPageAnalytics = (WrappedComponent, options = {}) => {
  return withAnalytics(WrappedComponent, {
    pageType: 'MAIN_PAGE',
    autoClickTracking: true,
    autoPageView: true,
    ...options
  });
}; 