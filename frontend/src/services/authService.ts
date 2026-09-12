import { api } from './api';
import { ApiResponse, LoginResponse, User } from '../types';

export const authService = {
  login: async (credentials: { username: string; password: string }) => {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return res.data.data;
  },

  getCurrentUser: async () => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  refreshToken: async (refreshToken: string) => {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/refresh', { refreshToken });
    return res.data.data;
  },
};
