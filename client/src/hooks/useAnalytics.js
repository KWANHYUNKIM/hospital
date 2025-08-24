import { useCallback, useEffect, useRef } from 'react';
import { analyticsApi } from '../service/analyticsApi';
import sessionManager from '../utils/sessionManager';
import eventQueue from '../utils/eventQueue';

// 디바운스 함수
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 스로틀 함수
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const useAnalytics = () => {
  const pageStartTime = useRef(Date.now());
  const scrollDepth = useRef(0);
  const interactionCount = useRef(0);

  // 사용자 동의 확인
  const hasConsent = useCallback(() => {
    return sessionManager.hasUserConsent();
  }, []);

  // 검색 이벤트 전송 (배치 처리)
  const sendSearchEvent = useCallback(async (searchQuery, searchResultsCount, additionalData = {}) => {
    if (!hasConsent()) return;

    try {
      const eventData = {
        type: 'search',
        userId: sessionManager.getUserId(),
        searchQuery,
        searchResultsCount,
        searchSuccess: searchResultsCount > 0,
        userAgent: sessionManager.getUserAgent(),
        ipAddress: await sessionManager.getClientIP(),
        sessionId: sessionManager.getSessionData().sessionId,
        ...additionalData
      };

      // 이벤트 큐에 추가 (배치 처리)
      eventQueue.add(eventData);
      console.log('✅ 검색 이벤트 큐에 추가:', searchQuery);
    } catch (error) {
      console.error('❌ 검색 이벤트 생성 실패:', error);
    }
  }, [hasConsent]);

  // 클릭 이벤트 전송 (배치 처리)
  const sendClickEvent = useCallback(async (hospitalId, clickPosition, additionalData = {}) => {
    if (!hasConsent()) return;

    try {
      const eventData = {
        type: 'click',
        userId: sessionManager.getUserId(),
        hospitalId,
        clickPosition,
        pageType: additionalData.pageType || 'HOSPITAL_LIST',
        clickType: additionalData.clickType || 'DETAIL_VIEW',
        dwellTimeBeforeClick: additionalData.dwellTimeBeforeClick || 0,
        scrollDepth: scrollDepth.current,
        userAgent: sessionManager.getUserAgent(),
        ipAddress: await sessionManager.getClientIP(),
        sessionId: sessionManager.getSessionData().sessionId,
        ...additionalData
      };

      // 이벤트 큐에 추가 (배치 처리)
      eventQueue.add(eventData);
      console.log('✅ 클릭 이벤트 큐에 추가:', hospitalId);
    } catch (error) {
      console.error('❌ 클릭 이벤트 생성 실패:', error);
    }
  }, [hasConsent]);

  // 체류 시간 이벤트 전송 (배치 처리)
  const sendDwellTimeEvent = useCallback(async (pageType, dwellTimeSeconds, additionalData = {}) => {
    if (!hasConsent()) return;

    try {
      const eventData = {
        type: 'dwell_time',
        userId: sessionManager.getUserId(),
        pageType,
        dwellTimeSeconds,
        scrollDepth: scrollDepth.current,
        interactionCount: interactionCount.current,
        pageLoadTime: sessionManager.getPageLoadTime(),
        exitMethod: additionalData.exitMethod || 'PAGE_LEAVE',
        userAgent: sessionManager.getUserAgent(),
        ipAddress: await sessionManager.getClientIP(),
        sessionId: sessionManager.getSessionData().sessionId,
        ...additionalData
      };

      // 이벤트 큐에 추가 (배치 처리)
      eventQueue.add(eventData);
      console.log('✅ 체류 시간 이벤트 큐에 추가:', pageType, dwellTimeSeconds);
    } catch (error) {
      console.error('❌ 체류 시간 이벤트 생성 실패:', error);
    }
  }, [hasConsent]);

  // 페이지 뷰 이벤트 전송 (배치 처리)
  const sendPageViewEvent = useCallback(async (pageType, additionalData = {}) => {
    if (!hasConsent()) return;

    try {
      const eventData = {
        type: 'page_view',
        userId: sessionManager.getUserId(),
        pageType,
        userAgent: sessionManager.getUserAgent(),
        ipAddress: await sessionManager.getClientIP(),
        sessionId: sessionManager.getSessionData().sessionId,
        referrer: document.referrer,
        ...additionalData
      };

      // 이벤트 큐에 추가 (배치 처리)
      eventQueue.add(eventData);
      console.log('✅ 페이지 뷰 이벤트 큐에 추가:', pageType);
    } catch (error) {
      console.error('❌ 페이지 뷰 이벤트 생성 실패:', error);
    }
  }, [hasConsent]);

  // 스크롤 깊이 업데이트
  const updateScrollDepth = useCallback((depth) => {
    scrollDepth.current = Math.max(scrollDepth.current, depth);
    sessionManager.updateScrollDepth(depth);
  }, []);

  // 상호작용 카운트 증가
  const incrementInteraction = useCallback(() => {
    interactionCount.current++;
    sessionManager.incrementInteractionCount();
  }, []);

  // 페이지 로드 시간 측정
  const measurePageLoadTime = useCallback(() => {
    const loadTime = sessionManager.measurePageLoadTime();
    if (loadTime) {
      console.log('📊 페이지 로드 시간:', loadTime + 'ms');
    }
  }, []);

  // 이벤트 큐 상태 확인
  const getEventQueueStatus = useCallback(() => {
    return eventQueue.getStatus();
  }, []);

  // 이벤트 큐 강제 플러시
  const flushEventQueue = useCallback(async () => {
    await eventQueue.flush();
  }, []);

  // 스크롤 이벤트 리스너 설정
  useEffect(() => {
    if (!hasConsent()) return;

    const handleScroll = throttle(() => {
      const depth = sessionManager.calculateScrollDepth();
      updateScrollDepth(depth);
    }, 1000);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasConsent, updateScrollDepth]);

  // 클릭 이벤트 리스너 설정
  useEffect(() => {
    if (!hasConsent()) return;

    const handleClick = () => {
      incrementInteraction();
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [hasConsent, incrementInteraction]);

  // 페이지 언로드 시 체류 시간 전송
  useEffect(() => {
    if (!hasConsent()) return;

    const handleBeforeUnload = () => {
      const dwellTime = Math.floor((Date.now() - pageStartTime.current) / 1000);
      if (dwellTime > 0) {
        // 동기적으로 전송 (페이지 떠날 때)
        const eventData = {
          type: 'dwell_time',
          userId: sessionManager.getUserId(),
          pageType: 'PAGE_LEAVE',
          dwellTimeSeconds: dwellTime,
          scrollDepth: scrollDepth.current,
          interactionCount: interactionCount.current,
          exitMethod: 'PAGE_UNLOAD',
          userAgent: sessionManager.getUserAgent(),
          sessionId: sessionManager.getSessionData().sessionId
        };

        // navigator.sendBeacon 사용 (페이지 떠날 때도 전송 가능)
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(eventData)], { type: 'application/json' });
          navigator.sendBeacon('/api/analytics/dwell-time', blob);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasConsent]);

  // 페이지 로드 시간 측정
  useEffect(() => {
    if (!hasConsent()) return;

    const timer = setTimeout(() => {
      measurePageLoadTime();
    }, 100);

    return () => clearTimeout(timer);
  }, [hasConsent, measurePageLoadTime]);

  // 세션 관리
  useEffect(() => {
    if (sessionManager.shouldStartNewSession()) {
      sessionManager.resetSession();
      console.log('🔄 새 세션 시작');
    }
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      // 페이지 떠날 때 체류 시간 이벤트 전송
      const dwellTime = Math.floor((Date.now() - pageStartTime.current) / 1000);
      if (dwellTime > 0 && hasConsent()) {
        sendDwellTimeEvent('PAGE_LEAVE', dwellTime, { exitMethod: 'COMPONENT_UNMOUNT' });
      }
    };
  }, [hasConsent, sendDwellTimeEvent]);

  return {
    sendSearchEvent,
    sendClickEvent,
    sendDwellTimeEvent,
    sendPageViewEvent,
    updateScrollDepth,
    incrementInteraction,
    measurePageLoadTime,
    hasConsent,
    sessionManager,
    getEventQueueStatus,
    flushEventQueue
  };
}; 