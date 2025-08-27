# 🛠️ 프로젝트 관리 스크립트

**Hospital Project의 프로세스 관리 및 운영 도구**

## 📋 개요

이 문서는 Hospital Project의 프로세스 관리, 백업 시스템, 그리고 운영에 필요한 스크립트들의 사용법을 설명합니다.

## 🏗️ 스크립트 구조

```
hospital/
├── 🚀 start_project.sh          # 프로젝트 시작 스크립트
├── 🛠️ manage_project.sh         # 프로젝트 관리 스크립트
├── 📁 backup/                   # 백업 시스템
│   ├── 📁 scripts/              # 백업 관련 스크립트
│   └── 📚 README.md             # 백업 시스템 문서
├── 📁 docs/                     # 문서 디렉토리
│   └── 📚 README.md             # 이 파일
└── 📚 README.md                 # 메인 프로젝트 문서
```

## 🚀 프로젝트 시작 스크립트

### **기본 사용법**
```bash
./start_project.sh
```

### **제공하는 실행 모드**

#### **1️⃣ 포그라운드 실행**
- 🖥️ **설명**: 터미널에서 직접 실행
- 💡 **장점**: 실시간 로그 확인, Ctrl+C로 즉시 종료
- ⚠️ **주의**: 터미널을 닫으면 서버 종료
- 🔧 **사용법**: `./start_project.sh` → 1번 선택

#### **2️⃣ 백그라운드 실행**
- 🔄 **설명**: 백그라운드에서 실행
- 💡 **장점**: 터미널 종료해도 서버 유지
- 📝 **로그**: `logs/spring-boot.log`에 저장
- 🔧 **사용법**: `./start_project.sh` → 2번 선택

#### **3️⃣ 데몬 모드 실행**
- 👻 **설명**: 완전히 독립적인 프로세스로 실행
- 💡 **장점**: 시스템 재부팅 후에도 자동 시작 가능
- 📝 **로그**: 시스템 로그에 저장
- 🔧 **사용법**: `./start_project.sh` → 3번 선택

### **실행 과정**
1. 🔍 **백업 상태 확인**: 백업 시스템 상태 점검
2. 🔌 **Elasticsearch 확인**: 연결 및 클러스터 상태 확인
3. 🔍 **기존 프로세스 확인**: 중복 실행 방지
4. 🚀 **실행 모드 선택**: 사용자가 원하는 모드 선택
5. 🖥️ **서버 시작**: 선택된 모드로 Spring Boot 서버 시작
6. 📊 **상태 요약**: 프로젝트 전체 상태 표시

## 🛠️ 프로젝트 관리 스크립트

### **기본 사용법**
```bash
./manage_project.sh [명령어]
```

### **사용 가능한 명령어**

#### **🚀 프로젝트 시작**
```bash
./manage_project.sh start
```
**기능:**
- ✅ 중복 실행 방지
- 🔄 백그라운드에서 서버 시작
- 📝 PID 파일 생성
- ⏳ 서버 시작 완료 대기
- 📊 시작 상태 확인

#### **🛑 프로젝트 종료**
```bash
./manage_project.sh stop
```
**기능:**
- 🛑 정상 종료 시도 (5초 대기)
- 🔴 강제 종료 (필요시)
- 🧹 PID 파일 정리
- 📝 종료 상태 확인

#### **🔄 프로젝트 재시작**
```bash
./manage_project.sh restart
```
**기능:**
- 🛑 기존 프로세스 종료
- ⏳ 2초 대기
- 🚀 새 프로세스 시작
- 📊 재시작 상태 확인

#### **📊 프로젝트 상태 확인**
```bash
./manage_project.sh status
```
**표시 정보:**
- 🟢 **프로세스 상태**: 실행 중/중지됨
- 📋 **PID 정보**: 프로세스 ID 및 상세 정보
- 🟢 **서버 상태**: HTTP 응답 상태
- 🌐 **서버 주소**: 접속 가능한 URL
- 📝 **로그 정보**: 로그 파일 크기, 라인 수, 최근 로그
- 📁 **백업 시스템**: 백업 시스템 사용 가능 여부

#### **📖 로그 확인**
```bash
./manage_project.sh logs
```
**로그 보기 옵션:**
- 1️⃣ **전체 로그**: `cat logs/spring-boot.log`
- 2️⃣ **최근 50라인**: `tail -50 logs/spring-boot.log`
- 3️⃣ **실시간 로그**: `tail -f logs/spring-boot.log`
- 4️⃣ **에러 로그만**: `grep ERROR logs/spring-boot.log`

#### **🆔 PID 확인**
```bash
./manage_project.sh pid
```
**표시 정보:**
- 🟢 **프로세스 상태**: 실행 중/중지됨
- 📋 **PID**: 프로세스 ID
- 📁 **PID 파일**: PID 파일 위치
- 📊 **프로세스 정보**: 상세 프로세스 정보

#### **💀 강제 종료**
```bash
./manage_project.sh kill
```
**기능:**
- ⚠️ **경고**: 데이터 손실 가능성 안내
- 💡 **확인**: 사용자 확인 요청
- 💀 **강제 종료**: `kill -9` 명령으로 즉시 종료
- 🧹 **정리**: PID 파일 제거

#### **❓ 도움말**
```bash
./manage_project.sh help
# 또는
./manage_project.sh
```
**표시 정보:**
- 📋 **사용법**: 스크립트 사용법
- 🛠️ **명령어**: 사용 가능한 모든 명령어
- 💡 **예시**: 실제 사용 예시
- 📚 **설명**: 각 명령어의 상세 설명

## 📁 로그 관리

### **로그 파일 위치**
- **Spring Boot**: `logs/spring-boot.log`
- **PID 파일**: `logs/hospital.pid`
- **백업 로그**: `backup/backup.log`
- **복구 로그**: `backup/restore.log`
- **자동 백업**: `backup/cron.log`

### **로그 모니터링**
```bash
# 실시간 로그 모니터링
./manage_project.sh logs

# 백업 로그 모니터링
./backup/scripts/view_logs.sh

# 특정 로그 파일 직접 모니터링
tail -f logs/spring-boot.log
tail -f backup/backup.log
```

## 🔍 프로세스 모니터링

### **프로세스 상태 확인**
```bash
# 프로젝트 상태 확인
./manage_project.sh status

# 시스템 프로세스 확인
ps aux | grep java
ps aux | grep spring-boot

# 포트 사용 확인
lsof -i :3002
netstat -an | grep 3002
```

### **리소스 사용량 확인**
```bash
# CPU 및 메모리 사용량
top -p $(cat logs/hospital.pid)

# 디스크 사용량
du -sh logs/
du -sh backup/
```

## 🚨 문제 해결

### **일반적인 문제들**

#### **1. 포트 충돌**
```bash
# 사용 중인 포트 확인
lsof -i :3002

# 프로세스 종료
./manage_project.sh stop

# 또는 강제 종료
./manage_project.sh kill
```

#### **2. 프로세스가 시작되지 않음**
```bash
# 로그 확인
./manage_project.sh logs

# Elasticsearch 상태 확인
curl http://localhost:9200/_cluster/health

# Java 프로세스 확인
ps aux | grep java
```

#### **3. 서버가 응답하지 않음**
```bash
# 프로세스 상태 확인
./manage_project.sh status

# 서버 헬스 체크
curl http://localhost:3002/actuator/health

# 로그 확인
./manage_project.sh logs
```

#### **4. PID 파일 문제**
```bash
# PID 파일 확인
cat logs/hospital.pid

# PID 파일 정리
rm -f logs/hospital.pid

# 프로세스 재시작
./manage_project.sh restart
```

### **문제 해결 순서**
1. **상태 확인**: `./manage_project.sh status`
2. **로그 확인**: `./manage_project.sh logs`
3. **프로세스 확인**: `./manage_project.sh pid`
4. **서버 재시작**: `./manage_project.sh restart`
5. **강제 종료 후 재시작**: `./manage_project.sh kill` → `./manage_project.sh start`

## 💡 모범 사례

### **운영 환경에서의 사용**
- 🔄 **백그라운드 모드**: `./manage_project.sh start`
- 📊 **정기 상태 확인**: `./manage_project.sh status`
- 📖 **로그 모니터링**: `./manage_project.sh logs`
- 🛑 **안전한 종료**: `./manage_project.sh stop`

### **개발 환경에서의 사용**
- 🖥️ **포그라운드 모드**: `./start_project.sh` → 1번 선택
- 📝 **실시간 로그**: 터미널에서 직접 확인
- 🔄 **빠른 재시작**: Ctrl+C → `./start_project.sh`

### **모니터링 전략**
- ⏰ **정기 상태 확인**: 매일 또는 주기적으로 `./manage_project.sh status`
- 📖 **로그 분석**: `./manage_project.sh logs`로 에러 패턴 확인
- 💾 **백업 상태 확인**: `./backup/scripts/check_backup_status.sh`
- 🔍 **시스템 리소스**: CPU, 메모리, 디스크 사용량 모니터링

## 🔧 고급 설정

### **환경 변수 설정**
```bash
# 프로젝트 설정
export PROJECT_NAME="Hospital Project"
export SERVER_PORT="3002"
export LOG_DIR="./logs"

# 백업 설정
export BACKUP_DIR="./backup/elasticsearch"
export BACKUP_REPO="local_backup"
```

### **스크립트 커스터마이징**
- **포트 변경**: `start_project.sh`와 `manage_project.sh`의 `SERVER_PORT` 변수 수정
- **로그 레벨**: Spring Boot `application.yml`에서 로그 레벨 조정
- **백업 주기**: `backup/scripts/setup_cron.sh`에서 Cron 설정 수정

## 📞 지원

### **문제 발생 시 확인 순서**
1. **프로젝트 상태**: `./manage_project.sh status`
2. **로그 확인**: `./manage_project.sh logs`
3. **백업 상태**: `./backup/scripts/check_backup_status.sh`
4. **시스템 리소스**: CPU, 메모리, 디스크 사용량
5. **네트워크**: 포트 사용 상태, 방화벽 설정

### **유용한 명령어 모음**
```bash
# 전체 시스템 상태 확인
./manage_project.sh status
./backup/scripts/check_backup_status.sh

# 로그 모니터링
./manage_project.sh logs
./backup/scripts/view_logs.sh

# 프로세스 관리
./manage_project.sh start
./manage_project.sh stop
./manage_project.sh restart

# 백업 관리
./backup/scripts/backup_elasticsearch.sh
./backup/scripts/restore_elasticsearch.sh [백업명]
```

---

**🛠️ 프로젝트 관리 스크립트** - 효율적이고 안전한 프로젝트 운영 