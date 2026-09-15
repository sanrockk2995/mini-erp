-- ====================================================================
-- MINI-ERP CLOTHING & APPAREL SEED DATA (MySQL 8+)
-- Database: erp_db
-- Hệ thống Quản trị Doanh nghiệp Dệt may & Bán lẻ Thời trang
-- Kiến trúc: Core-FK & Flat Read Model (Tối ưu hợp nhất 18 bảng)
-- Mật khẩu mặc định toàn hệ thống cho mọi tài khoản: 123456
-- BCrypt Hash: $2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.
-- ====================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa dữ liệu cũ trước khi nạp lại dữ liệu đồng bộ
TRUNCATE TABLE goods_issue_items;
TRUNCATE TABLE goods_issue_notes;
TRUNCATE TABLE goods_receipt_items;
TRUNCATE TABLE goods_receipt_notes;
TRUNCATE TABLE supplier_debts;
TRUNCATE TABLE purchase_order_items;
TRUNCATE TABLE purchase_orders;
TRUNCATE TABLE sales_order_items;
TRUNCATE TABLE sales_orders;
TRUNCATE TABLE stock_ledger;
TRUNCATE TABLE inventory;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE customers;
TRUNCATE TABLE suppliers;
TRUNCATE TABLE warehouses;
TRUNCATE TABLE permissions;
TRUNCATE TABLE users;

-- --------------------------------------------------------------------
-- 1. AUTH & RBAC (Phân quyền & Người dùng Hợp nhất - Zero-Join Auth)
-- Bảng permissions lưu danh mục quyền hệ thống
-- Bảng users hợp nhất vai trò (role) và danh sách quyền (permissions)
-- --------------------------------------------------------------------

INSERT INTO permissions (id, code, name, module) VALUES
(1, 'PRODUCT_VIEW', 'Xem danh mục & sản phẩm', 'PRODUCT'),
(2, 'PRODUCT_MANAGE', 'Thêm/sửa/xóa sản phẩm', 'PRODUCT'),
(3, 'PRICELIST_MANAGE', 'Cấu hình bảng giá', 'PRODUCT'),
(4, 'CUSTOMER_VIEW', 'Xem danh sách khách hàng', 'CUSTOMER'),
(5, 'CUSTOMER_MANAGE', 'Thêm/sửa/xóa khách hàng', 'CUSTOMER'),
(6, 'SO_CREATE', 'Tạo đơn bán hàng', 'SALES'),
(7, 'SO_APPROVE', 'Duyệt đơn bán hàng', 'SALES'),
(8, 'SO_CANCEL', 'Hủy đơn bán hàng', 'SALES'),
(9, 'SUPPLIER_VIEW', 'Xem nhà cung cấp', 'SUPPLIER'),
(10, 'SUPPLIER_MANAGE', 'Thêm/sửa/đánh giá NCC', 'SUPPLIER'),
(11, 'PO_CREATE', 'Lập đơn mua hàng', 'PURCHASE'),
(12, 'PO_APPROVE', 'Duyệt đơn mua hàng', 'PURCHASE'),
(13, 'DEBT_VIEW', 'Xem công nợ NCC', 'FINANCE'),
(14, 'PAYMENT_CREATE', 'Lập phiếu chi thanh toán NCC', 'FINANCE'),
(15, 'STOCK_VIEW', 'Xem tồn kho & sổ cái kho', 'WAREHOUSE'),
(16, 'GRN_MANAGE', 'Nhập kho hàng hóa', 'WAREHOUSE'),
(17, 'GIN_MANAGE', 'Xuất kho hàng hóa', 'WAREHOUSE'),
(18, 'DASHBOARD_VIEW', 'Xem báo cáo thống kê Dashboard', 'DASHBOARD');

-- Danh sách người dùng hệ thống (Mật khẩu mặc định: 123456)
INSERT INTO users (id, username, email, password_hash, full_name, phone, role, permissions, status) VALUES
(1, 'admin', 'admin@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Nguyễn Quản Trị', '0901234567', 'ADMIN', 'PRODUCT_VIEW,PRODUCT_MANAGE,PRICELIST_MANAGE,CUSTOMER_VIEW,CUSTOMER_MANAGE,SO_CREATE,SO_APPROVE,SO_CANCEL,SUPPLIER_VIEW,SUPPLIER_MANAGE,PO_CREATE,PO_APPROVE,DEBT_VIEW,PAYMENT_CREATE,STOCK_VIEW,GRN_MANAGE,GIN_MANAGE,DASHBOARD_VIEW', 'ACTIVE'),
(2, 'sales_user', 'sales@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Trần Thu Thảo', '0912345678', 'SALES', 'PRODUCT_VIEW,CUSTOMER_VIEW,CUSTOMER_MANAGE,SO_CREATE,SO_CANCEL,STOCK_VIEW,DASHBOARD_VIEW', 'ACTIVE'),
(3, 'purchase_user', 'purchase@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Lê Hoàng Nam', '0923456789', 'PURCHASING', 'PRODUCT_VIEW,SUPPLIER_VIEW,SUPPLIER_MANAGE,PO_CREATE,STOCK_VIEW,DASHBOARD_VIEW', 'ACTIVE'),
(4, 'warehouse_user', 'warehouse@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Phạm Quốc Bảo', '0934567890', 'WAREHOUSE', 'PRODUCT_VIEW,STOCK_VIEW,GRN_MANAGE,GIN_MANAGE,DASHBOARD_VIEW', 'ACTIVE'),
(5, 'accountant_user', 'accountant@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Vũ Mai Hương', '0945678901', 'ACCOUNTANT', 'CUSTOMER_VIEW,SUPPLIER_VIEW,DEBT_VIEW,PAYMENT_CREATE,DASHBOARD_VIEW', 'ACTIVE'),
(6, 'sales', 'sales_alias@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Trần Thu Thảo', '0912345678', 'SALES', 'PRODUCT_VIEW,CUSTOMER_VIEW,CUSTOMER_MANAGE,SO_CREATE,SO_CANCEL,STOCK_VIEW,DASHBOARD_VIEW', 'ACTIVE'),
(7, 'purchasing', 'purchasing_alias@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Lê Hoàng Nam', '0923456789', 'PURCHASING', 'PRODUCT_VIEW,SUPPLIER_VIEW,SUPPLIER_MANAGE,PO_CREATE,STOCK_VIEW,DASHBOARD_VIEW', 'ACTIVE'),
(8, 'warehouse', 'warehouse_alias@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Phạm Quốc Bảo', '0934567890', 'WAREHOUSE', 'PRODUCT_VIEW,STOCK_VIEW,GRN_MANAGE,GIN_MANAGE,DASHBOARD_VIEW', 'ACTIVE'),
(9, 'accountant', 'accountant_alias@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Vũ Mai Hương', '0945678901', 'ACCOUNTANT', 'CUSTOMER_VIEW,SUPPLIER_VIEW,DEBT_VIEW,PAYMENT_CREATE,DASHBOARD_VIEW', 'ACTIVE'),
(10, 'director', 'director@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Trần Văn Giám Đốc', '0909998888', 'ADMIN', 'PRODUCT_VIEW,PRODUCT_MANAGE,PRICELIST_MANAGE,CUSTOMER_VIEW,CUSTOMER_MANAGE,SO_CREATE,SO_APPROVE,SO_CANCEL,SUPPLIER_VIEW,SUPPLIER_MANAGE,PO_CREATE,PO_APPROVE,DEBT_VIEW,PAYMENT_CREATE,STOCK_VIEW,GRN_MANAGE,GIN_MANAGE,DASHBOARD_VIEW', 'ACTIVE'),
(11, 'sales_hn', 'sales_hn@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Nguyễn Văn Tuấn', '0919887766', 'SALES', 'PRODUCT_VIEW,CUSTOMER_VIEW,CUSTOMER_MANAGE,SO_CREATE,SO_CANCEL,STOCK_VIEW,DASHBOARD_VIEW', 'ACTIVE'),
(12, 'sales_sg', 'sales_sg@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Võ Thị Thanh Thảo', '0983112233', 'SALES', 'PRODUCT_VIEW,CUSTOMER_VIEW,CUSTOMER_MANAGE,SO_CREATE,SO_CANCEL,STOCK_VIEW,DASHBOARD_VIEW', 'ACTIVE'),
(13, 'purchase_mgr', 'purchase_mgr@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Hoàng Đức Thịnh', '0972334455', 'PURCHASING', 'PRODUCT_VIEW,SUPPLIER_VIEW,SUPPLIER_MANAGE,PO_CREATE,PO_APPROVE,STOCK_VIEW,DASHBOARD_VIEW', 'ACTIVE'),
(14, 'wh_sg', 'wh_sg@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Vũ Nam Kho', '0988776655', 'WAREHOUSE', 'PRODUCT_VIEW,STOCK_VIEW,GRN_MANAGE,GIN_MANAGE,DASHBOARD_VIEW', 'ACTIVE'),
(15, 'wh_dn', 'wh_dn@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Đặng Trung Kho', '0977665544', 'WAREHOUSE', 'PRODUCT_VIEW,STOCK_VIEW,GRN_MANAGE,GIN_MANAGE,DASHBOARD_VIEW', 'ACTIVE'),
(16, 'acc_lead', 'acc_lead@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Phan Thị Kim Oanh', '0966554433', 'ACCOUNTANT', 'CUSTOMER_VIEW,SUPPLIER_VIEW,DEBT_VIEW,PAYMENT_CREATE,DASHBOARD_VIEW', 'ACTIVE');

-- --------------------------------------------------------------------
-- 2. WAREHOUSES (Hệ thống 5 Tổng kho Dệt may & Thành phẩm Toàn quốc)
-- --------------------------------------------------------------------

INSERT INTO warehouses (id, code, name, address, manager_name, phone, is_active) VALUES
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 'Lô 12 KCN Dệt May Phố Nối, Hưng Yên - Hà Nội', 'Phạm Quốc Bảo', '0934567890', 1),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 'Đường số 3 KCN Tân Bình, Tây Thạnh, Tân Phú, TP.HCM', 'Vũ Nam Kho', '0988776655', 1),
(3, 'WH-DN-01', 'Kho Trung Chuyển Miền Trung', 'Khu công nghiệp Hòa Khánh, Liên Chiểu, Đà Nẵng', 'Đặng Trung Kho', '0977665544', 1),
(4, 'WH-CT-01', 'Kho Vận Chuyển Miền Tây - Cần Thơ', 'Lô B3 KCN Trà Nóc, Quận Bình Thủy, Cần Thơ', 'Nguyễn Hữu Tài', '0939112233', 1),
(5, 'WH-HP-01', 'Kho Cảng Dệt May Hải Phòng', 'Khu Kinh tế Đình Vũ, Đông Hải 2, Hải An, Hải Phòng', 'Bùi Quốc Trọng', '0918223344', 1);

-- --------------------------------------------------------------------
-- 3. CATEGORIES (Danh mục Thời trang Đa cấp Phân cấp Cây)
-- --------------------------------------------------------------------

INSERT INTO categories (id, code, name, parent_id, sort_order, is_active) VALUES
-- Cấp 1 (Gốc)
(1, 'MEN', 'Thời Trang Nam', NULL, 1, 1),
(2, 'WOMEN', 'Thời Trang Nữ', NULL, 2, 1),
(3, 'UNISEX', 'Thời Trang Unisex & Streetwear', NULL, 3, 1),
(4, 'ACCESSORIES', 'Phụ Kiện Thời Trang', NULL, 4, 1),
(5, 'KIDS', 'Thời Trang Trẻ Em', NULL, 5, 1),
(6, 'SPORT', 'Đồ Thể Thao & Activewear', NULL, 6, 1),
(7, 'INNER', 'Đồ Lót & Đồ Mặc Nhà Cao Cấp', NULL, 7, 1),
-- Cấp 2: Nam
(8, 'POLO-MEN', 'Áo Polo Nam Công Sở & Thể Thao', 1, 1, 1),
(9, 'SHIRT-MEN', 'Áo Sơ Mi Nam Công Sở Cao Cấp', 1, 2, 1),
(10, 'JEANS-MEN', 'Quần Jean & Quần Denim Nam', 1, 3, 1),
(11, 'PANTS-MEN', 'Quần Tây & Quần Âu Nam', 1, 4, 1),
(12, 'COAT-MEN', 'Áo Khoác & Blazer Nam', 1, 5, 1),
(13, 'SHORT-MEN', 'Quần Short & Kaki Lửng Nam', 1, 6, 1),
-- Cấp 2: Nữ
(14, 'DRESS-WOMEN', 'Váy Đầm Liền & Đầm Dự Tiệc', 2, 1, 1),
(15, 'BLAZER-WOMEN', 'Áo Blazer & Áo Khoác Vest Nữ', 2, 2, 1),
(16, 'SKIRT-WOMEN', 'Chân Váy & Quần Tây Nữ', 2, 3, 1),
(17, 'SHIRT-WOMEN', 'Áo Sơ Mi & Blouse Công Sở Nữ', 2, 4, 1),
(18, 'JEANS-WOMEN', 'Quần Jean & Quần Ống Rộng Nữ', 2, 5, 1),
-- Cấp 2: Unisex & Streetwear
(19, 'HOODIE-UNISEX', 'Áo Hoodie & Sweater Nỉ Nặng', 3, 1, 1),
(20, 'TEE-UNISEX', 'Áo Thun Streetwear Oversize', 3, 2, 1),
(21, 'JACKET-UNISEX', 'Áo Khoác Gió & Bomber Chống Nước', 3, 3, 1),
-- Cấp 2: Phụ Kiện
(22, 'LEATHER-ACC', 'Thắt Lưng & Ví Da Thật', 4, 1, 1),
(23, 'BAGS-ACC', 'Balo & Túi Xách Thời Trang', 4, 2, 1),
(24, 'FOOTWEAR-ACC', 'Giày Sneaker & Giày Tây', 4, 3, 1),
-- Cấp 2: Trẻ em, Thể thao, Đồ lót
(25, 'KIDS-BOYS', 'Quần Áo Bé Trai Năng Động', 5, 1, 1),
(26, 'KIDS-GIRLS', 'Váy Đầm Bé Gái Dễ Thương', 5, 2, 1),
(27, 'SPORT-GYM', 'Đồ Tập Gym, Chạy Bộ & Yoga', 6, 1, 1),
(28, 'INNER-SILK', 'Đồ Ngủ Lụa Satin & Homewear', 7, 1, 1);

-- --------------------------------------------------------------------
-- 4. PRODUCTS (45+ Sản phẩm Thời trang Đa dạng Hợp nhất Thuộc tính & Giá sỉ)
-- Cột color, size, material, wholesale_price trực tiếp trên products (Zero-Join)
-- --------------------------------------------------------------------

INSERT INTO products (id, sku, barcode, name, category_id, category_name, unit, color, size, material, standard_cost, standard_price, wholesale_price, description, is_active) VALUES
-- 1 - 10: Áo Nam & Sơ Mi & Quần Nam
(1, 'AT-POLO-WHT-L', '8936012340011', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 8, 'Áo Polo Nam Công Sở & Thể Thao', 'Cái', 'Trắng Tinh', 'Size L (68 - 75kg)', '100% Pique Cotton USA', 135000.00, 299000.00, 210000.00, 'Chất vải Pique cá sấu 100% Cotton chải kỹ, bo cổ dệt tổ ong giữ form, công nghệ kháng khuẩn khử mùi vượt trội', 1),
(2, 'AT-POLO-NVY-M', '8936012340028', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Xanh Navy / M)', 8, 'Áo Polo Nam Công Sở & Thể Thao', 'Cái', 'Xanh Navy Đậm', 'Size M (58 - 67kg)', '100% Pique Cotton USA', 135000.00, 299000.00, 210000.00, 'Màu xanh navy thanh lịch tôn da, thấm hút mồ hôi tối đa, đường may móc xích đôi tiêu chuẩn xuất khẩu', 1),
(3, 'AT-POLO-BLK-XL', '8936012340032', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Đen / XL)', 8, 'Áo Polo Nam Công Sở & Thể Thao', 'Cái', 'Đen Tuyển', 'Size XL (76 - 85kg)', '100% Pique Cotton USA', 140000.00, 310000.00, 220000.00, 'Chất liệu Pique cao cấp nhuộm màu hoạt tính không phai màu khi giặt máy', 1),
(4, 'SM-OXFORD-BLU-M', '8936012340045', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Xanh Pastel / M)', 9, 'Áo Sơ Mi Nam Công Sở Cao Cấp', 'Cái', 'Xanh Nhạt Pastel', 'Size M', 'Oxford Cotton 80s', 195000.00, 420000.00, 295000.00, 'Vải Oxford 80s dệt chéo cao cấp, xử lý chống nhăn Easy-Iron, cúc xà cừ khắc laser tinh xảo', 1),
(5, 'SM-OXFORD-WHT-L', '8936012340052', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Trắng / L)', 9, 'Áo Sơ Mi Nam Công Sở Cao Cấp', 'Cái', 'Trắng Công Sở', 'Size L', 'Oxford Cotton 80s', 195000.00, 420000.00, 295000.00, 'Sơ mi trắng cơ bản chuẩn doanh nhân, form regular tôn dáng lịch lãm', 1),
(6, 'SM-BAMBOO-WHT-M', '8936012340069', 'Áo Sơ Mi Nam Vải Sợi Tre Bamboo Kháng Khuẩn (Trắng Sữa / M)', 9, 'Áo Sơ Mi Nam Công Sở Cao Cấp', 'Cái', 'Trắng Sữa', 'Size M', '50% Bamboo, 50% Polyspun', 210000.00, 450000.00, 315000.00, 'Sợi tre Bamboo tự nhiên mát lạnh tức thì, chống tia UV và thấm hút mồ hôi gấp 3 lần cotton thông thường', 1),
(7, 'SM-LINEN-BEI-L', '8936012340076', 'Áo Sơ Mi Nam Cổ Tàu Vải Đũi Linen Tự Nhiên (Be Sáng / L)', 9, 'Áo Sơ Mi Nam Công Sở Cao Cấp', 'Cái', 'Be Sáng Tự Nhiên', 'Size L', '100% Pure Linen Pháp', 185000.00, 395000.00, 280000.00, '100% Linen dệt tự nhiên thoáng mát, cổ tàu thanh lịch phong cách Smart Casual phóng khoáng', 1),
(8, 'QJ-SLIM-IND-31', '8936012340083', 'Quần Jean Nam Slimfit Co Giãn Cao Cấp (Xanh Indigo / Size 31)', 10, 'Quần Jean & Quần Denim Nam', 'Cái', 'Xanh Chàm Indigo', 'Size 31', 'Denim 12oz Spandex', 240000.00, 550000.00, 385000.00, 'Vải Denim Cotton 12oz pha 2% Spandex co giãn 4 chiều, wash màu enzyme vintage thời thượng', 1),
(9, 'QJ-STRAIGHT-BLK-32', '8936012340090', 'Quần Jean Nam Ống Đứng Regular Cổ Điển (Đen Wash / Size 32)', 10, 'Quần Jean & Quần Denim Nam', 'Cái', 'Đen Khói Wash', 'Size 32', '100% Heavy Cotton Denim', 250000.00, 570000.00, 399000.00, 'Dáng thẳng regular fit cổ điển, đường chỉ nổi chắc chắn, tán đinh đồng bền bỉ', 1),
(10, 'QT-WOOL-GRY-32', '8936012340106', 'Quần Tây Nam Dáng Đứng Xếp Ly Wool Blend (Ghi Xám / Size 32)', 11, 'Quần Tây & Quần Âu Nam', 'Cái', 'Ghi Xám Chuẩn', 'Size 32 (Eo 82cm)', 'Wool Blend 60% Len', 260000.00, 580000.00, 410000.00, 'Chất liệu Wool Blend pha len đứng form, lưng chun thông minh co giãn tăng giảm 3cm vòng eo êm ái', 1),
-- 11 - 20: Thời Trang Nam Khác & Thời Trang Nữ
(11, 'QT-SLIM-BLK-31', '8936012340113', 'Quần Âu Nam Công Sở Co Giãn Form Hàn Quốc (Đen / Size 31)', 11, 'Quần Tây & Quần Âu Nam', 'Cái', 'Đen Nhám', 'Size 31', 'Tuyết Mưa Cao Cấp', 210000.00, 490000.00, 340000.00, 'Không nhăn, không xù lông, form slim ôm vừa vặn tôn chiều cao', 1),
(12, 'AK-VEST-MEN-NVY-L', '8936012340120', 'Áo Khoác Blazer Nam Công Sở 2 Lớp (Xanh Navy / Size L)', 12, 'Áo Khoác & Blazer Nam', 'Cái', 'Xanh Navy Lịch Lãm', 'Size L', 'Vải Kaki Tuyết Mưa Lót Lụa', 450000.00, 990000.00, 690000.00, 'May theo tiêu chuẩn suit công sở, ve áo vuông thanh lịch, có đệm vai chuẩn form', 1),
(13, 'QS-KAKI-BEI-30', '8936012340137', 'Quần Short Kaki Nam Co Giãn Thoáng Mát (Màu Be / Size 30)', 13, 'Quần Short & Kaki Lửng Nam', 'Cái', 'Be Sáng', 'Size 30', 'Kaki Cotton Twill 100%', 120000.00, 270000.00, 190000.00, 'Túi chéo tiện dụng, cạp chun hông co giãn thoải mái khi vận động ngoài trời', 1),
(14, 'DV-HOANHI-BE-S', '8936012340144', 'Đầm Voan Hoa Nhí Cổ Vuông Dáng Xòe (Họa Tiết Be / Size S)', 14, 'Váy Đầm Liền & Đầm Dự Tiệc', 'Cái', 'Hoa Nhí Nền Be', 'Size S (42 - 48kg)', 'Tơ Voan Hàn Quốc', 280000.00, 650000.00, 455000.00, 'Chất tơ voan Hàn Quốc 2 lớp mềm mại bay bổng, cổ vuông tiểu thư tôn xương quai xanh', 1),
(15, 'DV-SATIN-RED-M', '8936012340151', 'Đầm Dạ Hội Lụa Satin Dáng Ôm Xẻ Tà (Đỏ Ruby / Size M)', 14, 'Váy Đầm Liền & Đầm Dự Tiệc', 'Cái', 'Đỏ Ruby Quý Phái', 'Size M (49 - 55kg)', 'Lụa Satin Cao Cấp', 420000.00, 950000.00, 665000.00, 'Lụa Satin dệt sợi bóng mượt óng ả, cắt cúp tôn eo thon, xẻ tà quyến rũ cho tiệc tối sang trọng', 1),
(16, 'DV-TWEED-WHT-S', '8936012340168', 'Đầm Dạ Tweed Sang Trọng Thiết Kế Nơ Cổ (Trắng Kem / Size S)', 14, 'Váy Đầm Liền & Đầm Dự Tiệc', 'Cái', 'Trắng Kem Dạ Kim Tuyến', 'Size S', 'Dạ Tweed Dệt Nổi', 390000.00, 890000.00, 620000.00, 'Chất dạ Tweed cao cấp dệt sợi kim tuyến lấp lánh, đính cúc ngọc trai sang trọng quý phái', 1),
(17, 'AK-BLAZER-BE-M', '8936012340175', 'Áo Blazer Nữ 2 Lớp Form Rộng Hàn Quốc (Màu Be / Size M)', 15, 'Áo Blazer & Áo Khoác Vest Nữ', 'Cái', 'Màu Be Hạnh Nhân', 'Size M Form Rộng', 'Tuyết Mưa Hàn Quốc', 350000.00, 790000.00, 550000.00, 'Vải Tuyết Mưa dệt chéo 2 lớp lót lụa habutai, đệm vai tinh tế, chuẩn phong cách công sở trẻ trung hiện đại', 1),
(18, 'AK-BLAZER-BLK-L', '8936012340182', 'Áo Blazer Nữ Chiết Eo Tôn Dáng (Đen Tuyển / Size L)', 15, 'Áo Blazer & Áo Khoác Vest Nữ', 'Cái', 'Đen Cơ Bản', 'Size L', 'Tuyết Mưa Cao Cấp', 360000.00, 820000.00, 570000.00, 'Thiết kế chiết eo tôn vóc dáng đồng hồ cát, cúc áo mạ vàng tinh tế', 1),
(19, 'CV-XEP-LY-BLK-S', '8936012340199', 'Chân Váy Chữ A Xếp Ly Lưng Cao (Đen / Size S)', 16, 'Chân Váy & Quần Tây Nữ', 'Cái', 'Đen Tuyền', 'Size S', 'Kaki Tuyết Mưa', 140000.00, 320000.00, 225000.00, 'Chất kaki tuyết mưa giữ nếp ly sắc nét sau giặt, cạp lưng cao tôn dáng che khuyết điểm vòng 2', 1),
(20, 'CV-BUTCHI-NVY-M', '8936012340205', 'Chân Váy Bút Chì Công Sở Xẻ Sau (Xanh Navy / Size M)', 16, 'Chân Váy & Quần Tây Nữ', 'Cái', 'Xanh Navy', 'Size M', 'Cotton Spandex Co Giãn', 150000.00, 350000.00, 245000.00, 'Form ôm nhẹ nhàng không gò bó, đường may giấu chỉ tinh xảo chuẩn văn phòng', 1),
-- 21 - 30: Đồ Nữ, Unisex & Streetwear
(21, 'SM-BLOUSE-SLK-WHT-M', '8936012340212', 'Áo Blouse Nữ Tay Bồng Cổ Thắt Nơ Lụa Tơ (Trắng Tinh / Size M)', 17, 'Áo Sơ Mi & Blouse Công Sở Nữ', 'Cái', 'Trắng Tinh Khôi', 'Size M', 'Lụa Tơ Hàn Quốc', 170000.00, 380000.00, 265000.00, 'Chất lụa tơ mềm rủ nhẹ nhàng, cổ nơ điệu đà thích hợp phối cùng chân váy bút chì hoặc quần tây', 1),
(22, 'QJ-SUONG-WOMEN-BLU-M', '8936012340229', 'Quần Jean Nữ Ống Suông Rộng Cạp Cao Vintage (Xanh Nhạt / Size M)', 18, 'Quần Jean & Quần Ống Rộng Nữ', 'Cái', 'Xanh Nhạt Retro', 'Size M (Eo 68cm)', 'Denim Mềm 100% Cotton', 230000.00, 520000.00, 360000.00, 'Hack dáng kéo dài chân tối đa, cạp cao ôm khít vòng eo, phong cách Y2K sành điệu', 1),
(23, 'HD-HEAVY-GRY-XL', '8936012340236', 'Áo Hoodie Unisex Nỉ Chân Cua 380gsm (Xám Tiêu / Size XL)', 19, 'Áo Hoodie & Sweater Nỉ Nặng', 'Cái', 'Xám Tiêu Melange', 'Size XL (Streetwear Form)', 'Nỉ Chân Cua 380gsm', 210000.00, 480000.00, 335000.00, 'Vải nỉ chân cua 100% Cotton định lượng 380gsm siêu dày dặn, mũ 2 lớp đứng form chuẩn Streetwear', 1),
(24, 'HD-HEAVY-BLK-L', '8936012340243', 'Áo Hoodie Unisex Nỉ Chân Cua 380gsm (Đen Tuyển / Size L)', 19, 'Áo Hoodie & Sweater Nỉ Nặng', 'Cái', 'Đen Tuyền', 'Size L', 'Nỉ Chân Cua 380gsm', 210000.00, 480000.00, 335000.00, 'Túi kangaroo rộng rãi trước bụng, bo dệt rib co giãn bền bỉ không bai dão', 1),
(25, 'SW-CREWNECK-GRN-L', '8936012340250', 'Áo Sweater Unisex Cổ Tròn Nỉ Lót Bông (Xanh Rêu / Size L)', 19, 'Áo Hoodie & Sweater Nỉ Nặng', 'Cái', 'Xanh Rêu Cổ Điển', 'Size L', 'Nỉ Bông Cotton', 180000.00, 390000.00, 275000.00, 'Lớp bông cào siêu êm ái giữ ấm vượt trội trong mùa thu đông', 1),
(26, 'AT-OVERSIZE-BLK-L', '8936012340267', 'Áo Thun Unisex Oversize Cotton Compact 250gsm (Đen / Size L)', 20, 'Áo Thun Streetwear Oversize', 'Cái', 'Đen Tuyền', 'Size L', 'Cotton Compact 250gsm', 95000.00, 220000.00, 150000.00, 'Vải Cotton dệt compact không xơ lông, hình in chuyển nhiệt sắc nét bền màu sau 50 lần giặt', 1),
(27, 'AT-OVERSIZE-WHT-XL', '8936012340274', 'Áo Thun Unisex Oversize Cotton Compact 250gsm (Trắng / Size XL)', 20, 'Áo Thun Streetwear Oversize', 'Cái', 'Trắng Tinh', 'Size XL', 'Cotton Compact 250gsm', 95000.00, 220000.00, 150000.00, 'Form rộng thả vai phong cách đường phố năng động phóng khoáng', 1),
(28, 'AK-GIO-2LOP-BLK-L', '8936012340281', 'Áo Khoác Gió Unisex 2 Lớp Chống Nước Trượt Nước (Đen / Size L)', 21, 'Áo Khoác Gió & Bomber Chống Nước', 'Cái', 'Đen Chống Thấm', 'Size L', 'Polyester Tráng PU Cản Gió', 175000.00, 399000.00, 280000.00, 'Lớp ngoài trượt nước mưa nhỏ, lớp lót lưới thoáng khí không bí mồ hôi, khóa kéo YKK chống kẹt', 1),
(29, 'AK-BOMBER-GRN-XL', '8936012340298', 'Áo Khoác Bomber Unisex Chần Bông Thời Trang (Xanh Rêu / Size XL)', 21, 'Áo Khoác Gió & Bomber Chống Nước', 'Cái', 'Xanh Rêu Quân Đội', 'Size XL', 'Kaki Dày Chần Bông', 280000.00, 620000.00, 430000.00, 'Lót bông trần hình thoi giữ nhiệt, bo chun cổ tay và gấu áo dệt dày dặn', 1),
(30, 'TL-DABO-BLK-120', '8936012340304', 'Thắt Lưng Nam Da Bò Thật Khóa Tự Động (Đen / Bản 3.5cm)', 22, 'Thắt Lưng & Ví Da Thật', 'Sợi', 'Đen Bóng Nhẹ', 'Bản 3.5cm - 120cm', 'Da Bò Mill Lớp 1', 110000.00, 260000.00, 180000.00, 'Da bò Mill nguyên tấm dẻo dai không nứt gãy, đầu khóa hợp kim carbon chống xước gạt tự động tiện lợi', 1),
-- 31 - 45: Phụ Kiện, Trẻ Em, Thể Thao & Đồ Ngủ Cao Cấp
(31, 'TL-DABO-BRN-120', '8936012340311', 'Thắt Lưng Nam Da Bò Thật Khóa Xỏ Kim (Nâu Cà Phê / Bản 3.5cm)', 22, 'Thắt Lưng & Ví Da Thật', 'Sợi', 'Nâu Cà Phê Vintage', 'Bản 3.5cm - 120cm', 'Da Bò Sáp Nappa', 115000.00, 270000.00, 185000.00, 'Da bò sáp lên màu patina độc đáo theo thời gian sử dụng, mặt khóa đồng đúc nguyên khối', 1),
(32, 'VI-DA-NAM-BLK', '8936012340328', 'Ví Ngang Nam Da Bò Đựng Thẻ & Tiền (Đen Cổ Điển)', 22, 'Thắt Lưng & Ví Da Thật', 'Cái', 'Đen Classic', 'Kích thước 12x9.5cm', 'Da Bò Thật Dập Vân Epsom', 95000.00, 230000.00, 160000.00, 'Thiết kế 8 ngăn đựng thẻ ngân hàng, 2 ngăn chính đựng tiền thẳng thớm', 1),
(33, 'BL-CANVAS-GRY', '8936012340335', 'Balo Unisex Canvas Chống Thấm Đựng Laptop 15.6 Inch (Xám Khói)', 23, 'Balo & Túi Xách Thời Trang', 'Cái', 'Xám Khói Hiện Đại', 'Dung tích 20L', 'Vải Canvas Trượt Nước', 160000.00, 360000.00, 250000.00, 'Ngăn chống sốc bảo vệ laptop chuyên dụng, quai đeo đệm xốp êm vai khi mang đồ nặng', 1),
(34, 'TX-TOTE-WOMEN-BEI', '8936012340342', 'Túi Xách Nữ Tote Da PU Cao Cấp Đi Làm (Màu Be / Cỡ Lớn)', 23, 'Balo & Túi Xách Thời Trang', 'Cái', 'Be Sữa Sang Chảnh', 'Kích thước 35x28cm', 'Da PU Siêu Bền Chống Xước', 145000.00, 330000.00, 230000.00, 'Đựng vừa tài liệu A4 và iPad, có khóa kéo miệng an toàn và dây đeo chéo tháo rời', 1),
(35, 'GY-SNEAKER-WHT-42', '8936012340359', 'Giày Sneaker Unisex Da Bò Thật Đế Cao Su (Trắng / Size 42)', 24, 'Giày Sneaker & Giày Tây', 'Đôi', 'Trắng Tinh Minimalist', 'Size 42', 'Da Bò Thật & Đế Cao Su Đúc', 380000.00, 850000.00, 595000.00, 'Đế cao su lưu hóa đúc nguyên khối êm chân chống trơn trượt, lót giày kháng khuẩn thoáng khí', 1),
(36, 'GY-OXFORD-MEN-BLK-41', '8936012340366', 'Giày Tây Nam Derby Da Bò Bóng Khâu Viền (Đen / Size 41)', 24, 'Giày Sneaker & Giày Tây', 'Đôi', 'Đen Bóng Sang Trọng', 'Size 41', 'Da Bò Cao Cấp Lớp 1', 480000.00, 1100000.00, 770000.00, 'Đóng thủ công Goodyear Welted viền chỉ chắc chắn, gót đệm gỗ cao cấp tăng chiều cao 3.5cm', 1),
(37, 'BO-KIDS-POLO-BLU-4T', '8936012340373', 'Set Bộ Bé Trai Áo Polo & Quần Short Kaki (Xanh Biển / 4 Tuổi)', 25, 'Quần Áo Bé Trai Năng Động', 'Bộ', 'Xanh Biển Tươi Sáng', 'Size 4T (15 - 18kg)', '100% Organic Cotton', 95000.00, 220000.00, 150000.00, 'Chất cotton hữu cơ an toàn cho làn da nhạy cảm của bé, thấm hút mồ hôi tối đa', 1),
(38, 'DAM-KIDS-CONGCHUA-PNK', '8936012340380', 'Váy Đầm Bé Gái Công Chúa Đính Nơ Voan Lưới (Hồng Phấn / 5 Tuổi)', 26, 'Váy Đầm Bé Gái Dễ Thương', 'Cái', 'Hồng Phấn Pastel', 'Size 5T (17 - 21kg)', 'Lụa Voan Lưới Mềm 3 Lớp', 130000.00, 290000.00, 200000.00, 'Vải voan mềm không châm chích ngứa ngáy, lót trong 100% cotton mềm mịn cho bé tự tin dự tiệc', 1),
(39, 'AO-TAP-GYM-MEN-BLK-L', '8936012340397', 'Áo Tập Gym Nam Thun Mè Thoát Mồ Hôi Siêu Tốc (Đen / Size L)', 27, 'Đồ Tập Gym, Chạy Bộ & Yoga', 'Cái', 'Đen Viền Phản Quang', 'Size L', '90% Polyester Coolmax, 10% Spandex', 75000.00, 175000.00, 120000.00, 'Công nghệ dệt lỗ thoáng khí tổ ong khô tức thì sau 15 phút, co giãn 4 chiều vận động mạnh', 1),
(40, 'QUAN-YOGA-WOMEN-NVY-S', '8936012340403', 'Quần Legging Nữ Tập Yoga Cạp Cao Nâng Mông (Xanh Navy / Size S)', 27, 'Đồ Tập Gym, Chạy Bộ & Yoga', 'Cái', 'Xanh Navy Sâu', 'Size S', 'Nylon Spandex Siêu Mịn', 125000.00, 280000.00, 195000.00, 'Vải bơ siêu mềm mát như chạm vào da, cạp chữ V định hình eo thon và nâng cơ mông tự nhiên', 1),
(41, 'BRA-SPORT-WOMEN-BLK-M', '8936012340410', 'Áo Bra Thể Thao Nữ Chống Rung Nâng Đỡ Tốt (Đen / Size M)', 27, 'Đồ Tập Gym, Chạy Bộ & Yoga', 'Cái', 'Đen Nhám', 'Size M', 'Spandex Chuyên Dụng Sport', 90000.00, 210000.00, 145000.00, 'Đệm mút đúc liền thông hơi, quai áo đan chéo trợ lực lưng không gây đau mỏi khi chạy bộ', 1),
(42, 'DO-NGU-LUA-WOMEN-PNK-M', '8936012340427', 'Bộ Pijama Lụa Nữ Dài Tay Viền Trắng (Hồng Pastel / Size M)', 28, 'Đồ Ngủ Lụa Satin & Homewear', 'Bộ', 'Hồng Pastel Nhẹ Nhàng', 'Size M', 'Lụa Satin Gấm Cao Cấp', 165000.00, 380000.00, 260000.00, 'Lụa dệt sợi tơ tằm bóng mịn, form pijama chuẩn lịch sự có thể mặc tiếp khách tại nhà', 1),
(43, 'DO-NGU-LUA-MEN-NVY-L', '8936012340434', 'Bộ Pijama Lụa Nam Cộc Tay Quần Đùi (Xanh Navy / Size L)', 28, 'Đồ Ngủ Lụa Satin & Homewear', 'Bộ', 'Xanh Navy Lịch Sự', 'Size L', 'Lụa Satin Nhẹ Mát', 150000.00, 350000.00, 245000.00, 'Thoáng khí giải nhiệt mùa hè, cạp quần chun co giãn mềm không để lại vết hằn trên da', 1),
(44, 'AT-COMPACT-GRY-M', '8936012340441', 'Áo Thun Nam Cổ Tròn Basic Cotton 100% (Xám Tiêu / Size M)', 8, 'Áo Polo Nam Công Sở & Thể Thao', 'Cái', 'Xám Tiêu Melange', 'Size M', '100% Cotton 220gsm', 80000.00, 185000.00, 130000.00, 'Chiếc áo thun basic không thể thiếu trong tủ đồ, đường may móc xích chắc chắn', 1),
(45, 'QK-CHINO-KHK-32', '8936012340458', 'Quần Kaki Nam Dáng Slim Ống Côn Tự Nhiên (Vàng Khaki / Size 32)', 10, 'Quần Jean & Quần Denim Nam', 'Cái', 'Vàng Khaki Trẻ Trung', 'Size 32', 'Kaki Cotton Twill', 190000.00, 430000.00, 300000.00, 'Vải Kaki Twill chải kỹ mềm mịn không thô ráp, wash chống co rút tối đa sau giặt', 1);

-- --------------------------------------------------------------------
-- 5. CUSTOMERS (18 Khách hàng Đa dạng: Bán sỉ, Chuỗi Shop, VIP, Đồng phục)
-- Nhóm và % chiết khấu được lưu trực tiếp trên bảng customers (Zero-Join)
-- --------------------------------------------------------------------

INSERT INTO customers (id, code, name, customer_type, phone, email, address, tax_code, group_name, discount_percent, is_active) VALUES
(1, 'CUST-001', 'Nguyễn Thùy Linh', 'INDIVIDUAL', '0912334455', 'thuylinh.fashion@gmail.com', 'Căn hộ 12B Landmark 81, P. 22, Bình Thạnh, TP.HCM', NULL, 'Khách Hàng Thân Thiết VIP', 10.00, 1),
(2, 'CUST-002', 'Chuỗi Cửa Hàng Thời Trang May Boutique', 'BUSINESS', '0283998877', 'contact@mayboutique.vn', 'Số 245 Cầu Giấy, P. Dịch Vọng, Q. Cầu Giấy, Hà Nội', '0108997766', 'Đại Lý Phân Phối & Chuỗi Shop', 25.00, 1),
(3, 'CUST-003', 'Công ty Cổ phần Đầu tư Công nghệ FPT', 'BUSINESS', '02473007300', 'procurement@fpt.com.vn', 'Tòa nhà FPT, Phố Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội', '0101248141', 'Doanh Nghiệp Đặt May Đồng Phục', 20.00, 1),
(4, 'CUST-004', 'Hoàng Minh Tuấn', 'INDIVIDUAL', '0987654321', 'tuan.hoang88@yahoo.com', 'Số 88 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM', NULL, 'Khách Hàng Mua Lẻ', 0.00, 1),
(5, 'CUST-005', 'Công ty Cổ phần Thời Trang Canifa', 'BUSINESS', '02435647788', 'b2b@canifa.com', 'Số 121 Thái Hà, Phường Trung Liệt, Đống Đa, Hà Nội', '0101487890', 'Đại Lý Phân Phối & Chuỗi Shop', 25.00, 1),
(6, 'CUST-006', 'Công ty TNHH Thời Trang Yody Miền Trung', 'BUSINESS', '02363889900', 'danang.yody@gmail.com', 'Số 478 Điện Biên Phủ, Thanh Khê Đông, Thanh Khê, Đà Nẵng', '0402113344', 'Đại Lý Phân Phối & Chuỗi Shop', 25.00, 1),
(7, 'CUST-007', 'Tập đoàn Viễn thông Quân đội Viettel (Đồng phục)', 'BUSINESS', '02462556789', 'uniform@viettel.com.vn', 'Tòa nhà Viettel, Số 1 Trần Hữu Dực, Mỹ Đình 2, Nam Từ Liêm, Hà Nội', '0100109106', 'Doanh Nghiệp Đặt May Đồng Phục', 20.00, 1),
(8, 'CUST-008', 'Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank CN HCM)', 'BUSINESS', '02838297245', 'admin.hcm@vietcombank.com.vn', 'Tòa tháp Vietcombank, Số 5 Công Trường Mê Linh, Bến Nghé, Quận 1, TP.HCM', '0100112437', 'Doanh Nghiệp Đặt May Đồng Phục', 20.00, 1),
(9, 'CUST-009', 'Chuỗi Thời Trang Routine Vietnam', 'BUSINESS', '02862899988', 'order@routine.vn', 'Tầng 5, 80 Pasteur, Phường Bến Nghé, Quận 1, TP.HCM', '0312678991', 'Đại Lý Phân Phối & Chuỗi Shop', 25.00, 1),
(10, 'CUST-010', 'Công ty TNHH Bán Lẻ TokyoLife Miền Tây', 'BUSINESS', '02923768899', 'cantho@tokyolife.vn', 'Số 54 đường 30 Tháng 4, Phường An Phú, Ninh Kiều, Cần Thơ', '1801556677', 'Đại Lý Phân Phối & Chuỗi Shop', 25.00, 1),
(11, 'CUST-011', 'Trần Bảo Ngọc', 'INDIVIDUAL', '0903889900', 'baongoc.designer@gmail.com', 'Villa C12 Khu Biệt Thự Thảo Điền, TP. Thủ Đức, TP.HCM', NULL, 'Khách Hàng Kim Cương VVIP', 15.00, 1),
(12, 'CUST-012', 'Phạm Hoàng Long', 'INDIVIDUAL', '0938123456', 'long.pham82@gmail.com', 'Số 15 Ngô Quyền, Phường Tràng Tiền, Quận Hoàn Kiếm, Hà Nội', NULL, 'Khách Hàng Thân Thiết VIP', 10.00, 1),
(13, 'CUST-013', 'Đỗ Phương Thảo', 'INDIVIDUAL', '0978998877', 'thaodo.hust@outlook.com', 'Tòa R4 Royal City, 72A Nguyễn Trãi, Thanh Xuân, Hà Nội', NULL, 'Khách Hàng Thân Thiết VIP', 10.00, 1),
(14, 'CUST-014', 'Vũ Đình Trọng', 'INDIVIDUAL', '0988665544', 'trongvu.media@gmail.com', 'Số 42 Nguyễn Thị Minh Khai, Phường Đa Kao, Quận 1, TP.HCM', NULL, 'Khách Hàng Mua Lẻ', 0.00, 1),
(15, 'CUST-015', 'Lê Khánh Huyền', 'INDIVIDUAL', '0915667788', 'huyenle.boutique@gmail.com', 'Số 112 Lê Lợi, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng', NULL, 'Khách Hàng Thân Thiết VIP', 10.00, 1),
(16, 'CUST-016', 'Công ty Cổ phần Dịch vụ Hàng không Nội Bài (NASCO)', 'BUSINESS', '02438865500', 'purchasing@nasco.vn', 'Sân bay Quốc tế Nội Bài, Xã Phú Minh, Sóc Sơn, Hà Nội', '0100108260', 'Doanh Nghiệp Đặt May Đồng Phục', 20.00, 1),
(17, 'CUST-017', 'Shop Thời Trang Mẹ & Bé Baby Angel', 'BUSINESS', '0283778899', 'babyangel.store@yahoo.com', 'Số 310 Võ Văn Tần, Phường 5, Quận 3, TP.HCM', '0315889911', 'Đại Lý Phân Phối & Chuỗi Shop', 25.00, 1),
(18, 'CUST-018', 'Bùi Đức Anh', 'INDIVIDUAL', '0908776655', 'ducanh.tech@gmail.com', 'Số 79 Nguyễn Trãi, Phường An Hội, Quận Ninh Kiều, Cần Thơ', NULL, 'Khách Hàng Mua Lẻ', 0.00, 1);

-- --------------------------------------------------------------------
-- 6. SUPPLIERS (12 Nhà cung cấp Dệt may, Phụ liệu & Đánh giá/Xếp hạng A/B/C)
-- Điểm đánh giá (Chất lượng, Giao hàng, Giá) và Xếp hạng nằm trực tiếp trong suppliers
-- --------------------------------------------------------------------

INSERT INTO suppliers (id, code, name, phone, email, address, tax_code, product_groups, quality_score, delivery_score, price_score, rating_score, rating_tier, review_date, review_notes, is_active) VALUES
(1, 'SUPP-HANOSIMEX', 'Tổng Công ty Cổ phần Dệt May Hà Nội (Hanosimex)', '02438621456', 'sales@hanosimex.com.vn', 'Tầng 8 Tòa nhà Nam Hải Lakeview, KĐT Vĩnh Hoàng, Hoàng Mai, Hà Nội', '0100100874', 'Vải dệt kim, Áo thun, Vải Pique Cotton', 9.5, 9.5, 9.5, 9.5, 'A', '2026-08-15', 'Chất lượng vải Pique Cotton rất đồng đều, sợi chải kỹ không bai xù, giao hàng đúng tiến độ', 1),
(2, 'SUPP-MAY10', 'Tổng Công ty May 10 - CTCP', '02438276923', 'kinhdoanh@garco10.com.vn', 'Số 765 Nguyễn Văn Linh, Sài Đồng, Long Biên, Hà Nội', '0100101308', 'Áo sơ mi, Veston, Quần âu cao cấp', 9.8, 9.5, 9.5, 9.6, 'A', '2026-08-20', 'Gia công sơ mi đường kim mũi chỉ tỉ mỉ chuẩn xuất khẩu Châu Âu, chứng chỉ Oeko-Tex đạt chuẩn', 1),
(3, 'SUPP-PHONGPHU', 'Tổng Công ty Cổ phần Phong Phú (Phuphu Textile)', '02838963533', 'info@phongphucorp.com', 'Số 48 Tăng Nhơn Phú, Phường Tăng Nhơn Phú B, TP. Thủ Đức, TP.HCM', '0300452912', 'Vải Denim Jean, Kaki tuyết mưa, Vải nỉ', 9.0, 9.0, 9.0, 9.0, 'A', '2026-08-25', 'Vải Denim co giãn tốt, màu wash chuẩn mẫu thiết kế, hỗ trợ công nợ 30 ngày linh hoạt', 1),
(4, 'SUPP-PHULIEU', 'Công ty TNHH Phụ Liệu May Mặc Tân Bình', '02838641122', 'order@phulieumay.vn', 'Số 15 Lý Thường Kiệt, Phường 7, Quận Tân Bình, TP.HCM', '0312456789', 'Khóa kéo YKK, Cúc áo xà cừ, Thắt lưng da, Nhãn dệt', 8.5, 8.0, 8.0, 8.2, 'B', '2026-08-28', 'Khóa kéo YKK chính hãng, cúc áo đều đẹp, thời gian giao hàng đôi khi chậm 1 ngày', 1),
(5, 'SUPP-VIETTIEN', 'Tổng Công ty Cổ phần May Việt Tiến', '02838640800', 'viettien@viettien.com.vn', 'Số 7 Lê Minh Xuân, Phường 7, Quận Tân Bình, TP.HCM', '0300401524', 'Áo sơ mi cao cấp, Vải sợi tre Bamboo, Quần âu', 9.8, 9.6, 9.4, 9.6, 'A', '2026-08-30', 'Đơn vị dẫn đầu công nghệ dệt vải kháng khuẩn và may không nhăn, độ tin cậy tuyệt đối', 1),
(6, 'SUPP-THAI-TUAN', 'Công ty Cổ phần Tập đoàn Thái Tuấn', '02838591903', 'thaituan@thaituan.com.vn', 'Số 1/148 Nguyễn Văn Quá, Phường Đông Hưng Thuận, Quận 12, TP.HCM', '0301489088', 'Lụa Satin gấm hoa, Tơ voan hoa nhí, Vải đầm thiết kế', 9.6, 9.4, 9.2, 9.4, 'A', '2026-09-02', 'Lụa mềm rủ tuyệt hảo, công nghệ in hoa văn kỹ thuật số sắc nét cao cấp', 1),
(7, 'SUPP-NAMDINH', 'Công ty Cổ phần Dệt May Nam Định (Natexco)', '02283849437', 'sales@natexco.com.vn', 'Số 43 Tô Hiệu, Phường Năng Tĩnh, TP. Nam Định', '0600000085', 'Sợi Cotton chải thô, Vải mộc, Vải Kaki Chino', 8.8, 8.5, 9.0, 8.8, 'B', '2026-08-10', 'Giá thành cạnh tranh, nguồn cung vải thô số lượng lớn ổn định lâu năm', 1),
(8, 'SUPP-CHITHO', 'Công ty TNHH Chỉ May & Dệt Chun Phong Anh', '02436881122', 'phonganhthread@gmail.com', 'Lô 5 Cụm Công nghiệp Ngọc Hồi, Thanh Trì, Hà Nội', '0105678899', 'Chỉ may Spun Poly, Chun dệt thoi, Nhãn ép nhiệt', 8.5, 8.5, 8.8, 8.6, 'B', '2026-08-18', 'Chỉ may dai bền không đứt sợi ở máy may tốc độ cao 5000 vòng/phút', 1),
(9, 'SUPP-DA-BINHDUONG', 'Công ty TNHH Da Thuộc & Phụ Kiện Nam Hưng', '02743789900', 'namhung.leather@gmail.com', 'Đường ĐT 743, KCN Sóng Thần 2, Dĩ An, Bình Dương', '3702114455', 'Da bò Mill thật lớp 1, Đầu khóa hợp kim, Da sáp', 9.0, 8.5, 8.5, 8.7, 'B', '2026-08-22', 'Da bò nguyên tấm cao cấp đã qua xử lý mùi, mẫu khóa hợp kim phủ nano chống xước', 1),
(10, 'SUPP-DONGA-PACK', 'Công ty Cổ phần Bao Bì & In Ấn Dệt May Đông Á', '02439871122', 'dongapack@gmail.com', 'KCN Đài Tư, 386 Nguyễn Văn Linh, Sài Đồng, Long Biên, Hà Nội', '0106223344', 'Hộp quà cao cấp, Túi zipper mờ may mặc, Tem mác', 9.2, 9.5, 9.2, 9.3, 'A', '2026-08-26', 'Túi zipper in logo sắc nét, hộp áo sơ mi cứng cáp sang trọng bảo vệ sản phẩm', 1),
(11, 'SUPP-PROTEX-SPORT', 'Công ty TNHH Dệt Vải Thể Thao Pro-Tex Việt Nam', '02837651122', 'protex.sports@vnn.vn', 'Lô C4 KCN Hiệp Phước, Nhà Bè, TP.HCM', '0314556677', 'Vải mè Coolmax, Spandex 4 chiều tập gym, Poly co giãn', 9.5, 9.2, 9.0, 9.2, 'A', '2026-09-01', 'Vải thể thao đạt chuẩn co giãn kháng khuẩn, thoát ẩm cực nhanh khô', 1),
(12, 'SUPP-ECO-ORGANIC', 'Công ty TNHH Vải Sợi Sinh Học Eco-Cotton Việt Nam', '02838992211', 'ecocotton.vn@gmail.com', 'Số 28 Thảo Điền, Phường Thảo Điền, TP. Thủ Đức, TP.HCM', '0316778899', 'Organic Cotton hữu cơ GOTS, Vải sợi sồi Modal, Bamboo trẻ em', 9.6, 9.2, 8.8, 9.2, 'A', '2026-09-03', 'Chứng nhận hữu cơ quốc tế Oeko-Tex Standard 100 Class 1 dùng cho trẻ sơ sinh', 1);

-- --------------------------------------------------------------------
-- 7. INVENTORY (Số dư Tồn kho Toàn diện 5 Kho Hàng cho 45 Sản phẩm)
-- quantity_available = quantity_on_hand - quantity_reserved (Zero-Join Model)
-- --------------------------------------------------------------------

INSERT INTO inventory (warehouse_id, warehouse_code, warehouse_name, product_id, product_sku, product_name, product_unit, quantity_on_hand, quantity_reserved, quantity_available) VALUES
-- === Kho 1: Kho Tổng Thời Trang Hà Nội (WH-HN-01) ===
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 1, 'AT-POLO-WHT-L', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 'Cái', 450.000, 50.000, 400.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 2, 'AT-POLO-NVY-M', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Xanh Navy / M)', 'Cái', 380.000, 30.000, 350.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 3, 'AT-POLO-BLK-XL', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Đen / XL)', 'Cái', 260.000, 20.000, 240.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 4, 'SM-OXFORD-BLU-M', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Xanh Pastel / M)', 'Cái', 320.000, 40.000, 280.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 5, 'SM-OXFORD-WHT-L', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Trắng / L)', 'Cái', 410.000, 60.000, 350.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 6, 'SM-BAMBOO-WHT-M', 'Áo Sơ Mi Nam Vải Sợi Tre Bamboo Kháng Khuẩn (Trắng Sữa / M)', 'Cái', 290.000, 30.000, 260.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 7, 'SM-LINEN-BEI-L', 'Áo Sơ Mi Nam Cổ Tàu Vải Đũi Linen Tự Nhiên (Be Sáng / L)', 'Cái', 210.000, 15.000, 195.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 8, 'QJ-SLIM-IND-31', 'Quần Jean Nam Slimfit Co Giãn Cao Cấp (Xanh Indigo / Size 31)', 'Cái', 340.000, 35.000, 305.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 9, 'QJ-STRAIGHT-BLK-32', 'Quần Jean Nam Ống Đứng Regular Cổ Điển (Đen Wash / Size 32)', 'Cái', 280.000, 25.000, 255.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 10, 'QT-WOOL-GRY-32', 'Quần Tây Nam Dáng Đứng Xếp Ly Wool Blend (Ghi Xám / Size 32)', 'Cái', 250.000, 20.000, 230.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 11, 'QT-SLIM-BLK-31', 'Quần Âu Nam Công Sở Co Giãn Form Hàn Quốc (Đen / Size 31)', 'Cái', 310.000, 30.000, 280.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 12, 'AK-VEST-MEN-NVY-L', 'Áo Khoác Blazer Nam Công Sở 2 Lớp (Xanh Navy / Size L)', 'Cái', 180.000, 15.000, 165.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 13, 'QS-KAKI-BEI-30', 'Quần Short Kaki Nam Co Giãn Thoáng Mát (Màu Be / Size 30)', 'Cái', 220.000, 10.000, 210.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 14, 'DV-HOANHI-BE-S', 'Đầm Voan Hoa Nhí Cổ Vuông Dáng Xòe (Họa Tiết Be / Size S)', 'Cái', 160.000, 15.000, 145.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 15, 'DV-SATIN-RED-M', 'Đầm Dạ Hội Lụa Satin Dáng Ôm Xẻ Tà (Đỏ Ruby / Size M)', 'Cái', 95.000, 8.000, 87.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 16, 'DV-TWEED-WHT-S', 'Đầm Dạ Tweed Sang Trọng Thiết Kế Nơ Cổ (Trắng Kem / Size S)', 'Cái', 110.000, 12.000, 98.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 17, 'AK-BLAZER-BE-M', 'Áo Blazer Nữ 2 Lớp Form Rộng Hàn Quốc (Màu Be / Size M)', 'Cái', 240.000, 20.000, 220.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 18, 'AK-BLAZER-BLK-L', 'Áo Blazer Nữ Chiết Eo Tôn Dáng (Đen Tuyển / Size L)', 'Cái', 190.000, 18.000, 172.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 19, 'CV-XEP-LY-BLK-S', 'Chân Váy Chữ A Xếp Ly Lưng Cao (Đen / Size S)', 'Cái', 280.000, 25.000, 255.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 20, 'CV-BUTCHI-NVY-M', 'Chân Váy Bút Chì Công Sở Xẻ Sau (Xanh Navy / Size M)', 'Cái', 230.000, 20.000, 210.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 23, 'HD-HEAVY-GRY-XL', 'Áo Hoodie Unisex Nỉ Chân Cua 380gsm (Xám Tiêu / Size XL)', 'Cái', 310.000, 30.000, 280.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 26, 'AT-OVERSIZE-BLK-L', 'Áo Thun Unisex Oversize Cotton Compact 250gsm (Đen / Size L)', 'Cái', 520.000, 50.000, 470.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 30, 'TL-DABO-BLK-120', 'Thắt Lưng Nam Da Bò Thật Khóa Tự Động (Đen / Bản 3.5cm)', 'Sợi', 450.000, 40.000, 410.000),

-- === Kho 2: Tổng Kho Thời Trang TP.HCM (WH-SG-01) ===
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 1, 'AT-POLO-WHT-L', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 'Cái', 380.000, 40.000, 340.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 2, 'AT-POLO-NVY-M', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Xanh Navy / M)', 'Cái', 320.000, 25.000, 295.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 4, 'SM-OXFORD-BLU-M', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Xanh Pastel / M)', 'Cái', 280.000, 30.000, 250.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 6, 'SM-BAMBOO-WHT-M', 'Áo Sơ Mi Nam Vải Sợi Tre Bamboo Kháng Khuẩn (Trắng Sữa / M)', 'Cái', 350.000, 35.000, 315.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 8, 'QJ-SLIM-IND-31', 'Quần Jean Nam Slimfit Co Giãn Cao Cấp (Xanh Indigo / Size 31)', 'Cái', 290.000, 30.000, 260.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 11, 'QT-SLIM-BLK-31', 'Quần Âu Nam Công Sở Co Giãn Form Hàn Quốc (Đen / Size 31)', 'Cái', 260.000, 20.000, 240.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 14, 'DV-HOANHI-BE-S', 'Đầm Voan Hoa Nhí Cổ Vuông Dáng Xòe (Họa Tiết Be / Size S)', 'Cái', 210.000, 25.000, 185.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 15, 'DV-SATIN-RED-M', 'Đầm Dạ Hội Lụa Satin Dáng Ôm Xẻ Tà (Đỏ Ruby / Size M)', 'Cái', 140.000, 15.000, 125.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 17, 'AK-BLAZER-BE-M', 'Áo Blazer Nữ 2 Lớp Form Rộng Hàn Quốc (Màu Be / Size M)', 'Cái', 210.000, 20.000, 190.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 22, 'QJ-SUONG-WOMEN-BLU-M', 'Quần Jean Nữ Ống Suông Rộng Cạp Cao Vintage (Xanh Nhạt / Size M)', 'Cái', 310.000, 30.000, 280.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 26, 'AT-OVERSIZE-BLK-L', 'Áo Thun Unisex Oversize Cotton Compact 250gsm (Đen / Size L)', 'Cái', 450.000, 45.000, 405.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 28, 'AK-GIO-2LOP-BLK-L', 'Áo Khoác Gió Unisex 2 Lớp Chống Nước Trượt Nước (Đen / Size L)', 'Cái', 260.000, 20.000, 240.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 30, 'TL-DABO-BLK-120', 'Thắt Lưng Nam Da Bò Thật Khóa Tự Động (Đen / Bản 3.5cm)', 'Sợi', 320.000, 30.000, 290.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 34, 'TX-TOTE-WOMEN-BEI', 'Túi Xách Nữ Tote Da PU Cao Cấp Đi Làm (Màu Be / Cỡ Lớn)', 'Cái', 230.000, 20.000, 210.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 35, 'GY-SNEAKER-WHT-42', 'Giày Sneaker Unisex Da Bò Thật Đế Cao Su (Trắng / Size 42)', 'Đôi', 190.000, 15.000, 175.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 39, 'AO-TAP-GYM-MEN-BLK-L', 'Áo Tập Gym Nam Thun Mè Thoát Mồ Hôi Siêu Tốc (Đen / Size L)', 'Cái', 360.000, 30.000, 330.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 40, 'QUAN-YOGA-WOMEN-NVY-S', 'Quần Legging Nữ Tập Yoga Cạp Cao Nâng Mông (Xanh Navy / Size S)', 'Cái', 280.000, 25.000, 255.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 42, 'DO-NGU-LUA-WOMEN-PNK-M', 'Bộ Pijama Lụa Nữ Dài Tay Viền Trắng (Hồng Pastel / Size M)', 'Bộ', 250.000, 20.000, 230.000),

-- === Kho 3: Kho Trung Chuyển Miền Trung - Đà Nẵng (WH-DN-01) ===
(3, 'WH-DN-01', 'Kho Trung Chuyển Miền Trung', 1, 'AT-POLO-WHT-L', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 'Cái', 200.000, 10.000, 190.000),
(3, 'WH-DN-01', 'Kho Trung Chuyển Miền Trung', 4, 'SM-OXFORD-BLU-M', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Xanh Pastel / M)', 'Cái', 180.000, 10.000, 170.000),
(3, 'WH-DN-01', 'Kho Trung Chuyển Miền Trung', 8, 'QJ-SLIM-IND-31', 'Quần Jean Nam Slimfit Co Giãn Cao Cấp (Xanh Indigo / Size 31)', 'Cái', 190.000, 15.000, 175.000),
(3, 'WH-DN-01', 'Kho Trung Chuyển Miền Trung', 14, 'DV-HOANHI-BE-S', 'Đầm Voan Hoa Nhí Cổ Vuông Dáng Xòe (Họa Tiết Be / Size S)', 'Cái', 120.000, 10.000, 110.000),
(3, 'WH-DN-01', 'Kho Trung Chuyển Miền Trung', 17, 'AK-BLAZER-BE-M', 'Áo Blazer Nữ 2 Lớp Form Rộng Hàn Quốc (Màu Be / Size M)', 'Cái', 140.000, 12.000, 128.000),
(3, 'WH-DN-01', 'Kho Trung Chuyển Miền Trung', 26, 'AT-OVERSIZE-BLK-L', 'Áo Thun Unisex Oversize Cotton Compact 250gsm (Đen / Size L)', 'Cái', 250.000, 20.000, 230.000),
(3, 'WH-DN-01', 'Kho Trung Chuyển Miền Trung', 30, 'TL-DABO-BLK-120', 'Thắt Lưng Nam Da Bò Thật Khóa Tự Động (Đen / Bản 3.5cm)', 'Sợi', 210.000, 15.000, 195.000),
(3, 'WH-DN-01', 'Kho Trung Chuyển Miền Trung', 37, 'BO-KIDS-POLO-BLU-4T', 'Set Bộ Bé Trai Áo Polo & Quần Short Kaki (Xanh Biển / 4 Tuổi)', 'Bộ', 150.000, 10.000, 140.000),

-- === Kho 4: Kho Vận Chuyển Miền Tây - Cần Thơ (WH-CT-01) ===
(4, 'WH-CT-01', 'Kho Vận Chuyển Miền Tây - Cần Thơ', 1, 'AT-POLO-WHT-L', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 'Cái', 180.000, 10.000, 170.000),
(4, 'WH-CT-01', 'Kho Vận Chuyển Miền Tây - Cần Thơ', 6, 'SM-BAMBOO-WHT-M', 'Áo Sơ Mi Nam Vải Sợi Tre Bamboo Kháng Khuẩn (Trắng Sữa / M)', 'Cái', 160.000, 10.000, 150.000),
(4, 'WH-CT-01', 'Kho Vận Chuyển Miền Tây - Cần Thơ', 8, 'QJ-SLIM-IND-31', 'Quần Jean Nam Slimfit Co Giãn Cao Cấp (Xanh Indigo / Size 31)', 'Cái', 150.000, 10.000, 140.000),
(4, 'WH-CT-01', 'Kho Vận Chuyển Miền Tây - Cần Thơ', 26, 'AT-OVERSIZE-BLK-L', 'Áo Thun Unisex Oversize Cotton Compact 250gsm (Đen / Size L)', 'Cái', 220.000, 15.000, 205.000),
(4, 'WH-CT-01', 'Kho Vận Chuyển Miền Tây - Cần Thơ', 39, 'AO-TAP-GYM-MEN-BLK-L', 'Áo Tập Gym Nam Thun Mè Thoát Mồ Hôi Siêu Tốc (Đen / Size L)', 'Cái', 200.000, 10.000, 190.000),

-- === Kho 5: Kho Cảng Dệt May Hải Phòng (WH-HP-01) ===
(5, 'WH-HP-01', 'Kho Cảng Dệt May Hải Phòng', 4, 'SM-OXFORD-BLU-M', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Xanh Pastel / M)', 'Cái', 350.000, 20.000, 330.000),
(5, 'WH-HP-01', 'Kho Cảng Dệt May Hải Phòng', 5, 'SM-OXFORD-WHT-L', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Trắng / L)', 'Cái', 300.000, 20.000, 280.000),
(5, 'WH-HP-01', 'Kho Cảng Dệt May Hải Phòng', 10, 'QT-WOOL-GRY-32', 'Quần Tây Nam Dáng Đứng Xếp Ly Wool Blend (Ghi Xám / Size 32)', 'Cái', 240.000, 15.000, 225.000),
(5, 'WH-HP-01', 'Kho Cảng Dệt May Hải Phòng', 23, 'HD-HEAVY-GRY-XL', 'Áo Hoodie Unisex Nỉ Chân Cua 380gsm (Xám Tiêu / Size XL)', 'Cái', 280.000, 20.000, 260.000),
(5, 'WH-HP-01', 'Kho Cảng Dệt May Hải Phòng', 28, 'AK-GIO-2LOP-BLK-L', 'Áo Khoác Gió Unisex 2 Lớp Chống Nước Trượt Nước (Đen / Size L)', 'Cái', 290.000, 15.000, 275.000);

-- --------------------------------------------------------------------
-- 8. STOCK LEDGER (Sổ Cái Ghi Nhận Biến Động Nhập / Xuất / Tồn Kho)
-- --------------------------------------------------------------------

INSERT INTO stock_ledger (warehouse_id, warehouse_code, warehouse_name, product_id, product_sku, product_name, reference_type, reference_code, transaction_type, quantity, balance_after, unit_cost, notes, created_by) VALUES
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 1, 'AT-POLO-WHT-L', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 450.000, 450.000, 135000.00, 'Số dư đầu kỳ Áo Polo Trắng L tại Kho Hà Nội', 'admin'),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 2, 'AT-POLO-NVY-M', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Xanh Navy / M)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 380.000, 380.000, 135000.00, 'Số dư đầu kỳ Áo Polo Xanh Navy tại Kho Hà Nội', 'admin'),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 4, 'SM-OXFORD-BLU-M', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Xanh Pastel / M)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 320.000, 320.000, 195000.00, 'Số dư đầu kỳ Sơ mi Oxford Xanh tại Kho Hà Nội', 'admin'),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 8, 'QJ-SLIM-IND-31', 'Quần Jean Nam Slimfit Co Giãn Cao Cấp (Xanh Indigo / Size 31)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 340.000, 340.000, 240000.00, 'Số dư đầu kỳ Quần Jean Slimfit tại Kho Hà Nội', 'admin'),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 14, 'DV-HOANHI-BE-S', 'Đầm Voan Hoa Nhí Cổ Vuông Dáng Xòe (Họa Tiết Be / Size S)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 160.000, 160.000, 280000.00, 'Số dư đầu kỳ Đầm Voan Hoa Nhí tại Kho Hà Nội', 'admin'),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 17, 'AK-BLAZER-BE-M', 'Áo Blazer Nữ 2 Lớp Form Rộng Hàn Quốc (Màu Be / Size M)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 240.000, 240.000, 350000.00, 'Số dư đầu kỳ Áo Blazer Nữ Be tại Kho Hà Nội', 'admin'),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 1, 'AT-POLO-WHT-L', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 380.000, 380.000, 135000.00, 'Số dư đầu kỳ Áo Polo Trắng L tại Kho TP.HCM', 'admin'),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 6, 'SM-BAMBOO-WHT-M', 'Áo Sơ Mi Nam Vải Sợi Tre Bamboo Kháng Khuẩn (Trắng Sữa / M)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 350.000, 350.000, 210000.00, 'Số dư đầu kỳ Sơ mi Sợi tre tại Kho TP.HCM', 'admin'),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 15, 'DV-SATIN-RED-M', 'Đầm Dạ Hội Lụa Satin Dáng Ôm Xẻ Tà (Đỏ Ruby / Size M)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 140.000, 140.000, 420000.00, 'Số dư đầu kỳ Đầm Dạ Hội Satin tại Kho TP.HCM', 'admin'),
(3, 'WH-DN-01', 'Kho Trung Chuyển Miền Trung', 1, 'AT-POLO-WHT-L', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 200.000, 200.000, 135000.00, 'Số dư đầu kỳ Kho Đà Nẵng', 'admin'),
(4, 'WH-CT-01', 'Kho Vận Chuyển Miền Tây - Cần Thơ', 1, 'AT-POLO-WHT-L', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 180.000, 180.000, 135000.00, 'Số dư đầu kỳ Kho Cần Thơ', 'admin'),
(5, 'WH-HP-01', 'Kho Cảng Dệt May Hải Phòng', 4, 'SM-OXFORD-BLU-M', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Xanh Pastel / M)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 350.000, 350.000, 195000.00, 'Số dư đầu kỳ Kho Cảng Hải Phòng', 'admin');

-- --------------------------------------------------------------------
-- 9. SALES ORDERS & ITEMS (10 Đơn Bán hàng Đa dạng Trạng thái & JSON History)
-- Đủ các trạng thái: DRAFT, APPROVED, DELIVERING, COMPLETED, CANCELLED
-- --------------------------------------------------------------------

-- Đơn 1: Xuất sỉ cho May Boutique (Đã giao & Hoàn thành)
INSERT INTO sales_orders (id, order_code, customer_id, customer_code, customer_name, customer_phone, warehouse_id, warehouse_code, warehouse_name, order_date, subtotal, tax_amount, discount_amount, total_amount, status, status_history, created_by, approved_by, approved_at, notes) VALUES
(1, 'SO-202609-001', 2, 'CUST-002', 'Chuỗi Cửa Hàng Thời Trang May Boutique', '0283998877', 1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', '2026-09-02', 47350000.00, 4735000.00, 11837500.00, 40247500.00, 'COMPLETED',
'[{"fromStatus":null,"toStatus":"DRAFT","note":"Tạo mới đơn bán buôn đợt 1 tháng 9","changedBy":"sales_user","changedAt":"2026-09-02 09:15:00"},{"fromStatus":"DRAFT","toStatus":"APPROVED","note":"Phê duyệt chiết khấu 25% cho đại lý chuỗi shop","changedBy":"admin","changedAt":"2026-09-02 10:30:00"},{"fromStatus":"APPROVED","toStatus":"DELIVERING","note":"Xuất kho giao Viettel Post chuyển đến showroom Cầu Giấy","changedBy":"warehouse_user","changedAt":"2026-09-02 14:00:00"},{"fromStatus":"DELIVERING","toStatus":"COMPLETED","note":"May Boutique ký nhận đủ số lượng và thanh toán chuyển khoản","changedBy":"sales_user","changedAt":"2026-09-03 16:30:00"}]',
'sales_user', 'admin', '2026-09-02 10:30:00', 'Đơn xuất sỉ quần áo cho chuỗi cửa hàng May Boutique đợt đầu tháng 9');

INSERT INTO sales_order_items (id, sales_order_id, product_id, product_sku, product_name, product_unit, quantity, unit_price, discount_percent, line_total) VALUES
(1, 1, 1, 'AT-POLO-WHT-L', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 'Cái', 50.000, 299000.00, 25.00, 11212500.00),
(2, 1, 4, 'SM-OXFORD-BLU-M', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Xanh Pastel / M)', 'Cái', 30.000, 420000.00, 25.00, 9450000.00),
(3, 1, 8, 'QJ-SLIM-IND-31', 'Quần Jean Nam Slimfit Co Giãn Cao Cấp (Xanh Indigo / Size 31)', 'Cái', 30.000, 550000.00, 25.00, 12375000.00),
(4, 1, 17, 'AK-BLAZER-BE-M', 'Áo Blazer Nữ 2 Lớp Form Rộng Hàn Quốc (Màu Be / Size M)', 'Cái', 20.000, 790000.00, 25.00, 11850000.00);

-- Đơn 2: Bán lẻ Khách VIP Nguyễn Thùy Linh (Đã duyệt, chuẩn bị giao)
INSERT INTO sales_orders (id, order_code, customer_id, customer_code, customer_name, customer_phone, warehouse_id, warehouse_code, warehouse_name, order_date, subtotal, tax_amount, discount_amount, total_amount, status, status_history, created_by, approved_by, approved_at, notes) VALUES
(2, 'SO-202609-002', 1, 'CUST-001', 'Nguyễn Thùy Linh', '0912334455', 2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', '2026-09-05', 1740000.00, 174000.00, 174000.00, 1740000.00, 'APPROVED',
'[{"fromStatus":null,"toStatus":"DRAFT","note":"Tạo đơn bán lẻ trực tuyến","changedBy":"sales_sg","changedAt":"2026-09-05 13:50:00"},{"fromStatus":"DRAFT","toStatus":"APPROVED","note":"Áp dụng chiết khấu VIP 10% và chuẩn bị xuất kho TP.HCM","changedBy":"admin","changedAt":"2026-09-05 14:20:00"}]',
'sales_sg', 'admin', '2026-09-05 14:20:00', 'Khách VIP mua set Blazer Nữ và Đầm dạ hội lụa Satin đỏ');

INSERT INTO sales_order_items (id, sales_order_id, product_id, product_sku, product_name, product_unit, quantity, unit_price, discount_percent, line_total) VALUES
(5, 2, 15, 'DV-SATIN-RED-M', 'Đầm Dạ Hội Lụa Satin Dáng Ôm Xẻ Tà (Đỏ Ruby / Size M)', 'Cái', 1.000, 950000.00, 10.00, 855000.00),
(6, 2, 17, 'AK-BLAZER-BE-M', 'Áo Blazer Nữ 2 Lớp Form Rộng Hàn Quốc (Màu Be / Size M)', 'Cái', 1.000, 790000.00, 10.00, 711000.00);

-- Đơn 3: Hợp đồng may đo đồng phục Tập đoàn FPT (Đang giao hàng)
INSERT INTO sales_orders (id, order_code, customer_id, customer_code, customer_name, customer_phone, warehouse_id, warehouse_code, warehouse_name, order_date, subtotal, tax_amount, discount_amount, total_amount, status, status_history, created_by, approved_by, approved_at, notes) VALUES
(3, 'SO-202609-003', 3, 'CUST-003', 'Công ty Cổ phần Đầu tư Công nghệ FPT', '02473007300', 1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', '2026-09-06', 74800000.00, 7480000.00, 14960000.00, 67320000.00, 'DELIVERING',
'[{"fromStatus":null,"toStatus":"DRAFT","note":"Lập đơn may đồng phục khối công nghệ FPT đợt 2","changedBy":"sales_hn","changedAt":"2026-09-06 08:30:00"},{"fromStatus":"DRAFT","toStatus":"APPROVED","note":"Duyệt giá chiết khấu doanh nghiệp 20% theo hợp đồng khung","changedBy":"director","changedAt":"2026-09-06 09:45:00"},{"fromStatus":"APPROVED","toStatus":"DELIVERING","note":"Bàn giao 200 áo polo cho xe tải vận chuyển đến FPT Tower Cầu Giấy","changedBy":"warehouse_user","changedAt":"2026-09-07 10:00:00"}]',
'sales_hn', 'director', '2026-09-06 09:45:00', 'Giao đợt 1 gồm 100 Polo Trắng và 100 Polo Navy cho nhân viên kỹ thuật FPT');

INSERT INTO sales_order_items (id, sales_order_id, product_id, product_sku, product_name, product_unit, quantity, unit_price, discount_percent, line_total) VALUES
(7, 3, 1, 'AT-POLO-WHT-L', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 'Cái', 100.000, 299000.00, 20.00, 23920000.00),
(8, 3, 2, 'AT-POLO-NVY-M', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Xanh Navy / M)', 'Cái', 100.000, 299000.00, 20.00, 23920000.00),
(9, 3, 5, 'SM-OXFORD-WHT-L', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Trắng / L)', 'Cái', 50.000, 420000.00, 20.00, 16800000.00);

-- Đơn 4: Xuất buôn cho Chuỗi Yody Miền Trung (Mới tạo - DRAFT)
INSERT INTO sales_orders (id, order_code, customer_id, customer_code, customer_name, customer_phone, warehouse_id, warehouse_code, warehouse_name, order_date, subtotal, tax_amount, discount_amount, total_amount, status, status_history, created_by, approved_by, approved_at, notes) VALUES
(4, 'SO-202609-004', 6, 'CUST-006', 'Công ty TNHH Thời Trang Yody Miền Trung', '02363889900', 3, 'WH-DN-01', 'Kho Trung Chuyển Miền Trung', '2026-09-08', 52500000.00, 5250000.00, 13125000.00, 44625000.00, 'DRAFT',
'[{"fromStatus":null,"toStatus":"DRAFT","note":"Tạo báo giá và đơn đặt hàng dự kiến cho Yody Đà Nẵng","changedBy":"sales_user","changedAt":"2026-09-08 11:20:00"}]',
'sales_user', NULL, NULL, 'Báo giá lô Quần Jean và Sơ mi cho các showroom Yody khu vực Đà Nẵng & Huế');

INSERT INTO sales_order_items (id, sales_order_id, product_id, product_sku, product_name, product_unit, quantity, unit_price, discount_percent, line_total) VALUES
(10, 4, 8, 'QJ-SLIM-IND-31', 'Quần Jean Nam Slimfit Co Giãn Cao Cấp (Xanh Indigo / Size 31)', 'Cái', 50.000, 550000.00, 25.00, 20625000.00),
(11, 4, 4, 'SM-OXFORD-BLU-M', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Xanh Pastel / M)', 'Cái', 40.000, 420000.00, 25.00, 12600000.00),
(12, 4, 26, 'AT-OVERSIZE-BLK-L', 'Áo Thun Unisex Oversize Cotton Compact 250gsm (Đen / Size L)', 'Cái', 50.000, 220000.00, 25.00, 8250000.00);

-- Đơn 5: Đơn bán sỉ bị Hủy do khách đổi mẫu (CANCELLED)
INSERT INTO sales_orders (id, order_code, customer_id, customer_code, customer_name, customer_phone, warehouse_id, warehouse_code, warehouse_name, order_date, subtotal, tax_amount, discount_amount, total_amount, status, status_history, created_by, approved_by, approved_at, cancelled_by, cancelled_at, status_note, notes) VALUES
(5, 'SO-202609-005', 9, 'CUST-009', 'Chuỗi Thời Trang Routine Vietnam', '02862899988', 2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', '2026-09-07', 36500000.00, 3650000.00, 9125000.00, 31025000.00, 'CANCELLED',
'[{"fromStatus":null,"toStatus":"DRAFT","note":"Tạo đơn hàng áo khoác gió Routine","changedBy":"sales_sg","changedAt":"2026-09-07 14:00:00"},{"fromStatus":"DRAFT","toStatus":"CANCELLED","note":"Khách hàng Routine yêu cầu đổi sang bộ sưu tập Bomber và tăng số lượng","changedBy":"admin","changedAt":"2026-09-08 09:30:00"}]',
'sales_sg', NULL, NULL, 'admin', '2026-09-08 09:30:00', 'Khách đổi kế hoạch kinh doanh sang phân khúc bomber', 'Hủy theo yêu cầu văn bản của Giám đốc mua sắm Routine để tạo đơn mới');

INSERT INTO sales_order_items (id, sales_order_id, product_id, product_sku, product_name, product_unit, quantity, unit_price, discount_percent, line_total) VALUES
(13, 5, 28, 'AK-GIO-2LOP-BLK-L', 'Áo Khoác Gió Unisex 2 Lớp Chống Nước Trượt Nước (Đen / Size L)', 'Cái', 50.000, 399000.00, 25.00, 14962500.00),
(14, 5, 29, 'AK-BOMBER-GRN-XL', 'Áo Khoác Bomber Unisex Chần Bông Thời Trang (Xanh Rêu / Size XL)', 'Cái', 25.000, 620000.00, 25.00, 11625000.00);

-- Đơn 6: Đồng phục Viettel Quân Đội (Hoàn thành)
INSERT INTO sales_orders (id, order_code, customer_id, customer_code, customer_name, customer_phone, warehouse_id, warehouse_code, warehouse_name, order_date, subtotal, tax_amount, discount_amount, total_amount, status, status_history, created_by, approved_by, approved_at, notes) VALUES
(6, 'SO-202609-006', 7, 'CUST-007', 'Tập đoàn Viễn thông Quân đội Viettel (Đồng phục)', '02462556789', 1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', '2026-08-28', 89000000.00, 8900000.00, 17800000.00, 80100000.00, 'COMPLETED',
'[{"fromStatus":null,"toStatus":"DRAFT","note":"Đơn hàng đồng phục giao dịch viên Viettel","changedBy":"sales_user","changedAt":"2026-08-28 09:00:00"},{"fromStatus":"DRAFT","toStatus":"APPROVED","note":"Duyệt đơn chiết khấu 20%","changedBy":"director","changedAt":"2026-08-28 11:00:00"},{"fromStatus":"APPROVED","toStatus":"DELIVERING","note":"Giao hàng đến trụ sở Viettel","changedBy":"warehouse_user","changedAt":"2026-08-29 08:30:00"},{"fromStatus":"DELIVERING","toStatus":"COMPLETED","note":"Nghiệm thu thành công và thanh toán 100%","changedBy":"sales_user","changedAt":"2026-08-30 15:00:00"}]',
'sales_user', 'director', '2026-08-28 11:00:00', 'Đơn hàng cung ứng đồng phục sơ mi và quần âu cho Viettel');

INSERT INTO sales_order_items (id, sales_order_id, product_id, product_sku, product_name, product_unit, quantity, unit_price, discount_percent, line_total) VALUES
(15, 6, 6, 'SM-BAMBOO-WHT-M', 'Áo Sơ Mi Nam Vải Sợi Tre Bamboo Kháng Khuẩn (Trắng Sữa / M)', 'Cái', 100.000, 450000.00, 20.00, 36000000.00),
(16, 6, 11, 'QT-SLIM-BLK-31', 'Quần Âu Nam Công Sở Co Giãn Form Hàn Quốc (Đen / Size 31)', 'Cái', 100.000, 490000.00, 20.00, 39200000.00);

-- Đơn 7: Khách Kim Cương Trần Bảo Ngọc (Đã duyệt)
INSERT INTO sales_orders (id, order_code, customer_id, customer_code, customer_name, customer_phone, warehouse_id, warehouse_code, warehouse_name, order_date, subtotal, tax_amount, discount_amount, total_amount, status, status_history, created_by, approved_by, approved_at, notes) VALUES
(7, 'SO-202609-007', 11, 'CUST-011', 'Trần Bảo Ngọc', '0903889900', 2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', '2026-09-09', 3130000.00, 313000.00, 469500.00, 2973500.00, 'APPROVED',
'[{"fromStatus":null,"toStatus":"DRAFT","note":"Tạo đơn hàng khách VVIP","changedBy":"sales_sg","changedAt":"2026-09-09 10:00:00"},{"fromStatus":"DRAFT","toStatus":"APPROVED","note":"Duyệt chiết khấu Kim Cương 15%","changedBy":"admin","changedAt":"2026-09-09 10:45:00"}]',
'sales_sg', 'admin', '2026-09-09 10:45:00', 'Đơn hàng trang phục dạ hội và giày sneaker cao cấp');

INSERT INTO sales_order_items (id, sales_order_id, product_id, product_sku, product_name, product_unit, quantity, unit_price, discount_percent, line_total) VALUES
(17, 7, 16, 'DV-TWEED-WHT-S', 'Đầm Dạ Tweed Sang Trọng Thiết Kế Nơ Cổ (Trắng Kem / Size S)', 'Cái', 1.000, 890000.00, 15.00, 756500.00),
(18, 7, 34, 'TX-TOTE-WOMEN-BEI', 'Túi Xách Nữ Tote Da PU Cao Cấp Đi Làm (Màu Be / Cỡ Lớn)', 'Cái', 1.000, 330000.00, 15.00, 280500.00),
(19, 7, 35, 'GY-SNEAKER-WHT-42', 'Giày Sneaker Unisex Da Bò Thật Đế Cao Su (Trắng / Size 42)', 'Đôi', 1.000, 850000.00, 15.00, 722500.00);

-- Đơn 8: Đơn xuất sỉ cho Canifa (Đã giao hàng)
INSERT INTO sales_orders (id, order_code, customer_id, customer_code, customer_name, customer_phone, warehouse_id, warehouse_code, warehouse_name, order_date, subtotal, tax_amount, discount_amount, total_amount, status, status_history, created_by, approved_by, approved_at, notes) VALUES
(8, 'SO-202609-008', 5, 'CUST-005', 'Công ty Cổ phần Thời Trang Canifa', '02435647788', 1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', '2026-09-04', 62400000.00, 6240000.00, 15600000.00, 53040000.00, 'DELIVERING',
'[{"fromStatus":null,"toStatus":"DRAFT","note":"Tạo đơn sỉ Canifa đợt Thu Đông","changedBy":"sales_hn","changedAt":"2026-09-04 14:00:00"},{"fromStatus":"DRAFT","toStatus":"APPROVED","note":"Phê duyệt hạn mức tín dụng và chiết khấu 25%","changedBy":"director","changedAt":"2026-09-04 16:30:00"},{"fromStatus":"APPROVED","toStatus":"DELIVERING","note":"Đã bốc xếp hàng lên xe tải vận chuyển đến tổng kho Canifa Hưng Yên","changedBy":"warehouse_user","changedAt":"2026-09-05 08:30:00"}]',
'sales_hn', 'director', '2026-09-04 16:30:00', 'Đơn hàng gồm Hoodie nỉ và Áo len mùa đông cho chuỗi Canifa');

INSERT INTO sales_order_items (id, sales_order_id, product_id, product_sku, product_name, product_unit, quantity, unit_price, discount_percent, line_total) VALUES
(20, 8, 23, 'HD-HEAVY-GRY-XL', 'Áo Hoodie Unisex Nỉ Chân Cua 380gsm (Xám Tiêu / Size XL)', 'Cái', 80.000, 480000.00, 25.00, 28800000.00),
(21, 8, 24, 'HD-HEAVY-BLK-L', 'Áo Hoodie Unisex Nỉ Chân Cua 380gsm (Đen Tuyển / Size L)', 'Cái', 50.000, 480000.00, 25.00, 18000000.00);

-- --------------------------------------------------------------------
-- 10. PURCHASE ORDERS & ITEMS (Đơn Mua Hàng & Gia Công May Mặc)
-- --------------------------------------------------------------------

-- PO 1: May gia công 500 Áo Polo Nam từ Hanosimex (Đã nhận hàng đầy đủ)
INSERT INTO purchase_orders (id, po_code, supplier_id, supplier_code, supplier_name, warehouse_id, warehouse_code, warehouse_name, order_date, expected_date, subtotal, tax_amount, total_amount, status, created_by, approved_by, approved_at, notes) VALUES
(1, 'PO-202609-001', 1, 'SUPP-HANOSIMEX', 'Tổng Công ty Cổ phần Dệt May Hà Nội (Hanosimex)', 1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', '2026-08-25', '2026-09-02', 67500000.00, 6750000.00, 74250000.00, 'RECEIVED', 'purchase_user', 'admin', '2026-08-25 16:00:00', 'Đơn đặt may gia công lô 500 Áo Polo Cotton Pique từ Hanosimex phục vụ vụ Thu Đông');

INSERT INTO purchase_order_items (id, purchase_order_id, product_id, product_sku, product_name, product_unit, quantity, unit_price, line_total) VALUES
(1, 1, 1, 'AT-POLO-WHT-L', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 'Cái', 300.000, 135000.00, 40500000.00),
(2, 1, 2, 'AT-POLO-NVY-M', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Xanh Navy / M)', 'Cái', 200.000, 135000.00, 27000000.00);

-- PO 2: Đặt may 300 Áo Sơ Mi Oxford từ Tổng Công ty May 10 (Đã duyệt)
INSERT INTO purchase_orders (id, po_code, supplier_id, supplier_code, supplier_name, warehouse_id, warehouse_code, warehouse_name, order_date, expected_date, subtotal, tax_amount, total_amount, status, created_by, approved_by, approved_at, notes) VALUES
(2, 'PO-202609-002', 2, 'SUPP-MAY10', 'Tổng Công ty May 10 - CTCP', 1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', '2026-09-01', '2026-09-12', 58500000.00, 5850000.00, 64350000.00, 'APPROVED', 'purchase_user', 'admin', '2026-09-01 11:30:00', 'Đơn đặt may 300 Áo Sơ Mi Nam Oxford dệt chéo từ May 10');

INSERT INTO purchase_order_items (id, purchase_order_id, product_id, product_sku, product_name, product_unit, quantity, unit_price, line_total) VALUES
(3, 2, 4, 'SM-OXFORD-BLU-M', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Xanh Pastel / M)', 'Cái', 150.000, 195000.00, 29250000.00),
(4, 2, 5, 'SM-OXFORD-WHT-L', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Trắng / L)', 'Cái', 150.000, 195000.00, 29250000.00);

-- PO 3: Nhập vải và gia công Quần Jean từ Phong Phú Textile (Đã nhận hàng)
INSERT INTO purchase_orders (id, po_code, supplier_id, supplier_code, supplier_name, warehouse_id, warehouse_code, warehouse_name, order_date, expected_date, subtotal, tax_amount, total_amount, status, created_by, approved_by, approved_at, notes) VALUES
(3, 'PO-202609-003', 3, 'SUPP-PHONGPHU', 'Tổng Công ty Cổ phần Phong Phú (Phuphu Textile)', 2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', '2026-08-20', '2026-08-31', 96000000.00, 9600000.00, 105600000.00, 'RECEIVED', 'purchase_user', 'director', '2026-08-20 14:00:00', 'Đặt sản xuất lô 400 Quần Jean Denim co giãn tại xưởng may Phong Phú TP.HCM');

INSERT INTO purchase_order_items (id, purchase_order_id, product_id, product_sku, product_name, product_unit, quantity, unit_price, line_total) VALUES
(5, 3, 8, 'QJ-SLIM-IND-31', 'Quần Jean Nam Slimfit Co Giãn Cao Cấp (Xanh Indigo / Size 31)', 'Cái', 250.000, 240000.00, 60000000.00),
(6, 3, 9, 'QJ-STRAIGHT-BLK-32', 'Quần Jean Nam Ống Đứng Regular Cổ Điển (Đen Wash / Size 32)', 'Cái', 150.000, 240000.00, 36000000.00);

-- PO 4: Đặt may sơ mi sợi tre cao cấp từ May Việt Tiến (Đang thực hiện - ORDERED)
INSERT INTO purchase_orders (id, po_code, supplier_id, supplier_code, supplier_name, warehouse_id, warehouse_code, warehouse_name, order_date, expected_date, subtotal, tax_amount, total_amount, status, created_by, approved_by, approved_at, notes) VALUES
(4, 'PO-202609-004', 5, 'SUPP-VIETTIEN', 'Tổng Công ty Cổ phần May Việt Tiến', 2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', '2026-09-03', '2026-09-18', 63000000.00, 6300000.00, 69300000.00, 'ORDERED', 'purchase_mgr', 'director', '2026-09-03 15:45:00', 'Hợp đồng may đo sơ mi Bamboo công sở chống nhăn cao cấp');

INSERT INTO purchase_order_items (id, purchase_order_id, product_id, product_sku, product_name, product_unit, quantity, unit_price, line_total) VALUES
(7, 4, 6, 'SM-BAMBOO-WHT-M', 'Áo Sơ Mi Nam Vải Sợi Tre Bamboo Kháng Khuẩn (Trắng Sữa / M)', 'Cái', 300.000, 210000.00, 63000000.00);

-- PO 5: Nhập vải lụa satin may đầm dự tiệc từ Tập đoàn Thái Tuấn (Đã duyệt)
INSERT INTO purchase_orders (id, po_code, supplier_id, supplier_code, supplier_name, warehouse_id, warehouse_code, warehouse_name, order_date, expected_date, subtotal, tax_amount, total_amount, status, created_by, approved_by, approved_at, notes) VALUES
(5, 'PO-202609-005', 6, 'SUPP-THAI-TUAN', 'Công ty Cổ phần Tập đoàn Thái Tuấn', 2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', '2026-09-06', '2026-09-20', 70000000.00, 7000000.00, 77000000.00, 'APPROVED', 'purchase_mgr', 'admin', '2026-09-06 10:15:00', 'Gia công đầm lụa Satin đỏ và đầm voan hoa nhí thiết kế');

INSERT INTO purchase_order_items (id, purchase_order_id, product_id, product_sku, product_name, product_unit, quantity, unit_price, line_total) VALUES
(8, 5, 14, 'DV-HOANHI-BE-S', 'Đầm Voan Hoa Nhí Cổ Vuông Dáng Xòe (Họa Tiết Be / Size S)', 'Cái', 150.000, 280000.00, 42000000.00),
(9, 5, 15, 'DV-SATIN-RED-M', 'Đầm Dạ Hội Lụa Satin Dáng Ôm Xẻ Tà (Đỏ Ruby / Size M)', 'Cái', 100.000, 280000.00, 28000000.00);

-- PO 6: Đặt hàng phụ liệu thắt lưng da bò thật từ Da Bình Dương (RECEIVED)
INSERT INTO purchase_orders (id, po_code, supplier_id, supplier_code, supplier_name, warehouse_id, warehouse_code, warehouse_name, order_date, expected_date, subtotal, tax_amount, total_amount, status, created_by, approved_by, approved_at, notes) VALUES
(6, 'PO-202609-006', 9, 'SUPP-DA-BINHDUONG', 'Công ty TNHH Da Thuộc & Phụ Kiện Nam Hưng', 1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', '2026-08-28', '2026-09-05', 55000000.00, 5500000.00, 60500000.00, 'RECEIVED', 'purchase_user', 'admin', '2026-08-28 17:00:00', 'Lô 500 chiếc thắt lưng da bò lớp 1 dập vân kèm khóa tự động');

INSERT INTO purchase_order_items (id, purchase_order_id, product_id, product_sku, product_name, product_unit, quantity, unit_price, line_total) VALUES
(10, 6, 30, 'TL-DABO-BLK-120', 'Thắt Lưng Nam Da Bò Thật Khóa Tự Động (Đen / Bản 3.5cm)', 'Sợi', 500.000, 110000.00, 55000000.00);

-- PO 7: Nhập túi zipper mờ và bao bì may mặc từ Đông Á Pack (DRAFT)
INSERT INTO purchase_orders (id, po_code, supplier_id, supplier_code, supplier_name, warehouse_id, warehouse_code, warehouse_name, order_date, expected_date, subtotal, tax_amount, total_amount, status, created_by, approved_by, approved_at, notes) VALUES
(7, 'PO-202609-007', 10, 'SUPP-DONGA-PACK', 'Công ty Cổ phần Bao Bì & In Ấn Dệt May Đông Á', 1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', '2026-09-10', '2026-09-25', 18500000.00, 1850000.00, 20350000.00, 'DRAFT', 'purchase_user', NULL, NULL, 'Bao bì in logo phục vụ đóng gói bộ sưu tập Thu Đông mới');

INSERT INTO purchase_order_items (id, purchase_order_id, product_id, product_sku, product_name, product_unit, quantity, unit_price, line_total) VALUES
(11, 7, 30, 'TL-DABO-BLK-120', 'Thắt Lưng Nam Da Bò Thật Khóa Tự Động (Đen / Bản 3.5cm)', 'Sợi', 100.000, 110000.00, 11000000.00);

-- --------------------------------------------------------------------
-- 11. SUPPLIER DEBTS (Công Nợ Nhà Cung Cấp & Lịch Sử Chi Trả Gộp)
-- Cột payment_method, payment_reference, last_payment_date, paid_by nằm trực tiếp trên supplier_debts
-- --------------------------------------------------------------------

INSERT INTO supplier_debts (id, po_id, po_code, supplier_id, supplier_code, supplier_name, invoice_code, debt_date, due_date, total_amount, paid_amount, remaining_amount, status, payment_method, payment_reference, last_payment_date, payment_notes, paid_by) VALUES
-- Công nợ PO-001: Hanosimex (Thanh toán 1 phần - PARTIAL)
(1, 1, 'PO-202609-001', 1, 'SUPP-HANOSIMEX', 'Tổng Công ty Cổ phần Dệt May Hà Nội (Hanosimex)', 'INV-HNX-202609-01', '2026-09-02', '2026-09-30', 74250000.00, 40000000.00, 34250000.00, 'PARTIAL', 'BANK_TRANSFER', 'UNC-VCB-20260903-8899', '2026-09-03', 'Thanh toán đợt 1 tiền may gia công áo Polo qua Vietcombank', 'accountant_user'),

-- Công nợ PO-003: Phong Phú (Đã tất toán 100% - PAID)
(2, 3, 'PO-202609-003', 3, 'SUPP-PHONGPHU', 'Tổng Công ty Cổ phần Phong Phú (Phuphu Textile)', 'INV-PP-202608-88', '2026-08-31', '2026-09-30', 105600000.00, 105600000.00, 0.00, 'PAID', 'BANK_TRANSFER', 'UNC-TCB-20260901-4433', '2026-09-01', 'Tất toán hợp đồng may quần Jean Denim cho Phong Phú Textile', 'accountant_user'),

-- Công nợ PO-002: May 10 (Chưa thanh toán - UNPAID, đang trong hạn 30 ngày)
(3, 2, 'PO-202609-002', 2, 'SUPP-MAY10', 'Tổng Công ty May 10 - CTCP', 'INV-M10-202609-12', '2026-09-01', '2026-10-01', 64350000.00, 0.00, 64350000.00, 'UNPAID', 'BANK_TRANSFER', NULL, NULL, 'Chờ nghiệm thu đợt may áo sơ mi dệt chéo', NULL),

-- Công nợ PO-006: Da Nam Hưng Bình Dương (Đã đặt cọc 50% - PARTIAL)
(4, 6, 'PO-202609-006', 9, 'SUPP-DA-BINHDUONG', 'Công ty TNHH Da Thuộc & Phụ Kiện Nam Hưng', 'INV-NH-202609-06', '2026-09-05', '2026-10-05', 60500000.00, 30000000.00, 30500000.00, 'PARTIAL', 'BANK_TRANSFER', 'UNC-MBB-20260905-1122', '2026-09-05', 'Chuyển khoản đặt cọc 50% tiền lô thắt lưng da bò', 'acc_lead'),

-- Công nợ Phụ liệu Tân Bình (Hóa đơn tháng trước - PAID)
(5, NULL, NULL, 4, 'SUPP-PHULIEU', 'Công ty TNHH Phụ Liệu May Mặc Tân Bình', 'INV-TB-202608-99', '2026-08-15', '2026-09-15', 25400000.00, 25400000.00, 0.00, 'PAID', 'CASH', 'PC-20260820-001', '2026-08-20', 'Thanh toán tiền mặt đợt cúc xà cừ và khóa YKK nhập kho', 'accountant_user'),

-- Công nợ May Việt Tiến (Hóa đơn mới nhận - UNPAID)
(6, 4, 'PO-202609-004', 5, 'SUPP-VIETTIEN', 'Tổng Công ty Cổ phần May Việt Tiến', 'INV-VT-202609-04', '2026-09-03', '2026-10-03', 69300000.00, 0.00, 69300000.00, 'UNPAID', 'BANK_TRANSFER', NULL, NULL, 'Thời hạn thanh toán 30 ngày theo hợp đồng nguyên tắc', NULL);

-- --------------------------------------------------------------------
-- 12. GOODS RECEIPT NOTES & ITEMS (Phiếu Nhập Kho Thành Phẩm)
-- --------------------------------------------------------------------

-- GRN 1: Nhập kho 500 Áo Polo từ PO-001 tại Kho Hà Nội
INSERT INTO goods_receipt_notes (id, grn_code, po_id, po_code, supplier_name, warehouse_id, warehouse_name, receipt_date, status, notes, created_by, confirmed_by, confirmed_at) VALUES
(1, 'GRN-20260902-001', 1, 'PO-202609-001', 'Tổng Công ty Cổ phần Dệt May Hà Nội (Hanosimex)', 1, 'Kho Tổng Thời Trang Hà Nội', '2026-09-02', 'CONFIRMED', 'Nhập đủ 500 áo Polo theo hợp đồng may gia công của Hanosimex', 'warehouse_user', 'admin', '2026-09-02 15:30:00');

INSERT INTO goods_receipt_items (id, grn_id, product_id, product_sku, product_name, product_unit, ordered_quantity, received_quantity, unit_price, notes) VALUES
(1, 1, 1, 'AT-POLO-WHT-L', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 'Cái', 300.000, 300.000, 135000.00, 'Kiểm tra 100% đạt chuẩn đường may, tem Oeko-Tex đầy đủ'),
(2, 1, 2, 'AT-POLO-NVY-M', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Xanh Navy / M)', 'Cái', 200.000, 200.000, 135000.00, 'Màu navy đều đẹp, đóng gói túi nilon trong suốt theo từng áo');

-- GRN 2: Nhập kho 400 Quần Jean Denim từ PO-003 tại Kho TP.HCM
INSERT INTO goods_receipt_notes (id, grn_code, po_id, po_code, supplier_name, warehouse_id, warehouse_name, receipt_date, status, notes, created_by, confirmed_by, confirmed_at) VALUES
(2, 'GRN-20260831-002', 3, 'PO-202609-003', 'Tổng Công ty Cổ phần Phong Phú (Phuphu Textile)', 2, 'Tổng Kho Thời Trang TP.HCM', '2026-08-31', 'CONFIRMED', 'Nhập lô Quần Jean Phong Phú đạt chuẩn kiểm định co giãn', 'wh_sg', 'director', '2026-08-31 16:45:00');

INSERT INTO goods_receipt_items (id, grn_id, product_id, product_sku, product_name, product_unit, ordered_quantity, received_quantity, unit_price, notes) VALUES
(3, 2, 8, 'QJ-SLIM-IND-31', 'Quần Jean Nam Slimfit Co Giãn Cao Cấp (Xanh Indigo / Size 31)', 'Cái', 250.000, 250.000, 240000.00, 'Kiểm đếm đủ 250 chiếc, chất vải mềm đúng mẫu cam kết'),
(4, 2, 9, 'QJ-STRAIGHT-BLK-32', 'Quần Jean Nam Ống Đứng Regular Cổ Điển (Đen Wash / Size 32)', 'Cái', 150.000, 150.000, 240000.00, 'Màu wash chuẩn, đinh tán và cúc đồng đầy đủ');

-- GRN 3: Nhập kho 500 Thắt Lưng Da từ PO-006 tại Kho Hà Nội
INSERT INTO goods_receipt_notes (id, grn_code, po_id, po_code, supplier_name, warehouse_id, warehouse_name, receipt_date, status, notes, created_by, confirmed_by, confirmed_at) VALUES
(3, 'GRN-20260905-003', 6, 'PO-202609-006', 'Công ty TNHH Da Thuộc & Phụ Kiện Nam Hưng', 1, 'Kho Tổng Thời Trang Hà Nội', '2026-09-05', 'CONFIRMED', 'Nhập lô thắt lưng da bò thật lớp 1', 'warehouse_user', 'admin', '2026-09-05 11:20:00');

INSERT INTO goods_receipt_items (id, grn_id, product_id, product_sku, product_name, product_unit, ordered_quantity, received_quantity, unit_price, notes) VALUES
(5, 3, 30, 'TL-DABO-BLK-120', 'Thắt Lưng Nam Da Bò Thật Khóa Tự Động (Đen / Bản 3.5cm)', 'Sợi', 500.000, 500.000, 110000.00, 'Mỗi sợi kèm hộp đựng cao cấp');

-- --------------------------------------------------------------------
-- 13. GOODS ISSUE NOTES & ITEMS (Phiếu Xuất Kho Bán Hàng)
-- --------------------------------------------------------------------

-- GIN 1: Xuất kho cho SO-001 (May Boutique)
INSERT INTO goods_issue_notes (id, gin_code, so_id, so_code, customer_name, warehouse_id, warehouse_name, issue_date, issue_type, status, notes, created_by, confirmed_by, confirmed_at) VALUES
(1, 'GIN-20260902-001', 1, 'SO-202609-001', 'Chuỗi Cửa Hàng Thời Trang May Boutique', 1, 'Kho Tổng Thời Trang Hà Nội', '2026-09-02', 'SALES_ORDER', 'CONFIRMED', 'Xuất kho giao xe tải Viettel Post giao cho chuỗi shop May Boutique', 'warehouse_user', 'admin', '2026-09-02 14:00:00');

INSERT INTO goods_issue_items (id, gin_id, product_id, product_sku, product_name, product_unit, requested_quantity, issued_quantity, notes) VALUES
(1, 1, 1, 'AT-POLO-WHT-L', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 'Cái', 50.000, 50.000, 'Đóng thùng carton 5 lớp dán băng keo niêm phong'),
(2, 1, 4, 'SM-OXFORD-BLU-M', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Xanh Pastel / M)', 'Cái', 30.000, 30.000, 'Treo mắc áo bọc màng nilon bảo quản chống nhăn'),
(3, 1, 8, 'QJ-SLIM-IND-31', 'Quần Jean Nam Slimfit Co Giãn Cao Cấp (Xanh Indigo / Size 31)', 'Cái', 30.000, 30.000, 'Gấp định hình chuẩn size 31 đóng gói 10 chiếc/túi'),
(4, 1, 17, 'AK-BLAZER-BE-M', 'Áo Blazer Nữ 2 Lớp Form Rộng Hàn Quốc (Màu Be / Size M)', 'Cái', 20.000, 20.000, 'Sử dụng túi trùm chống bụi chuyên dụng cao cấp');

-- GIN 2: Xuất kho cho SO-003 (Đồng phục FPT)
INSERT INTO goods_issue_notes (id, gin_code, so_id, so_code, customer_name, warehouse_id, warehouse_name, issue_date, issue_type, status, notes, created_by, confirmed_by, confirmed_at) VALUES
(2, 'GIN-20260907-002', 3, 'SO-202609-003', 'Công ty Cổ phần Đầu tư Công nghệ FPT', 1, 'Kho Tổng Thời Trang Hà Nội', '2026-09-07', 'SALES_ORDER', 'CONFIRMED', 'Xuất đồng phục đợt 1 bàn giao cho phòng Hành chính FPT', 'warehouse_user', 'director', '2026-09-07 10:00:00');

INSERT INTO goods_issue_items (id, gin_id, product_id, product_sku, product_name, product_unit, requested_quantity, issued_quantity, notes) VALUES
(5, 2, 1, 'AT-POLO-WHT-L', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 'Cái', 100.000, 100.000, 'Đóng gói chia theo phòng ban FPT'),
(6, 2, 2, 'AT-POLO-NVY-M', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Xanh Navy / M)', 'Cái', 100.000, 100.000, 'Đóng gói chia theo phòng ban FPT'),
(7, 2, 5, 'SM-OXFORD-WHT-L', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Trắng / L)', 'Cái', 50.000, 50.000, 'Sơ mi gấp hộp cao cấp');

-- GIN 3: Xuất kho cho SO-006 (Đồng phục Viettel)
INSERT INTO goods_issue_notes (id, gin_code, so_id, so_code, customer_name, warehouse_id, warehouse_name, issue_date, issue_type, status, notes, created_by, confirmed_by, confirmed_at) VALUES
(3, 'GIN-20260829-003', 6, 'SO-202609-006', 'Tập đoàn Viễn thông Quân đội Viettel (Đồng phục)', 1, 'Kho Tổng Thời Trang Hà Nội', '2026-08-29', 'SALES_ORDER', 'CONFIRMED', 'Bàn giao đồng phục Viettel tại Tòa nhà Viettel Mỹ Đình', 'warehouse_user', 'director', '2026-08-29 08:30:00');

INSERT INTO goods_issue_items (id, gin_id, product_id, product_sku, product_name, product_unit, requested_quantity, issued_quantity, notes) VALUES
(8, 3, 6, 'SM-BAMBOO-WHT-M', 'Áo Sơ Mi Nam Vải Sợi Tre Bamboo Kháng Khuẩn (Trắng Sữa / M)', 'Cái', 100.000, 100.000, 'Giao đủ 100 áo sơ mi sợi tre'),
(9, 3, 11, 'QT-SLIM-BLK-31', 'Quần Âu Nam Công Sở Co Giãn Form Hàn Quốc (Đen / Size 31)', 'Cái', 100.000, 100.000, 'Giao đủ 100 quần âu đen form Hàn Quốc');

SET FOREIGN_KEY_CHECKS = 1;
