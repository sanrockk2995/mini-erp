-- ====================================================================
-- MINI-ERP CLOTHING & APPAREL SEED DATA (MySQL 8+)
-- Database: erp_db
-- Hệ thống Quản trị Doanh nghiệp Dệt may & Bán lẻ Thời trang
-- Kiến trúc: Core-FK & Flat Read Model (Tối ưu hợp nhất 18 bảng)
-- Mật khẩu mặc định toàn hệ thống: 123456
-- ====================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

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

-- Users (Mật khẩu: 123456 -> BCrypt hash)
INSERT INTO users (id, username, email, password_hash, full_name, phone, role, permissions, status) VALUES
(1, 'admin', 'admin@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Nguyễn Quản Trị', '0901234567', 'ADMIN', 'PRODUCT_VIEW,PRODUCT_MANAGE,PRICELIST_MANAGE,CUSTOMER_VIEW,CUSTOMER_MANAGE,SO_CREATE,SO_APPROVE,SO_CANCEL,SUPPLIER_VIEW,SUPPLIER_MANAGE,PO_CREATE,PO_APPROVE,DEBT_VIEW,PAYMENT_CREATE,STOCK_VIEW,GRN_MANAGE,GIN_MANAGE,DASHBOARD_VIEW', 'ACTIVE'),
(2, 'sales_user', 'sales@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Trần Thu Thảo', '0912345678', 'SALES', 'PRODUCT_VIEW,CUSTOMER_VIEW,CUSTOMER_MANAGE,SO_CREATE,SO_CANCEL,STOCK_VIEW,DASHBOARD_VIEW', 'ACTIVE'),
(3, 'purchase_user', 'purchase@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Lê Hoàng Nam', '0923456789', 'PURCHASING', 'PRODUCT_VIEW,SUPPLIER_VIEW,SUPPLIER_MANAGE,PO_CREATE,STOCK_VIEW,DASHBOARD_VIEW', 'ACTIVE'),
(4, 'warehouse_user', 'warehouse@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Phạm Quốc Bảo', '0934567890', 'WAREHOUSE', 'PRODUCT_VIEW,STOCK_VIEW,GRN_MANAGE,GIN_MANAGE,DASHBOARD_VIEW', 'ACTIVE'),
(5, 'accountant_user', 'accountant@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Vũ Mai Hương', '0945678901', 'ACCOUNTANT', 'CUSTOMER_VIEW,SUPPLIER_VIEW,DEBT_VIEW,PAYMENT_CREATE,DASHBOARD_VIEW', 'ACTIVE'),
(10, 'sales', 'sales_alias@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Trần Thu Thảo', '0912345678', 'SALES', 'PRODUCT_VIEW,CUSTOMER_VIEW,CUSTOMER_MANAGE,SO_CREATE,SO_CANCEL,STOCK_VIEW,DASHBOARD_VIEW', 'ACTIVE'),
(11, 'purchasing', 'purchasing_alias@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Lê Hoàng Nam', '0923456789', 'PURCHASING', 'PRODUCT_VIEW,SUPPLIER_VIEW,SUPPLIER_MANAGE,PO_CREATE,STOCK_VIEW,DASHBOARD_VIEW', 'ACTIVE'),
(12, 'warehouse', 'warehouse_alias@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Phạm Quốc Bảo', '0934567890', 'WAREHOUSE', 'PRODUCT_VIEW,STOCK_VIEW,GRN_MANAGE,GIN_MANAGE,DASHBOARD_VIEW', 'ACTIVE');

-- --------------------------------------------------------------------
-- 2. WAREHOUSES (Hệ thống Kho Dệt may & Thành phẩm)
-- --------------------------------------------------------------------

INSERT INTO warehouses (id, code, name, address, manager_name, phone, is_active) VALUES
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 'Lô 12 KCN Dệt May Phố Nối, Hưng Yên - Hà Nội', 'Phạm Quốc Bảo', '0934567890', 1),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 'Đường số 3 KCN Tân Bình, Tây Thạnh, Tân Phú, TP.HCM', 'Vũ Nam Kho', '0988776655', 1),
(3, 'WH-DN-01', 'Kho Trung Chuyển Miền Trung', 'Khu công nghiệp Hòa Khánh, Liên Chiểu, Đà Nẵng', 'Đặng Trung Kho', '0977665544', 1);

-- --------------------------------------------------------------------
-- 3. CATEGORIES (Danh mục Thời trang đa cấp)
-- --------------------------------------------------------------------

INSERT INTO categories (id, code, name, parent_id, sort_order, is_active) VALUES
(1, 'MEN', 'Thời Trang Nam', NULL, 1, 1),
(2, 'WOMEN', 'Thời Trang Nữ', NULL, 2, 1),
(3, 'UNISEX', 'Thời Trang Unisex & Streetwear', NULL, 3, 1),
(4, 'ACCESSORIES', 'Phụ Kiện Thời Trang', NULL, 4, 1),
(5, 'POLO-MEN', 'Áo Thun & Áo Polo Nam', 1, 1, 1),
(6, 'SHIRT-MEN', 'Áo Sơ Mi Nam Công Sở', 1, 2, 1),
(7, 'JEANS-MEN', 'Quần Jean & Quần Kaki Nam', 1, 3, 1),
(8, 'PANTS-MEN', 'Quần Tây & Quần Âu Nam', 1, 4, 1),
(9, 'DRESS-WOMEN', 'Váy Đầm Liền & Thiết Kế', 2, 1, 1),
(10, 'BLAZER-WOMEN', 'Áo Blazer & Áo Khoác Nữ', 2, 2, 1),
(11, 'SKIRT-WOMEN', 'Chân Váy & Quần Nữ', 2, 3, 1),
(12, 'HOODIE-UNISEX', 'Áo Hoodie & Sweater Nỉ', 3, 1, 1),
(13, 'LEATHER-ACC', 'Thắt Lưng & Ví Da Thật', 4, 1, 1);

-- --------------------------------------------------------------------
-- 4. PRODUCTS (Sản phẩm Thời trang Hợp nhất Thuộc tính & Giá sỉ)
-- Gộp color, size, material, wholesale_price trực tiếp vào bảng products
-- --------------------------------------------------------------------

INSERT INTO products (id, sku, barcode, name, category_id, category_name, unit, color, size, material, standard_cost, standard_price, wholesale_price, description, is_active) VALUES
(1, 'AT-POLO-WHT-L', '8936012340011', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 5, 'Áo Thun & Áo Polo Nam', 'Cái', 'Trắng Tinh', 'Size L (68 - 75kg)', '100% Pique Cotton USA', 135000.00, 299000.00, 210000.00, 'Chất vải Pique cá sấu 100% Cotton chải kỹ, bo cổ dệt tổ ong giữ form, công nghệ kháng khuẩn khử mùi vượt trội', 1),
(2, 'AT-POLO-NVY-M', '8936012340028', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Xanh Navy / M)', 5, 'Áo Thun & Áo Polo Nam', 'Cái', 'Xanh Navy Đậm', 'Size M (58 - 67kg)', '100% Pique Cotton USA', 135000.00, 299000.00, 210000.00, 'Màu xanh navy thanh lịch tôn da, thấm hút mồ hôi tối đa, đường may móc xích đôi tiêu chuẩn xuất khẩu', 1),
(3, 'SM-OXFORD-BLU-M', '8936012340035', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Xanh Pastel / M)', 6, 'Áo Sơ Mi Nam Công Sở', 'Cái', 'Xanh Nhạt Pastel', 'Size M', 'Oxford Cotton 80s', 195000.00, 420000.00, 295000.00, 'Vải Oxford 80s dệt chéo cao cấp, xử lý chống nhăn Easy-Iron, cúc xà cừ khắc laser tinh xảo', 1),
(4, 'SM-LINEN-WHT-L', '8936012340042', 'Áo Sơ Mi Nam Cổ Tàu Vải Đũi Linen (Trắng Sữa / L)', 6, 'Áo Sơ Mi Nam Công Sở', 'Cái', 'Trắng Sữa', 'Size L', '100% Linen Dệt Thô', 180000.00, 390000.00, 275000.00, '100% Linen dệt tự nhiên thoáng mát, cổ trụ thanh lịch phong cách Smart Casual phóng khoáng', 1),
(5, 'QJ-SLIM-IND-31', '8936012340059', 'Quần Jean Nam Slimfit Co Giãn Cao Cấp (Xanh Indigo / Size 31)', 7, 'Quần Jean & Quần Kaki Nam', 'Cái', 'Xanh Chàm Indigo', 'Size 31', 'Denim 12oz Spandex', 240000.00, 550000.00, 385000.00, 'Vải Denim Cotton 12oz pha 2% Spandex co giãn 4 chiều, wash màu enzyme vintage thời thượng', 1),
(6, 'QT-WOOL-GRY-32', '8936012340066', 'Quần Tây Nam Dáng Đứng Xếp Ly Wool Blend (Ghi Xám / Size 32)', 8, 'Quần Tây & Quần Âu Nam', 'Cái', 'Ghi Xám Chuẩn', 'Size 32 (Vòng eo 82cm)', 'Wool Blend 60% Len', 260000.00, 580000.00, 410000.00, 'Chất liệu Wool Blend pha len đứng form, lưng chun thông minh co giãn tăng giảm 3cm vòng eo êm ái', 1),
(7, 'DV-HOANHI-BE-S', '8936012340073', 'Đầm Voan Hoa Nhí Cổ Vuông Dáng Xòe (Họa Tiết Be / Size S)', 9, 'Váy Đầm Liền & Thiết Kế', 'Cái', 'Hoa Nhí Nền Be', 'Size S (42 - 48kg)', 'Tơ Voan Hàn Quốc', 280000.00, 650000.00, 455000.00, 'Chất tơ voan Hàn Quốc 2 lớp mềm mại bay bổng, cổ vuông tiểu thư tôn xương quai xanh', 1),
(8, 'DV-SATIN-RED-M', '8936012340080', 'Đầm Dạ Hội Lụa Satin Dáng Ôm Xẻ Tà (Đỏ Ruby / Size M)', 9, 'Váy Đầm Liền & Thiết Kế', 'Cái', 'Đỏ Ruby Quý Phái', 'Size M (49 - 55kg)', 'Lụa Satin Cao Cấp', 420000.00, 950000.00, 665000.00, 'Lụa Satin dệt sợi bóng mượt óng ả, cắt cúp tôn eo thon, xẻ tà quyến rũ cho tiệc tối sang trọng', 1),
(9, 'AK-BLAZER-BE-M', '8936012340097', 'Áo Blazer Nữ 2 Lớp Form Rộng Hàn Quốc (Màu Be / Size M)', 10, 'Áo Blazer & Áo Khoác Nữ', 'Cái', 'Màu Be Hạnh Nhân', 'Size M Form Rộng', 'Tuyết Mưa Hàn Quốc', 350000.00, 790000.00, 550000.00, 'Vải Tuyết Mưa dệt chéo 2 lớp lót lụa habutai, đệm vai tinh tế, chuẩn phong cách công sở trẻ trung hiện đại', 1),
(10, 'CV-XEP-LY-BLK-S', '8936012340103', 'Chân Váy Chữ A Xếp Ly Lưng Cao (Đen / Size S)', 11, 'Chân Váy & Quần Nữ', 'Cái', 'Đen Tuyền', 'Size S', 'Kaki Tuyết Mưa', 140000.00, 320000.00, 225000.00, 'Chất kaki tuyết mưa giữ nếp ly sắc nét sau giặt, cạp lưng cao tôn dáng che khuyết điểm vòng 2', 1),
(11, 'HD-HEAVY-GRY-XL', '8936012340110', 'Áo Hoodie Unisex Nỉ Chân Cua 380gsm (Xám Tiêu / Size XL)', 12, 'Áo Hoodie & Sweater Nỉ', 'Cái', 'Xám Tiêu Melange', 'Size XL (Streetwear Form)', 'Nỉ Chân Cua 380gsm', 210000.00, 480000.00, 335000.00, 'Vải nỉ chân cua 100% Cotton định lượng 380gsm siêu dày dặn, mũ 2 lớp đứng form chuẩn Streetwear', 1),
(12, 'TL-DABO-BLK-120', '8936012340127', 'Thắt Lưng Nam Da Bò Thật Khóa Tự Động (Đen / Bản 3.5cm)', 13, 'Thắt Lưng & Ví Da Thật', 'Sợi', 'Đen Bóng Nhẹ', 'Bản 3.5cm - 120cm', 'Da Bò Mill Lớp 1', 110000.00, 260000.00, 180000.00, 'Da bò Mill nguyên tấm dẻo dai không nứt gãy, đầu khóa hợp kim carbon chống xước gạt tự động tiện lợi', 1);

-- --------------------------------------------------------------------
-- 5. CUSTOMERS (Khách hàng Hợp nhất Nhóm & Chiết khấu)
-- Tích hợp group_name và discount_percent trực tiếp vào bảng customers
-- --------------------------------------------------------------------

INSERT INTO customers (id, code, name, customer_type, phone, email, address, tax_code, group_name, discount_percent, is_active) VALUES
(1, 'CUST-001', 'Nguyễn Thùy Linh', 'INDIVIDUAL', '0912334455', 'thuylinh.fashion@gmail.com', 'Căn hộ 12B Landmark 81, P. 22, Bình Thạnh, TP.HCM', NULL, 'Khách Hàng Thân Thiết VIP', 10.00, 1),
(2, 'CUST-002', 'Chuỗi Cửa Hàng Thời Trang May Boutique', 'BUSINESS', '0283998877', 'contact@mayboutique.vn', 'Số 245 Cầu Giấy, P. Dịch Vọng, Q. Cầu Giấy, Hà Nội', '0108997766', 'Đại Lý Phân Phối & Chuỗi Shop', 25.00, 1),
(3, 'CUST-003', 'Công ty Cổ phần Đầu tư Công nghệ FPT', 'BUSINESS', '02473007300', 'procurement@fpt.com.vn', 'Tòa nhà FPT, Phố Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội', '0101248141', 'Doanh Nghiệp Đặt May Đồng Phục', 20.00, 1),
(4, 'CUST-004', 'Hoàng Minh Tuấn', 'INDIVIDUAL', '0987654321', 'tuan.hoang88@yahoo.com', 'Số 88 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM', NULL, 'Khách Hàng Mua Lẻ', 0.00, 1);

-- --------------------------------------------------------------------
-- 6. SUPPLIERS (Nhà cung cấp Dệt may, Phụ liệu & Đánh giá/Xếp hạng tập trung)
-- --------------------------------------------------------------------

INSERT INTO suppliers (id, code, name, phone, email, address, tax_code, product_groups, quality_score, delivery_score, price_score, rating_score, rating_tier, review_date, review_notes, is_active) VALUES
(1, 'SUPP-HANOSIMEX', 'Tổng Công ty Cổ phần Dệt May Hà Nội (Hanosimex)', '02438621456', 'sales@hanosimex.com.vn', 'Tầng 8 Tòa nhà Nam Hải Lakeview, KĐT Vĩnh Hoàng, Hoàng Mai, Hà Nội', '0100100874', 'Vải dệt kim, Áo thun, Vải Pique Cotton', 9.5, 9.5, 9.5, 9.5, 'A', '2026-08-15', 'Chất lượng vải Pique Cotton rất đồng đều, sợi chải kỹ không bai xù, giao hàng đúng tiến độ', 1),
(2, 'SUPP-MAY10', 'Tổng Công ty May 10 - CTCP', '02438276923', 'kinhdoanh@garco10.com.vn', 'Số 765 Nguyễn Văn Linh, Sài Đồng, Long Biên, Hà Nội', '0100101308', 'Áo sơ mi, Veston, Quần âu cao cấp', 9.8, 9.5, 9.5, 9.6, 'A', '2026-08-20', 'Gia công sơ mi đường kim mũi chỉ tỉ mỉ chuẩn xuất khẩu Châu Âu, chứng chỉ Oeko-Tex đạt chuẩn', 1),
(3, 'SUPP-PHONGPHU', 'Tổng Công ty Cổ phần Phong Phú (Phuphu Textile)', '02838963533', 'info@phongphucorp.com', 'Số 48 Tăng Nhơn Phú, Phường Tăng Nhơn Phú B, TP. Thủ Đức, TP.HCM', '0300452912', 'Vải Denim Jean, Kaki tuyết mưa, Vải nỉ', 9.0, 9.0, 9.0, 9.0, 'A', '2026-08-25', 'Vải Denim co giãn tốt, màu wash chuẩn mẫu thiết kế, hỗ trợ công nợ 30 ngày linh hoạt', 1),
(4, 'SUPP-PHULIEU', 'Công ty TNHH Phụ Liệu May Mặc Tân Bình', '02838641122', 'order@phulieumay.vn', 'Số 15 Lý Thường Kiệt, Phường 7, Quận Tân Bình, TP.HCM', '0312456789', 'Khóa kéo YKK, Cúc áo xà cừ, Thắt lưng da, Nhãn dệt', 8.5, 8.0, 8.0, 8.2, 'B', '2026-08-28', 'Khóa kéo YKK chính hãng, cúc áo đều đẹp, thời gian giao hàng đôi khi chậm 1 ngày', 1);

-- --------------------------------------------------------------------
-- 7. INVENTORY & STOCK LEDGER (Tồn kho Thời trang đầu kỳ)
-- Tích hợp warehouse_name, product_sku, product_name để truy vấn 0-JOIN
-- --------------------------------------------------------------------

INSERT INTO inventory (warehouse_id, warehouse_code, warehouse_name, product_id, product_sku, product_name, product_unit, quantity_on_hand, quantity_reserved, quantity_available) VALUES
-- Kho Tổng Hà Nội (warehouse 1)
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 1, 'AT-POLO-WHT-L', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 'Cái', 250.000, 20.000, 230.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 2, 'AT-POLO-NVY-M', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Xanh Navy / M)', 'Cái', 200.000, 15.000, 185.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 3, 'SM-OXFORD-BLU-M', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Xanh Pastel / M)', 'Cái', 180.000, 10.000, 170.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 4, 'SM-LINEN-WHT-L', 'Áo Sơ Mi Nam Cổ Tàu Vải Đũi Linen (Trắng Sữa / L)', 'Cái', 150.000, 5.000, 145.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 5, 'QJ-SLIM-IND-31', 'Quần Jean Nam Slimfit Co Giãn Cao Cấp (Xanh Indigo / Size 31)', 'Cái', 220.000, 25.000, 195.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 6, 'QT-WOOL-GRY-32', 'Quần Tây Nam Dáng Đứng Xếp Ly Wool Blend (Ghi Xám / Size 32)', 'Cái', 160.000, 10.000, 150.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 7, 'DV-HOANHI-BE-S', 'Đầm Voan Hoa Nhí Cổ Vuông Dáng Xòe (Họa Tiết Be / Size S)', 'Cái', 90.000, 8.000, 82.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 8, 'DV-SATIN-RED-M', 'Đầm Dạ Hội Lụa Satin Dáng Ôm Xẻ Tà (Đỏ Ruby / Size M)', 'Cái', 50.000, 4.000, 46.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 9, 'AK-BLAZER-BE-M', 'Áo Blazer Nữ 2 Lớp Form Rộng Hàn Quốc (Màu Be / Size M)', 'Cái', 120.000, 12.000, 108.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 10, 'CV-XEP-LY-BLK-S', 'Chân Váy Chữ A Xếp Ly Lưng Cao (Đen / Size S)', 'Cái', 140.000, 10.000, 130.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 11, 'HD-HEAVY-GRY-XL', 'Áo Hoodie Unisex Nỉ Chân Cua 380gsm (Xám Tiêu / Size XL)', 'Cái', 180.000, 15.000, 165.000),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 12, 'TL-DABO-BLK-120', 'Thắt Lưng Nam Da Bò Thật Khóa Tự Động (Đen / Bản 3.5cm)', 'Sợi', 300.000, 20.000, 280.000),
-- Kho TP.HCM (warehouse 2)
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 1, 'AT-POLO-WHT-L', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 'Cái', 180.000, 0.000, 180.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 2, 'AT-POLO-NVY-M', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Xanh Navy / M)', 'Cái', 150.000, 0.000, 150.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 3, 'SM-OXFORD-BLU-M', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Xanh Pastel / M)', 'Cái', 120.000, 0.000, 120.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 5, 'QJ-SLIM-IND-31', 'Quần Jean Nam Slimfit Co Giãn Cao Cấp (Xanh Indigo / Size 31)', 'Cái', 140.000, 0.000, 140.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 7, 'DV-HOANHI-BE-S', 'Đầm Voan Hoa Nhí Cổ Vuông Dáng Xòe (Họa Tiết Be / Size S)', 'Cái', 70.000, 0.000, 70.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 9, 'AK-BLAZER-BE-M', 'Áo Blazer Nữ 2 Lớp Form Rộng Hàn Quốc (Màu Be / Size M)', 'Cái', 80.000, 0.000, 80.000),
(2, 'WH-SG-01', 'Tổng Kho Thời Trang TP.HCM', 12, 'TL-DABO-BLK-120', 'Thắt Lưng Nam Da Bò Thật Khóa Tự Động (Đen / Bản 3.5cm)', 'Sợi', 200.000, 0.000, 200.000);

-- Ghi nhận số dư ban đầu vào Sổ cái kho (Stock Ledger)
INSERT INTO stock_ledger (warehouse_id, warehouse_code, warehouse_name, product_id, product_sku, product_name, reference_type, reference_code, transaction_type, quantity, balance_after, unit_cost, notes, created_by) VALUES
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 1, 'AT-POLO-WHT-L', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 250.000, 250.000, 135000.00, 'Tồn kho đầu kỳ Áo Polo Trắng L', 'admin'),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 2, 'AT-POLO-NVY-M', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Xanh Navy / M)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 200.000, 200.000, 135000.00, 'Tồn kho đầu kỳ Áo Polo Xanh Navy M', 'admin'),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 3, 'SM-OXFORD-BLU-M', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Xanh Pastel / M)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 180.000, 180.000, 195000.00, 'Tồn kho đầu kỳ Sơ Mi Oxford Dài Tay', 'admin'),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 4, 'SM-LINEN-WHT-L', 'Áo Sơ Mi Nam Cổ Tàu Vải Đũi Linen (Trắng Sữa / L)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 150.000, 150.000, 180000.00, 'Tồn kho đầu kỳ Sơ Mi Linen Cổ Tàu', 'admin'),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 5, 'QJ-SLIM-IND-31', 'Quần Jean Nam Slimfit Co Giãn Cao Cấp (Xanh Indigo / Size 31)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 220.000, 220.000, 240000.00, 'Tồn kho đầu kỳ Quần Jean Slimfit', 'admin'),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 6, 'QT-WOOL-GRY-32', 'Quần Tây Nam Dáng Đứng Xếp Ly Wool Blend (Ghi Xám / Size 32)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 160.000, 160.000, 260000.00, 'Tồn kho đầu kỳ Quần Tây Wool Blend', 'admin'),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 7, 'DV-HOANHI-BE-S', 'Đầm Voan Hoa Nhí Cổ Vuông Dáng Xòe (Họa Tiết Be / Size S)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 90.000, 90.000, 280000.00, 'Tồn kho đầu kỳ Đầm Voan Hoa Nhí', 'admin'),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 8, 'DV-SATIN-RED-M', 'Đầm Dạ Hội Lụa Satin Dáng Ôm Xẻ Tà (Đỏ Ruby / Size M)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 50.000, 50.000, 420000.00, 'Tồn kho đầu kỳ Đầm Dạ Hội Lụa Satin', 'admin'),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 9, 'AK-BLAZER-BE-M', 'Áo Blazer Nữ 2 Lớp Form Rộng Hàn Quốc (Màu Be / Size M)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 120.000, 120.000, 350000.00, 'Tồn kho đầu kỳ Áo Blazer Nữ 2 Lớp', 'admin'),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 10, 'CV-XEP-LY-BLK-S', 'Chân Váy Chữ A Xếp Ly Lưng Cao (Đen / Size S)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 140.000, 140.000, 140000.00, 'Tồn kho đầu kỳ Chân Váy Xếp Ly Chữ A', 'admin'),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 11, 'HD-HEAVY-GRY-XL', 'Áo Hoodie Unisex Nỉ Chân Cua 380gsm (Xám Tiêu / Size XL)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 180.000, 180.000, 210000.00, 'Tồn kho đầu kỳ Áo Hoodie Nỉ Chân Cua', 'admin'),
(1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', 12, 'TL-DABO-BLK-120', 'Thắt Lưng Nam Da Bò Thật Khóa Tự Động (Đen / Bản 3.5cm)', 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 300.000, 300.000, 110000.00, 'Tồn kho đầu kỳ Thắt Lưng Da Bò', 'admin');

-- --------------------------------------------------------------------
-- 8. SALES ORDERS (Đơn Bán hàng Thời trang Hợp nhất Nhật ký Trạng thái)
-- Gộp status_history JSON trực tiếp vào bảng sales_orders
-- --------------------------------------------------------------------

-- Đơn 1: Xuất sỉ cho Chuỗi May Boutique (Đã hoàn thành)
INSERT INTO sales_orders (id, order_code, customer_id, customer_code, customer_name, customer_phone, warehouse_id, warehouse_code, warehouse_name, order_date, subtotal, tax_amount, discount_amount, total_amount, status, status_history, created_by, approved_by, approved_at, notes) VALUES
(1, 'SO-202609-001', 2, 'CUST-002', 'Chuỗi Cửa Hàng Thời Trang May Boutique', '0283998877', 1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', '2026-09-05', 47350000.00, 4735000.00, 11837500.00, 40247500.00, 'COMPLETED',
'[{"fromStatus":null,"toStatus":"DRAFT","note":"Tạo mới đơn đặt hàng sỉ","changedBy":"sales_user","changedAt":"2026-09-05 09:15:00"},{"fromStatus":"DRAFT","toStatus":"APPROVED","note":"Quản lý bán hàng phê duyệt chiết khấu 25%","changedBy":"admin","changedAt":"2026-09-05 10:30:00"},{"fromStatus":"APPROVED","toStatus":"DELIVERING","note":"Thủ kho xuất hàng cho bên vận chuyển","changedBy":"warehouse_user","changedAt":"2026-09-05 14:00:00"},{"fromStatus":"DELIVERING","toStatus":"COMPLETED","note":"Khách hàng nhận đủ hàng và thanh toán chuyển khoản","changedBy":"sales_user","changedAt":"2026-09-06 16:30:00"}]',
'sales_user', 'admin', '2026-09-05 10:30:00', 'Đơn xuất sỉ quần áo cho chuỗi cửa hàng May Boutique đợt đầu tháng 9');

INSERT INTO sales_order_items (sales_order_id, product_id, product_sku, product_name, product_unit, quantity, unit_price, discount_percent, line_total) VALUES
(1, 1, 'AT-POLO-WHT-L', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 'Cái', 50.000, 299000.00, 25.00, 11212500.00),
(1, 3, 'SM-OXFORD-BLU-M', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Xanh Pastel / M)', 'Cái', 30.000, 420000.00, 25.00, 9450000.00),
(1, 5, 'QJ-SLIM-IND-31', 'Quần Jean Nam Slimfit Co Giãn Cao Cấp (Xanh Indigo / Size 31)', 'Cái', 30.000, 550000.00, 25.00, 12375000.00),
(1, 9, 'AK-BLAZER-BE-M', 'Áo Blazer Nữ 2 Lớp Form Rộng Hàn Quốc (Màu Be / Size M)', 'Cái', 20.000, 790000.00, 25.00, 11850000.00);

-- Đơn 2: Bán lẻ cho Khách VIP Nguyễn Thùy Linh (Đã duyệt)
INSERT INTO sales_orders (id, order_code, customer_id, customer_code, customer_name, customer_phone, warehouse_id, warehouse_code, warehouse_name, order_date, subtotal, tax_amount, discount_amount, total_amount, status, status_history, created_by, approved_by, approved_at, notes) VALUES
(2, 'SO-202609-002', 1, 'CUST-001', 'Nguyễn Thùy Linh', '0912334455', 1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', '2026-09-10', 1740000.00, 174000.00, 174000.00, 1740000.00, 'APPROVED',
'[{"fromStatus":null,"toStatus":"DRAFT","note":"Tạo mới đơn bán lẻ","changedBy":"sales_user","changedAt":"2026-09-10 13:50:00"},{"fromStatus":"DRAFT","toStatus":"APPROVED","note":"Áp dụng chiết khấu VIP 10% thành công","changedBy":"admin","changedAt":"2026-09-10 14:20:00"}]',
'sales_user', 'admin', '2026-09-10 14:20:00', 'Khách VIP mua trực tiếp set Blazer và Đầm dự tiệc');

INSERT INTO sales_order_items (sales_order_id, product_id, product_sku, product_name, product_unit, quantity, unit_price, discount_percent, line_total) VALUES
(2, 8, 'DV-SATIN-RED-M', 'Đầm Dạ Hội Lụa Satin Dáng Ôm Xẻ Tà (Đỏ Ruby / Size M)', 'Cái', 1.000, 950000.00, 10.00, 855000.00),
(2, 9, 'AK-BLAZER-BE-M', 'Áo Blazer Nữ 2 Lớp Form Rộng Hàn Quốc (Màu Be / Size M)', 'Cái', 1.000, 790000.00, 10.00, 711000.00);

-- --------------------------------------------------------------------
-- 9. PURCHASE ORDERS & DEBTS (Đơn đặt mua Dệt may & Công nợ NCC Hợp nhất)
-- Gộp thanh toán trực tiếp vào supplier_debts
-- --------------------------------------------------------------------

-- Đơn mua 1: Đặt gia công 500 Áo Polo Nam từ Hanosimex (Đã nhận hàng)
INSERT INTO purchase_orders (id, po_code, supplier_id, supplier_code, supplier_name, warehouse_id, warehouse_code, warehouse_name, order_date, expected_date, subtotal, tax_amount, total_amount, status, created_by, approved_by, approved_at, notes) VALUES
(1, 'PO-202609-001', 1, 'SUPP-HANOSIMEX', 'Tổng Công ty Cổ phần Dệt May Hà Nội (Hanosimex)', 1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', '2026-09-01', '2026-09-04', 67500000.00, 6750000.00, 74250000.00, 'RECEIVED', 'purchase_user', 'admin', '2026-09-01 16:00:00', 'Đơn đặt may gia công lô 500 Áo Polo Cotton Pique từ Hanosimex');

INSERT INTO purchase_order_items (purchase_order_id, product_id, product_sku, product_name, product_unit, quantity, unit_price, line_total) VALUES
(1, 1, 'AT-POLO-WHT-L', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 'Cái', 300.000, 135000.00, 40500000.00),
(1, 2, 'AT-POLO-NVY-M', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Xanh Navy / M)', 'Cái', 200.000, 135000.00, 27000000.00);

-- Công nợ phát sinh từ PO-001 kèm thông tin thanh toán đã gộp
INSERT INTO supplier_debts (id, po_id, po_code, supplier_id, supplier_code, supplier_name, invoice_code, debt_date, due_date, total_amount, paid_amount, remaining_amount, status, payment_method, payment_reference, last_payment_date, payment_notes, paid_by) VALUES
(1, 1, 'PO-202609-001', 1, 'SUPP-HANOSIMEX', 'Tổng Công ty Cổ phần Dệt May Hà Nội (Hanosimex)', 'INV-HNX-202609-01', '2026-09-04', '2026-09-30', 74250000.00, 40000000.00, 34250000.00, 'PARTIAL', 'BANK_TRANSFER', 'VCB202609068899', '2026-09-06', 'Thanh toán đợt 1 tiền gia công lô áo Polo Hanosimex', 'accountant_user');

-- Đơn mua 2: Đặt may 200 Áo Sơ Mi Oxford từ Tổng Công ty May 10 (Đã duyệt)
INSERT INTO purchase_orders (id, po_code, supplier_id, supplier_code, supplier_name, warehouse_id, warehouse_code, warehouse_name, order_date, expected_date, subtotal, tax_amount, total_amount, status, created_by, approved_by, approved_at, notes) VALUES
(2, 'PO-202609-002', 2, 'SUPP-MAY10', 'Tổng Công ty May 10 - CTCP', 1, 'WH-HN-01', 'Kho Tổng Thời Trang Hà Nội', '2026-09-08', '2026-09-18', 39000000.00, 3900000.00, 42900000.00, 'APPROVED', 'purchase_user', 'admin', '2026-09-08 11:30:00', 'Đơn đặt may 200 Áo Sơ Mi Nam Oxford dệt chéo từ May 10');

INSERT INTO purchase_order_items (purchase_order_id, product_id, product_sku, product_name, product_unit, quantity, unit_price, line_total) VALUES
(2, 3, 'SM-OXFORD-BLU-M', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Xanh Pastel / M)', 'Cái', 200.000, 195000.00, 39000000.00);

-- --------------------------------------------------------------------
-- 10. GOODS RECEIPTS & GOODS ISSUES (Phiếu nhập kho & Phiếu xuất kho)
-- --------------------------------------------------------------------

-- Phiếu nhập kho từ PO-001
INSERT INTO goods_receipt_notes (id, grn_code, po_id, po_code, supplier_name, warehouse_id, warehouse_name, receipt_date, status, notes, created_by, confirmed_by, confirmed_at) VALUES
(1, 'GRN-20260904-001', 1, 'PO-202609-001', 'Tổng Công ty Cổ phần Dệt May Hà Nội (Hanosimex)', 1, 'Kho Tổng Thời Trang Hà Nội', '2026-09-04', 'CONFIRMED', 'Nhập đủ 500 áo Polo theo hợp đồng may đo gia công', 'warehouse_user', 'admin', '2026-09-04 15:30:00');

INSERT INTO goods_receipt_items (grn_id, product_id, product_sku, product_name, product_unit, ordered_quantity, received_quantity, unit_price, notes) VALUES
(1, 1, 'AT-POLO-WHT-L', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 'Cái', 300.000, 300.000, 135000.00, 'Nguyên kiện, chuẩn tem mác Oeko-Tex'),
(1, 2, 'AT-POLO-NVY-M', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Xanh Navy / M)', 'Cái', 200.000, 200.000, 135000.00, 'Nguyên kiện, màu sắc đồng đều');

-- Phiếu xuất kho cho SO-001
INSERT INTO goods_issue_notes (id, gin_code, so_id, so_code, customer_name, warehouse_id, warehouse_name, issue_date, issue_type, status, notes, created_by, confirmed_by, confirmed_at) VALUES
(1, 'GIN-20260905-001', 1, 'SO-202609-001', 'Chuỗi Cửa Hàng Thời Trang May Boutique', 1, 'Kho Tổng Thời Trang Hà Nội', '2026-09-05', 'SALES_ORDER', 'CONFIRMED', 'Xuất kho giao cho đơn vị vận chuyển Viettel Post', 'warehouse_user', 'admin', '2026-09-05 14:00:00');

INSERT INTO goods_issue_items (gin_id, product_id, product_sku, product_name, product_unit, requested_quantity, issued_quantity, notes) VALUES
(1, 1, 'AT-POLO-WHT-L', 'Áo Polo Nam Pique Cotton Kháng Khuẩn (Trắng / L)', 'Cái', 50.000, 50.000, 'Đóng thùng carton 5 lớp'),
(1, 3, 'SM-OXFORD-BLU-M', 'Áo Sơ Mi Nam Oxford Dài Tay Chống Nhăn (Xanh Pastel / M)', 'Cái', 30.000, 30.000, 'Treo mắc áo bọc nilon bảo quản'),
(1, 5, 'QJ-SLIM-IND-31', 'Quần Jean Nam Slimfit Co Giãn Cao Cấp (Xanh Indigo / Size 31)', 'Cái', 30.000, 30.000, 'Gấp định hình chuẩn size'),
(1, 9, 'AK-BLAZER-BE-M', 'Áo Blazer Nữ 2 Lớp Form Rộng Hàn Quốc (Màu Be / Size M)', 'Cái', 20.000, 20.000, 'Túi trùm chống bụi chuyên dụng');

SET FOREIGN_KEY_CHECKS = 1;
