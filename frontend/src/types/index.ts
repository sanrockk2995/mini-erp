// Common API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Auth Types
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  roles: string[];
  permissions: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

// Product & Category
export interface Category {
  id: number;
  code: string;
  name: string;
  parentId: number | null;
  sortOrder: number;
  isActive: boolean;
  children?: Category[];
}

export interface ProductAttribute {
  id?: number;
  attrKey: string;
  attrValue: string;
}

export interface Product {
  id: number;
  sku: string;
  barcode: string;
  name: string;
  categoryId: number;
  categoryName: string;
  unit: string;
  standardCost: number;
  standardPrice: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  attributes: ProductAttribute[];
}

export interface PriceListItem {
  id?: number;
  productId: number;
  productSku?: string;
  productName?: string;
  unitPrice: number;
}

export interface PriceList {
  id: number;
  code: string;
  name: string;
  customerGroupId: number;
  customerGroupName: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  items: PriceListItem[];
}

// Customer
export interface CustomerGroup {
  id: number;
  code: string;
  name: string;
  discountPercent: number;
  description?: string;
}

export interface Customer {
  id: number;
  code: string;
  name: string;
  customerType: 'INDIVIDUAL' | 'BUSINESS';
  phone: string;
  email: string;
  address: string;
  taxCode: string;
  groupId: number;
  groupName: string;
  isActive: boolean;
  createdAt: string;
}

export interface CustomerPurchaseHistory {
  customerId: number;
  customerCode: string;
  customerName: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  orders: {
    orderId: number;
    orderCode: string;
    orderDate: string;
    totalAmount: number;
    status: string;
  }[];
}

// Warehouse & Inventory
export interface Warehouse {
  id: number;
  code: string;
  name: string;
  address: string;
  managerName: string;
  phone: string;
  isActive: boolean;
}

export interface Inventory {
  id: number;
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  productId: number;
  productSku: string;
  productName: string;
  productUnit: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
}

export interface StockLedger {
  id: number;
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  productId: number;
  productSku: string;
  productName: string;
  referenceType: string;
  referenceId: number;
  referenceCode: string;
  transactionType: 'IN' | 'OUT';
  quantity: number;
  balanceAfter: number;
  unitCost: number;
  notes: string;
  createdAt: string;
  createdBy: string;
}

// Sales Order
export interface SalesOrderItem {
  id?: number;
  productId: number;
  productSku?: string;
  productName?: string;
  productUnit?: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  lineTotal: number;
}

export interface SalesOrderStatusHistory {
  id: number;
  fromStatus: string;
  toStatus: string;
  note: string;
  changedBy: string;
  changedAt: string;
}

export interface SalesOrder {
  id: number;
  orderCode: string;
  customerId: number;
  customerCode: string;
  customerName: string;
  customerPhone: string;
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  orderDate: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: 'DRAFT' | 'APPROVED' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
  items?: SalesOrderItem[];
  statusHistories?: SalesOrderStatusHistory[];
}

// Supplier & Procurement
export interface SupplierReview {
  id: number;
  supplierId: number;
  reviewDate: string;
  qualityScore: number;
  deliveryScore: number;
  priceScore: number;
  averageScore: number;
  reviewerId?: number;
  comments?: string;
  createdAt: string;
}

export interface Supplier {
  id: number;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  taxCode: string;
  productGroups: string;
  ratingScore: number;
  ratingTier: 'A' | 'B' | 'C';
  isActive: boolean;
  createdAt: string;
  currentDebt?: number;
}

export interface SupplierDebtSummary {
  supplierId: number;
  supplierCode: string;
  supplierName: string;
  totalDebt: number;
  paidDebt: number;
  remainingDebt: number;
  unpaidInvoicesCount: number;
}

export interface PurchaseOrderItem {
  id?: number;
  productId: number;
  productSku?: string;
  productName?: string;
  productUnit?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PurchaseOrder {
  id: number;
  poCode: string;
  supplierId: number;
  supplierCode: string;
  supplierName: string;
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  orderDate: string;
  expectedDate?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'RECEIVED' | 'CLOSED' | 'REJECTED';
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
  items?: PurchaseOrderItem[];
}

export interface SupplierDebt {
  id: number;
  poId?: number;
  poCode?: string;
  supplierId: number;
  supplierCode: string;
  supplierName: string;
  invoiceCode: string;
  debtDate: string;
  dueDate?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  createdAt: string;
}

export interface SupplierPayment {
  id: number;
  paymentCode: string;
  debtId: number;
  invoiceCode: string;
  supplierId: number;
  supplierCode: string;
  supplierName: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

// Goods Receipt & Issue Notes
export interface GoodsReceiptItem {
  id?: number;
  productId: number;
  productSku?: string;
  productName?: string;
  productUnit?: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  notes?: string;
}

export interface GoodsReceiptNote {
  id: number;
  grnCode: string;
  poId?: number;
  poCode?: string;
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  receiptDate: string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  notes?: string;
  createdBy: string;
  confirmedBy?: string;
  confirmedAt?: string;
  createdAt: string;
  items?: GoodsReceiptItem[];
}

export interface GoodsIssueItem {
  id?: number;
  productId: number;
  productSku?: string;
  productName?: string;
  productUnit?: string;
  requestedQuantity: number;
  issuedQuantity: number;
  notes?: string;
}

export interface GoodsIssueNote {
  id: number;
  ginCode: string;
  soId?: number;
  soCode?: string;
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  issueDate: string;
  issueType: string;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  notes?: string;
  createdBy: string;
  confirmedBy?: string;
  confirmedAt?: string;
  createdAt: string;
  items?: GoodsIssueItem[];
}

// Dashboard
export interface DashboardStats {
  totalMonthlyRevenue: number;
  totalOrdersThisMonth: number;
  pendingOrdersCount: number;
  lowStockCount: number;
  totalSupplierDebt: number;
  totalProductsCount: number;
  totalCustomersCount: number;
  totalSuppliersCount: number;
}

export interface MonthlySales {
  month: string;
  revenue: number;
  orderCount: number;
}

export interface TopProduct {
  productId: number;
  productSku: string;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
}
