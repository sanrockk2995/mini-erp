-- ====================================================================
-- MINI-ERP CLOTHING & APPAREL DATABASE SCHEMA (MySQL 8+)
-- Database: erp_db
-- Hệ thống Quản trị Doanh nghiệp Dệt may & Bán lẻ Thời trang
-- Kiến trúc: Core-FK (Ràng buộc Khóa ngoại Cốt lõi) & Flat Read Model
-- Giữ các liên kết chính: RBAC, Cây danh mục, Chi tiết dòng đơn hàng,
-- Tồn kho, Sổ cái, Đơn mua, Công nợ, Nhập/Xuất kho.
-- Tối ưu truy vấn: Lưu trữ denormalized (tên khách, tên NCC, tên kho,
-- SKU, tên SP) để truy vấn danh sách/báo cáo phẳng, nhanh, hạn chế JOIN.
-- ====================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS goods_issue_items;
DROP TABLE IF EXISTS goods_issue_notes;
DROP TABLE IF EXISTS goods_receipt_items;
DROP TABLE IF EXISTS goods_receipt_notes;
DROP TABLE IF EXISTS stock_ledger;
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS warehouses;
DROP TABLE IF EXISTS supplier_payments;
DROP TABLE IF EXISTS supplier_debts;
DROP TABLE IF EXISTS purchase_order_items;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS supplier_reviews;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS sales_order_status_history;
DROP TABLE IF EXISTS sales_order_items;
DROP TABLE IF EXISTS sales_orders;
DROP TABLE IF EXISTS price_list_items;
DROP TABLE IF EXISTS price_lists;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS customer_groups;
DROP TABLE IF EXISTS product_attributes;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------------------
-- 1. AUTH & RBAC (Phân quyền & Người dùng)
-- --------------------------------------------------------------------

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_perm FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 2. PRODUCT & CATEGORY (Danh mục & Sản phẩm Thời trang)
-- --------------------------------------------------------------------

CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    parent_id BIGINT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cat_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_cat_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    barcode VARCHAR(100),
    name VARCHAR(200) NOT NULL,
    category_id BIGINT,
    category_name VARCHAR(100),
    unit VARCHAR(20) NOT NULL DEFAULT 'Cái',
    standard_cost DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    standard_price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_prod_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_prod_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_attributes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    attr_key VARCHAR(50) NOT NULL,   -- Size, Màu sắc, Chất liệu, Form dáng
    attr_value VARCHAR(255) NOT NULL,
    CONSTRAINT fk_attr_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_attr_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 3. CUSTOMER & PRICE LIST (Khách hàng & Bảng giá Thời trang)
-- --------------------------------------------------------------------

CREATE TABLE customer_groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    customer_type VARCHAR(20) NOT NULL DEFAULT 'INDIVIDUAL',
    phone VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(255),
    tax_code VARCHAR(50),
    group_id BIGINT,
    group_name VARCHAR(100),
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cust_group FOREIGN KEY (group_id) REFERENCES customer_groups(id) ON DELETE SET NULL,
    INDEX idx_cust_group (group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE price_lists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    customer_group_id BIGINT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pl_group FOREIGN KEY (customer_group_id) REFERENCES customer_groups(id) ON DELETE SET NULL,
    INDEX idx_pl_group (customer_group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE price_list_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    price_list_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    CONSTRAINT fk_pli_pricelist FOREIGN KEY (price_list_id) REFERENCES price_lists(id) ON DELETE CASCADE,
    CONSTRAINT fk_pli_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uk_pli_pl_prod (price_list_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 4. WAREHOUSE & INVENTORY (Kho hàng & Tồn kho Thời trang)
-- --------------------------------------------------------------------

CREATE TABLE warehouses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    manager_name VARCHAR(100),
    phone VARCHAR(20),
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id BIGINT NOT NULL,
    warehouse_code VARCHAR(50),
    warehouse_name VARCHAR(100),
    product_id BIGINT NOT NULL,
    product_sku VARCHAR(50),
    product_name VARCHAR(200),
    product_unit VARCHAR(20) DEFAULT 'Cái',
    quantity_on_hand DECIMAL(12, 3) NOT NULL DEFAULT 0.000,
    quantity_reserved DECIMAL(12, 3) NOT NULL DEFAULT 0.000,
    quantity_available DECIMAL(12, 3) NOT NULL DEFAULT 0.000,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inv_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT,
    CONSTRAINT fk_inv_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    UNIQUE KEY uk_inv_wh_prod (warehouse_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE stock_ledger (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id BIGINT NOT NULL,
    warehouse_code VARCHAR(50),
    warehouse_name VARCHAR(100),
    product_id BIGINT NOT NULL,
    product_sku VARCHAR(50),
    product_name VARCHAR(200),
    reference_type VARCHAR(50) NOT NULL,
    reference_id BIGINT,
    reference_code VARCHAR(50),
    transaction_type VARCHAR(10) NOT NULL,
    quantity DECIMAL(12, 3) NOT NULL,
    balance_after DECIMAL(12, 3) NOT NULL,
    unit_cost DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    notes VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    CONSTRAINT fk_sl_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT,
    CONSTRAINT fk_sl_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_sl_wh_prod (warehouse_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 5. SALES ORDER (Đơn Bán hàng Thời trang)
-- --------------------------------------------------------------------

CREATE TABLE sales_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    customer_code VARCHAR(50),
    customer_name VARCHAR(150),
    customer_phone VARCHAR(20),
    warehouse_id BIGINT NOT NULL,
    warehouse_code VARCHAR(50),
    warehouse_name VARCHAR(100),
    order_date DATE NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    created_by VARCHAR(50) NOT NULL,
    approved_by VARCHAR(50),
    approved_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_so_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_so_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT,
    INDEX idx_so_customer (customer_id),
    INDEX idx_so_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sales_order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sales_order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_sku VARCHAR(50),
    product_name VARCHAR(200),
    product_unit VARCHAR(20) DEFAULT 'Cái',
    quantity DECIMAL(12, 3) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    line_total DECIMAL(15, 2) NOT NULL,
    CONSTRAINT fk_soi_order FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_soi_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_soi_order (sales_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sales_order_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sales_order_id BIGINT NOT NULL,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL,
    note VARCHAR(255),
    changed_by VARCHAR(50) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sosh_order FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE,
    INDEX idx_sosh_order (sales_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 6. SUPPLIER & PURCHASING (Nhà cung cấp Dệt may & Đơn mua hàng)
-- --------------------------------------------------------------------

CREATE TABLE suppliers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(255),
    tax_code VARCHAR(50),
    product_groups VARCHAR(255),
    rating_score DECIMAL(3, 1) NOT NULL DEFAULT 0.0,
    rating_tier VARCHAR(10) NOT NULL DEFAULT 'B',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE supplier_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    supplier_id BIGINT NOT NULL,
    review_date DATE NOT NULL,
    quality_score DECIMAL(3, 1) NOT NULL,
    delivery_score DECIMAL(3, 1) NOT NULL,
    price_score DECIMAL(3, 1) NOT NULL,
    average_score DECIMAL(3, 1) NOT NULL,
    reviewer_id BIGINT,
    comments TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sr_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    INDEX idx_sr_supplier (supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE purchase_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    po_code VARCHAR(50) NOT NULL UNIQUE,
    supplier_id BIGINT NOT NULL,
    supplier_code VARCHAR(50),
    supplier_name VARCHAR(150),
    warehouse_id BIGINT NOT NULL,
    warehouse_code VARCHAR(50),
    warehouse_name VARCHAR(100),
    order_date DATE NOT NULL,
    expected_date DATE,
    subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    created_by VARCHAR(50) NOT NULL,
    approved_by VARCHAR(50),
    approved_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    CONSTRAINT fk_po_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT,
    INDEX idx_po_supplier (supplier_id),
    INDEX idx_po_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE purchase_order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_sku VARCHAR(50),
    product_name VARCHAR(200),
    product_unit VARCHAR(20) DEFAULT 'Cái',
    quantity DECIMAL(12, 3) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    line_total DECIMAL(15, 2) NOT NULL,
    CONSTRAINT fk_poi_order FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_poi_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_poi_order (purchase_order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE supplier_debts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    po_id BIGINT NULL,
    po_code VARCHAR(50),
    supplier_id BIGINT NOT NULL,
    supplier_code VARCHAR(50),
    supplier_name VARCHAR(150),
    invoice_code VARCHAR(50) NOT NULL UNIQUE,
    debt_date DATE NOT NULL,
    due_date DATE,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    remaining_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sd_po FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE SET NULL,
    CONSTRAINT fk_sd_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    INDEX idx_sd_supplier (supplier_id),
    INDEX idx_sd_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE supplier_payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_code VARCHAR(50) NOT NULL UNIQUE,
    debt_id BIGINT NOT NULL,
    debt_invoice_code VARCHAR(50),
    supplier_id BIGINT NOT NULL,
    supplier_name VARCHAR(150),
    payment_date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL DEFAULT 'BANK_TRANSFER',
    reference_number VARCHAR(100),
    notes VARCHAR(255),
    created_by VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sp_debt FOREIGN KEY (debt_id) REFERENCES supplier_debts(id) ON DELETE RESTRICT,
    CONSTRAINT fk_sp_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
    INDEX idx_sp_debt (debt_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 7. GOODS RECEIPT & GOODS ISSUE (Nhập kho & Xuất kho Hàng dệt may)
-- --------------------------------------------------------------------

CREATE TABLE goods_receipt_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    grn_code VARCHAR(50) NOT NULL UNIQUE,
    po_id BIGINT NULL,
    po_code VARCHAR(50),
    supplier_name VARCHAR(150),
    warehouse_id BIGINT NOT NULL,
    warehouse_name VARCHAR(100),
    receipt_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    notes TEXT,
    created_by VARCHAR(50) NOT NULL,
    confirmed_by VARCHAR(50),
    confirmed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_grn_po FOREIGN KEY (po_id) REFERENCES purchase_orders(id) ON DELETE SET NULL,
    CONSTRAINT fk_grn_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT,
    INDEX idx_grn_po (po_id),
    INDEX idx_grn_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE goods_receipt_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    grn_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_sku VARCHAR(50),
    product_name VARCHAR(200),
    product_unit VARCHAR(20) DEFAULT 'Cái',
    ordered_quantity DECIMAL(12, 3) NOT NULL DEFAULT 0.000,
    received_quantity DECIMAL(12, 3) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    notes VARCHAR(255),
    CONSTRAINT fk_gri_note FOREIGN KEY (grn_id) REFERENCES goods_receipt_notes(id) ON DELETE CASCADE,
    CONSTRAINT fk_gri_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_gri_note (grn_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE goods_issue_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    gin_code VARCHAR(50) NOT NULL UNIQUE,
    so_id BIGINT NULL,
    so_code VARCHAR(50),
    customer_name VARCHAR(150),
    warehouse_id BIGINT NOT NULL,
    warehouse_name VARCHAR(100),
    issue_date DATE NOT NULL,
    issue_type VARCHAR(30) NOT NULL DEFAULT 'SALES_ORDER',
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    notes TEXT,
    created_by VARCHAR(50) NOT NULL,
    confirmed_by VARCHAR(50),
    confirmed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_gin_so FOREIGN KEY (so_id) REFERENCES sales_orders(id) ON DELETE SET NULL,
    CONSTRAINT fk_gin_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT,
    INDEX idx_gin_so (so_id),
    INDEX idx_gin_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE goods_issue_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    gin_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_sku VARCHAR(50),
    product_name VARCHAR(200),
    product_unit VARCHAR(20) DEFAULT 'Cái',
    requested_quantity DECIMAL(12, 3) NOT NULL,
    issued_quantity DECIMAL(12, 3) NOT NULL,
    notes VARCHAR(255),
    CONSTRAINT fk_gii_note FOREIGN KEY (gin_id) REFERENCES goods_issue_notes(id) ON DELETE CASCADE,
    CONSTRAINT fk_gii_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_gii_note (gin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
