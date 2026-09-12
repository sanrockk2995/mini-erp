import { api } from './api';
import { ApiResponse, PageResponse, Supplier, SupplierReview, SupplierDebtSummary } from '../types';

export const supplierService = {
  searchSuppliers: async (params: { tier?: string; isActive?: boolean; keyword?: string; page?: number; size?: number }) => {
    const res = await api.get<ApiResponse<PageResponse<Supplier>>>('/suppliers', { params });
    return res.data.data;
  },

  getAllActiveSuppliers: async () => {
    const res = await api.get<ApiResponse<Supplier[]>>('/suppliers/active');
    return res.data.data;
  },

  getSupplierById: async (id: number) => {
    const res = await api.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
    return res.data.data;
  },

  createSupplier: async (data: Partial<Supplier>) => {
    const res = await api.post<ApiResponse<Supplier>>('/suppliers', data);
    return res.data.data;
  },

  updateSupplier: async (id: number, data: Partial<Supplier>) => {
    const res = await api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data);
    return res.data.data;
  },

  addReview: async (id: number, data: { qualityScore: number; deliveryScore: number; priceScore: number; comments?: string; reviewDate?: string }) => {
    const res = await api.post<ApiResponse<SupplierReview>>(`/suppliers/${id}/reviews`, data);
    return res.data.data;
  },

  getReviews: async (id: number) => {
    const res = await api.get<ApiResponse<SupplierReview[]>>(`/suppliers/${id}/reviews`);
    return res.data.data;
  },

  getDebtSummary: async (id: number) => {
    const res = await api.get<ApiResponse<SupplierDebtSummary>>(`/suppliers/${id}/debt-summary`);
    return res.data.data;
  },
};
