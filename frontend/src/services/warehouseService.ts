import { api } from './api';
import { ApiResponse, PageResponse, Warehouse, Inventory, StockLedger, GoodsReceiptNote, GoodsIssueNote } from '../types';

export const warehouseService = {
  // Warehouses
  getAllWarehouses: async (activeOnly = false) => {
    const res = await api.get<ApiResponse<Warehouse[]>>('/warehouses', { params: { activeOnly } });
    return res.data.data;
  },

  getAllActiveWarehouses: async () => {
    const res = await api.get<ApiResponse<Warehouse[]>>('/warehouses', { params: { activeOnly: true } });
    return res.data.data;
  },

  getWarehouseById: async (id: number) => {
    const res = await api.get<ApiResponse<Warehouse>>(`/warehouses/${id}`);
    return res.data.data;
  },

  createWarehouse: async (data: Partial<Warehouse>) => {
    const res = await api.post<ApiResponse<Warehouse>>('/warehouses', data);
    return res.data.data;
  },

  updateWarehouse: async (id: number, data: Partial<Warehouse>) => {
    const res = await api.put<ApiResponse<Warehouse>>(`/warehouses/${id}`, data);
    return res.data.data;
  },

  // Inventory
  searchInventory: async (params: { warehouseId?: number; keyword?: string; page?: number; size?: number }) => {
    const res = await api.get<ApiResponse<PageResponse<Inventory>>>('/inventory', { params });
    return res.data.data;
  },

  getLowStockAlerts: async () => {
    const res = await api.get<ApiResponse<Inventory[]>>('/inventory/low-stock');
    return res.data.data;
  },

  adjustStock: async (data: { warehouseId: number; productId: number; transactionType: 'IN' | 'OUT'; quantity: number; notes?: string }) => {
    const res = await api.post<ApiResponse<void>>('/inventory/adjust', data);
    return res.data;
  },

  // Stock Ledger
  getStockLedger: async (params: { warehouseId?: number; productId?: number; transactionType?: string; page?: number; size?: number }) => {
    const res = await api.get<ApiResponse<PageResponse<StockLedger>>>('/stock-ledger', { params });
    return res.data.data;
  },

  // Goods Receipt Notes (GRN)
  searchReceipts: async (params: { warehouseId?: number; status?: string; keyword?: string; page?: number; size?: number }) => {
    const res = await api.get<ApiResponse<PageResponse<GoodsReceiptNote>>>('/goods-receipts', { params });
    return res.data.data;
  },

  getReceiptById: async (id: number) => {
    const res = await api.get<ApiResponse<GoodsReceiptNote>>(`/goods-receipts/${id}`);
    return res.data.data;
  },

  createReceipt: async (data: any) => {
    const res = await api.post<ApiResponse<GoodsReceiptNote>>('/goods-receipts', data);
    return res.data.data;
  },

  confirmReceipt: async (id: number) => {
    const res = await api.post<ApiResponse<GoodsReceiptNote>>(`/goods-receipts/${id}/confirm`);
    return res.data.data;
  },

  // Goods Issue Notes (GIN)
  searchIssues: async (params: { warehouseId?: number; status?: string; keyword?: string; page?: number; size?: number }) => {
    const res = await api.get<ApiResponse<PageResponse<GoodsIssueNote>>>('/goods-issues', { params });
    return res.data.data;
  },

  getIssueById: async (id: number) => {
    const res = await api.get<ApiResponse<GoodsIssueNote>>(`/goods-issues/${id}`);
    return res.data.data;
  },

  createIssue: async (data: any) => {
    const res = await api.post<ApiResponse<GoodsIssueNote>>('/goods-issues', data);
    return res.data.data;
  },

  confirmIssue: async (id: number) => {
    const res = await api.post<ApiResponse<GoodsIssueNote>>(`/goods-issues/${id}/confirm`);
    return res.data.data;
  },
};
