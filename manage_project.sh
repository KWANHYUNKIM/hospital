#!/bin/bash

# Hospital Project 프로세스 관리 스크립트
# 서버 시작, 종료, 상태 확인, 로그 확인 등을 관리합니다

# 설정
PROJECT_NAME="Hospital Project"
SERVER_PORT="3002"
LOG_DIR="./logs"
PID_FILE="./logs/hospital.pid"
LOG_FILE="./logs/spring-boot.log"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 로그 디렉토리 생성
mkdir -p "$LOG_DIR"

# 도움말 함수
show_help() {
    echo -e "${CYAN}🏥 $PROJECT_NAME 관리 스크립트${NC}"
    echo "=================================="
    echo ""
    echo -e "${YELLOW}사용법:${NC}"
    echo "  $0 [명령어]"
    echo ""
    echo -e "${YELLOW}명령어:${NC}"
    echo -e "  ${CYAN}start${NC}     - 프로젝트 시작"
    echo -e "  ${CYAN}stop${NC}      - 프로젝트 종료"
    echo -e "  ${CYAN}restart${NC}   - 프로젝트 재시작"
    echo -e "  ${CYAN}status${NC}    - 프로젝트 상태 확인"
    echo -e "  ${CYAN}logs${NC}      - 로그 확인"
    echo -e "  ${CYAN}pid${NC}       - 프로세스 ID 확인"
    echo -e "  ${CYAN}kill${NC}      - 강제 종료"
    echo -e "  ${CYAN}help${NC}      - 도움말 표시"
    echo ""
    echo -e "${YELLOW}예시:${NC}"
    echo "  $0 start      # 프로젝트 시작"
    echo "  $0 status     # 상태 확인"
    echo "  $0 stop       # 프로젝트 종료"
    echo "  $0 logs       # 로그 확인"
}

# 프로세스 상태 확인
check_process() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            return 0  # 프로세스 실행 중
        else
            return 1  # 프로세스 없음
        fi
    else
        return 1  # PID 파일 없음
    fi
}

# 서버 상태 확인
check_server() {
    if curl -s "http://localhost:$SERVER_PORT/actuator/health" > /dev/null 2>&1; then
        return 0  # 서버 응답
    else
        return 1  # 서버 응답 없음
    fi
}

# 프로젝트 시작
start_project() {
    echo -e "${BLUE}🚀 $PROJECT_NAME 시작 중...${NC}"
    
    if check_process; then
        echo -e "   ⚠️  ${YELLOW}이미 실행 중인 프로세스가 있습니다${NC}"
        echo -e "   💡 PID: $(cat "$PID_FILE")"
        echo -e "   💡 상태를 확인하려면: $0 status"
        return 1
    fi
    
    if [ -d "./server" ]; then
        cd server
        
        # 백그라운드에서 서버 시작
        nohup ./mvnw spring-boot:run > "../$LOG_FILE" 2>&1 &
        SERVER_PID=$!
        echo "$SERVER_PID" > "../$PID_FILE"
        
        echo -e "   ✅ 서버가 백그라운드에서 시작되었습니다 (PID: $SERVER_PID)"
        echo -e "   🌐 서버 주소: ${CYAN}http://localhost:$SERVER_PORT${NC}"
        echo -e "   📝 로그 파일: ${CYAN}$LOG_FILE${NC}"
        
        cd ..
        
        # 서버 시작 대기
        echo -e "   ⏳ 서버가 완전히 시작될 때까지 잠시 기다려주세요..."
        for i in {1..30}; do
            if check_server; then
                echo -e "   ✅ ${GREEN}서버 시작 완료!${NC}"
                break
            fi
            echo -e "   ⏳ 서버 시작 대기 중... ($i/30)"
            sleep 2
        done
        
        if [ $i -eq 30 ]; then
            echo -e "   ⚠️  ${YELLOW}서버 시작 시간이 초과되었습니다${NC}"
            echo -e "   📝 로그를 확인해보세요: $0 logs"
        fi
    else
        echo -e "   ❌ ${RED}서버 디렉토리를 찾을 수 없습니다${NC}"
        return 1
    fi
}

# 프로젝트 종료
stop_project() {
    echo -e "${BLUE}🛑 $PROJECT_NAME 종료 중...${NC}"
    
    if ! check_process; then
        echo -e "   ℹ️  실행 중인 프로세스가 없습니다"
        return 0
    fi
    
    PID=$(cat "$PID_FILE")
    echo -e "   🛑 프로세스 종료 중 (PID: $PID)..."
    
    # 정상 종료 시도
    kill "$PID" 2>/dev/null
    
    # 5초 대기
    for i in {1..5}; do
        if ! ps -p "$PID" > /dev/null 2>&1; then
            echo -e "   ✅ 프로세스가 정상적으로 종료되었습니다"
            rm -f "$PID_FILE"
            return 0
        fi
        echo -e "   ⏳ 프로세스 종료 대기 중... ($i/5)"
        sleep 1
    done
    
    # 강제 종료
    echo -e "   🔴 강제 종료 중..."
    kill -9 "$PID" 2>/dev/null
    
    if ! ps -p "$PID" > /dev/null 2>&1; then
        echo -e "   ✅ 프로세스가 강제 종료되었습니다"
        rm -f "$PID_FILE"
    else
        echo -e "   ❌ ${RED}프로세스 종료 실패${NC}"
        return 1
    fi
}

# 프로젝트 재시작
restart_project() {
    echo -e "${BLUE}🔄 $PROJECT_NAME 재시작 중...${NC}"
    
    stop_project
    sleep 2
    start_project
}

# 프로젝트 상태 확인
show_status() {
    echo -e "${BLUE}📊 $PROJECT_NAME 상태 확인${NC}"
    echo "=================================="
    
    # 프로세스 상태
    if check_process; then
        PID=$(cat "$PID_FILE")
        echo -e "   🟢 ${GREEN}프로세스 실행 중${NC}"
        echo -e "   📋 PID: ${CYAN}$PID${NC}"
        
        # 프로세스 상세 정보
        PROCESS_INFO=$(ps -p "$PID" -o pid,ppid,command,etime,pcpu,pmem 2>/dev/null | tail -1)
        if [ -n "$PROCESS_INFO" ]; then
            echo -e "   📊 프로세스 정보:"
            echo -e "      $PROCESS_INFO"
        fi
    else
        echo -e "   🔴 ${RED}프로세스 실행 중이 아님${NC}"
    fi
    
    echo ""
    
    # 서버 상태
    if check_server; then
        echo -e "   🟢 ${GREEN}서버 응답 정상${NC}"
        echo -e "   🌐 서버 주소: ${CYAN}http://localhost:$SERVER_PORT${NC}"
        
        # 서버 정보
        HEALTH_RESPONSE=$(curl -s "http://localhost:$SERVER_PORT/actuator/health" 2>/dev/null)
        if [ -n "$HEALTH_RESPONSE" ]; then
            echo -e "   📊 서버 상태: ${GREEN}정상${NC}"
        fi
    else
        echo -e "   🔴 ${RED}서버 응답 없음${NC}"
    fi
    
    echo ""
    
    # 로그 파일 정보
    if [ -f "$LOG_FILE" ]; then
        LOG_SIZE=$(du -h "$LOG_FILE" | cut -f1)
        LOG_LINES=$(wc -l < "$LOG_FILE")
        LOG_LAST=$(tail -1 "$LOG_FILE" 2>/dev/null | cut -c1-50)
        
        echo -e "   📝 로그 파일 정보:"
        echo -e "      📁 파일: $LOG_FILE"
        echo -e "      📏 크기: $LOG_SIZE"
        echo -e "      📊 라인 수: $LOG_LINES"
        if [ -n "$LOG_LAST" ]; then
            echo -e "      🕐 최근 로그: $LOG_LAST..."
        fi
    else
        echo -e "   📝 로그 파일: ${YELLOW}없음${NC}"
    fi
    
    echo ""
    
    # 백업 시스템 상태
    if [ -f "./backup/scripts/check_backup_status.sh" ]; then
        echo -e "   📁 백업 시스템: ${GREEN}사용 가능${NC}"
        echo -e "   💡 백업 상태 확인: ${CYAN}./backup/scripts/check_backup_status.sh${NC}"
    else
        echo -e "   📁 백업 시스템: ${YELLOW}사용 불가${NC}"
    fi
}

# 로그 확인
show_logs() {
    echo -e "${BLUE}📖 $PROJECT_NAME 로그 확인${NC}"
    echo "=================================="
    
    if [ -f "$LOG_FILE" ]; then
        echo -e "   📁 로그 파일: $LOG_FILE"
        echo -e "   📏 파일 크기: $(du -h "$LOG_FILE" | cut -f1)"
        echo -e "   📊 총 라인 수: $(wc -l < "$LOG_FILE")"
        echo ""
        
        echo -e "   💡 로그 보기 옵션:"
        echo -e "     1️⃣  ${CYAN}전체 로그${NC} - cat $LOG_FILE"
        echo -e "     2️⃣  ${CYAN}최근 50라인${NC} - tail -50 $LOG_FILE"
        echo -e "     3️⃣  ${CYAN}실시간 로그${NC} - tail -f $LOG_FILE"
        echo -e "     4️⃣  ${CYAN}에러 로그만${NC} - grep ERROR $LOG_FILE"
        echo ""
        
        echo -e "   선택 (1/2/3/4): "
        read -r choice
        
        case $choice in
            1)
                echo -e "   📖 전체 로그 표시 중..."
                cat "$LOG_FILE"
                ;;
            2)
                echo -e "   📖 최근 50라인 표시 중..."
                tail -50 "$LOG_FILE"
                ;;
            3)
                echo -e "   📖 실시간 로그 모니터링 중... (종료: Ctrl+C)"
                tail -f "$LOG_FILE"
                ;;
            4)
                echo -e "   📖 에러 로그만 표시 중..."
                grep ERROR "$LOG_FILE" || echo "에러 로그가 없습니다"
                ;;
            *)
                echo -e "   ⚠️  ${YELLOW}잘못된 선택입니다. 최근 50라인을 표시합니다.${NC}"
                tail -50 "$LOG_FILE"
                ;;
        esac
    else
        echo -e "   ❌ ${RED}로그 파일을 찾을 수 없습니다: $LOG_FILE${NC}"
        echo -e "   💡 프로젝트가 아직 시작되지 않았거나 로그가 생성되지 않았습니다"
    fi
}

# PID 확인
show_pid() {
    echo -e "${BLUE}🆔 $PROJECT_NAME 프로세스 ID 확인${NC}"
    echo "=================================="
    
    if check_process; then
        PID=$(cat "$PID_FILE")
        echo -e "   🟢 ${GREEN}프로세스 실행 중${NC}"
        echo -e "   📋 PID: ${CYAN}$PID${NC}"
        echo -e "   📁 PID 파일: $PID_FILE"
        
        # 프로세스 상세 정보
        ps -p "$PID" -o pid,ppid,command,etime,pcpu,pmem 2>/dev/null
    else
        echo -e "   🔴 ${RED}프로세스 실행 중이 아님${NC}"
        echo -e "   📁 PID 파일: $PID_FILE (존재하지 않음)"
    fi
}

# 강제 종료
force_kill() {
    echo -e "${BLUE}💀 $PROJECT_NAME 강제 종료${NC}"
    echo "=================================="
    
    if ! check_process; then
        echo -e "   ℹ️  실행 중인 프로세스가 없습니다"
        return 0
    fi
    
    PID=$(cat "$PID_FILE")
    echo -e "   ⚠️  ${YELLOW}경고: 이 작업은 데이터 손실을 일으킬 수 있습니다${NC}"
    echo -e "   💡 프로세스 PID: $PID"
    echo -e "   💡 정말로 강제 종료하시겠습니까? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "   💀 강제 종료 중..."
        kill -9 "$PID" 2>/dev/null
        
        if ! ps -p "$PID" > /dev/null 2>&1; then
            echo -e "   ✅ 프로세스가 강제 종료되었습니다"
            rm -f "$PID_FILE"
        else
            echo -e "   ❌ ${RED}강제 종료 실패${NC}"
            return 1
        fi
    else
        echo -e "   ℹ️  강제 종료가 취소되었습니다"
    fi
}

# 메인 실행
case "${1:-help}" in
    "start")
        start_project
        ;;
    "stop")
        stop_project
        ;;
    "restart")
        restart_project
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "pid")
        show_pid
        ;;
    "kill")
        force_kill
        ;;
    "help"|*)
        show_help
        ;;
esac 