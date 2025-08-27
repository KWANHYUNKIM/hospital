# 🏥 Hospital Project

**병원 정보 검색 및 관리 시스템**

## 📋 프로젝트 개요

Hospital Project는 병원, 약국, 요양병원 등의 의료 시설 정보를 검색하고 관리할 수 있는 웹 애플리케이션입니다. Elasticsearch를 기반으로 한 강력한 검색 기능과 자동 백업 시스템을 제공합니다.

## 🏗️ 프로젝트 구조

```
hospital/
├── 📁 server/                    # Spring Boot 백엔드 서버
├── 📁 client/                    # React 웹 클라이언트
├── 📁 mobile/                    # React Native 모바일 앱
├── 📁 hopsital-admin-client/     # 관리자 클라이언트
├── 📁 elasticsearch/             # Elasticsearch 설정 및 스크립트
├── 📁 backup/                    # 자동 백업 시스템
├── 📁 logs/                      # 로그 파일들
├── 📁 docker/                    # Docker 설정
├── 📁 k8s/                       # Kubernetes 설정
├── 🚀 start_project.sh          # 프로젝트 시작 스크립트
├── 🛠️ manage_project.sh         # 프로젝트 관리 스크립트
└── 📚 README.md                  # 이 파일
```

## 🚀 빠른 시작

### **1. 사전 요구사항**
- Java 17+
- Node.js 18+
- Elasticsearch 8.x
- Maven 3.8+

### **2. 프로젝트 시작**
```bash
# 프로젝트 클론
git clone <repository-url>
cd hospital

# 프로젝트 시작 (대화형)
./start_project.sh

# 또는 백그라운드에서 시작
./manage_project.sh start
```

### **3. 서비스 접속**
- **웹 클라이언트**: http://localhost:3000
- **백엔드 API**: http://localhost:3002
- **Elasticsearch**: http://localhost:9200

## 🛠️ 프로젝트 관리

### **프로젝트 시작**
```bash
./start_project.sh
```
**제공하는 실행 모드:**
- 🖥️ **포그라운드**: 터미널에서 직접 실행 (Ctrl+C로 종료)
- 🔄 **백그라운드**: 백그라운드에서 실행 (터미널 종료해도 유지)
- 👻 **데몬**: 완전히 독립적인 프로세스로 실행

### **프로세스 관리**
```bash
# 프로젝트 시작
./manage_project.sh start

# 상태 확인
./manage_project.sh status

# 로그 확인
./manage_project.sh logs

# 프로젝트 종료
./manage_project.sh stop

# 프로젝트 재시작
./manage_project.sh restart

# 강제 종료
./manage_project.sh kill
```

## 💾 백업 시스템

### **자동 백업 설정**
```bash
# Cron 자동 백업 설정 (매일 새벽 2시)
./backup/scripts/setup_cron.sh
```

### **수동 백업**
```bash
# 백업 생성
./backup/scripts/backup_elasticsearch.sh

# 백업 복구
./backup/scripts/restore_elasticsearch.sh [백업명]

# 백업 상태 확인
./backup/scripts/check_backup_status.sh
```

### **백업 관리**
```bash
# 로그 확인
./backup/scripts/view_logs.sh

# 백업 파일명 형식: YYYYMMDD_HHMMSS.backup
# 예: 20241227_143022.backup
```

## 🔍 주요 기능

### **병원 검색**
- 🔍 **전문 검색**: 병원명, 주소, 진료과목으로 검색
- 🗺️ **지역별 필터**: 시/도, 구/군별 필터링
- 🏥 **진료과별 필터**: 내과, 외과, 소아청소년과 등
- 📍 **내 주변 검색**: GPS 기반 근처 병원 찾기

### **요양병원 관리**
- 🏥 **요양병원 검색**: 지역, 서비스별 검색
- 📍 **위치 기반 검색**: 내 주변 요양병원 찾기
- ⭐ **평가 및 리뷰**: 사용자 후기 시스템

### **약국 정보**
- 💊 **약국 검색**: 지역별, 서비스별 검색
- 📍 **위치 기반**: 내 주변 약국 찾기

## 📊 데이터 구조

### **Elasticsearch 인덱스**
- `hospitals`: 병원 정보
- `pharmacies`: 약국 정보  
- `map_data`: 지도 데이터
- `map_data_cluster`: 지도 클러스터 데이터

### **주요 필드**
- `yadmNm`: 병원명
- `addr`: 주소
- `region`: 지역
- `category`: 카테고리
- `major`: 진료과목 (배열)
- `location`: GPS 좌표

## 🔧 개발 환경

### **백엔드 (Spring Boot)**
```bash
cd server
./mvnw spring-boot:run
```

### **프론트엔드 (React)**
```bash
cd client
npm install
npm start
```

### **모바일 (React Native)**
```bash
cd mobile
npm install
npx expo start
```

## 📝 로그 관리

### **로그 파일 위치**
- **Spring Boot**: `logs/spring-boot.log`
- **백업**: `backup/backup.log`
- **복구**: `backup/restore.log`
- **자동 백업**: `backup/cron.log`

### **로그 확인**
```bash
# 실시간 로그 모니터링
./manage_project.sh logs

# 백업 로그 확인
./backup/scripts/view_logs.sh
```

## 🚨 문제 해결

### **Elasticsearch 연결 실패**
```bash
# Elasticsearch 시작
brew services start elasticsearch

# 상태 확인
curl http://localhost:9200/_cluster/health
```

### **포트 충돌**
```bash
# 사용 중인 포트 확인
lsof -i :3002

# 프로세스 종료
./manage_project.sh stop
```

### **백업 실패**
```bash
# 백업 상태 확인
./backup/scripts/check_backup_status.sh

# 백업 저장소 확인
curl http://localhost:9200/_snapshot/local_backup
```

## 📅 백업 정책

### **자동 백업**
- ⏰ **시간**: 매일 새벽 2시
- 🎯 **대상**: hospitals, pharmacies, map_data, map_data_cluster
- 🧹 **정리**: 30일 이상 된 백업 자동 삭제
- 💾 **저장**: `backup/elasticsearch/` 디렉토리

### **백업 파일 관리**
- 📁 **위치**: `backup/elasticsearch/`
- 📄 **형식**: `YYYYMMDD_HHMMSS.backup`
- 🔍 **모니터링**: `./backup/scripts/check_backup_status.sh`

## 🤝 기여하기

### **개발 환경 설정**
1. 프로젝트 클론
2. 의존성 설치
3. Elasticsearch 시작
4. 프로젝트 실행

### **코드 컨벤션**
- Java: Google Java Style
- JavaScript/TypeScript: ESLint + Prettier
- Git: Conventional Commits

## 📞 지원

### **문제 발생 시**
1. 로그 확인: `./manage_project.sh logs`
2. 백업 상태 확인: `./backup/scripts/check_backup_status.sh`
3. 프로젝트 상태 확인: `./manage_project.sh status`

### **유용한 명령어**
```bash
# 전체 상태 확인
./manage_project.sh status

# 백업 시스템 상태 확인
./backup/scripts/check_backup_status.sh

# 로그 모니터링
./manage_project.sh logs
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**🏥 Hospital Project** - 더 나은 의료 서비스를 위한 정보 플랫폼