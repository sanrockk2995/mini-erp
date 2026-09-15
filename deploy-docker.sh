#!/usr/bin/env bash
# ==============================================================================
# HỆ THỐNG QUẢN TRỊ DOANH NGHIỆP DỆT MAY & THỜI TRANG MINI-ERP
# SCRIPT TRIỂN KHAI & QUẢN TRỊ HỆ THỐNG BẰNG DOCKER TRÊN MÁY CHỦ (PRODUCTION)
# ==============================================================================

set -e

# Màu sắc hiển thị terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Thư mục gốc dự án
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Kiểm tra Docker & Docker Compose
check_docker() {
    log_info "Kiểm tra môi trường Docker trên máy chủ..."

    if ! command -v docker >/dev/null 2>&1; then
        log_error "Docker chưa được cài đặt trên máy chủ!"
        echo -e "Vui lòng cài đặt Docker: ${BOLD}curl -fsSL https://get.docker.com | sh${NC}"
        exit 1
    fi

    if ! docker info >/dev/null 2>&1; then
        log_error "Docker daemon không chạy hoặc bạn chưa có quyền truy cập!"
        echo -e "Khởi động Docker: ${BOLD}sudo systemctl start docker${NC}"
        echo -e "Thêm user vào nhóm docker: ${BOLD}sudo usermod -aG docker \$USER${NC}"
        exit 1
    fi

    if docker compose version >/dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    elif command -v docker-compose >/dev/null 2>&1; then
        COMPOSE_CMD="docker-compose"
    else
        log_error "Docker Compose chưa được cài đặt!"
        echo -e "Vui lòng cài đặt: ${BOLD}sudo apt-get install docker-compose-plugin${NC}"
        exit 1
    fi

    log_success "Docker & Docker Compose sẵn sàng! ($($COMPOSE_CMD version))"
}

# 2. Kiểm tra file cấu hình .env
check_env() {
    if [ ! -f "$PROJECT_DIR/.env" ]; then
        if [ -f "$PROJECT_DIR/.env.example" ]; then
            log_warn "Không tìm thấy file .env, tiến hành khởi tạo từ .env.example..."
            cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
            log_success "Đã tạo file .env thành công!"
        else
            log_error "Không tìm thấy file .env hoặc .env.example!"
            exit 1
        fi
    fi
}

# 3. Triển khai hệ thống (Build & Run)
deploy_system() {
    check_docker
    check_env

    echo -e "\n${BOLD}${BLUE}==============================================================================${NC}"
    echo -e "${BOLD}${BLUE}         BẮT ĐẦU TRIỂN KHAI HỆ THỐNG MINI-ERP BẰNG DOCKER COMPOSE              ${NC}"
    echo -e "${BOLD}${BLUE}==============================================================================${NC}\n"

    # Nạp biến môi trường để hiển thị
    export $(grep -v '^#' .env | xargs -d '\n' 2>/dev/null || true)

    log_info "Build và khởi chạy các container trong background..."
    $COMPOSE_CMD up -d --build

    log_info "Đang kiểm tra trạng thái khởi động của Backend (chờ tối đa 90 giây)..."
    local max_retries=18
    local count=0
    local healthy=false

    while [ $count -lt $max_retries ]; do
        sleep 5
        count=$((count + 1))

        local status
        status=$(docker inspect --format='{{json .State.Health.Status}}' erp-backend 2>/dev/null || echo "\"unknown\"")

        if [ "$status" = "\"healthy\"" ]; then
            healthy=true
            break
        fi

        echo -ne "${YELLOW}Chờ Backend sẵn sàng... (${count}/${max_retries}) [Trạng thái hiện tại: ${status}]${NC}\r"
    done
    echo ""

    if [ "$healthy" = true ]; then
        log_success "erp-backend đã khởi động hoàn tất và đạt trạng thái HEALTHY!"
    else
        log_warn "Backend đang khởi động hoặc chưa đạt trạng thái healthy. Kiểm tra log bằng lệnh: ${BOLD}$0 logs backend${NC}"
    fi

    show_info
}

# 4. Hiển thị thông tin truy cập hệ thống
show_info() {
    local host_ip
    host_ip=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")
    [ -z "$host_ip" ] && host_ip="localhost"

    echo -e "\n${BOLD}${GREEN}==============================================================================${NC}"
    echo -e "${BOLD}${GREEN}                 HỆ THỐNG MINI-ERP ĐÃ ĐƯỢC TRIỂN KHAI THÀNH CÔNG!              ${NC}"
    echo -e "${BOLD}${GREEN}==============================================================================${NC}\n"

    echo -e "${BOLD}CỔNG TRUY CẬP HỆ THỐNG:${NC}"
    echo -e "  - ${CYAN}Giao diện Web (Frontend):${NC}    http://${host_ip}:80 hoặc http://${host_ip}:3000"
    echo -e "  - ${CYAN}API Backend trực tiếp:${NC}        http://${host_ip}:7070"
    echo -e "  - ${CYAN}Tài liệu Swagger API Docs:${NC}    http://${host_ip}:80/swagger-ui.html"
    echo -e "  - ${CYAN}Endpoint kiểm tra (Health):${NC}   http://${host_ip}:80/v3/api-docs"
    echo ""
    echo -e "${BOLD}TÀI KHOẢN ĐĂNG NHẬP MẶC ĐỊNH:${NC}"
    echo -e "  - ${YELLOW}Admin (Toàn quyền):${NC}           admin / admin123"
    echo -e "  - ${YELLOW}Sales (Bán hàng):${NC}             sales / sales123"
    echo -e "  - ${YELLOW}Purchasing (Mua hàng):${NC}        purchase / purchase123"
    echo -e "  - ${YELLOW}Warehouse (Thủ kho):${NC}          warehouse / warehouse123"
    echo -e "  - ${YELLOW}Accountant (Kế toán nợ):${NC}      accountant / acc123"
    echo ""
    echo -e "${BOLD}LỆNH QUẢN TRỊ NHANH:${NC}"
    echo -e "  - Xem log Backend:                 ${BOLD}$0 logs backend${NC}"
    echo -e "  - Xem log Frontend:                ${BOLD}$0 logs frontend${NC}"
    echo -e "  - Xem trạng thái & tài nguyên:     ${BOLD}$0 status${NC}"
    echo -e "  - Khởi động lại:                   ${BOLD}$0 restart${NC}"
    echo -e "  - Dừng hệ thống:                   ${BOLD}$0 down${NC}"
    echo -e "  - Cập nhật phiên bản mới:          ${BOLD}$0 update${NC}"
    echo -e "${BOLD}${GREEN}==============================================================================${NC}\n"
}

# 5. Dừng hệ thống
stop_system() {
    check_docker
    log_info "Dừng và giải phóng các container..."
    $COMPOSE_CMD down
    log_success "Đã dừng hệ thống thành công."
}

# 6. Khởi động lại hệ thống
restart_system() {
    check_docker
    local service="${1:-}"
    if [ -n "$service" ]; then
        log_info "Khởi động lại dịch vụ: $service..."
        $COMPOSE_CMD restart "$service"
    else
        log_info "Khởi động lại toàn bộ hệ thống..."
        $COMPOSE_CMD restart
    fi
    log_success "Khởi động lại hoàn tất."
}

# 7. Xem log
view_logs() {
    check_docker
    local service="${1:-}"
    if [ -n "$service" ]; then
        $COMPOSE_CMD logs -f --tail=100 "$service"
    else
        $COMPOSE_CMD logs -f --tail=100
    fi
}

# 8. Xem trạng thái các dịch vụ
check_status() {
    check_docker
    echo -e "\n${BOLD}${CYAN}=== DANH SÁCH CONTAINER ĐANG CHẠY ===${NC}"
    $COMPOSE_CMD ps
    echo -e "\n${BOLD}${CYAN}=== MỨC ĐỘ TIÊU THỤ TÀI NGUYÊN (CPU/RAM) ===${NC}"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" $(docker ps -q --filter "name=erp-") 2>/dev/null || docker stats --no-stream
}

# 9. Cập nhật code mới từ Git và Re-deploy
update_system() {
    check_docker
    log_info "Kéo mã nguồn mới nhất từ nhánh Git..."
    git pull origin main || git pull
    log_info "Tiến hành build lại và cập nhật container..."
    deploy_system
}

# 10. Kiểm thử nhanh các Endpoint
test_system() {
    log_info "Đang kiểm tra kết nối tới các dịch vụ..."
    local host="localhost"

    echo -ne "1. Kiểm tra Swagger UI: "
    if curl -s -o /dev/null -w "%{http_code}" "http://${host}:7070/v3/api-docs" | grep -q "200"; then
        echo -e "${GREEN}[OK - HTTP 200]${NC}"
    else
        echo -e "${RED}[FAILED]${NC}"
    fi

    echo -ne "2. Kiểm tra Nginx Frontend Proxy: "
    if curl -s -o /dev/null -w "%{http_code}" "http://${host}:80/" | grep -q "200"; then
        echo -e "${GREEN}[OK - HTTP 200]${NC}"
    else
        echo -e "${RED}[FAILED]${NC}"
    fi

    echo -ne "3. Kiểm tra Nginx Reverse Proxy /api/auth/me (Chặn 401 khi chưa login): "
    if curl -s -o /dev/null -w "%{http_code}" "http://${host}:80/api/auth/me" | grep -q "401"; then
        echo -e "${GREEN}[OK - HTTP 401 Unauthorized theo chuẩn bảo mật]${NC}"
    else
        echo -e "${YELLOW}[Cảnh báo: Kiểm tra cấu hình Nginx proxy]${NC}"
    fi
}

# Menu hướng dẫn
show_help() {
    echo -e "${BOLD}CÁCH SỬ DỤNG LỆNH:${NC} $0 [command]"
    echo ""
    echo "Các lệnh hỗ trợ:"
    echo "  deploy | up        Build và khởi chạy hệ thống ở chế độ background (mặc định)"
    echo "  down | stop        Dừng và gỡ bỏ toàn bộ container"
    echo "  restart [service]  Khởi động lại toàn bộ hoặc một service cụ thể (backend | frontend)"
    echo "  logs [service]     Xem trực tiếp log theo thời gian thực (backend | frontend)"
    echo "  status | ps        Kiểm tra trạng thái hoạt động và mức độ tiêu thụ RAM/CPU"
    echo "  update             Kéo code mới nhất từ Git và tự động build/re-deploy"
    echo "  test               Kiểm tra tự động các endpoint dịch vụ"
    echo "  info               Hiển thị thông tin truy cập, port và tài khoản mặc định"
    echo "  help               Hiển thị hướng dẫn này"
    echo ""
}

# Xử lý tham số truyền vào
COMMAND="${1:-deploy}"

case "$COMMAND" in
    deploy|up)
        deploy_system
        ;;
    down|stop)
        stop_system
        ;;
    restart)
        restart_system "$2"
        ;;
    logs)
        view_logs "$2"
        ;;
    status|ps)
        check_status
        ;;
    update)
        update_system
        ;;
    test)
        test_system
        ;;
    info)
        show_info
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Lệnh '$COMMAND' không hợp lệ!"
        show_help
        exit 1
        ;;
esac
