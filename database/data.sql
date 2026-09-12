-- ====================================================================
-- SMART MINI-ERP INITIAL DATA SEED (MySQL 8+)
-- Database: erp_db
-- ====================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
INSERT INTO roles (id, code, name, description) VALUES
(1, 'ADMIN', 'Quản trị hệ thống', 'Toàn quyền cấu hình và quản lý mọi phân hệ'),
(2, 'SALES', 'Nhân viên bán hàng', 'Tạo và quản lý đơn bán hàng, khách hàng, xem bảng giá'),
(3, 'PURCHASING', 'Nhân viên mua hàng', 'Quản lý nhà cung cấp, lập và theo dõi đơn mua hàng PO'),
(4, 'WAREHOUSE', 'Thủ kho', 'Quản lý xuất nhập kho, kiểm tra tồn kho, xác nhận phiếu xuất/nhập'),
(5, 'ACCOUNTANT', 'Kế toán', 'Quản lý công nợ, duyệt thanh toán cho nhà cung cấp, báo cáo tài chính');

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
(14, 'PAYMENT_CREATE', 'Lập phiếu chi/thanh toán NCC', 'FINANCE'),
(15, 'STOCK_VIEW', 'Xem tồn kho & sổ cái kho', 'WAREHOUSE'),
(16, 'GRN_MANAGE', 'Nhập kho hàng hóa', 'WAREHOUSE'),
(17, 'GIN_MANAGE', 'Xuất kho hàng hóa', 'WAREHOUSE'),
(18, 'DASHBOARD_VIEW', 'Xem báo cáo thống kê Dashboard', 'DASHBOARD');

-- Gán quyền cho ADMIN (Full permissions 1..18)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
(1, 9), (1, 10), (1, 11), (1, 12), (1, 13), (1, 14), (1, 15), (1, 16), (1, 17), (1, 18);

-- Gán quyền cho SALES
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 1), (2, 4), (2, 5), (2, 6), (2, 8), (2, 15), (2, 18);

-- Gán quyền cho PURCHASING
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3, 1), (3, 9), (3, 10), (3, 11), (3, 15), (3, 18);

-- Gán quyền cho WAREHOUSE
INSERT INTO role_permissions (role_id, permission_id) VALUES
(4, 1), (4, 15), (4, 16), (4, 17), (4, 18);

-- Gán quyền cho ACCOUNTANT
INSERT INTO role_permissions (role_id, permission_id) VALUES
(5, 4), (5, 9), (5, 13), (5, 14), (5, 18);

-- 2. USERS (Mật khẩu mặc định: 123456 -> $2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.)
INSERT INTO users (id, username, email, password_hash, full_name, phone, status) VALUES
(1, 'admin', 'admin@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Nguyễn Quản Trị', '0901234567', 'ACTIVE'),
(2, 'sales_user', 'sales@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Trần Bán Hàng', '0912345678', 'ACTIVE'),
(3, 'purchase_user', 'purchase@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Lê Mua Hàng', '0923456789', 'ACTIVE'),
(4, 'warehouse_user', 'warehouse@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Phạm Thủ Kho', '0934567890', 'ACTIVE'),
(5, 'accountant_user', 'accountant@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Hoàng Kế Toán', '0945678901', 'ACTIVE'),
(10, 'sales', 'sales_alias@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Trần Bán Hàng', '0912345678', 'ACTIVE'),
(11, 'purchasing', 'purchasing_alias@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Lê Mua Hàng', '0923456789', 'ACTIVE'),
(12, 'warehouse', 'warehouse_alias@erp.vn', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'Phạm Thủ Kho', '0934567890', 'ACTIVE');

INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(10, 2),
(11, 3),
(12, 4);

-- 3. WAREHOUSES
INSERT INTO warehouses (id, code, name, address, manager_name, phone, is_active) VALUES
(1, 'WH-HN-01', 'Kho Tổng Hà Nội', 'Lô 18 KCN Quang Minh, Mê Linh, Hà Nội', 'Phạm Thủ Kho', '0934567890', 1),
(2, 'WH-SG-01', 'Kho Chi Nhánh TP.HCM', 'Đường số 3 KCN Tân Bình, Tây Thạnh, TP.HCM', 'Vũ Nam Kho', '0988776655', 1),
(3, 'WH-DN-01', 'Kho Chi Nhánh Đà Nẵng', 'Khu công nghiệp Hòa Khánh, Liên Chiểu, Đà Nẵng', 'Đặng Trung Kho', '0977665544', 1);

-- 4. CATEGORIES (Dạng cây tự tham chiếu)
INSERT INTO categories (id, code, name, parent_id, sort_order, is_active) VALUES
(1, 'ELEC', 'Thiết bị điện tử', NULL, 1, 1),
(2, 'COMP', 'Máy tính & Linh kiện', NULL, 2, 1),
(3, 'ACC', 'Phụ kiện công nghệ', NULL, 3, 1),
(4, 'SMARTPHONE', 'Điện thoại thông minh', 1, 1, 1),
(5, 'TABLET', 'Máy tính bảng', 1, 2, 1),
(6, 'LAPTOP-OFFICE', 'Laptop Văn phòng', 2, 1, 1),
(7, 'LAPTOP-GAMING', 'Laptop Gaming', 2, 2, 1),
(8, 'CHARGER-CABLE', 'Củ sạc & Cáp kết nối', 3, 1, 1),
(9, 'HEADPHONE', 'Tai nghe & Loa', 3, 2, 1);

-- 5. PRODUCTS & ATTRIBUTES
INSERT INTO products (id, sku, barcode, name, category_id, unit, standard_cost, standard_price, description, is_active) VALUES
(1, 'SP-IP15PM-256', '8938501234511', 'iPhone 15 Pro Max 256GB Titan Tự Nhiên', 4, 'Chiếc', 26500000.00, 29990000.00, 'Màn hình OLED 6.7 inch, chip Apple A17 Pro mạnh mẽ, camera tiềm vọng 5x', 1),
(2, 'SP-SS-S24U-512', '8938501234528', 'Samsung Galaxy S24 Ultra 512GB Xám Titan', 4, 'Chiếc', 25000000.00, 28990000.00, 'Tích hợp bút S-Pen, vi xử lý Snapdragon 8 Gen 3 for Galaxy, AI Camera', 1),
(3, 'SP-IPAD-AIR-M2', '8938501234535', 'iPad Air 11 inch M2 128GB Wi-Fi Xanh', 5, 'Chiếc', 13500000.00, 16490000.00, 'Chip Apple M2, thiết kế mỏng nhẹ, hỗ trợ Apple Pencil Pro', 1),
(4, 'SP-DELL-XPS13', '8938501234542', 'Dell XPS 13 9340 Core Ultra 7 16GB 512GB', 6, 'Chiếc', 32000000.00, 36990000.00, 'Màn hình FHD+ tràn viền, vỏ nhôm nguyên khối, pin 12 tiếng', 1),
(5, 'SP-ASUS-G16', '8938501234559', 'Asus ROG Zephyrus G16 RTX 4070 32GB 1TB', 7, 'Chiếc', 45000000.00, 52990000.00, 'Laptop Gaming cao cấp mỏng nhẹ, màn hình OLED 2.5K 240Hz', 1),
(6, 'SP-ANKER-65W', '8938501234566', 'Củ sạc nhanh Anker GaNPrime 65W 3 cổng', 8, 'Củ', 650000.00, 890000.00, 'Công nghệ sạc GaN siêu nhỏ gọn, 2 Type-C + 1 Type-A', 1),
(7, 'SP-CABLE-CC-1M', '8938501234573', 'Cáp sạc Type-C to Type-C 100W Dù 1.2m', 8, 'Sợi', 90000.00, 160000.00, 'Bọc dù chống gãy gập, truyền dữ liệu tốc độ cao', 1),
(8, 'SP-SONY-XM5', '8938501234580', 'Tai nghe chụp tai Sony WH-1000XM5 Đen', 9, 'Chiếc', 6800000.00, 7990000.00, 'Chống ồn đỉnh cao hàng đầu thế giới, thời lượng pin 30 giờ', 1);

INSERT INTO product_attributes (product_id, attr_key, attr_value) VALUES
(1, 'Color', 'Titan Tự Nhiên'),
(1, 'Storage', '256GB'),
(2, 'Color', 'Xám Titan'),
(2, 'Storage', '512GB'),
(3, 'Color', 'Xanh Dương'),
(3, 'Storage', '128GB'),
(4, 'RAM', '16GB LPDDR5x'),
(4, 'SSD', '512GB NVMe'),
(5, 'GPU', 'NVIDIA GeForce RTX 4070 8GB'),
(5, 'RAM', '32GB DDR5');

-- 6. CUSTOMER GROUPS & CUSTOMERS
INSERT INTO customer_groups (id, code, name, discount_percent, description) VALUES
(1, 'RETAIL', 'Khách lẻ vãng lai', 0.00, 'Khách mua lẻ trực tiếp, áp dụng giá niêm yết'),
(2, 'LOYAL', 'Khách hàng thân thiết', 3.00, 'Khách hàng tích điểm định kỳ, chiết khấu 3%'),
(3, 'VIP', 'Khách hàng VIP', 5.00, 'Khách mua nhiều lần giá trị cao, chiết khấu 5%'),
(4, 'DISTRIBUTOR', 'Đại lý phân phối cấp 1', 10.00, 'Hệ thống đại lý kinh doanh, chiết khấu 10%');

INSERT INTO customers (id, code, name, customer_type, phone, email, address, tax_code, group_id, is_active) VALUES
(1, 'CUST-0001', 'Nguyễn Văn An', 'INDIVIDUAL', '0911223344', 'an.nguyen@gmail.com', '120 Hoàng Hoa Thám, Ba Đình, Hà Nội', NULL, 2, 1),
(2, 'CUST-0002', 'Công ty TNHH Giải Pháp Công Nghệ NexTech', 'BUSINESS', '0243888999', 'contact@nextech.vn', 'Tầng 5 Tòa nhà Keangnam Landmark 72, Cầu Giấy, Hà Nội', '0109988776', 4, 1),
(3, 'CUST-0003', 'Trần Thị Bích Ngọc', 'INDIVIDUAL', '0933445566', 'ngoc.tran@yahoo.com', '45 Lê Duẩn, Hải Châu, Đà Nẵng', NULL, 3, 1),
(4, 'CUST-0004', 'Công ty CP Bán Lẻ Điện Tử Sao Mai', 'BUSINESS', '0287777888', 'info@saomai.com.vn', '88 Nguyễn Huệ, Quận 1, TP.HCM', '0308877665', 4, 1);

-- 7. PRICE LISTS & ITEMS
INSERT INTO price_lists (id, code, name, customer_group_id, start_date, end_date, is_active) VALUES
(1, 'PL-RETAIL-2026', 'Bảng giá bán lẻ niêm yết 2026', 1, '2026-01-01', '2026-12-31', 1),
(2, 'PL-DIST-2026', 'Bảng giá Đại lý cấp 1 năm 2026', 4, '2026-01-01', '2026-12-31', 1);

INSERT INTO price_list_items (price_list_id, product_id, unit_price) VALUES
(1, 1, 29990000.00),
(1, 2, 28990000.00),
(1, 3, 16490000.00),
(1, 4, 36990000.00),
(1, 5, 52990000.00),
(1, 6, 890000.00),
(1, 7, 160000.00),
(1, 8, 7990000.00),
(2, 1, 26990000.00),
(2, 2, 25990000.00),
(2, 3, 14800000.00),
(2, 4, 33290000.00),
(2, 5, 47690000.00),
(2, 6, 750000.00),
(2, 7, 130000.00),
(2, 8, 7190000.00);

-- 8. SUPPLIERS & REVIEWS
INSERT INTO suppliers (id, code, name, phone, email, address, tax_code, product_groups, rating_score, rating_tier, is_active) VALUES
(1, 'SUPP-FPT', 'Công ty Cổ phần Bán lẻ Kỹ thuật số FPT', '02473006666', 'b2b@fpt.com.vn', 'Số 261-263 Khánh Hội, Phường 5, Quận 4, TP.HCM', '0101234567', 'Smartphone, Laptop, Tablet', 9.2, 'A', 1),
(2, 'SUPP-DGW', 'Công ty Cổ phần Thế Giới Số (Digiworld)', '02839290059', 'contact@dgw.com.vn', 'Tầng 16, Tòa nhà Centec, 72-74 Nguyễn Thị Minh Khai, Q.3, TP.HCM', '0302861742', 'Laptop, Phụ kiện, Màn hình', 8.8, 'A', 1),
(3, 'SUPP-PETRO', 'Tổng Công ty Cổ phần Dịch vụ Tổng hợp Dầu khí (Petrosetco)', '02839117788', 'b2b@petrosetco.com.vn', 'Tầng 6 Petrovietnam Tower, 1-5 Lê Duẩn, Q.1, TP.HCM', '0300452060', 'Phụ kiện, Thiết bị điện tử', 7.5, 'B', 1);

INSERT INTO supplier_reviews (supplier_id, review_date, quality_score, delivery_score, price_score, average_score, reviewer_id, comments) VALUES
(1, '2026-08-15', 9.5, 9.0, 9.0, 9.2, 3, 'Hàng chính hãng Apple/Samsung bảo hành chuẩn, giao hàng đúng hạn'),
(2, '2026-08-20', 9.0, 8.5, 9.0, 8.8, 3, 'Chính sách chiết khấu tốt cho đơn hàng lớn, hỗ trợ công nợ linh hoạt'),
(3, '2026-08-25', 7.5, 7.5, 7.5, 7.5, 3, 'Thời gian giao hàng đôi khi chậm 1-2 ngày, chất lượng sản phẩm ổn định');

-- 9. INITIAL INVENTORY (Kho Hà Nội & Kho TP.HCM)
INSERT INTO inventory (warehouse_id, product_id, quantity_on_hand, quantity_reserved, quantity_available) VALUES
(1, 1, 50.000, 5.000, 45.000),
(1, 2, 40.000, 0.000, 40.000),
(1, 3, 30.000, 2.000, 28.000),
(1, 4, 25.000, 0.000, 25.000),
(1, 5, 15.000, 1.000, 14.000),
(1, 6, 200.000, 10.000, 190.000),
(1, 7, 300.000, 20.000, 280.000),
(1, 8, 60.000, 4.000, 56.000),
(2, 1, 30.000, 0.000, 30.000),
(2, 2, 25.000, 0.000, 25.000),
(2, 6, 150.000, 0.000, 150.000),
(2, 7, 200.000, 0.000, 200.000);

-- Ghi nhận số dư ban đầu vào Sổ cái kho
INSERT INTO stock_ledger (warehouse_id, product_id, reference_type, reference_code, transaction_type, quantity, balance_after, unit_cost, notes, created_by) VALUES
(1, 1, 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 50.000, 50.000, 26500000.00, 'Số dư tồn kho đầu kỳ', 'admin'),
(1, 2, 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 40.000, 40.000, 25000000.00, 'Số dư tồn kho đầu kỳ', 'admin'),
(1, 3, 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 30.000, 30.000, 13500000.00, 'Số dư tồn kho đầu kỳ', 'admin'),
(1, 4, 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 25.000, 25.000, 32000000.00, 'Số dư tồn kho đầu kỳ', 'admin'),
(1, 5, 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 15.000, 15.000, 45000000.00, 'Số dư tồn kho đầu kỳ', 'admin'),
(1, 6, 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 200.000, 200.000, 650000.00, 'Số dư tồn kho đầu kỳ', 'admin'),
(1, 7, 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 300.000, 300.000, 90000.00, 'Số dư tồn kho đầu kỳ', 'admin'),
(1, 8, 'ADJUSTMENT', 'INIT-STOCK-2026', 'IN', 60.000, 60.000, 6800000.00, 'Số dư tồn kho đầu kỳ', 'admin');

-- 10. SAMPLE SALES ORDERS
INSERT INTO sales_orders (id, order_code, customer_id, warehouse_id, order_date, subtotal, tax_amount, discount_amount, total_amount, status, created_by, approved_by, approved_at, notes) VALUES
(1, 'SO-202609-001', 2, 1, '2026-09-05', 149950000.00, 14995000.00, 14995000.00, 149950000.00, 'COMPLETED', 'sales_user', 'admin', '2026-09-05 10:30:00', 'Đơn hàng bán buôn Đại lý NexTech đợt 1'),
(2, 'SO-202609-002', 1, 1, '2026-09-10', 29990000.00, 2999000.00, 899700.00, 32089300.00, 'APPROVED', 'sales_user', 'admin', '2026-09-10 14:15:00', 'Đơn khách VIP đặt mua iPhone 15 Pro Max');

INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, discount_percent, line_total) VALUES
(1, 1, 5.000, 29990000.00, 10.00, 134955000.00),
(1, 6, 10.000, 890000.00, 10.00, 8010000.00),
(2, 1, 1.000, 29990000.00, 3.00, 29090300.00);

INSERT INTO sales_order_status_history (sales_order_id, from_status, to_status, note, changed_by, changed_at) VALUES
(1, NULL, 'DRAFT', 'Tạo mới đơn hàng', 'sales_user', '2026-09-05 09:00:00'),
(1, 'DRAFT', 'APPROVED', 'Quản lý phê duyệt đơn', 'admin', '2026-09-05 10:30:00'),
(1, 'APPROVED', 'DELIVERING', 'Thủ kho xuất kho giao hàng', 'warehouse_user', '2026-09-05 11:30:00'),
(1, 'DELIVERING', 'COMPLETED', 'Khách hàng nhận đủ hàng và ký biên bản', 'sales_user', '2026-09-06 15:00:00'),
(2, NULL, 'DRAFT', 'Tạo mới đơn hàng', 'sales_user', '2026-09-10 13:45:00'),
(2, 'DRAFT', 'APPROVED', 'Quản lý phê duyệt đơn bán', 'admin', '2026-09-10 14:15:00');

-- 11. SAMPLE PURCHASE ORDERS & DEBTS
INSERT INTO purchase_orders (id, po_code, supplier_id, warehouse_id, order_date, expected_date, subtotal, tax_amount, total_amount, status, created_by, approved_by, approved_at, notes) VALUES
(1, 'PO-202609-001', 1, 1, '2026-09-01', '2026-09-04', 265000000.00, 26500000.00, 291500000.00, 'RECEIVED', 'purchase_user', 'admin', '2026-09-01 16:00:00', 'Đơn nhập lô iPhone 15 Pro Max chính hãng từ FPT'),
(2, 'PO-202609-002', 2, 1, '2026-09-08', '2026-09-15', 65000000.00, 6500000.00, 71500000.00, 'APPROVED', 'purchase_user', 'admin', '2026-09-08 11:00:00', 'Đơn nhập củ sạc Anker từ Digiworld');

INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, line_total) VALUES
(1, 1, 10.000, 26500000.00, 265000000.00),
(2, 6, 100.000, 650000.00, 65000000.00);

-- Công nợ phát sinh từ PO-001
INSERT INTO supplier_debts (id, po_id, supplier_id, invoice_code, debt_date, due_date, total_amount, paid_amount, remaining_amount, status) VALUES
(1, 1, 1, 'INV-FPT-8899', '2026-09-04', '2026-09-30', 291500000.00, 150000000.00, 141500000.00, 'PARTIAL');

INSERT INTO supplier_payments (payment_code, debt_id, supplier_id, payment_date, amount, payment_method, reference_number, notes, created_by) VALUES
('PAY-202609-001', 1, 1, '2026-09-06', 150000000.00, 'BANK_TRANSFER', 'FT260906001234', 'Thanh toán đợt 1 tiền mua hàng iPhone', 'accountant_user');
