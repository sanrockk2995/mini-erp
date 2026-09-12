# HỆ THỐNG MINI-ERP DOANH NGHIỆP
### Quản Lý Bán Hàng – Mua Hàng & Nhà Cung Cấp – Kho Hàng (Double-Entry Inventory)

---

## 📌 1. Giới thiệu Tổng quan

Hệ thống **Mini-ERP** là nền tảng quản trị nguồn lực doanh nghiệp tích hợp ba phân hệ nghiệp vụ cốt lõi:
1. **Phân hệ Quản lý Bán hàng (Sales Order Management)**
2. **Phân hệ Quản lý Mua hàng & Nhà cung cấp (Procurement & Supplier Management)**
3. **Phân hệ Quản lý Kho (Warehouse & Double-Entry Stock Ledger)**

Hệ thống được phát triển tuân thủ nghiêm ngặt hai bộ nguyên lý thiết kế:
- **/ux-ui-pro-max**: Tối ưu hóa trải nghiệm giao diện người dùng theo phong cách **Industrial Slate & Emerald Accent** (`#1E293B`, `#059669`), mật độ thông tin cao (Density 8/10), tương phản WCAG AAA, bảng dữ liệu tài chính tối ưu cho nghiệp vụ doanh nghiệp.
- **/ponytail**: Kiến trúc tối giản, hiệu quả cao, loại bỏ hoàn toàn các tầng trừu tượng dư thừa (KISS, YAGNI), mã nguồn sạch và tự tài liệu hóa.

---

## 🛠️ 2. Ngăn xếp Công nghệ (Tech Stack)

### Backend (Java Spring Boot 3.3.4)
- **Runtime**: Java 17+ (Tương thích Java 21 LTS & Java 25)
- **Framework**: Spring Boot 3.3.4
- **Persistence**: Spring Data JPA, Hibernate, MySQL Connector/J
- **Security**: Spring Security 6 với stateless JWT Authentication (Access Token + Refresh Token), mã hóa mật khẩu BCrypt.
- **Validation**: Jakarta Bean Validation (`@Valid`, `@NotNull`, `@Min`, ...)
- **API Documentation**: Springdoc OpenAPI 3.0 (Swagger UI tại `/swagger-ui/index.html`)
- **Centralized Handling**: `@RestControllerAdvice` chuẩn hóa `ApiResponse<T>` và mã lỗi nghiệp vụ thống nhất.

### Frontend (React 18 + Vite + TypeScript)
- **Core**: React 18, Vite 5, TypeScript 5
- **Design System & Components**: Ant Design (AntD) v5 tùy biến Theme Token doanh nghiệp.
- **Icon Set**: `@ant-design/icons`
- **State Management**: `zustand` gọn nhẹ, bền vững với `localStorage`.
- **Router**: `react-router-dom` v6 với `ProtectedRoute` phân quyền RBAC đa tầng.
- **HTTP Client**: `axios` với Interceptor tự động gán Bearer Token và bắt lỗi 401 tự động chuyển hướng đăng nhập.
- **Utility**: `dayjs` xử lý ngày tháng theo chuẩn quốc tế và định dạng Việt Nam.

### Cơ sở Dữ liệu (Database)
- **Hệ quản trị**: MySQL 8+
- **Địa chỉ máy chủ**: `10.216.1.218:3306`
- **Tên cơ sở dữ liệu**: `erp_db`
- **Tài khoản**: `root` / Mật khẩu: `1`
- **Tổng số bảng**: 28 bảng dữ liệu quan hệ, thiết kế khóa ngoại, chỉ mục (Index) và quy tắc toàn vẹn tham chiếu.

---

## 🏗️ 3. Quy trình Nghiệp vụ Cốt lõi & Cơ chế Tự động hóa

### 3.1. Bán hàng & Tự động giữ kho (Sales Order Workflow)
```
DRAFT ──[Duyệt đơn]──> APPROVED ──[Xác nhận xuất GIN]──> DELIVERING ──[Giao xong]──> COMPLETED
  │                         │                                  │
  └─[Hủy]─> CANCELLED       ├─> Tự động trừ Tồn khả dụng       └─> Trừ Tồn thực tế & Giữ chỗ
                            │   (quantity_reserved += Qty)         (quantity_on_hand -= Qty)
                            └─> Tự động sinh Phiếu Xuất Kho        Ghi Sổ cái kho (OUT)
                                DRAFT (GoodsIssueNote)
```

### 3.2. Mua hàng, Nhập kho & Phát sinh Công nợ NCC (Procurement Workflow)
```
DRAFT ──[Gửi duyệt]──> PENDING_APPROVAL ──[Phê duyệt]──> APPROVED
                                                            │
                                                     [Lập & Duyệt GRN]
                                                            ▼
                                                        RECEIVED
                                                            │
                                  ┌─────────────────────────┴─────────────────────────┐
                                  ▼                                                   ▼
                         Tăng Tồn kho thực tế                                Tự động sinh Công nợ NCC
                       (quantity_on_hand += Qty)                             (Hạn thanh toán 30 ngày)
                       Ghi Sổ cái kho (IN)                                   Ghi nhận Phiếu chi thanh toán
```

### 3.3. Sổ cái kho Bất biến (Double-Entry Stock Ledger)
Mọi biến động kho (Nhập hàng PO, Xuất bán SO, Điều chỉnh kiểm kê) đều ghi vào bảng `stock_ledger` bất biến:
- `transaction_type`: `IN` (Nhập) hoặc `OUT` (Xuất)
- `reference_type`: `PO_RECEIPT`, `SO_ISSUE`, `ADJUSTMENT`, `TRANSFER`
- `balance_after`: Tồn kho tức thời sau giao dịch.
- Công thức tồn kho:
  $$\text{quantityAvailable} = \text{quantityOnHand} - \text{quantityReserved}$$

### 3.4. Chấm điểm & Xếp hạng Nhà Cung Cấp Tự động
Đánh giá nhà cung cấp trên 3 tiêu chí từ 1 đến 10:
- **Chất lượng (Quality)**
- **Tiến độ giao hàng (Delivery)**
- **Tính cạnh tranh về giá (Price)**
- Công thức điểm: $\text{Average} = \frac{\text{Quality} + \text{Delivery} + \text{Price}}{3}$
- Phân hạng NCC:
  * **Hạng A (Xuất sắc)**: Điểm trung bình $\ge 8.5$
  * **Hạng B (Đạt tiêu chuẩn)**: $6.5 \le$ Điểm trung bình $< 8.5$
  * **Hạng C (Cần cải thiện)**: Điểm trung bình $< 6.5$

---

## 👥 4. Tài khoản Kiểm thử Hệ thống (Pre-seeded Users)

Hệ thống đã nạp sẵn các tài khoản phân quyền RBAC để kiểm thử:

| Tên đăng nhập | Mật khẩu | Họ và tên | Phân quyền (Roles) | Mô tả vai trò |
|---|---|---|---|---|
| **`admin`** | `123456` | Quản trị Hệ thống | `ADMIN`, `SALES`, `PURCHASING`, `WAREHOUSE`, `ACCOUNTANT` | Toàn quyền kiểm soát toàn hệ thống |
| **`sales`** | `123456` | Nhân viên Kinh doanh | `SALES` | Quản lý khách hàng, lập & theo dõi đơn đặt hàng bán |
| **`purchasing`** | `123456` | Nhân viên Mua hàng | `PURCHASING` | Quản lý NCC, chấm điểm, lập đơn mua PO |
| **`warehouse`** | `123456` | Thủ kho Quản lý | `WAREHOUSE` | Quản lý tồn kho, xác nhận phiếu nhập GRN, phiếu xuất GIN, sổ cái |

*(Trên màn hình Đăng nhập `/login`, có sẵn 4 nút bấm điền nhanh tài khoản kiểm thử).*

---

## 🚀 5. Hướng dẫn Cài đặt & Chạy Dự án

### Cách 1: Chạy tự động với Script `run.sh` (Nhanh nhất & Đơn giản nhất)

Script [run.sh](file:///home/sanrockk/mini-erp/run.sh) tự động dò tìm môi trường (Java 17, Maven, Node.js), dọn dẹp port cũ, biên dịch và chạy đồng thời Backend (8080) và Frontend (3000):

```bash
# Khởi chạy toàn bộ hệ thống (Backend + Frontend)
bash run.sh

# Hoặc dùng các lệnh quản trị:
bash run.sh status    # Kiểm tra trạng thái hoạt động của Backend & Frontend
bash run.sh test      # Chạy bộ kiểm thử tự động toàn diện
bash run.sh logs      # Xem realtime log của Backend và Frontend
bash run.sh stop      # Dừng toàn bộ hệ thống
bash run.sh restart   # Khởi động lại hệ thống
bash run.sh docker    # Khởi chạy qua Docker Compose
```

### Cách 2: Chạy trực tiếp qua Docker Compose

Yêu cầu: Đã cài đặt **Docker** và **Docker Compose**.

```bash
docker compose up --build -d
```

Truy cập hệ thống:
- **Giao diện người dùng (Frontend)**: [http://localhost:3000](http://localhost:3000) (hoặc [http://localhost](http://localhost))
- **API Backend RESTful**: [http://localhost:8080/api](http://localhost:8080/api)
- **Tài liệu Swagger UI**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **OpenAPI JSON Docs**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

### Cách 3: Chạy thủ công trong môi trường Phát triển (Native Development)

#### Bước 1: Khởi động Backend Spring Boot
Yêu cầu: **JDK 17+** và **Maven 3.8+**.
```bash
cd backend
mvn clean package -DskipTests
java -jar target/mini-erp-backend-1.0.0.jar
```
Backend sẽ khởi chạy tại cổng `8080`, kết nối trực tiếp đến database MySQL `10.216.1.218:3306`.

#### Bước 2: Khởi động Frontend React Vite
Yêu cầu: **Node.js 18+** và **npm**.
```bash
cd frontend
npm install
npm run dev
```
Frontend sẽ chạy tại [http://localhost:3000](http://localhost:3000). Vite đã cấu hình proxy `/api` sang `http://localhost:8080`.

---

## 📑 6. Danh mục Endpoints RESTful API Chính

| Phân hệ | Phương thức | Đường dẫn API | Chức năng nghiệp vụ |
|---|---|---|---|
| **Xác thực** | `POST` | `/api/auth/login` | Đăng nhập hệ thống, nhận JWT Access + Refresh token |
| | `GET` | `/api/auth/me` | Lấy thông tin tài khoản hiện hành và quyền hạn |
| **Sản phẩm** | `GET` | `/api/products` | Tìm kiếm, lọc sản phẩm theo danh mục và phân trang |
| | `POST` | `/api/products` | Thêm mới hàng hóa, mã SKU, giá vốn tiêu chuẩn và giá bán |
| | `PUT` | `/api/products/{id}` | Cập nhật thông số sản phẩm |
| **Bảng giá** | `GET` | `/api/price-lists` | Danh sách bảng giá theo nhóm khách hàng |
| | `POST` | `/api/price-lists` | Tạo bảng giá tùy biến theo thời hạn áp dụng |
| **Khách hàng**| `GET` | `/api/customers` | Danh sách khách hàng và phân nhóm |
| | `GET` | `/api/customers/{id}/purchase-history` | Xem lịch sử đơn hàng và tổng giá trị mua của khách |
| **Bán hàng** | `GET` | `/api/sales-orders` | Danh sách đơn đặt hàng bán |
| | `POST` | `/api/sales-orders` | Tạo đơn bán hàng mới |
| | `POST` | `/api/sales-orders/{id}/approve` | Duyệt đơn hàng (Tự động giữ kho & sinh Phiếu Xuất Kho) |
| | `POST` | `/api/sales-orders/{id}/cancel` | Hủy đơn hàng và hoàn lại số lượng tồn kho giữ chỗ |
| **NCC** | `GET` | `/api/suppliers` | Danh sách nhà cung cấp và phân hạng A/B/C |
| | `POST` | `/api/suppliers/{id}/reviews` | Đánh giá chất lượng NCC (Tự động tính điểm và xếp hạng) |
| **Mua hàng** | `GET` | `/api/purchase-orders` | Danh sách đơn mua hàng PO |
| | `POST` | `/api/purchase-orders` | Lập đơn mua hàng gửi NCC |
| | `POST` | `/api/purchase-orders/{id}/submit` | Gửi duyệt đơn mua hàng |
| | `POST` | `/api/purchase-orders/{id}/approve` | Quản lý phê duyệt đơn mua hàng |
| **Công nợ** | `GET` | `/api/supplier-debts` | Quản lý hóa đơn công nợ NCC và trạng thái thanh toán |
| | `POST` | `/api/supplier-debts/payments` | Ghi nhận phiếu chi thanh toán công nợ |
| **Kho hàng** | `GET` | `/api/inventory` | Tổng hợp tồn kho thực tế, giữ chỗ và khả dụng |
| | `GET` | `/api/inventory/low-stock` | Cảnh báo các mặt hàng dưới định mức an toàn |
| | `POST` | `/api/inventory/adjust` | Điều chỉnh tồn kho thực tế do kiểm kê thừa/thiếu |
| | `GET` | `/api/stock-ledger` | Sổ cái biến động kho chi tiết từng giao dịch IN/OUT |
| | `POST` | `/api/goods-receipts/{id}/confirm`| Xác nhận Nhập Kho: Tăng tồn, ghi sổ, hoàn tất PO, sinh nợ |
| | `POST` | `/api/goods-issues/{id}/confirm` | Xác nhận Xuất Kho: Trừ tồn thực & giữ chỗ, chuyển giao hàng |
| **Dashboard**| `GET` | `/api/dashboard/stats` | Thống kê KPIs (Doanh thu tháng, đơn hàng, công nợ, cảnh báo) |
| | `GET` | `/api/dashboard/sales-trend` | Biểu đồ doanh thu 6 tháng gần nhất |
| | `GET` | `/api/dashboard/top-products` | Top 5 sản phẩm bán chạy nhất |

---

## 🛡️ 7. Kiểm soát Chất lượng & Đảm bảo Tính Toàn vẹn

1. **Giao dịch Bất khả phân (ACID Transactional)**:
   Mọi thao tác thay đổi tồn kho, duyệt đơn hàng, xác nhận nhập/xuất kho đều được bao bọc trong `@Transactional`, đảm bảo dữ liệu luôn đồng nhất và không bao giờ xảy ra tình trạng trừ kho thiếu sót hay sinh công nợ mồ côi.
2. **Khóa chống Bán âm Kho (Concurrency Guard)**:
   Hàm `reserveStock` và `deductIssuedStock` luôn kiểm tra số lượng tồn kho khả dụng hiện hữu, ném `BusinessException` kèm thông báo chi tiết nếu số lượng trong kho không đủ cung ứng.
3. **Audit Trail**:
   Tất cả các bản ghi đều lưu vết thời gian khởi tạo (`created_at`), cập nhật (`updated_at`), người tạo (`created_by`) và lịch sử thay đổi trạng thái đơn hàng (`sales_order_status_history`).
