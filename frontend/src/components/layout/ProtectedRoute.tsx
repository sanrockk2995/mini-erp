import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Result, Button } from 'antd';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && user) {
    const hasRole = user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return (
        <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
          <Result
            status="403"
            title="403"
            subTitle="Xin lỗi, bạn không có quyền truy cập vào phân hệ này."
            extra={
              <Button type="primary" onClick={() => (window.location.href = '/')}>
                Về Trang Chủ
              </Button>
            }
          />
        </div>
      );
    }
  }

  return <Outlet />;
};
