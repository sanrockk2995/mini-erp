# HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG MINI-ERP BẰNG DOCKER TRÊN SERVER

Tài liệu hướng dẫn chi tiết quy trình đóng gói, triển khai và vận hành hệ thống Quản trị Doanh nghiệp Mini-ERP (Thời trang & May mặc) trên máy chủ Linux (Ubuntu, Debian, CentOS, Rocky Linux) bằng Docker & Docker Compose.

---

## 1. TỔNG QUAN KIẾN TRÚC TRIỂN KHAI

Hệ thống được thiết kế theo kiến trúc Micro-service container hóa đạt chuẩn production:

```
                          [ Client Browser / Mobile ]
                                      │
                                 Port 80 / 3000
                                      ▼
             ┌─────────────────────────────────────────────────┐
             │            Container: erp-frontend              │
             │           (Nginx 1.25 Alpine Linux)             │
             │  • Phục vụ Single Page App (React Vite SPA)     │
             │  • Nén Gzip, Cache tĩnh (js, css, hình ảnh)     │
             │  • HTML5 History Routing (try_files)            │
             └───────────────┬─────────────────┬───────────────┘
                     /api/*  │                 │  /v3/*, /swagger-ui/*
                             ▼                 ▼
             ┌─────────────────────────────────────────────────┐
             │             Container: erp-backend              │
             │       (Eclipse Temurin JRE 21 Alpine Linux)     │
             │  • Spring Boot 3.3.4 (REST API & Auth RBAC)     │
             │  • Cổng nội bộ: 7070 (Map ra ngoài 7070)        │
             │  • JVM Tuning: -Xms512m -Xmx1024m -XX:+UseG1GC  │
             │  • Người dùng phi root (erpuser:erpgroup)        │
             └────────────────────────┬────────────────────────┘
                                      │
                         Port 3306 (JDBC MySQL 8)
                                      ▼
             ┌─────────────────────────────────────────────────┐
             │               Cơ Sở Dữ Liệu MySQL               │
             │  Tùy chọn A (Mặc định): Server từ xa 10.216.1.218│
             │  Tùy chọn B: Container erp-mysql (--profile)   │
             └─────────────────────────────────────────────────┘
```

---

## 2. YÊU CẦU MÁY CHỦ (SYSTEM REQUIREMENTS)

- **Hệ điều hành:** Linux 64-bit (Ubuntu 20.04+, Debian 11+, CentOS 8+, Rocky Linux 9+, AlmaLinux).
- **Phần cứng:**
  - CPU: Tối thiểu 2 Cores.
  - RAM: Tối thiểu 2 GB (Khuyến nghị 4 GB trở lên).
  - Ổ cứng: Trống tối thiểu 10 GB (SSD khuyến nghị).
- **Mạng:** Mở các port tường lửa sau:
  - `80` (HTTP Web Frontend)
  - `3000` (Frontend cổng phụ nếu cần)
  - `7070` (Backend API trực tiếp)
  - `3306` (Nếu mở kết nối MySQL)

---

## 3. CÀI ĐẶT DOCKER & DOCKER COMPOSE TRÊN SERVER (NẾU CHƯA CÓ)

Chạy các lệnh sau trên terminal của máy chủ Linux:

```bash
# 1. Cài đặt Docker tự động từ script chính thức
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 2. Khởi động và cho phép Docker tự khởi chạy cùng hệ thống
sudo systemctl enable --now docker

# 3. Thêm tài khoản hiện tại vào nhóm docker để không cần sudo
sudo usermod -aG docker $USER
newgrp docker

# 4. Kiểm tra phiên bản Docker & Docker Compose
docker --version
docker compose version
```

---

## 4. QUY TRÌNH TRIỂN KHAI NHANH (1 LỆNH DUY NHẤT)

### Bước 1: Tải mã nguồn lên Server
Bạn có thể clone trực tiếp từ GitHub hoặc copy thư mục dự án lên server:

```bash
# Clone dự án từ GitHub
git clone https://github.com/sanrockk2995/AI-ERP.git
cd AI-ERP
```

### Bước 2: Cấp quyền thực thi cho script triển khai
```bash
chmod +x deploy-docker.sh
```

### Bước 3: Kiểm tra cấu hình kết nối (.env)
Nếu chưa có file `.env`, bạn có thể tạo từ file mẫu `.env.example`:
```bash
cp .env.example .env
nano .env
```
Nội dung cấu hình chuẩn trong `.env`:
```ini
# Kết nối CSDL MySQL (Mặc định kết nối server nội bộ 10.216.1.218):
SPRING_DATASOURCE_URL=jdbc:mysql://10.216.1.218:3306/erp_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Ho_Chi_Minh&characterEncoding=UTF-8
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=1

# Cổng Backend & JWT
SERVER_PORT=7070
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION=86400000

# CORS & Cổng Frontend
APP_CORS_ALLOWED_ORIGINS=*
FRONTEND_PORT=80
FRONTEND_PORT_DEV=3000
```

### Bước 4: Chạy triển khai tự động
```bash
./deploy-docker.sh
```
*Script sẽ tự động kiểm tra Docker, nạp cấu hình `.env`, build image đa tầng (multi-stage build), khởi chạy container và kiểm tra tính năng Healthcheck đến khi hệ thống sẵn sàng 100%.*

---

## 5. TÙY CHỌN TRIỂN KHAI VỚI CSDL MYSQL CỤC BỘ (STAND-ALONE VPS)

Nếu bạn thuê một VPS mới hoàn toàn và muốn chạy luôn cả CSDL MySQL 8.0 trong Docker trên cùng máy chủ đó (không cần kết nối ra ngoài `10.216.1.218`), thực hiện như sau:

1. Mở file `.env` và sửa dòng `SPRING_DATASOURCE_URL`:
   ```ini
   SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/erp_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Ho_Chi_Minh&characterEncoding=UTF-8
   SPRING_DATASOURCE_USERNAME=root
   SPRING_DATASOURCE_PASSWORD=1
   MYSQL_ROOT_PASSWORD=1
   ```

2. Khởi chạy với profile `with-db`:
   ```bash
   docker compose --profile with-db up -d --build
   ```
   *Container `erp-mysql` sẽ tự động khởi tạo database `erp_db` và nạp toàn bộ cấu trúc 18 bảng từ `database/schema.sql` cùng dữ liệu mẫu ban đầu từ `database/data.sql`.*

---

## 6. THÔNG TIN TRUY CẬP HỆ THỐNG SAU KHI TRIỂN KHAI

Sau khi triển khai thành công, bạn có thể truy cập qua địa chỉ IP của server:

| Dịch vụ | Địa chỉ URL | Mô tả |
|---|---|---|
| **Giao diện người dùng (Web ERP)** | `http://<IP_SERVER>:80` hoặc `:3000` | Trang đăng nhập & Dashboard chính |
| **API Backend trực tiếp** | `http://<IP_SERVER>:7070` | Spring Boot REST API |
| **Tài liệu Swagger OpenAPI** | `http://<IP_SERVER>:80/swagger-ui.html` | Thử nghiệm và tra cứu API tương tác |
| **Kiểm tra API Docs (JSON)** | `http://<IP_SERVER>:80/v3/api-docs` | Endpoint kiểm tra sức khỏe hệ thống |

### Danh sách tài khoản đăng nhập mẫu:
| Vai trò (Role) | Tên đăng nhập | Mật khẩu | Quyền hạn chính |
|---|---|---|---|
| **Tổng Giám đốc (Admin)** | `admin` | `123456` | Toàn quyền kiểm soát hệ thống, thiết lập danh mục |
| **Nhân viên Bán hàng (Sales)** | `sales` | `123456` | Quản lý Khách hàng, Báo giá, Lập Đơn bán hàng (SO) |
| **Nhân viên Mua hàng (Purchasing)** | `purchasing` / `purchase_user` | `123456` | Quản lý Nhà cung cấp, Lập Đơn mua hàng (PO) |
| **Thủ kho (Warehouse)** | `warehouse` | `123456` | Nhập kho (GRN), Xuất kho (GIN), Theo dõi tồn kho & Sổ cái |
| **Kế toán nợ (Accountant)** | `accountant` | `123456` | Theo dõi và Thanh toán Công nợ Nhà cung cấp |

---

## 7. CÁC LỆNH QUẢN TRỊ & VẬN HÀNH BẰNG SCRIPT `deploy-docker.sh`

File script `deploy-docker.sh` cung cấp đầy đủ các tiện ích quản lý hệ thống:

```bash
# Xem trực tiếp log của Backend (theo thời gian thực)
./deploy-docker.sh logs backend

# Xem log của Nginx Frontend
./deploy-docker.sh logs frontend

# Kiểm tra trạng thái container và mức độ tiêu thụ RAM / CPU
./deploy-docker.sh status

# Kéo Docker image đóng gói sẵn từ GitHub Container Registry (GHCR)
./deploy-docker.sh pull

# Tự động kéo mã nguồn mới nhất từ GitHub và re-deploy (Cập nhật phiên bản)
./deploy-docker.sh update

# Tự động kiểm tra kết nối các endpoint dịch vụ
./deploy-docker.sh test

# Khởi động lại hệ thống
./deploy-docker.sh restart

# Dừng và giải phóng toàn bộ container
./deploy-docker.sh down
```

---

## 8. XỬ LÝ SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

### 1. Lỗi không mở được Web từ xa (Connection Timed Out)
- **Nguyên nhân:** Tường lửa của Linux (UFW hoặc Firewalld) hoặc Security Group trên Cloud (AWS, Azure, DigitalOcean) đang chặn port.
- **Cách khắc phục:**
  ```bash
  # Với Ubuntu/Debian (UFW):
  sudo ufw allow 80/tcp
  sudo ufw allow 3000/tcp
  sudo ufw allow 7070/tcp
  sudo ufw reload

  # Với CentOS/RHEL (Firewalld):
  sudo firewall-cmd --permanent --add-port=80/tcp
  sudo firewall-cmd --permanent --add-port=3000/tcp
  sudo firewall-cmd --permanent --add-port=7070/tcp
  sudo firewall-cmd --reload
  ```

### 2. Lỗi Backend không kết nối được Database (Communications link failure)
- **Nguyên nhân:** Địa chỉ IP MySQL hoặc tài khoản/mật khẩu trong file `.env` chưa chính xác.
- **Cách kiểm tra:**
  ```bash
  # Kiểm tra kết nối từ server tới máy chủ MySQL:
  nc -zv 10.216.1.218 3306
  # hoặc
  telnet 10.216.1.218 3306
  ```
  Nếu không kết nối được, hãy đảm bảo MySQL trên máy chủ `10.216.1.218` đã bật `bind-address = 0.0.0.0` và cấp quyền cho user `root`:
  ```sql
  GRANT ALL PRIVILEGES ON erp_db.* TO 'root'@'%' IDENTIFIED BY '1';
  FLUSH PRIVILEGES;
  ```

### 3. Lỗi trùng port 80 hoặc 7070 trên Server
- **Nguyên nhân:** Đang có dịch vụ Nginx, Apache hoặc tiến trình khác chạy trên cổng 80/7070.
- **Cách kiểm tra & giải quyết:**
  ```bash
  sudo lsof -i :80
  sudo lsof -i :7070
  ```
  Bạn có thể đổi cổng trong file `.env` (ví dụ `FRONTEND_PORT=8080`, `SERVER_PORT=7071`) rồi chạy lại `./deploy-docker.sh`.
