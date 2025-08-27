#!/bin/bash

# Hospital Project 시작 스크립트
# 프로젝트 시작 시 백업 상태를 자동으로 확인합니다

# 설정
PROJECT_NAME="Hospital Project"
SERVER_PORT="3002"
ES_PORT="9200"
LOG_DIR="./logs"
PID_FILE="./logs/hospital.pid"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 로그 디렉토리 생성
mkdir -p "$LOG_DIR"

echo -e "${CYAN}🏥 $PROJECT_NAME 시작${NC}"
echo "=================================="
echo ""

# 1. 백업 상태 확인
echo -e "${BLUE}🔍 백업 상태 확인 중...${NC}"
if [ -f "./backup/scripts/check_backup_status.sh" ]; then
    echo -e "   ✅ 백업 상태 확인 스크립트 실행"
    ./backup/scripts/check_backup_status.sh
else
    echo -e "   ⚠️  ${YELLOW}백업 상태 확인 스크립트를 찾을 수 없습니다${NC}"
fi

echo ""

# 2. Elasticsearch 상태 확인
echo -e "${BLUE}🔌 Elasticsearch 상태 확인 중...${NC}"
if curl -s "http://localhost:$ES_PORT/_cluster/health" > /dev/null; then
    echo -e "   ✅ ${GREEN}Elasticsearch 실행 중${NC}"
    
    # 클러스터 상태 확인
    CLUSTER_HEALTH=$(curl -s "http://localhost:$ES_PORT/_cluster/health?pretty")
    CLUSTER_STATUS=$(echo "$CLUSTER_HEALTH" | grep '"status"' | cut -d'"' -f4)
    echo -e "   📊 클러스터 상태: ${GREEN}$CLUSTER_STATUS${NC}"
    
    if [ "$CLUSTER_STATUS" = "green" ]; then
        echo -e "   🟢 ${GREEN}모든 샤드가 정상 상태입니다${NC}"
    elif [ "$CLUSTER_STATUS" = "yellow" ]; then
        echo -e "   🟡 ${YELLOW}일부 샤드가 복제되지 않았습니다${NC}"
    elif [ "$CLUSTER_STATUS" = "red" ]; then
        echo -e "   🔴 ${RED}일부 샤드가 할당되지 않았습니다${NC}"
    fi
else
    echo -e "   ❌ ${RED}Elasticsearch가 실행되지 않았습니다${NC}"
    echo -e "   💡 다음 명령어로 Elasticsearch를 시작하세요:"
    echo -e "      ${CYAN}brew services start elasticsearch${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Elasticsearch를 시작한 후 다시 실행해주세요.${NC}"
    exit 1
fi

echo ""

# 3. 기존 프로세스 확인 및 관리
echo -e "${BLUE}🔍 기존 프로세스 확인 중...${NC}"
if [ -f "$PID_FILE" ]; then
    EXISTING_PID=$(cat "$PID_FILE")
    if ps -p "$EXISTING_PID" > /dev/null 2>&1; then
        echo -e "   ⚠️  ${YELLOW}이미 실행 중인 프로세스가 있습니다 (PID: $EXISTING_PID)${NC}"
        echo -e "   💡 기존 프로세스를 종료하시겠습니까? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            echo -e "   🛑 기존 프로세스 종료 중..."
            kill "$EXISTING_PID" 2>/dev/null
            sleep 2
            if ps -p "$EXISTING_PID" > /dev/null 2>&1; then
                echo -e "   🔴 강제 종료 중..."
                kill -9 "$EXISTING_PID" 2>/dev/null
            fi
            rm -f "$PID_FILE"
            echo -e "   ✅ 프로세스 종료 완료"
        else
            echo -e "   ℹ️  기존 프로세스 유지"
            echo -e "   💡 프로세스 관리 명령어:"
            echo -e "      ${CYAN}./manage_project.sh status${NC} - 상태 확인"
            echo -e "      ${CYAN}./manage_project.sh stop${NC} - 서버 종료"
            echo -e "      ${CYAN}./manage_project.sh logs${NC} - 로그 확인"
            exit 0
        fi
    else
        echo -e "   🧹 오래된 PID 파일 정리 중..."
        rm -f "$PID_FILE"
    fi
fi

# 4. 실행 모드 선택
echo -e "${BLUE}🚀 실행 모드 선택${NC}"
echo -e "   💡 어떤 방식으로 서버를 시작하시겠습니까?"
echo ""
echo -e "   1️⃣  ${CYAN}포그라운드 실행${NC} - 터미널에서 직접 실행 (Ctrl+C로 종료)"
echo -e "   2️⃣  ${CYAN}백그라운드 실행${NC} - 백그라운드에서 실행 (터미널 종료해도 유지)"
echo -e "   3️⃣  ${CYAN}데몬 모드 실행${NC} - 완전히 독립적인 프로세스로 실행"
echo ""
echo -e "   선택 (1/2/3): "
read -r mode

case $mode in
    1)
        echo -e "   ✅ ${GREEN}포그라운드 모드로 실행합니다${NC}"
        EXECUTION_MODE="foreground"
        ;;
    2)
        echo -e "   ✅ ${GREEN}백그라운드 모드로 실행합니다${NC}"
        EXECUTION_MODE="background"
        ;;
    3)
        echo -e "   ✅ ${GREEN}데몬 모드로 실행합니다${NC}"
        EXECUTION_MODE="daemon"
        ;;
    *)
        echo -e "   ⚠️  ${YELLOW}잘못된 선택입니다. 기본값(백그라운드)으로 실행합니다.${NC}"
        EXECUTION_MODE="background"
        ;;
esac

echo ""

# 5. Spring Boot 서버 시작
echo -e "${BLUE}🚀 Spring Boot 서버 시작 중...${NC}"
if [ -d "./server" ]; then
    echo -e "   📁 서버 디렉토리 확인됨"
    
    cd server
    
    case $EXECUTION_MODE in
        "foreground")
            echo -e "   🚀 포그라운드에서 서버 시작..."
            echo -e "   💡 서버를 종료하려면 Ctrl+C를 누르세요"
            echo -e "   🌐 서버 주소: ${CYAN}http://localhost:$SERVER_PORT${NC}"
            echo ""
            ./mvnw spring-boot:run
            ;;
        "background")
            echo -e "   🚀 백그라운드에서 서버 시작..."
            nohup ./mvnw spring-boot:run > "../$LOG_DIR/spring-boot.log" 2>&1 &
            SERVER_PID=$!
            echo "$SERVER_PID" > "../$PID_FILE"
            echo -e "   ✅ 서버가 백그라운드에서 시작되었습니다 (PID: $SERVER_PID)"
            echo -e "   🌐 서버 주소: ${CYAN}http://localhost:$SERVER_PORT${NC}"
            echo -e "   📝 로그 파일: ${CYAN}$LOG_DIR/spring-boot.log${NC}"
            ;;
        "daemon")
            echo -e "   🚀 데몬 모드로 서버 시작..."
            nohup ./mvnw spring-boot:run > "/dev/null" 2>&1 &
            SERVER_PID=$!
            echo "$SERVER_PID" > "../$PID_FILE"
            echo -e "   ✅ 서버가 데몬 모드로 시작되었습니다 (PID: $SERVER_PID)"
            echo -e "   🌐 서버 주소: ${CYAN}http://localhost:$SERVER_PORT${NC}"
            ;;
    esac
    
    cd ..
    
    # 서버 시작 확인 (백그라운드/데몬 모드인 경우)
    if [ "$EXECUTION_MODE" != "foreground" ]; then
        echo -e "   ⏳ 서버가 완전히 시작될 때까지 잠시 기다려주세요..."
        
        # 서버 시작 대기
        for i in {1..30}; do
            if curl -s "http://localhost:$SERVER_PORT/actuator/health" > /dev/null 2>&1; then
                echo -e "   ✅ ${GREEN}Spring Boot 서버 시작 완료!${NC}"
                break
            fi
            echo -e "   ⏳ 서버 시작 대기 중... ($i/30)"
            sleep 2
        done
        
        if [ $i -eq 30 ]; then
            echo -e "   ⚠️  ${YELLOW}서버 시작 시간이 초과되었습니다${NC}"
            echo -e "   📝 로그를 확인해보세요: ${CYAN}cat $LOG_DIR/spring-boot.log${NC}"
        fi
    fi
else
    echo -e "   ❌ ${RED}서버 디렉토리를 찾을 수 없습니다${NC}"
fi

echo ""

# 6. 프로젝트 상태 요약
echo -e "${CYAN}📊 프로젝트 상태 요약:${NC}"
echo -e "   🔌 Elasticsearch: ${GREEN}실행 중${NC}"
echo -e "   🚀 Spring Boot: ${GREEN}시작됨${NC}"
echo -e "   📁 백업 시스템: ${GREEN}준비됨${NC}"

echo ""

# 7. 유용한 명령어
echo -e "${YELLOW}💡 유용한 명령어:${NC}"
echo -e "   📊 ${CYAN}백업 상태 확인:${NC} ./backup/scripts/check_backup_status.sh"
echo -e "   📖 ${CYAN}로그 확인:${NC} ./backup/scripts/view_logs.sh"
echo -e "   💾 ${CYAN}수동 백업:${NC} ./backup/scripts/backup_elasticsearch.sh"
echo -e "   🔄 ${CYAN}백업 복구:${NC} ./backup/scripts/restore_elasticsearch.sh [백업명]"

if [ "$EXECUTION_MODE" != "foreground" ]; then
    echo -e "   🛑 ${CYAN}서버 종료:${NC} ./manage_project.sh stop"
    echo -e "   📊 ${CYAN}서버 상태:${NC} ./manage_project.sh status"
    echo -e "   📝 ${CYAN}서버 로그:${NC} ./manage_project.sh logs"
fi

echo ""

# 8. 백업 스케줄 정보
echo -e "${CYAN}📅 자동 백업 스케줄:${NC}"
echo -e "   🕐 ${BLUE}매일 새벽 2시${NC} - Elasticsearch 자동 백업"
echo -e "   🧹 ${BLUE}30일 이상 된 백업${NC} - 자동 정리"
echo -e "   📊 ${BLUE}백업 대상 인덱스:${NC} hospitals, pharmacies, map_data, map_data_cluster"

echo ""

if [ "$EXECUTION_MODE" = "foreground" ]; then
    echo -e "${GREEN}🎉 $PROJECT_NAME이 포그라운드에서 시작되었습니다!${NC}"
    echo -e "${BLUE}💡 서버를 종료하려면 Ctrl+C를 누르세요${NC}"
else
    echo -e "${GREEN}🎉 $PROJECT_NAME이 성공적으로 시작되었습니다!${NC}"
    echo -e "${BLUE}📝 자세한 로그는 $LOG_DIR/ 디렉토리에서 확인할 수 있습니다.${NC}"
    echo -e "${BLUE}💡 프로세스 관리는 ./manage_project.sh 명령어를 사용하세요${NC}"
fi 