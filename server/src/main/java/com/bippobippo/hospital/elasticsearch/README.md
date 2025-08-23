# 🏥 Hospital Elasticsearch Service

병원 및 약국 데이터를 위한 Elasticsearch 서비스입니다. MongoDB와의 실시간 동기화 및 자동 색인 기능을 제공합니다.

## 🚀 주요 기능

### 1. **자동 색인 및 동기화**
- **초기 동기화**: 서비스 시작 시 자동으로 MongoDB와 Elasticsearch 데이터 동기화
- **정기 동기화**: 5분마다 자동으로 데이터 변경사항 체크 및 동기화
- **실시간 동기화**: MongoDB Change Stream을 통한 실시간 데이터 변경 감지
- **증분 색인**: 새로운 데이터만 선택적으로 색인하여 성능 최적화

### 2. **데이터 타입별 관리**
- **병원 데이터**: 병원 정보, 진료시간, 장비, 전문과목 등
- **약국 데이터**: 약국 정보, 위치, 운영시간 등
- **지도 데이터**: 병원/약국 위치 기반 클러스터링 및 지도 표시

### 3. **고급 검색 기능**
- **자동완성**: 실시간 검색어 제안
- **위치 기반 검색**: GPS 좌표 기반 근처 병원/약국 검색
- **필터링**: 지역, 카테고리, 전문과목 등 다양한 조건으로 검색
- **집계**: 지역별, 카테고리별 통계 정보 제공

## 📁 프로젝트 구조

```
elasticsearch/
├── config/
│   ├── ElasticsearchConfig.java          # Elasticsearch 연결 설정
│   └── SchedulingConfig.java             # 스케줄링 설정
├── controller/
│   ├── SearchController.java             # 검색 API 엔드포인트
│   └── AutoIndexingController.java      # 관리자용 동기화 제어 API
├── service/
│   ├── ElasticsearchService.java         # 메인 재색인 프로세스
│   ├── IndexService.java                 # 인덱스 생성/삭제
│   ├── BulkIndexService.java             # 대량 데이터 색인
│   ├── HospitalSearchService.java        # 병원 검색 서비스
│   ├── PharmacySearchService.java        # 약국 검색 서비스
│   ├── AutoIndexingService.java          # 자동 동기화 서비스
│   └── MongoChangeStreamService.java     # MongoDB 변경사항 감지
└── README.md
```

## 🔧 설정

### 1. **application.yml 설정**

```yaml
elasticsearch:
  host: localhost
  port: 9200
  scheme: http
  username: elastic
  password: your_password
  ssl:
    enabled: false
  connection:
    timeout: 5000
  socket:
    timeout: 60000

spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/hospital_db
```

### 2. **의존성 (pom.xml)**

```xml
<dependencies>
    <!-- Spring Boot Starter -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Data MongoDB -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-mongodb</artifactId>
    </dependency>
    
    <!-- Elasticsearch -->
    <dependency>
        <groupId>org.elasticsearch.client</groupId>
        <artifactId>elasticsearch-rest-high-level-client</artifactId>
        <version>7.17.9</version>
    </dependency>
    
    <!-- Spring Data Elasticsearch -->
    <dependency>
        <groupId>org.springframework.data</groupId>
        <artifactId>spring-data-elasticsearch</artifactId>
    </dependency>
</dependencies>
```

## 🚀 사용법

### 1. **자동 동기화 시작**

서비스가 시작되면 자동으로 다음 작업이 수행됩니다:

```java
@PostConstruct
public void initialize() {
    // 1. 초기 동기화 수행
    // 2. MongoDB Change Stream 구독 시작
    // 3. 정기 동기화 스케줄링 시작
}
```

### 2. **수동 동기화 트리거**

```bash
# 특정 데이터 타입 동기화
POST /api/admin/elasticsearch/sync/hospitals
POST /api/admin/elasticsearch/sync/pharmacies
POST /api/admin/elasticsearch/sync/map

# 전체 동기화
POST /api/admin/elasticsearch/sync-all
```

### 3. **동기화 상태 모니터링**

```bash
# 동기화 상태 조회
GET /api/admin/elasticsearch/sync-status

# Change Stream 상태 조회
GET /api/admin/elasticsearch/change-stream/status

# 성능 통계 조회
GET /api/admin/elasticsearch/performance-stats
```

## 📊 동기화 프로세스

### 1. **초기 동기화**
```
🚀 서비스 시작
↓
🔄 MongoDB 연결 확인
↓
📊 데이터 수 비교 (MongoDB vs Elasticsearch)
↓
🆕 데이터가 없으면 → 전체 색인
📈 새 데이터가 있으면 → 증분 색인
🗑️ 데이터가 삭제되었으면 → 인덱스 재생성
```

### 2. **정기 동기화 (5분마다)**
```
⏰ 스케줄된 작업 실행
↓
📊 데이터 수 재확인
↓
🔄 필요한 경우 동기화 수행
↓
✅ 동기화 완료 로깅
```

### 3. **실시간 동기화**
```
📡 MongoDB Change Stream 감지
↓
🏥 병원 데이터 변경 → 즉시 Elasticsearch 업데이트
💊 약국 데이터 변경 → 즉시 Elasticsearch 업데이트
🗺️ 지도 데이터 자동 재계산
```

## 🔍 검색 API

### 1. **자동완성 검색**

```bash
GET /api/elasticsearch/autocomplete?query=서울대병원&latitude=37.5665&longitude=126.9780
```

**응답 예시:**
```json
{
  "hospital": [
    {
      "id": "12345",
      "name": "서울대학교병원",
      "address": "서울특별시 종로구...",
      "region": "서울",
      "score": 95.5,
      "distance": 2.3
    }
  ]
}
```

### 2. **전체 검색**

```bash
GET /api/elasticsearch/search?query=심장&page=1&size=20
```

**응답 예시:**
```json
{
  "hospitals": [...],
  "total": 150,
  "page": 1,
  "size": 20,
  "totalPages": 8
}
```

## 🛠️ 관리자 기능

### 1. **동기화 제어**
- 수동 동기화 트리거
- Change Stream 재시작
- 동기화 상태 모니터링

### 2. **성능 모니터링**
- 동기화 성공/실패 통계
- 처리 시간 측정
- 문서 처리량 추적

### 3. **문제 해결**
- Change Stream 연결 상태 확인
- 동기화 오류 로그 분석
- 수동 복구 작업 수행

## ⚠️ 주의사항

### 1. **MongoDB 요구사항**
- MongoDB 4.0+ (Change Stream 지원)
- Replica Set 또는 Sharded Cluster 구성 필요
- 적절한 권한 설정 필요

### 2. **Elasticsearch 요구사항**
- Elasticsearch 7.x+ 권장
- 충분한 메모리 및 디스크 공간
- 인덱스 설정 최적화 필요

### 3. **성능 고려사항**
- 대용량 데이터 처리 시 배치 크기 조정
- 네트워크 지연 시간 고려
- 동시 동기화 작업 수 제한

## 🚨 문제 해결

### 1. **Change Stream 연결 실패**
```bash
# Change Stream 재시작
POST /api/admin/elasticsearch/change-stream/restart

# 특정 컬렉션만 재시작
POST /api/admin/elasticsearch/change-stream/restart/hospitals
```

### 2. **동기화 실패**
```bash
# 동기화 상태 확인
GET /api/admin/elasticsearch/sync-status

# 수동 동기화 실행
POST /api/admin/elasticsearch/sync/hospitals
```

### 3. **로그 확인**
```bash
# 애플리케이션 로그에서 다음 키워드 검색:
# - "자동 색인 서비스"
# - "MongoDB Change Stream"
# - "동기화 완료"
# - "오류 발생"
```

## 📈 성능 최적화

### 1. **배치 처리**
- 기본 배치 크기: 500
- 병렬 배치 수: 5
- 동적 대기 시간 조정

### 2. **메모리 관리**
- Connection Pool 크기 조정
- 스레드 풀 크기 최적화
- 가비지 컬렉션 모니터링

### 3. **네트워크 최적화**
- Keep-Alive 연결 사용
- 재시도 로직 구현
- 타임아웃 설정 최적화

## 🔮 향후 계획

- [ ] 동기화 히스토리 데이터베이스 저장
- [ ] 웹 대시보드 UI 개발
- [ ] 알림 시스템 (Slack, Email)
- [ ] 백업 및 복구 기능
- [ ] 성능 메트릭 수집 및 분석
- [ ] 다중 환경 지원 (Dev, Staging, Prod)

---

**📞 문의사항이나 버그 리포트는 개발팀에 연락해주세요.** 