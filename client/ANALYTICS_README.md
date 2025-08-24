# 🎯 이벤트 수집 시스템 (Analytics System)

## 📋 개요

이 시스템은 사용자의 행동 데이터를 수집하여 유튜브와 같은 개인화된 검색 결과를 제공하기 위한 이벤트 수집 시스템입니다.

## 🏗️ 시스템 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Event Queue   │    │   Backend API   │
│                 │    │                 │    │                 │
│ • useAnalytics  │───▶│ • Batch Process │───▶│ • MongoDB       │
│ • Session Mgmt  │    │ • Offline Support│    │ • Elasticsearch │
│ • Consent Mgmt  │    │ • Retry Logic   │    │ • ChromaDB      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 파일 구조

```
client/src/
├── service/
│   └── analyticsApi.js          # API 서비스
├── utils/
│   ├── sessionManager.js        # 세션 관리
│   └── eventQueue.js           # 이벤트 큐 및 배치 처리
├── hooks/
│   ├── useAnalytics.js         # 기본 이벤트 수집 훅
│   └── useAutoAnalytics.js     # 자동 이벤트 감지 훅
├── components/
│   ├── common/
│   │   ├── AnalyticsConsent.js # 사용자 동의 관리
│   │   └── withAnalytics.js    # 고차 컴포넌트
│   └── admin/
│       └── AnalyticsDashboard.js # 관리자 대시보드
└── pages/
    ├── main/MainPage.js         # 메인 페이지 (자동 감지)
    ├── hospital/
    │   ├── HospitalListPage.js  # 병원 목록 (자동 감지)
    │   └── HospitalDetailPage.js # 병원 상세 (자동 감지)
    └── search/
        └── AutoComplete.js      # 검색 컴포넌트 (검색 이벤트)
```

## 🚀 주요 기능

### 1. 이벤트 수집
- **검색 이벤트**: 검색어, 결과 수, 성공 여부
- **클릭 이벤트**: 병원 클릭, 위치, 페이지 타입
- **페이지 뷰**: 페이지 방문, 체류 시간
- **체류 시간**: 페이지별 체류 시간, 스크롤 깊이

### 2. 세션 관리
- 자동 세션 생성 및 관리
- 30분 세션 타임아웃
- 스크롤 깊이 추적
- 상호작용 카운트

### 3. 배치 처리
- 10개 단위 배치 전송
- 30초 주기 자동 플러시
- 오프라인 지원 (로컬 스토리지)
- 재시도 로직 (최대 3회)

### 4. 사용자 동의
- GDPR 준수 동의 관리
- 상세한 개인정보 처리 방침
- 동의 철회 기능

### 5. 자동 이벤트 감지 ⭐ NEW!
- HTML data 속성 기반 자동 감지
- 수동 코드 작성 불필요
- 전역 클릭 이벤트 리스너
- 페이지 뷰 자동 전송

## 🔧 사용 방법

### 1. 기본 설정

```javascript
// App.js에 동의 컴포넌트 추가
import AnalyticsConsent from './components/common/AnalyticsConsent';

// 컴포넌트 내부에 추가
<AnalyticsConsent />
```

### 2. 자동 이벤트 감지 (추천!) ⭐

```javascript
import { useAutoAnalytics } from '../hooks/useAutoAnalytics';

const MyPage = () => {
  // 자동 이벤트 감지 설정
  useAutoAnalytics({
    pageType: 'MY_PAGE',
    autoPageView: true,
    autoClickTracking: true,
    pageViewData: {
      pageTitle: '내 페이지'
    }
  });

  return (
    <div>
      {/* 병원 카드 - 자동으로 클릭 이벤트 감지 */}
      <div 
        data-hospital-id="hosp_123"
        data-click-type="DETAIL_VIEW"
        data-analytics-hospital-name="서울대병원"
        data-analytics-hospital-address="서울시 종로구..."
        onClick={() => navigate('/hospital/details/hosp_123')}
      >
        <h3>서울대병원</h3>
        <p>서울시 종로구...</p>
      </div>

      {/* 지도보기 버튼 - 자동으로 클릭 이벤트 감지 */}
      <a 
        href="https://map.naver.com/..."
        data-analytics-click="MAP_VIEW"
        data-analytics-hospital-id="hosp_123"
      >
        지도보기
      </a>

      {/* 전화 버튼 - 자동으로 클릭 이벤트 감지 */}
      <button 
        onClick={() => window.location.href = 'tel:02-1234-5678'}
        data-analytics-click="PHONE_CALL"
        data-analytics-hospital-id="hosp_123"
        data-analytics-phone-number="02-1234-5678"
      >
        전화하기
      </button>
    </div>
  );
};
```

### 3. 고차 컴포넌트 사용

```javascript
import { withHospitalAnalytics } from '../components/common/withAnalytics';

const HospitalListPage = () => {
  // 컴포넌트 로직...
};

// 자동 이벤트 감지 적용
export default withHospitalAnalytics(HospitalListPage, {
  pageViewData: {
    pageTitle: '병원 목록'
  }
});
```

### 4. 수동 이벤트 수집 (필요시)

```javascript
import { useAnalytics } from '../hooks/useAnalytics';

const MyComponent = () => {
  const { 
    sendSearchEvent, 
    sendClickEvent, 
    sendPageViewEvent,
    hasConsent 
  } = useAnalytics();

  // 검색 이벤트
  const handleSearch = async (query, results) => {
    await sendSearchEvent(query, results.length, {
      region: '서울',
      searchType: 'KEYWORD'
    });
  };

  // 클릭 이벤트
  const handleClick = async (hospitalId, position) => {
    await sendClickEvent(hospitalId, position, {
      pageType: 'HOSPITAL_LIST',
      clickType: 'DETAIL_VIEW'
    });
  };

  // 페이지 뷰 이벤트
  useEffect(() => {
    sendPageViewEvent('MY_PAGE', {
      pageTitle: '내 페이지',
      referrer: document.referrer
    });
  }, []);
};
```

### 5. 세션 관리

```javascript
import sessionManager from '../utils/sessionManager';

// 세션 데이터 가져오기
const sessionData = sessionManager.getSessionData();

// 사용자 동의 확인
const hasConsent = sessionManager.hasUserConsent();

// 사용자 ID 설정
sessionManager.setUserId('user123');
```

## 📊 수집되는 데이터

### 검색 이벤트
```javascript
{
  type: 'search',
  userId: 'user123',
  searchQuery: '내과',
  searchResultsCount: 15,
  searchSuccess: true,
  userAgent: 'Mozilla/5.0...',
  ipAddress: '192.168.1.1',
  sessionId: 'session_1234567890_abc123',
  latitude: 37.5665,
  longitude: 126.9780,
  region: '서울'
}
```

### 클릭 이벤트 (자동 감지)
```javascript
{
  type: 'click',
  userId: 'user123',
  hospitalId: 'hosp_123',
  clickPosition: 'AUTO_DETECTED',
  pageType: 'HOSPITAL_LIST_PAGE',
  clickType: 'DETAIL_VIEW',
  elementType: 'div',
  elementClass: 'hospital-card',
  hospitalName: '서울대병원',
  hospitalAddress: '서울시 종로구...',
  searchQuery: '내과',
  selectedRegion: '서울',
  currentPage: 1,
  position: 3
}
```

### 페이지 뷰 이벤트
```javascript
{
  type: 'page_view',
  userId: 'user123',
  pageType: 'MAIN_PAGE',
  userAgent: 'Mozilla/5.0...',
  ipAddress: '192.168.1.1',
  sessionId: 'session_1234567890_abc123',
  referrer: 'https://google.com',
  pageTitle: '삐뽀삐뽀119 - 메인페이지'
}
```

### 체류 시간 이벤트
```javascript
{
  type: 'dwell_time',
  userId: 'user123',
  pageType: 'HOSPITAL_LIST_PAGE',
  dwellTimeSeconds: 180,
  scrollDepth: 85,
  interactionCount: 12,
  pageLoadTime: 1200,
  exitMethod: 'PAGE_LEAVE'
}
```

## 🎯 자동 이벤트 감지 가이드

### 지원하는 data 속성들

```html
<!-- 기본 병원 클릭 감지 -->
<div 
  data-hospital-id="hosp_123"
  data-click-type="DETAIL_VIEW"
>
  병원 카드
</div>

<!-- 추가 분석 데이터 -->
<div 
  data-hospital-id="hosp_123"
  data-click-type="DETAIL_VIEW"
  data-analytics-page-type="HOSPITAL_LIST_PAGE"
  data-analytics-hospital-name="서울대병원"
  data-analytics-hospital-address="서울시 종로구..."
  data-analytics-hospital-category="종합병원"
  data-analytics-search-query="내과"
  data-analytics-selected-region="서울"
  data-analytics-selected-subject="전체"
  data-analytics-selected-major="내과"
  data-analytics-current-page="1"
  data-analytics-position="3"
>
  병원 카드 (상세 데이터)
</div>

<!-- 특정 액션 감지 -->
<button 
  data-analytics-click="PHONE_CALL"
  data-analytics-hospital-id="hosp_123"
  data-analytics-phone-number="02-1234-5678"
>
  전화하기
</button>

<a 
  data-analytics-click="MAP_VIEW"
  data-analytics-hospital-id="hosp_123"
>
  지도보기
</a>
```

### 자동 감지 설정 옵션

```javascript
useAutoAnalytics({
  pageType: 'HOSPITAL_LIST_PAGE',        // 페이지 타입
  autoPageView: true,                    // 페이지 뷰 자동 전송
  autoClickTracking: true,               // 클릭 이벤트 자동 감지
  clickSelectors: [                      // 감지할 요소 선택자
    '[data-hospital-id]',
    '[data-analytics-click]'
  ],
  pageViewData: {                        // 페이지 뷰 추가 데이터
    pageTitle: '병원 목록',
    customField: 'value'
  }
});
```

## 🔒 개인정보 보호

### 수집 정보
- 검색어 및 검색 결과
- 페이지 방문 기록
- 클릭 패턴 및 체류 시간
- 기기 정보 (브라우저, 운영체제)
- IP 주소 (지역 기반 서비스 제공용)

### 보안 조치
- 암호화된 통신 (HTTPS)
- 개인 식별 불가능한 형태로 처리
- 최대 2년간 보관 후 자동 삭제
- 사용자 동의 기반 수집

## 🛠️ 관리자 기능

### 분석 대시보드
- 인기 검색어 TOP 10
- 인기 병원 TOP 10
- 검색 통계 (총 검색 횟수, 성공률 등)
- 이벤트 큐 상태 모니터링

### 접근 방법
```
/admin/analytics
```

## 🔧 개발 환경 설정

### 1. 의존성 확인
```bash
npm install axios
```

### 2. 환경 변수 설정
```env
REACT_APP_API_URL=http://localhost:8080
```

### 3. 백엔드 API 확인
- `/api/analytics/search-event` (POST)
- `/api/analytics/click-event` (POST)
- `/api/analytics/dwell-time` (POST)
- `/api/analytics/page-view` (POST)

## 🐛 문제 해결

### 1. 이벤트가 전송되지 않는 경우
- 사용자 동의 확인: `sessionManager.hasUserConsent()`
- 네트워크 상태 확인: `navigator.onLine`
- 브라우저 콘솔에서 오류 메시지 확인
- data 속성 확인: `data-hospital-id` 등이 올바르게 설정되었는지 확인

### 2. 자동 감지가 작동하지 않는 경우
- `useAutoAnalytics` 훅이 올바르게 import되었는지 확인
- data 속성이 올바른 형식으로 설정되었는지 확인
- 브라우저 개발자 도구에서 이벤트 리스너 확인

### 3. 오프라인 이벤트 처리
- 로컬 스토리지에 임시 저장
- 온라인 복구 시 자동 전송
- 최대 100개 이벤트까지 저장

### 4. 성능 최적화
- 배치 처리로 서버 부하 감소
- 스로틀링으로 과도한 이벤트 방지
- 디바운싱으로 중복 이벤트 제거

## 📈 모니터링

### 이벤트 큐 상태 확인
```javascript
const { getEventQueueStatus } = useAnalytics();
const status = getEventQueueStatus();

console.log('큐 길이:', status.queueLength);
console.log('처리 상태:', status.isProcessing);
console.log('네트워크 상태:', status.isOnline);
```

### 강제 플러시
```javascript
const { flushEventQueue } = useAnalytics();
await flushEventQueue();
```

## 🔄 업데이트 로그

### v1.1.0 (2024-01-XX) ⭐ NEW!
- **자동 이벤트 감지 시스템 추가**
- HTML data 속성 기반 자동 클릭 감지
- 페이지 뷰 자동 전송
- 고차 컴포넌트 패턴 지원
- 수동 코드 작성 불필요

### v1.0.0 (2024-01-XX)
- 기본 이벤트 수집 시스템 구축
- 세션 관리 및 사용자 동의 기능
- 배치 처리 및 오프라인 지원
- 관리자 대시보드 구현

## 📞 지원

문제가 발생하거나 개선 사항이 있으시면 개발팀에 문의해주세요.

---

**참고**: 이 시스템은 사용자의 개인정보를 보호하면서도 더 나은 서비스를 제공하기 위해 설계되었습니다. 모든 데이터 수집은 사용자의 명시적 동의 하에 이루어집니다. 

# 📊 사용자 행동 분석 시스템

유튜브처럼 검색할 때마다 원하는 데이터를 우선적으로 보여주는 기능을 위한 사용자 행동 데이터 수집 시스템입니다.

## 🚀 빠른 시작

### 1. 환경 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 설정을 추가하세요:

```bash
# 분석 기능 활성화 (백엔드 API 준비 후 true로 변경)
REACT_APP_ANALYTICS_ENABLED=false

# 분석 API 기본 URL
REACT_APP_ANALYTICS_API_URL=http://localhost:8081

# 세션 타임아웃 (분)
REACT_APP_SESSION_TIMEOUT=30

# 이벤트 배치 크기
REACT_APP_EVENT_BATCH_SIZE=10

# 이벤트 플러시 간격 (밀리초)
REACT_APP_FLUSH_INTERVAL=30000
```

### 2. 백엔드 API 준비 전 임시 사용법

백엔드 API가 아직 준비되지 않은 경우:

1. `REACT_APP_ANALYTICS_ENABLED=false`로 설정
2. 이벤트는 콘솔에만 로그로 출력됩니다
3. 404 에러가 발생하지 않습니다

### 3. 백엔드 API 준비 후 활성화

백엔드 API가 준비되면:

1. `REACT_APP_ANALYTICS_ENABLED=true`로 변경
2. 실제 API로 이벤트가 전송됩니다

## 📁 파일 구조

```
src/
├── hooks/
│   ├── useAnalytics.js          # 기본 분석 훅
│   └── useAutoAnalytics.js      # 자동 이벤트 감지 훅
├── utils/
│   ├── eventQueue.js            # 이벤트 큐 및 배치 처리
│   └── sessionManager.js        # 세션 관리
├── components/
│   ├── common/
│   │   ├── AnalyticsConsent.js  # 사용자 동의 관리
│   │   └── withAnalytics.js     # 고차 컴포넌트 (HOC)
│   └── admin/
│       └── AnalyticsDashboard.js # 관리자 대시보드
└── service/
    └── analyticsApi.js          # 분석 API 서비스
```

## 🔧 사용법

### 1. 자동 이벤트 감지 (권장)

```jsx
import { useAutoAnalytics } from '../hooks/useAutoAnalytics';

function HospitalListPage() {
  useAutoAnalytics({
    pageType: 'HOSPITAL_LIST',
    autoPageView: true,
    autoClickTracking: true
  });

  return (
    <div>
      {/* data-hospital-id 속성만 추가하면 자동으로 클릭 이벤트 감지 */}
      <div data-hospital-id="123" data-click-type="hospital_card">
        병원 카드
      </div>
    </div>
  );
}
```

### 2. 수동 이벤트 전송

```jsx
import { useAnalytics } from '../hooks/useAnalytics';

function HospitalCard({ hospital }) {
  const { sendClickEvent } = useAnalytics();

  const handleClick = async () => {
    await sendClickEvent(hospital.id, 'hospital_card_click', {
      hospitalName: hospital.name,
      category: hospital.category
    });
  };

  return (
    <div onClick={handleClick}>
      {hospital.name}
    </div>
  );
}
```

### 3. 고차 컴포넌트 사용

```jsx
import { withAnalytics } from '../components/common/withAnalytics';

const EnhancedHospitalCard = withAnalytics(HospitalCard, {
  pageType: 'HOSPITAL_LIST',
  autoTrack: true
});
```

## 📊 수집되는 이벤트

### 1. 페이지 뷰 이벤트
```javascript
{
  type: 'page_view',
  pageType: 'HOSPITAL_LIST',
  pageTitle: '병원 목록',
  referrer: 'https://example.com',
  url: 'https://example.com/hospitals',
  timestamp: 1640995200000,
  sessionId: 'session_123',
  userId: 'user_456'
}
```

### 2. 클릭 이벤트
```javascript
{
  type: 'click',
  hospitalId: '123',
  clickType: 'hospital_card',
  pageType: 'HOSPITAL_LIST',
  elementType: 'div',
  elementClass: 'hospital-card',
  timestamp: 1640995200000,
  sessionId: 'session_123',
  userId: 'user_456'
}
```

### 3. 검색 이벤트
```javascript
{
  type: 'search',
  query: '내과',
  filters: { category: 'internal' },
  resultsCount: 15,
  pageType: 'HOSPITAL_LIST',
  timestamp: 1640995200000,
  sessionId: 'session_123',
  userId: 'user_456'
}
```

### 4. 체류 시간 이벤트
```javascript
{
  type: 'dwell_time',
  pageType: 'HOSPITAL_DETAIL',
  hospitalId: '123',
  duration: 45000, // 밀리초
  timestamp: 1640995200000,
  sessionId: 'session_123',
  userId: 'user_456'
}
```

## 🎯 자동 감지 기능

### HTML Data 속성 기반 자동 감지

```jsx
// 자동으로 클릭 이벤트 감지됨
<div data-hospital-id="123" data-click-type="hospital_card">
  병원 카드
</div>

// 추가 데이터도 자동 수집
<div 
  data-hospital-id="123" 
  data-click-type="hospital_card"
  data-analytics-category="internal"
  data-analytics-region="seoul"
>
  병원 카드
</div>
```

### 지원하는 Data 속성

- `data-hospital-id`: 병원 ID (필수)
- `data-click-type`: 클릭 타입
- `data-analytics-*`: 추가 분석 데이터

## 🔄 이벤트 큐 시스템

### 배치 처리
- 이벤트를 즉시 전송하지 않고 큐에 저장
- 10개씩 배치로 묶어서 전송
- 30초마다 자동 플러시

### 오프라인 지원
- 네트워크 연결이 없을 때 로컬 스토리지에 저장
- 온라인 복구 시 자동으로 전송

### 재시도 로직
- 전송 실패 시 최대 3회 재시도
- 5초 간격으로 재시도

## 🛡️ 개인정보 보호

### 사용자 동의 관리
```jsx
import { AnalyticsConsent } from '../components/common/AnalyticsConsent';

function App() {
  return (
    <div>
      <AnalyticsConsent />
      {/* 앱 컨텐츠 */}
    </div>
  );
}
```

### 동의 상태 확인
```jsx
import { useAnalytics } from '../hooks/useAnalytics';

function Component() {
  const { isConsentGiven } = useAnalytics();
  
  if (!isConsentGiven) {
    return <div>분석 동의가 필요합니다</div>;
  }
  
  return <div>분석 기능 활성화됨</div>;
}
```

## 📈 관리자 대시보드

### 실시간 이벤트 모니터링
```jsx
import { AnalyticsDashboard } from '../components/admin/AnalyticsDashboard';

function AdminPage() {
  return (
    <div>
      <h1>분석 대시보드</h1>
      <AnalyticsDashboard />
    </div>
  );
}
```

### 대시보드 기능
- 실시간 이벤트 수
- 페이지별 방문자 수
- 인기 병원 클릭 수
- 검색어 분석
- 사용자 행동 패턴

## 🔧 설정 옵션

### useAutoAnalytics 옵션
```javascript
useAutoAnalytics({
  pageType: 'HOSPITAL_LIST',        // 페이지 타입
  autoPageView: true,               // 자동 페이지 뷰 전송
  autoClickTracking: true,          // 자동 클릭 감지
  clickSelectors: [                 // 클릭 감지할 선택자
    '[data-hospital-id]',
    '[data-analytics-click]'
  ],
  pageViewData: {                   // 추가 페이지 뷰 데이터
    category: 'hospital'
  }
});
```

### 이벤트 큐 설정
```javascript
// eventQueue.js에서 설정 가능
this.batchSize = 10;        // 배치 크기
this.flushInterval = 30000; // 플러시 간격 (밀리초)
this.maxRetries = 3;        // 최대 재시도 횟수
this.retryDelay = 5000;     // 재시도 간격 (밀리초)
```

## 🚨 주의사항

### 1. 백엔드 API 준비 전
- `REACT_APP_ANALYTICS_ENABLED=false`로 설정
- 이벤트는 콘솔에만 출력
- 404 에러 방지

### 2. 성능 고려사항
- 이벤트 큐는 메모리 사용량 제한
- 오프라인 이벤트는 최대 100개까지만 저장
- 주기적 플러시로 메모리 정리

### 3. 개인정보 보호
- 사용자 동의 없이는 이벤트 수집 안함
- 민감한 개인정보는 수집하지 않음
- 세션 ID는 임시 생성

## 🔄 마이그레이션 가이드

### 기존 수동 이벤트 코드 제거
```jsx
// ❌ 기존 방식 (제거)
const handleClick = () => {
  sendClickEvent(hospital.id, 'click');
};

// ✅ 새로운 방식 (자동 감지)
<div data-hospital-id={hospital.id} data-click-type="click">
  병원 카드
</div>
```

### 컴포넌트 업데이트
```jsx
// 기존
function HospitalListPage() {
  const { sendPageViewEvent } = useAnalytics();
  
  useEffect(() => {
    sendPageViewEvent('HOSPITAL_LIST');
  }, [sendPageViewEvent]);
  
  // ...
}

// 새로운 방식
function HospitalListPage() {
  useAutoAnalytics({ pageType: 'HOSPITAL_LIST' });
  
  // 페이지 뷰 자동 전송됨
  // ...
}
```

## 🐛 문제 해결

### 1. 404 에러 발생
```bash
# .env.local 파일에서
REACT_APP_ANALYTICS_ENABLED=false
```

### 2. 이벤트가 전송되지 않음
- 사용자 동의 확인
- 네트워크 연결 확인
- 콘솔 로그 확인

### 3. 성능 이슈
- 이벤트 큐 크기 확인
- 불필요한 이벤트 수집 제거
- 배치 크기 조정

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. 브라우저 콘솔 로그
2. 네트워크 탭에서 API 호출 상태
3. 환경 변수 설정
4. 사용자 동의 상태

---

**참고**: 이 시스템은 백엔드 API가 준비되기 전까지는 로그 모드로만 동작합니다. 