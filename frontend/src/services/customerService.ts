import { api } from './api';
import { ApiResponse, PageResponse, Customer, CustomerGroup, CustomerPurchaseHistory } from '../types';

export const customerService = {
  // Customer Groups
  getAllGroups: async () => {
    const res = await api.get<ApiResponse<CustomerGroup[]>>('/customer-groups');
    return res.data.data;
  },

  getAllCustomerGroups: async () => {
    const res = await api.get<ApiResponse<CustomerGroup[]>>('/customer-groups');
    return res.data.data;
  },

  createGroup: async (data: Partial<CustomerGroup>) => {
    const res = await api.post<ApiResponse<CustomerGroup>>('/customer-groups', data);
    return res.data.data;
  },

  updateGroup: async (id: number, data: Partial<CustomerGroup>) => {
    const res = await api.put<ApiResponse<CustomerGroup>>(`/customer-groups/${id}`, data);
    return res.data.data;
  },

  // Customers
  searchCustomers: async (params: { groupId?: number; customerType?: string; isActive?: boolean; keyword?: string; page?: number; size?: number }) => {
    const res = await api.get<ApiResponse<PageResponse<Customer>>>('/customers', { params });
    return res.data.data;
  },

  getAllActiveCustomers: async () => {
    const res = await api.get<ApiResponse<Customer[]>>('/customers/active');
    return res.data.data;
  },

  getCustomerById: async (id: number) => {
    const res = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
    return res.data.data;
  },

  createCustomer: async (data: Partial<Customer>) => {
    const res = await api.post<ApiResponse<Customer>>('/customers', data);
    return res.data.data;
  },

  updateCustomer: async (id: number, data: Partial<Customer>) => {
    const res = await api.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return res.data.data;
  },

  getPurchaseHistory: async (id: number) => {
    const res = await api.get<ApiResponse<CustomerPurchaseHistory>>(`/customers/${id}/purchase-history`);
    return res.data.data;
  },
};
