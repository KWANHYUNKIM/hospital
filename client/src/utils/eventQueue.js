class EventQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.batchSize = 10;
    this.flushInterval = 30000; // 30초마다 플러시
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5초 후 재시도
    
    // 백엔드 API 준비 상태 확인 (임시)
    this.isBackendReady = process.env.REACT_APP_ANALYTICS_ENABLED === 'true' || false;
    
    // 주기적 플러시 설정 (백엔드가 준비된 경우에만)
    if (this.isBackendReady) {
      this.flushTimer = setInterval(() => {
        this.flush();
      }, this.flushInterval);
    }
    
    // 페이지 언로드 시 플러시
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
    
    // 온라인 상태 변경 감지
    window.addEventListener('online', () => {
      this.processOfflineEvents();
    });
  }

  // 이벤트 추가
  add(event) {
    // 백엔드가 준비되지 않은 경우 로그만 출력하고 큐에 추가하지 않음
    if (!this.isBackendReady) {
      console.log('📊 이벤트 큐 (백엔드 미준비):', event);
      return;
    }

    this.queue.push({
      ...event,
      timestamp: Date.now(),
      retryCount: 0
    });
    
    // 큐가 배치 크기에 도달하면 즉시 플러시
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
    
    // 로컬 스토리지에 저장 (오프라인 지원)
    this.saveToLocalStorage();
  }

  // 이벤트 플러시 (배치 전송)
  async flush() {
    if (this.isProcessing || this.queue.length === 0 || !this.isBackendReady) {
      return;
    }

    this.isProcessing = true;
    
    try {
      // 네트워크 상태 확인
      if (!navigator.onLine) {
        console.log('📡 오프라인 상태: 이벤트를 로컬에 저장');
        this.saveToLocalStorage();
        return;
      }

      const batch = this.queue.splice(0, this.batchSize);
      console.log(`📦 ${batch.length}개 이벤트 배치 전송 시작`);

      // 이벤트 타입별로 그룹화
      const groupedEvents = this.groupEventsByType(batch);
      
      // 각 그룹별로 전송
      for (const [eventType, events] of Object.entries(groupedEvents)) {
        await this.sendBatch(eventType, events);
      }

      console.log('✅ 이벤트 배치 전송 완료');
      
    } catch (error) {
      console.error('❌ 이벤트 배치 전송 실패:', error);
      
      // 실패한 이벤트들을 다시 큐에 추가
      this.queue.unshift(...this.queue.splice(0, this.batchSize));
      
      // 재시도 로직
      this.scheduleRetry();
    } finally {
      this.isProcessing = false;
    }
  }

  // 이벤트 타입별 그룹화
  groupEventsByType(events) {
    return events.reduce((groups, event) => {
      const type = event.type || 'unknown';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(event);
      return groups;
    }, {});
  }

  // 배치 전송
  async sendBatch(eventType, events) {
    const endpoints = {
      'search': '/api/analytics/search-event',
      'click': '/api/analytics/click-event',
      'dwell_time': '/api/analytics/dwell-time',
      'page_view': '/api/analytics/page-view'
    };

    const endpoint = endpoints[eventType];
    if (!endpoint) {
      console.warn(`⚠️ 알 수 없는 이벤트 타입: ${eventType}`);
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(events)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`✅ ${eventType} 이벤트 ${events.length}개 전송 완료`);
      
    } catch (error) {
      console.error(`❌ ${eventType} 이벤트 전송 실패:`, error);
      throw error;
    }
  }

  // 재시도 스케줄링
  scheduleRetry() {
    setTimeout(() => {
      if (this.queue.length > 0) {
        console.log('🔄 이벤트 재시도 중...');
        this.flush();
      }
    }, this.retryDelay);
  }

  // 로컬 스토리지에 저장
  saveToLocalStorage() {
    if (!this.isBackendReady) return;
    
    try {
      const offlineEvents = JSON.parse(localStorage.getItem('offline_events') || '[]');
      offlineEvents.push(...this.queue);
      
      // 최대 100개까지만 저장
      if (offlineEvents.length > 100) {
        offlineEvents.splice(0, offlineEvents.length - 100);
      }
      
      localStorage.setItem('offline_events', JSON.stringify(offlineEvents));
    } catch (error) {
      console.error('❌ 로컬 스토리지 저장 실패:', error);
    }
  }

  // 오프라인 이벤트 처리
  async processOfflineEvents() {
    if (!this.isBackendReady) return;
    
    try {
      const offlineEvents = JSON.parse(localStorage.getItem('offline_events') || '[]');
      
      if (offlineEvents.length === 0) {
        return;
      }

      console.log(`📡 온라인 복구: ${offlineEvents.length}개 오프라인 이벤트 처리 중...`);
      
      // 오프라인 이벤트를 큐에 추가
      this.queue.unshift(...offlineEvents);
      
      // 로컬 스토리지 클리어
      localStorage.removeItem('offline_events');
      
      // 플러시 실행
      await this.flush();
      
    } catch (error) {
      console.error('❌ 오프라인 이벤트 처리 실패:', error);
    }
  }

  // 큐 상태 확인
  getStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      isOnline: navigator.onLine,
      isBackendReady: this.isBackendReady
    };
  }

  // 큐 클리어
  clear() {
    this.queue = [];
    localStorage.removeItem('offline_events');
  }

  // 정리
  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// 싱글톤 인스턴스 생성
const eventQueue = new EventQueue();

export default eventQueue; 