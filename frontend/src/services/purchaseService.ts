import { api } from './api';
import { ApiResponse, PageResponse, PurchaseOrder, SupplierDebt, SupplierPayment } from '../types';

export const purchaseService = {
  // Purchase Orders
  searchOrders: async (params: {
    supplierId?: number;
    warehouseId?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }) => {
    const res = await api.get<ApiResponse<PageResponse<PurchaseOrder>>>('/purchase-orders', { params });
    return res.data.data;
  },

  getOrderById: async (id: number) => {
    const res = await api.get<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}`);
    return res.data.data;
  },

  createOrder: async (data: any) => {
    const res = await api.post<ApiResponse<PurchaseOrder>>('/purchase-orders', data);
    return res.data.data;
  },

  submitForApproval: async (id: number) => {
    const res = await api.post<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}/submit`);
    return res.data.data;
  },

  approveOrder: async (id: number) => {
    const res = await api.post<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}/approve`);
    return res.data.data;
  },

  rejectOrder: async (id: number, note?: string) => {
    const res = await api.post<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}/reject`, { note });
    return res.data.data;
  },

  closeOrder: async (id: number) => {
    const res = await api.post<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}/close`);
    return res.data.data;
  },

  // Supplier Debts
  searchDebts: async (params: { supplierId?: number; status?: string; keyword?: string; page?: number; size?: number }) => {
    const res = await api.get<ApiResponse<PageResponse<SupplierDebt>>>('/supplier-debts', { params });
    return res.data.data;
  },

  getDebtById: async (id: number) => {
    const res = await api.get<ApiResponse<SupplierDebt>>(`/supplier-debts/${id}`);
    return res.data.data;
  },

  getDebtPayments: async (debtId: number) => {
    const res = await api.get<ApiResponse<SupplierPayment[]>>(`/supplier-debts/${debtId}/payments`);
    return res.data.data;
  },

  recordPayment: async (data: { debtId: number; amount: number; paymentDate?: string; paymentMethod?: string; referenceNumber?: string; notes?: string }) => {
    const res = await api.post<ApiResponse<SupplierPayment>>('/supplier-debts/payments', data);
    return res.data.data;
  },
};
