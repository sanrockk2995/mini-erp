import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Space, Divider, message, Row, Col, Card } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  ThunderboltFilled,
  CrownOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
  CheckCircleFilled,
  DatabaseOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';

const { Title, Text, Paragraph } = Typography;

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [form] = Form.useForm();

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await authService.login(values);
      login(data.accessToken, data.refreshToken, data.user);
      message.success(`Chào mừng ${data.user.fullName} đăng nhập thành công!`);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (username: string, pass = '123456') => {
    form.setFieldsValue({ username, password: pass });
    handleLogin({ username, password: pass });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#090D16',
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(5, 150, 105, 0.15) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(2, 132, 199, 0.12) 0px, transparent 50%),
          radial-gradient(#1E293B 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 28px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 960 }}>
        <Row
          gutter={[0, 0]}
          style={{
            backgroundColor: '#0F172A',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid #334155',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          }}
        >
          {/* Left Column: Brand & Feature Highlights */}
          <Col
            xs={0}
            md={11}
            style={{
              padding: '44px 36px',
              backgroundColor: '#0B1120',
              borderRight: '1px solid #1E293B',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Logo & Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: 22,
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)',
                  }}
                >
                  <ThunderboltFilled />
                </div>
                <div>
                  <Title level={4} style={{ color: '#F8FAFC', margin: 0, fontWeight: 800, letterSpacing: 0.5 }}>
                    MINI-ERP
                  </Title>
                  <Text style={{ color: '#059669', fontSize: 12, fontWeight: 700 }}>
                    ENTERPRISE PLATFORM v1.0
                  </Text>
                </div>
              </div>

              <Paragraph style={{ color: '#94A3B8', fontSize: 13.5, lineHeight: 1.6, marginBottom: 32 }}>
                Nền tảng quản trị nguồn lực hợp nhất ba phân hệ cốt lõi: Bán hàng, Mua hàng & Nhà cung cấp, và Kho hàng Double-Entry chuẩn mực doanh nghiệp.
              </Paragraph>

              {/* Feature Points */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <AuditOutlined style={{ color: '#34D399', fontSize: 18, marginTop: 2 }} />
                  <div>
                    <div style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 600 }}>Double-Entry Stock Ledger</div>
                    <div style={{ color: '#64748B', fontSize: 12 }}>Ghi nhận biến động kho bất biến, bảo toàn số dư tức thời.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <ShoppingCartOutlined style={{ color: '#38BDF8', fontSize: 18, marginTop: 2 }} />
                  <div>
                    <div style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 600 }}>Automated Stock Reserving</div>
                    <div style={{ color: '#64748B', fontSize: 12 }}>Duyệt đơn bán hàng tự động giữ chỗ và sinh Phiếu Xuất Kho GIN.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <ShopOutlined style={{ color: '#FBBF24', fontSize: 18, marginTop: 2 }} />
                  <div>
                    <div style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 600 }}>Procurement & Debt Tracking</div>
                    <div style={{ color: '#64748B', fontSize: 12 }}>Quy trình PO, Nhập kho GRN tự động sinh công nợ hạn 30 ngày.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Environment Footer */}
            <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #1E293B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DatabaseOutlined style={{ color: '#10B981' }} />
                <Text style={{ color: '#64748B', fontSize: 11.5 }}>
                  MySQL 8.0 • Host 10.216.1.218 • erp_db
                </Text>
              </div>
            </div>
          </Col>

          {/* Right Column: Login Form */}
          <Col xs={24} md={13} style={{ padding: '44px 40px' }}>
            <div style={{ marginBottom: 28 }}>
              <Title level={3} style={{ color: '#F8FAFC', margin: '0 0 6px 0', fontWeight: 700 }}>
                Đăng nhập hệ thống
              </Title>
              <Text style={{ color: '#94A3B8', fontSize: 13 }}>
                Nhập tài khoản để tiếp tục làm việc trên hệ thống Mini-ERP
              </Text>
            </div>

            {errorMsg && (
              <Alert
                message={errorMsg}
                type="error"
                showIcon
                style={{ marginBottom: 20, borderRadius: 6, backgroundColor: '#451A1A', borderColor: '#7F1D1D', color: '#FCA5A5' }}
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={handleLogin}
              initialValues={{ username: 'admin', password: '123456' }}
              requiredMark={false}
            >
              <Form.Item
                name="username"
                label={<span style={{ color: '#CBD5E1', fontSize: 13, fontWeight: 600 }}>Tên đăng nhập</span>}
                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#64748B' }} />}
                  placeholder="admin, sales, purchasing, warehouse..."
                  size="large"
                  style={{
                    backgroundColor: '#090D16',
                    borderColor: '#334155',
                    color: '#F8FAFC',
                    height: 44,
                    borderRadius: 8,
                  }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span style={{ color: '#CBD5E1', fontSize: 13, fontWeight: 600 }}>Mật khẩu</span>}
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#64748B' }} />}
                  placeholder="Nhập mật khẩu"
                  size="large"
                  style={{
                    backgroundColor: '#090D16',
                    borderColor: '#334155',
                    color: '#F8FAFC',
                    height: 44,
                    borderRadius: 8,
                  }}
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  backgroundColor: '#059669',
                  borderColor: '#059669',
                  fontWeight: 700,
                  fontSize: 14,
                  height: 46,
                  borderRadius: 8,
                  marginTop: 6,
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                }}
              >
                Xác thực & Đăng nhập
              </Button>
            </Form>

            <Divider style={{ borderColor: '#334155', margin: '26px 0 18px' }}>
              <Text style={{ color: '#64748B', fontSize: 12, fontWeight: 500 }}>
                Tài khoản kiểm thử nhanh (Mật khẩu: 123456)
              </Text>
            </Divider>

            {/* Quick Login Buttons with SVG Icons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Button
                icon={<CrownOutlined style={{ color: '#F59E0B' }} />}
                style={{
                  backgroundColor: '#090D16',
                  borderColor: '#334155',
                  color: '#E2E8F0',
                  fontSize: 12.5,
                  height: 38,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => quickFill('admin', '123456')}
              >
                Admin (Toàn quyền)
              </Button>

              <Button
                icon={<ShoppingCartOutlined style={{ color: '#10B981' }} />}
                style={{
                  backgroundColor: '#090D16',
                  borderColor: '#334155',
                  color: '#E2E8F0',
                  fontSize: 12.5,
                  height: 38,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => quickFill('sales_user', '123456')}
              >
                Sales Staff
              </Button>

              <Button
                icon={<ShopOutlined style={{ color: '#38BDF8' }} />}
                style={{
                  backgroundColor: '#090D16',
                  borderColor: '#334155',
                  color: '#E2E8F0',
                  fontSize: 12.5,
                  height: 38,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => quickFill('purchase_user', '123456')}
              >
                Purchasing Staff
              </Button>

              <Button
                icon={<InboxOutlined style={{ color: '#A78BFA' }} />}
                style={{
                  backgroundColor: '#090D16',
                  borderColor: '#334155',
                  color: '#E2E8F0',
                  fontSize: 12.5,
                  height: 38,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => quickFill('warehouse_user', '123456')}
              >
                Warehouse Staff
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};
