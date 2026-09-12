import axios from 'axios';
import { message } from 'antd';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        message.error('Bạn không có quyền thực hiện thao tác này');
      } else if (data && data.message) {
        message.error(data.message);
      } else {
        message.error('Có lỗi xảy ra, vui lòng thử lại');
      }
    } else {
      message.error('Không thể kết nối đến máy chủ Backend');
    }

    return Promise.reject(error);
  }
);
