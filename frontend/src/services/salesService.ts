import { api } from './api';
import { ApiResponse, PageResponse, SalesOrder } from '../types';

export const salesService = {
  searchOrders: async (params: {
    customerId?: number;
    warehouseId?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }) => {
    const res = await api.get<ApiResponse<PageResponse<SalesOrder>>>('/sales-orders', { params });
    return res.data.data;
  },

  getOrderById: async (id: number) => {
    const res = await api.get<ApiResponse<SalesOrder>>(`/sales-orders/${id}`);
    return res.data.data;
  },

  createOrder: async (data: any) => {
    const res = await api.post<ApiResponse<SalesOrder>>('/sales-orders', data);
    return res.data.data;
  },

  approveOrder: async (id: number) => {
    const res = await api.post<ApiResponse<SalesOrder>>(`/sales-orders/${id}/approve`);
    return res.data.data;
  },

  cancelOrder: async (id: number, note?: string) => {
    const res = await api.post<ApiResponse<SalesOrder>>(`/sales-orders/${id}/cancel`, { note });
    return res.data.data;
  },

  updateStatus: async (id: number, data: { status: string; note?: string }) => {
    const res = await api.post<ApiResponse<SalesOrder>>(`/sales-orders/${id}/status`, data);
    return res.data.data;
  },
};
