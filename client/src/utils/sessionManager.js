class SessionManager {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.startTime = this.getOrCreateStartTime();
    this.scrollDepth = 0;
    this.pageLoadTime = null;
    this.interactionCount = 0;
  }

  // 세션 ID 생성 또는 가져오기
  getOrCreateSessionId() {
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  // 시작 시간 생성 또는 가져오기
  getOrCreateStartTime() {
    let startTime = localStorage.getItem('analytics_session_start_time');
    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem('analytics_session_start_time', startTime);
    }
    return parseInt(startTime);
  }

  // 세션 데이터 가져오기
  getSessionData() {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      duration: Date.now() - this.startTime,
      scrollDepth: this.scrollDepth,
      pageLoadTime: this.pageLoadTime,
      interactionCount: this.interactionCount
    };
  }

  // 스크롤 깊이 업데이트
  updateScrollDepth(depth) {
    this.scrollDepth = Math.max(this.scrollDepth, depth);
  }

  // 페이지 로드 시간 설정
  setPageLoadTime(loadTime) {
    this.pageLoadTime = loadTime;
  }

  // 상호작용 카운트 증가
  incrementInteractionCount() {
    this.interactionCount++;
  }

  // 세션 리셋 (새 세션 시작)
  resetSession() {
    this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    this.startTime = Date.now();
    this.scrollDepth = 0;
    this.pageLoadTime = null;
    this.interactionCount = 0;

    localStorage.setItem('analytics_session_id', this.sessionId);
    localStorage.setItem('analytics_session_start_time', this.startTime.toString());
  }

  // 세션 지속 시간 확인 (30분 이상이면 새 세션)
  shouldStartNewSession() {
    const sessionDuration = Date.now() - this.startTime;
    const thirtyMinutes = 30 * 60 * 1000; // 30분
    return sessionDuration > thirtyMinutes;
  }

  // 사용자 동의 상태 확인
  hasUserConsent() {
    return localStorage.getItem('analytics_consent') === 'true';
  }

  // 사용자 동의 설정
  setUserConsent(consent) {
    localStorage.setItem('analytics_consent', consent.toString());
  }

  // 사용자 ID 가져오기
  getUserId() {
    return localStorage.getItem('user_id') || 'anonymous';
  }

  // 사용자 ID 설정
  setUserId(userId) {
    localStorage.setItem('user_id', userId);
  }

  // IP 주소 가져오기 (간단한 방법)
  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('IP 주소 가져오기 실패:', error);
      return 'unknown';
    }
  }

  // User-Agent 가져오기
  getUserAgent() {
    return navigator.userAgent;
  }

  // 현재 페이지 URL 가져오기
  getCurrentPageUrl() {
    return window.location.href;
  }

  // 현재 페이지 제목 가져오기
  getCurrentPageTitle() {
    return document.title;
  }

  // 스크롤 깊이 계산 (0-100%)
  calculateScrollDepth() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;
    return Math.round(scrollPercentage);
  }

  // 페이지 로드 시간 측정
  measurePageLoadTime() {
    if (performance && performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      this.setPageLoadTime(loadTime);
      return loadTime;
    }
    return null;
  }
}

// 싱글톤 인스턴스 생성
const sessionManager = new SessionManager();

export default sessionManager; 