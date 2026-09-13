#!/usr/bin/env bash

# ==============================================================================
# HỆ THỐNG MINI-ERP ENTERPRISE - SCRIPT KHỞI CHẠY TỰ ĐỘNG
# Backend: Spring Boot 3 (Port 7070)
# Frontend: React 18 + Vite + Ant Design (Port 3000)
# CSDL: MySQL 8 (10.216.1.218:3306 / erp_db)
# ==============================================================================

set -eo pipefail

# Màu sắc giao diện terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
PID_FILE="$SCRIPT_DIR/.erp_running_pids"
BACKEND_JAR="$BACKEND_DIR/target/mini-erp-backend-1.0.0.jar"
BACKEND_LOG="$SCRIPT_DIR/backend.log"
FRONTEND_LOG="$SCRIPT_DIR/frontend.log"

# Banner hệ thống
print_banner() {
  echo -e "${CYAN}${BOLD}"
  echo "╔═══════════════════════════════════════════════════════════════════════╗"
  echo "║                  HỆ THỐNG MINI-ERP ENTERPRISE                         ║"
  echo "║         Quản Lý Bán Hàng - Mua Hàng & NCC - Kho Hàng                  ║"
  echo "╚═══════════════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

# Tự động dò tìm môi trường Java, Maven, Node.js
setup_environment() {
  # 1. Dò tìm Java
  if ! command -v java &> /dev/null; then
    local JAVA_CANDIDATES=(
      "/home/sanrockk/Do_An_Tot_Nghiep_HTTT/tools/jdk-17"
      "/usr/lib/jvm/java-17-openjdk-amd64"
      "/usr/lib/jvm/java-21-openjdk-amd64"
      "$HOME/.sdkman/candidates/java/current"
      "/opt/jdk-17"
      "/opt/jdk-21"
    )
    for candidate in "${JAVA_CANDIDATES[@]}"; do
      if [ -f "$candidate/bin/java" ]; then
        export JAVA_HOME="$candidate"
        export PATH="$candidate/bin:$PATH"
        break
      fi
    done
  fi

  # 2. Dò tìm Maven
  if ! command -v mvn &> /dev/null; then
    local MVN_CANDIDATES=(
      "/home/sanrockk/Do_An_Tot_Nghiep_HTTT/tools/apache-maven-3.9.9"
      "$HOME/.sdkman/candidates/maven/current"
      "/opt/apache-maven"
    )
    for candidate in "${MVN_CANDIDATES[@]}"; do
      if [ -f "$candidate/bin/mvn" ]; then
        export MAVEN_HOME="$candidate"
        export PATH="$candidate/bin:$PATH"
        break
      fi
    done
  fi

  # 3. Dò tìm Node.js / npm
  if ! command -v node &> /dev/null; then
    local NVM_DIR="$HOME/.nvm"
    if [ -d "$NVM_DIR" ]; then
      export NVM_DIR
      [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
  fi

  # 4. Tự động liên kết kho lưu trữ Maven nếu có sẵn
  if [ ! -d "$HOME/.m2" ] && [ -d "/home/sanrockk/Do_An_Tot_Nghiep_HTTT/tools/.m2" ]; then
    ln -s "/home/sanrockk/Do_An_Tot_Nghiep_HTTT/tools/.m2" "$HOME/.m2" 2>/dev/null || true
  fi
}

# Kiểm tra các điều kiện tiên quyết
check_prerequisites() {
  setup_environment
  local has_error=false

  echo -e "${BLUE}▶ [1/4] Kiểm tra môi trường thực thi...${NC}"

  if command -v java &> /dev/null; then
    local java_v
    java_v=$(java -version 2>&1 | head -n 1)
    echo -e "  ${GREEN}✓ Java:${NC} $java_v"
  else
    echo -e "  ${RED}✗ Không tìm thấy Java runtime (Cần JDK 17+)${NC}"
    has_error=true
  fi

  if command -v mvn &> /dev/null; then
    local mvn_v
    mvn_v=$(mvn -v 2>&1 | head -n 1)
    echo -e "  ${GREEN}✓ Maven:${NC} $mvn_v"
  elif [ -f "$BACKEND_JAR" ]; then
    echo -e "  ${YELLOW}ℹ Maven chưa có trong PATH, nhưng file JAR đã được build sẵn.${NC}"
  else
    echo -e "  ${RED}✗ Không tìm thấy Maven để build Backend!${NC}"
    has_error=true
  fi

  if command -v node &> /dev/null; then
    local node_v
    node_v=$(node -v)
    echo -e "  ${GREEN}✓ Node.js:${NC} $node_v"
  else
    echo -e "  ${RED}✗ Không tìm thấy Node.js (Cần Node 18+)${NC}"
    has_error=true
  fi

  if command -v npm &> /dev/null; then
    local npm_v
    npm_v=$(npm -v)
    echo -e "  ${GREEN}✓ npm:${NC} v$npm_v"
  else
    echo -e "  ${RED}✗ Không tìm thấy npm!${NC}"
    has_error=true
  fi

  if [ "$has_error" = true ]; then
    echo -e "\n${RED}❌ Vui lòng cài đặt bổ sung các công cụ còn thiếu trước khi tiếp tục.${NC}"
    exit 1
  fi
  echo ""
}

# Dọn dẹp các tiến trình cũ chiếm cổng
stop_running_processes() {
  echo -e "${YELLOW}▶ Đang kiểm tra và giải phóng các tiến trình cũ...${NC}"
  if [ -f "$PID_FILE" ]; then
    while read -r pid; do
      if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
        kill -9 "$pid" 2>/dev/null || true
      fi
    done < "$PID_FILE"
    rm -f "$PID_FILE"
  fi

  # Giải phóng các cổng 7070, 8080, 3000, 5173
  if command -v fuser &> /dev/null; then
    fuser -k 7070/tcp 2>/dev/null || true
    fuser -k 8080/tcp 2>/dev/null || true
    fuser -k 3000/tcp 2>/dev/null || true
    fuser -k 5173/tcp 2>/dev/null || true
  elif command -v lsof &> /dev/null; then
    for port in 7070 8080 3000 5173; do
      local p
      p=$(lsof -ti:"$port" 2>/dev/null || true)
      if [ -n "$p" ]; then
        kill -9 $p 2>/dev/null || true
      fi
    done
  fi
}

# Xử lý dọn dẹp khi nhấn Ctrl+C
cleanup() {
  echo -e "\n\n${RED}${BOLD}🛑 Đang dừng hệ thống Mini-ERP...${NC}"
  stop_running_processes
  echo -e "${GREEN}✓ Đã dừng toàn bộ dịch vụ.${NC}"
  exit 0
}

# Đóng gói toàn bộ dự án
build_project() {
  print_banner
  setup_environment
  echo -e "${BLUE}▶ Đang tiến hành đóng gói Backend (Maven package)...${NC}"
  cd "$BACKEND_DIR"
  mvn clean package -DskipTests

  echo -e "\n${BLUE}▶ Đang tiến hành cài đặt và build Frontend (React Vite)...${NC}"
  cd "$FRONTEND_DIR"
  if [ ! -d "node_modules" ]; then
    npm install
  fi
  npm run build
  echo -e "\n${GREEN}${BOLD}✓ Đóng gói toàn bộ hệ thống hoàn tất!${NC}"
}

# In thông tin truy cập hệ thống
print_access_info() {
  echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}${BOLD}              🚀 HỆ THỐNG MINI-ERP ĐÃ KHỞI CHẠY THÀNH CÔNG             ${NC}"
  echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════════════════════${NC}"
  echo -e "  🌐 ${BOLD}Giao diện người dùng (Frontend):${NC}  ${CYAN}${BOLD}http://localhost:3000${NC}"
  echo -e "  ⚙️  ${BOLD}API Backend RESTful:${NC}            ${CYAN}http://localhost:7070/api${NC}"
  echo -e "  📑 ${BOLD}OpenAPI Swagger UI:${NC}             ${CYAN}http://localhost:7070/swagger-ui/index.html${NC}"
  echo -e "  📄 ${BOLD}API Docs (OpenAPI JSON):${NC}        ${CYAN}http://localhost:7070/v3/api-docs${NC}"
  echo ""
  echo -e "${YELLOW}${BOLD}🔑 TÀI KHOẢN ĐĂNG NHẬP HỆ THỐNG (Mật khẩu chung: 123456):${NC}"
  echo -e "  ┌──────────────────┬──────────┬────────────────────────────────────────┐"
  echo -e "  │ ${BOLD}Tên đăng nhập${NC}    │ ${BOLD}Mật khẩu${NC} │ ${BOLD}Vai trò & Quyền hạn${NC}                    │"
  echo -e "  ├──────────────────┼──────────┼────────────────────────────────────────┤"
  echo -e "  │ ${GREEN}admin${NC}            │ 123456   │ Quản trị viên (Toàn quyền hệ thống)    │"
  echo -e "  │ ${GREEN}sales${NC}            │ 123456   │ Nhân viên Kinh doanh                   │"
  echo -e "  │ ${GREEN}purchasing${NC}       │ 123456   │ Nhân viên Mua hàng & Quản lý NCC       │"
  echo -e "  │ ${GREEN}warehouse${NC}        │ 123456   │ Thủ kho & Sổ cái kho Double-Entry      │"
  echo -e "  └──────────────────┴──────────┴────────────────────────────────────────┘"
  echo ""
  echo -e "  ${PURPLE}ℹ  Xem log chi tiết:${NC} ${CYAN}bash run.sh logs${NC}"
  echo -e "  ${PURPLE}ℹ  Chạy kiểm thử:${NC}    ${CYAN}bash run.sh test${NC}"
  echo -e "  ${YELLOW}👉 Nhấn ${BOLD}Ctrl + C${NC}${YELLOW} để dừng toàn bộ hệ thống.${NC}"
  echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════════════════════${NC}\n"
}

# Khởi chạy toàn bộ hệ thống
start_system() {
  local force_rebuild="${1:-false}"
  print_banner
  check_prerequisites
  stop_running_processes

  # 1. Cài đặt npm dependencies cho Frontend nếu chưa có
  if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${BLUE}▶ [2/4] Cài đặt thư viện Frontend (npm install)...${NC}"
    (cd "$FRONTEND_DIR" && npm install)
    echo ""
  fi

  # 2. Chuẩn bị file JAR backend
  if [ "$force_rebuild" = "true" ] || [ ! -f "$BACKEND_JAR" ]; then
    echo -e "${BLUE}▶ [3/4] Biên dịch Backend (mvn clean package)...${NC}"
    (cd "$BACKEND_DIR" && mvn clean package -DskipTests)
    echo ""
  fi

  # 3. Khởi chạy Backend
  echo -e "${BLUE}▶ [3/4] Khởi động Spring Boot Backend (Port 7070)...${NC}"
  if [ -f "$BACKEND_JAR" ]; then
    (java -jar "$BACKEND_JAR") > "$BACKEND_LOG" 2>&1 &
    BACKEND_PID=$!
  else
    (cd "$BACKEND_DIR" && mvn spring-boot:run) > "$BACKEND_LOG" 2>&1 &
    BACKEND_PID=$!
  fi
  echo "$BACKEND_PID" > "$PID_FILE"
  echo -e "  Backend PID: ${BOLD}$BACKEND_PID${NC} (Log: ${CYAN}backend.log${NC})"

  # 4. Khởi chạy Frontend Vite
  echo -e "${BLUE}▶ [4/4] Khởi động React Vite Frontend (Port 3000)...${NC}"
  (cd "$FRONTEND_DIR" && npm run dev) > "$FRONTEND_LOG" 2>&1 &
  FRONTEND_PID=$!
  echo "$FRONTEND_PID" >> "$PID_FILE"
  echo -e "  Frontend PID: ${BOLD}$FRONTEND_PID${NC} (Log: ${CYAN}frontend.log${NC})"

  # 5. Chờ Backend sẵn sàng
  echo -e "\n${YELLOW}⏳ Đang kết nối Cơ sở Dữ liệu và khởi tạo hệ thống...${NC}"
  local max_attempts=45
  local attempt=1
  local backend_ready=false

  while [ $attempt -le $max_attempts ]; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:7070/v3/api-docs 2>/dev/null | grep -q "200"; then
      backend_ready=true
      break
    fi
    if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
      echo -e "\n${RED}❌ Backend dừng đột ngột! Xem 20 dòng log cuối trong backend.log:${NC}"
      tail -n 20 "$BACKEND_LOG"
      stop_running_processes
      exit 1
    fi
    printf "${CYAN}.${NC}"
    sleep 1
    attempt=$((attempt + 1))
  done
  echo ""

  if [ "$backend_ready" = true ]; then
    echo -e "${GREEN}✓ Backend Spring Boot đã sẵn sàng (HTTP 200 OK)!${NC}\n"
  else
    echo -e "${YELLOW}⚠️  Backend vẫn đang khởi động. Bạn có thể theo dõi qua: bash run.sh logs${NC}\n"
  fi

  print_access_info

  # Bắt tín hiệu ngắt để dọn dẹp
  trap cleanup SIGINT SIGTERM

  # Giữ script chạy để duy trì dịch vụ
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}

# Khởi chạy riêng Backend
start_backend_only() {
  print_banner
  setup_environment
  echo -e "${BLUE}▶ Khởi động riêng Backend Spring Boot...${NC}"
  cd "$BACKEND_DIR"
  if [ -f "$BACKEND_JAR" ]; then
    java -jar "$BACKEND_JAR"
  else
    mvn spring-boot:run
  fi
}

# Khởi chạy riêng Frontend
start_frontend_only() {
  print_banner
  setup_environment
  echo -e "${BLUE}▶ Khởi động riêng Frontend React Vite...${NC}"
  cd "$FRONTEND_DIR"
  if [ ! -d "node_modules" ]; then
    npm install
  fi
  npm run dev
}

# Khởi chạy bằng Docker Compose
start_docker() {
  print_banner
  echo -e "${BLUE}▶ Đang khởi chạy hệ thống bằng Docker Compose...${NC}"
  cd "$SCRIPT_DIR"
  docker compose up --build -d
  echo -e "\n${GREEN}✓ Docker containers đã được khởi chạy:${NC}"
  docker compose ps
  print_access_info
}

# Kiểm tra trạng thái hệ thống
check_status() {
  print_banner
  echo -e "${BOLD}TRẠNG THÁI CÁC DỊCH VỤ:${NC}"

  local b_pid f_pid
  if [ -f "$PID_FILE" ]; then
    read -r b_pid < "$PID_FILE" || true
    f_pid=$(sed -n '2p' "$PID_FILE" 2>/dev/null || true)
  fi

  # Backend check
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:7070/v3/api-docs 2>/dev/null | grep -q "200"; then
    echo -e "  ⚙️  Backend (Port 7070):  ${GREEN}● Đang chạy (HTTP 200 OK)${NC} (PID: ${b_pid:-N/A})"
  else
    echo -e "  ⚙️  Backend (Port 7070):  ${RED}○ Đang dừng${NC}"
  fi

  # Frontend check
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null | grep -q "200"; then
    echo -e "  🌐 Frontend (Port 3000): ${GREEN}● Đang chạy (HTTP 200 OK)${NC} (PID: ${f_pid:-N/A})"
  else
    echo -e "  🌐 Frontend (Port 3000): ${RED}○ Đang dừng${NC}"
  fi
}

# Xử lý tham số
ACTION="${1:-start}"

case "$ACTION" in
  "start"|"run"|"")
    start_system "false"
    ;;
  "--build"|"rebuild")
    start_system "true"
    ;;
  "stop")
    echo -e "${YELLOW}▶ Đang dừng hệ thống Mini-ERP...${NC}"
    stop_running_processes
    echo -e "${GREEN}✓ Đã dừng thành công.${NC}"
    ;;
  "restart")
    echo -e "${YELLOW}▶ Đang khởi động lại hệ thống Mini-ERP...${NC}"
    stop_running_processes
    sleep 1
    start_system "false"
    ;;
  "status")
    check_status
    ;;
  "build")
    build_project
    ;;
  "backend")
    start_backend_only
    ;;
  "frontend")
    start_frontend_only
    ;;
  "docker")
    start_docker
    ;;
  "logs")
    echo -e "${BLUE}▶ Đang hiển thị realtime log Backend & Frontend (Ctrl+C để thoát)...${NC}"
    touch "$BACKEND_LOG" "$FRONTEND_LOG"
    tail -f "$BACKEND_LOG" "$FRONTEND_LOG"
    ;;
  "test")
    if [ -f "$SCRIPT_DIR/test_system.sh" ]; then
      chmod +x "$SCRIPT_DIR/test_system.sh"
      "$SCRIPT_DIR/test_system.sh"
    fi
    ;;
  "help"|"-h"|"--help")
    print_banner
    echo -e "${BOLD}CÁC LỆNH ĐIỀU KHIỂN HỆ THỐNG:${NC}"
    echo -e "  ${GREEN}bash run.sh${NC}          : Tự động khởi chạy toàn bộ Backend (7070) và Frontend (3000)"
    echo -e "  ${GREEN}bash run.sh --build${NC}  : Re-build lại file jar và khởi chạy"
    echo -e "  ${GREEN}bash run.sh stop${NC}     : Dừng toàn bộ các dịch vụ đang chạy"
    echo -e "  ${GREEN}bash run.sh restart${NC}  : Khởi động lại hệ thống"
    echo -e "  ${GREEN}bash run.sh status${NC}   : Kiểm tra trạng thái hoạt động của Backend và Frontend"
    echo -e "  ${GREEN}bash run.sh backend${NC}  : Chỉ chạy riêng Backend Spring Boot"
    echo -e "  ${GREEN}bash run.sh frontend${NC} : Chỉ chạy riêng Frontend React Vite"
    echo -e "  ${GREEN}bash run.sh docker${NC}   : Khởi chạy bằng Docker Compose"
    echo -e "  ${GREEN}bash run.sh build${NC}    : Biên dịch và đóng gói toàn bộ Backend & Frontend"
    echo -e "  ${GREEN}bash run.sh test${NC}     : Chạy bộ kiểm thử tự động toàn diện"
    echo -e "  ${GREEN}bash run.sh logs${NC}     : Xem trực tiếp file log hệ thống"
    ;;
  *)
    echo -e "${RED}Lệnh không hợp lệ: $ACTION${NC}"
    echo -e "Chạy ${GREEN}bash run.sh help${NC} để xem hướng dẫn sử dụng."
    exit 1
    ;;
esac
