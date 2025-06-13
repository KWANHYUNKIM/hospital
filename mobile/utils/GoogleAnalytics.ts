// React Native용 Google Analytics
// 실제 사용 시에는 @react-native-google-analytics/google-analytics 패키지 설치 필요
// npm install @react-native-google-analytics/google-analytics

// 타입 정의
interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

interface ScreenViewEvent {
  screenName: string;
  screenClass?: string;
}

// Google Analytics 측정 ID
const GA_MEASUREMENT_ID = 'G-GTVH0NK2R7';

/**
 * Google Analytics 초기화
 * React Native에서는 네이티브 모듈을 통해 초기화
 */
export const initializeGA = async (): Promise<void> => {
  try {
    if (!GA_MEASUREMENT_ID) {
      console.warn('Google Analytics 측정 ID가 설정되지 않았습니다.');
      return;
    }

    // TODO: 실제 React Native Google Analytics 라이브러리 초기화
    // 예시:
    // import { GoogleAnalytics } from '@react-native-google-analytics/google-analytics';
    // await GoogleAnalytics.initialize(GA_MEASUREMENT_ID);
    
    console.log('Google Analytics 초기화됨:', GA_MEASUREMENT_ID);
  } catch (error) {
    console.error('Google Analytics 초기화 실패:', error);
  }
};

/**
 * 화면 조회 이벤트 전송
 * @param screenName 화면 이름
 * @param screenClass 화면 클래스 (선택사항)
 */
export const trackScreenView = async (screenName: string, screenClass?: string): Promise<void> => {
  try {
    if (!GA_MEASUREMENT_ID) {
      return;
    }

    const event: ScreenViewEvent = {
      screenName,
      screenClass: screenClass || screenName,
    };

    // TODO: 실제 화면 조회 이벤트 전송
    // 예시:
    // import { GoogleAnalytics } from '@react-native-google-analytics/google-analytics';
    // await GoogleAnalytics.logScreenView(event);
    
    console.log('화면 조회 이벤트:', event);
  } catch (error) {
    console.error('화면 조회 이벤트 전송 실패:', error);
  }
};

/**
 * 커스텀 이벤트 전송
 * @param event 이벤트 정보
 */
export const trackEvent = async (event: AnalyticsEvent): Promise<void> => {
  try {
    if (!GA_MEASUREMENT_ID) {
      return;
    }

    // TODO: 실제 커스텀 이벤트 전송
    // 예시:
    // import { GoogleAnalytics } from '@react-native-google-analytics/google-analytics';
    // await GoogleAnalytics.logEvent('custom_event', {
    //   category: event.category,
    //   action: event.action,
    //   label: event.label,
    //   value: event.value,
    // });
    
    console.log('커스텀 이벤트:', event);
  } catch (error) {
    console.error('커스텀 이벤트 전송 실패:', error);
  }
};

/**
 * 사용자 속성 설정
 * @param properties 사용자 속성 객체
 */
export const setUserProperties = async (properties: Record<string, any>): Promise<void> => {
  try {
    if (!GA_MEASUREMENT_ID) {
      return;
    }

    // TODO: 실제 사용자 속성 설정
    // 예시:
    // import { GoogleAnalytics } from '@react-native-google-analytics/google-analytics';
    // await GoogleAnalytics.setUserProperties(properties);
    
    console.log('사용자 속성 설정:', properties);
  } catch (error) {
    console.error('사용자 속성 설정 실패:', error);
  }
};

/**
 * 유저 ID 설정
 * @param userId 사용자 고유 ID
 */
export const setUserId = async (userId: string): Promise<void> => {
  try {
    if (!GA_MEASUREMENT_ID) {
      return;
    }

    // TODO: 실제 유저 ID 설정
    // 예시:
    // import { GoogleAnalytics } from '@react-native-google-analytics/google-analytics';
    // await GoogleAnalytics.setUserId(userId);
    
    console.log('유저 ID 설정:', userId);
  } catch (error) {
    console.error('유저 ID 설정 실패:', error);
  }
};

/**
 * 병원 검색 이벤트 (앱 특화)
 * @param searchQuery 검색어
 * @param resultCount 결과 개수
 */
export const trackHospitalSearch = async (searchQuery: string, resultCount: number): Promise<void> => {
  await trackEvent({
    category: 'Hospital',
    action: 'Search',
    label: searchQuery,
    value: resultCount,
  });
};

/**
 * 병원 상세 조회 이벤트 (앱 특화)
 * @param hospitalId 병원 ID
 * @param hospitalName 병원 이름
 */
export const trackHospitalView = async (hospitalId: string, hospitalName: string): Promise<void> => {
  await trackEvent({
    category: 'Hospital',
    action: 'View',
    label: hospitalName,
    value: parseInt(hospitalId, 10) || 0,
  });
};

/**
 * 전화 걸기 이벤트 (앱 특화)
 * @param hospitalName 병원 이름
 */
export const trackPhoneCall = async (hospitalName: string): Promise<void> => {
  await trackEvent({
    category: 'Hospital',
    action: 'Call',
    label: hospitalName,
  });
};

// 기존 함수와의 호환성을 위한 별칭
export const trackPageView = trackScreenView;

export default {
  initializeGA,
  trackScreenView,
  trackPageView,
  trackEvent,
  setUserProperties,
  setUserId,
  trackHospitalSearch,
  trackHospitalView,
  trackPhoneCall,
}; 