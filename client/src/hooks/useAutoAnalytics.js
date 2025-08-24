import { useEffect, useCallback } from 'react';
import { useAnalytics } from './useAnalytics';

export const useAutoAnalytics = (options = {}) => {
  const { sendClickEvent, sendPageViewEvent } = useAnalytics();
  
  const {
    pageType = 'UNKNOWN_PAGE',
    autoPageView = true,
    autoClickTracking = true,
    clickSelectors = ['[data-hospital-id]', '[data-analytics-click]'],
    pageViewData = {}
  } = options;

  // 백엔드 API 준비 상태 확인 (임시)
  const isBackendReady = process.env.REACT_APP_ANALYTICS_ENABLED === 'true' || true;
  
  // 디버깅: 환경 변수 값 확인
  console.log('🔧 환경 변수 디버깅:', {
    REACT_APP_ANALYTICS_ENABLED: process.env.REACT_APP_ANALYTICS_ENABLED,
    isBackendReady: isBackendReady,
    type: typeof process.env.REACT_APP_ANALYTICS_ENABLED
  });

  // 페이지 뷰 자동 전송
  useEffect(() => {
    if (autoPageView && isBackendReady) {
      const sendPageView = async () => {
        try {
          await sendPageViewEvent(pageType, {
            pageTitle: document.title,
            referrer: document.referrer,
            url: window.location.href,
            ...pageViewData
          });
        } catch (error) {
          console.error('자동 페이지 뷰 이벤트 전송 실패:', error);
        }
      };
      
      sendPageView();
    } else if (autoPageView && !isBackendReady) {
      // 백엔드가 준비되지 않은 경우 로그만 출력
      console.log('📊 페이지 뷰 이벤트 (백엔드 미준비):', {
        pageType,
        pageTitle: document.title,
        referrer: document.referrer,
        url: window.location.href,
        ...pageViewData
      });
    }
  }, [sendPageViewEvent, pageType, autoPageView, pageViewData, isBackendReady]);

  // 클릭 이벤트 자동 감지
  const handleAutoClick = useCallback(async (event) => {
    try {
      // 클릭된 요소에서 데이터 추출
      const target = event.target;
      const hospitalElement = target.closest('[data-hospital-id]');
      const analyticsElement = target.closest('[data-analytics-click]');
      
      let element = hospitalElement || analyticsElement;
      
      if (element) {
        const hospitalId = element.dataset.hospitalId;
        const clickType = element.dataset.clickType || 'AUTO_DETECTED';
        const elementType = element.tagName.toLowerCase();
        const elementClass = element.className;
        
        // 추가 데이터 추출
        const additionalData = {};
        Object.keys(element.dataset).forEach(key => {
          if (key.startsWith('analytics')) {
            additionalData[key.replace('analytics', '').toLowerCase()] = element.dataset[key];
          }
        });

        if (hospitalId) {
          if (isBackendReady) {
            await sendClickEvent(hospitalId, clickType, {
              pageType,
              elementType,
              elementClass,
              ...additionalData
            });
          } else {
            // 백엔드가 준비되지 않은 경우 로그만 출력
            console.log('📊 클릭 이벤트 (백엔드 미준비):', {
              hospitalId,
              clickType,
              pageType,
              elementType,
              elementClass,
              ...additionalData
            });
          }
        }
      }
    } catch (error) {
      console.error('자동 클릭 이벤트 처리 실패:', error);
    }
  }, [sendClickEvent, pageType, isBackendReady]);

  // 전역 클릭 이벤트 리스너 설정
  useEffect(() => {
    if (autoClickTracking) {
      document.addEventListener('click', handleAutoClick);
      return () => document.removeEventListener('click', handleAutoClick);
    }
  }, [autoClickTracking, handleAutoClick]);

  return {
    sendClickEvent,
    sendPageViewEvent
  };
}; 