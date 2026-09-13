import { api } from './api';
import { ApiResponse, PageResponse, Category, Product, PriceList } from '../types';

export const productService = {
  // Categories
  getCategoryTree: async (activeOnly = false) => {
    const res = await api.get<ApiResponse<Category[]>>('/categories/tree', { params: { activeOnly } });
    return res.data.data;
  },

  getAllCategoriesFlat: async () => {
    const res = await api.get<ApiResponse<Category[]>>('/categories');
    return res.data.data;
  },

  createCategory: async (data: { code: string; name: string; parentId?: number; sortOrder?: number; isActive?: boolean }) => {
    const res = await api.post<ApiResponse<Category>>('/categories', data);
    return res.data.data;
  },

  updateCategory: async (id: number, data: { code: string; name: string; parentId?: number; sortOrder?: number; isActive?: boolean }) => {
    const res = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return res.data.data;
  },

  deleteCategory: async (id: number) => {
    const res = await api.delete<ApiResponse<VoidFunction>>(`/categories/${id}`);
    return res.data;
  },

  // Products
  searchProducts: async (params: { categoryId?: number; isActive?: boolean; keyword?: string; page?: number; size?: number }) => {
    const res = await api.get<ApiResponse<PageResponse<Product>>>('/products', { params });
    return res.data.data;
  },

  getAllActiveProducts: async () => {
    const res = await api.get<ApiResponse<Product[]>>('/products/active');
    return res.data.data;
  },

  getProductById: async (id: number) => {
    const res = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data.data;
  },

  createProduct: async (data: Partial<Product>) => {
    const res = await api.post<ApiResponse<Product>>('/products', data);
    return res.data.data;
  },

  updateProduct: async (id: number, data: Partial<Product>) => {
    const res = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
    return res.data.data;
  },

  deleteProduct: async (id: number) => {
    const res = await api.delete<ApiResponse<VoidFunction>>(`/products/${id}`);
    return res.data;
  },

  // Price Lists
  getAllPriceLists: async (activeOnly = false) => {
    const res = await api.get<ApiResponse<PriceList[]>>('/price-lists', { params: { activeOnly } });
    return res.data.data;
  },

  getPriceListById: async (id: number) => {
    const res = await api.get<ApiResponse<PriceList>>(`/price-lists/${id}`);
    return res.data.data;
  },

  createPriceList: async (data: Partial<PriceList>) => {
    const res = await api.post<ApiResponse<PriceList>>('/price-lists', data);
    return res.data.data;
  },

  updatePriceList: async (id: number, data: Partial<PriceList>) => {
    const res = await api.put<ApiResponse<PriceList>>(`/price-lists/${id}`, data);
    return res.data.data;
  },
};
