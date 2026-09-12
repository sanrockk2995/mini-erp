import { api } from './api';
import { ApiResponse, DashboardStats, MonthlySales, TopProduct } from '../types';

export const dashboardService = {
  getStats: async () => {
    const res = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return res.data.data;
  },

  getSalesTrend: async () => {
    const res = await api.get<ApiResponse<MonthlySales[]>>('/dashboard/sales-trend');
    return res.data.data;
  },

  getTopProducts: async () => {
    const res = await api.get<ApiResponse<TopProduct[]>>('/dashboard/top-products');
    return res.data.data;
  },
};
