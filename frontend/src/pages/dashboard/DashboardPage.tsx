import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Typography, Button, Space, Tag, Tooltip, Alert } from 'antd';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  BankOutlined,
  ShopOutlined,
  TeamOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
  InboxOutlined,
  ImportOutlined,
  TrophyOutlined,
  RiseOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatNumber } from '../../components/common/PageHeader';
import { dashboardService } from '../../services/dashboardService';
import { warehouseService } from '../../services/warehouseService';
import { DashboardStats, MonthlySales, TopProduct, Inventory } from '../../types';
import { useAuthStore } from '../../store/authStore';

const { Text, Title } = Typography;

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesTrend, setSalesTrend] = useState<MonthlySales[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Inventory[]>([]);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, trendData, topProdData, lowStockData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getSalesTrend(),
        dashboardService.getTopProducts(),
        warehouseService.getLowStockAlerts(),
      ]);
      setStats(statsData);
      setSalesTrend(trendData);
      setTopProducts(topProdData);
      setLowStockItems(lowStockData);
    } catch (err: any) {
      console.error('Failed to load dashboard data', err);
      setError(err?.message || 'Không thể kết nối máy chủ để tải dữ liệu thống kê. Vui lòng kiểm tra kết nối API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const topProductColumns = [
    {
      title: 'Hạng',
      key: 'rank',
      width: 65,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => {
        const medals = ['#F59E0B', '#94A3B8', '#B45309'];
        const isMedal = index < 3;
        return (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: 'var(--radius-xs)',
              backgroundColor: isMedal ? medals[index] : 'var(--color-surface-subtle)',
              color: isMedal ? '#FFFFFF' : 'var(--color-ink-muted)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: 11,
              border: isMedal ? 'none' : '1px solid var(--color-rule)',
            }}
          >
            {index + 1}
          </div>
        );
      },
    },
    {
      title: 'Mã SKU',
      dataIndex: 'productSku',
      key: 'productSku',
      width: 140,
      render: (sku: string) => (
        <span
          className="code-mono"
          style={{
            backgroundColor: 'var(--color-surface-subtle)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-xs)',
            fontSize: 12,
            color: 'var(--color-info)',
            fontWeight: 600,
            border: '1px solid var(--color-rule)',
          }}
        >
          {sku}
        </span>
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (name: string) => (
        <Text strong style={{ color: 'var(--color-ink)', fontSize: 13 }}>
          {name}
        </Text>
      ),
    },
    {
      title: 'Số lượng bán',
      dataIndex: 'totalQuantitySold',
      key: 'totalQuantitySold',
      width: 130,
      align: 'right' as const,
      render: (qty: number) => (
        <span
          className="tabular-nums"
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: 'var(--color-ink)',
            backgroundColor: 'var(--color-surface-subtle)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--color-rule)',
          }}
        >
          {formatNumber(qty)} chiếc
        </span>
      ),
    },
    {
      title: 'Doanh số thực tế',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      width: 160,
      align: 'right' as const,
      render: (rev: number) => (
        <span
          className="tabular-nums"
          style={{
            fontWeight: 700,
            color: 'var(--color-accent)',
            fontSize: 13.5,
          }}
        >
          {formatCurrency(rev)}
        </span>
      ),
    },
  ];

  const lowStockColumns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (record: Inventory) => (
        <div>
          <Text strong style={{ color: 'var(--color-ink)', fontSize: 12.5 }}>
            {record.productName}
          </Text>
          <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', marginTop: 2 }}>
            SKU: <span className="code-mono">{record.productSku}</span> • {record.warehouseName}
          </div>
        </div>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'quantityOnHand',
      key: 'quantityOnHand',
      width: 90,
      align: 'right' as const,
      render: (qty: number) => (
        <span
          className="tabular-nums"
          style={{
            color: qty <= 5 ? 'var(--color-danger)' : 'var(--color-warning)',
            backgroundColor: qty <= 5 ? 'var(--color-danger-subtle)' : 'var(--color-warning-subtle)',
            padding: '2px 7px',
            borderRadius: 'var(--radius-xs)',
            fontWeight: 700,
            fontSize: 12,
            border: `1px solid ${qty <= 5 ? 'var(--color-danger-border)' : 'var(--color-warning-border)'}`,
          }}
        >
          {formatNumber(qty)}
        </span>
      ),
    },
    {
      title: 'Khả dụng',
      dataIndex: 'quantityAvailable',
      key: 'quantityAvailable',
      width: 90,
      align: 'right' as const,
      render: (qty: number) => (
        <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--color-ink-secondary)', fontSize: 12.5 }}>
          {formatNumber(qty)}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      align: 'center' as const,
      render: () => (
        <Tooltip title="Lập đơn mua PO để bổ sung kho ngay">
          <Button
            type="primary"
            size="small"
            style={{
              backgroundColor: 'var(--color-info)',
              borderColor: 'var(--color-info)',
              fontSize: 11,
              borderRadius: 'var(--radius-xs)',
              fontWeight: 600,
              height: 24,
            }}
            onClick={() => navigate('/purchase-orders/create')}
          >
            + PO
          </Button>
        </Tooltip>
      ),
    },
  ];

  const maxRevenue = Math.max(...salesTrend.map((s) => s.revenue), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Error Recovery Alert if API fails */}
      {error && (
        <Alert
          type="error"
          showIcon
          message="Lỗi kết nối dữ liệu thống kê"
          description={error}
          action={
            <Button
              size="small"
              danger
              icon={<ReloadOutlined />}
              onClick={fetchDashboardData}
              loading={loading}
            >
              Thử lại ngay
            </Button>
          }
          style={{ borderRadius: 'var(--radius-md)' }}
        />
      )}

      {/* Workbench Action Rail & Operational Status */}
      <div
        className="erp-card"
        style={{
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              className="telemetry-tag"
              style={{
                backgroundColor: 'var(--color-accent-subtle)',
                color: 'var(--color-accent-text)',
                border: '1px solid var(--color-accent-border)',
              }}
            >
              WORKBENCH · OPERATOR
            </span>
            <Title
              level={4}
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: 'var(--color-ink)',
                fontSize: 18,
              }}
            >
              Bàn làm việc Quản trị Mini-ERP
            </Title>
          </div>
          <Text style={{ fontSize: 12.5, color: 'var(--color-ink-muted)', marginTop: 4, display: 'block' }}>
            Phiên làm việc: <strong style={{ color: 'var(--color-ink)' }}>{user?.fullName || user?.username}</strong> • Cơ sở dữ liệu hoạt động trực tiếp trên máy chủ 10.216.1.218:3306
          </Text>
        </div>

        {/* Quick Action Buttons with Clear Visual Weight: Single Primary Action */}
        <Space wrap size={10}>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            style={{
              backgroundColor: 'var(--color-accent)',
              borderColor: 'var(--color-accent)',
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 'var(--radius-sm)',
              height: 36,
            }}
            onClick={() => navigate('/sales-orders/create')}
          >
            + Đơn bán (SO)
          </Button>

          <Button
            icon={<ShopOutlined />}
            style={{
              borderColor: 'var(--color-rule-strong)',
              color: 'var(--color-ink)',
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 'var(--radius-sm)',
              height: 36,
            }}
            onClick={() => navigate('/purchase-orders/create')}
          >
            + Đơn mua (PO)
          </Button>

          <Button
            icon={<ImportOutlined />}
            style={{
              borderColor: 'var(--color-rule-strong)',
              color: 'var(--color-ink-secondary)',
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 'var(--radius-sm)',
              height: 36,
            }}
            onClick={() => navigate('/goods-receipts')}
          >
            Nhập kho
          </Button>

          <Button
            icon={<InboxOutlined />}
            style={{
              borderColor: 'var(--color-rule-strong)',
              color: 'var(--color-ink-secondary)',
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 'var(--radius-sm)',
              height: 36,
            }}
            onClick={() => navigate('/inventory')}
          >
            Kiểm kê
          </Button>

          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={fetchDashboardData}
            loading={loading}
            style={{ borderRadius: 'var(--radius-sm)', height: 36 }}
            title="Tải lại dữ liệu mới nhất"
          />
        </Space>
      </div>

      {/* Row 1: Asymmetric Bento Grid (Hero KPI Card + 3 Secondary Focus Cells) */}
      <Row gutter={[16, 16]}>
        {/* Left: Wide Hero Revenue Card with Sparkline & Key Performance Ratio */}
        <Col xs={24} lg={10}>
          <div
            className="erp-card"
            style={{
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top Accent Rule */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                backgroundColor: 'var(--color-accent)',
              }}
            />

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--color-ink-muted)',
                  }}
                >
                  Doanh thu tháng này (Tháng 09)
                </span>
                <span
                  className="telemetry-tag"
                  style={{
                    backgroundColor: 'var(--color-accent-subtle)',
                    color: 'var(--color-accent-text)',
                    border: '1px solid var(--color-accent-border)',
                  }}
                >
                  <RiseOutlined /> +12.5% MOM
                </span>
              </div>

              {/* Large Metric Display in Space Grotesk */}
              <div
                className="tabular-nums"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 34,
                  fontWeight: 700,
                  color: 'var(--color-ink)',
                  letterSpacing: '-0.04em',
                  lineHeight: 1.1,
                  marginBottom: 16,
                }}
              >
                {formatCurrency(stats?.totalMonthlyRevenue)}
              </div>

              {/* SVG Sparkline Micro-Ribbon */}
              <div style={{ height: 48, width: '100%', marginBottom: 16 }}>
                <svg viewBox="0 0 300 48" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                  <defs>
                    <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0,38 Q 60,35 100,28 T 180,24 T 240,14 T 300,6 L 300,48 L 0,48 Z"
                    fill="url(#sparkline-grad)"
                  />
                  <path
                    d="M 0,38 Q 60,35 100,28 T 180,24 T 240,14 T 300,6"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="300" cy="6" r="3.5" fill="#059669" />
                </svg>
              </div>
            </div>

            {/* Bottom Proof Metrics */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
                paddingTop: 14,
                borderTop: '1px solid var(--color-rule)',
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
                  Đơn hoàn thành
                </div>
                <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-ink)' }}>
                  {formatNumber(stats?.totalOrdersThisMonth)} <span style={{ fontSize: 12, fontWeight: 500 }}>đơn</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
                  Tỷ lệ giao đúng hạn
                </div>
                <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-accent)' }}>
                  98.2%
                </div>
              </div>
            </div>
          </div>
        </Col>

        {/* Right: 3 Segmented Operational Metrics */}
        <Col xs={24} lg={14}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, height: '100%' }}>
            {/* Cell 1: Đơn chờ duyệt */}
            <div
              className="erp-card"
              style={{
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: '3px solid var(--color-warning)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
                    Chờ duyệt
                  </span>
                  <ClockCircleOutlined style={{ color: 'var(--color-warning)', fontSize: 16 }} />
                </div>
                <div
                  className="tabular-nums"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 28,
                    fontWeight: 700,
                    color: 'var(--color-ink)',
                    marginTop: 8,
                  }}
                >
                  {formatNumber(stats?.pendingOrdersCount)}
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-muted)', marginLeft: 4 }}>đơn</span>
                </div>
              </div>
              <div style={{ marginTop: 16, paddingTop: 10, borderTop: '1px solid var(--color-rule-subtle)' }}>
                <span
                  style={{
                    fontSize: 11.5,
                    color: stats?.pendingOrdersCount && stats.pendingOrdersCount > 0 ? 'var(--color-warning-text)' : 'var(--color-ink-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {stats?.pendingOrdersCount && stats.pendingOrdersCount > 0 ? 'Cần phòng KD duyệt' : 'Đã xử lý hết'}
                </span>
              </div>
            </div>

            {/* Cell 2: Cảnh báo kho */}
            <div
              className="erp-card"
              style={{
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: '3px solid var(--color-danger)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
                    Cảnh báo kho
                  </span>
                  <AlertOutlined style={{ color: 'var(--color-danger)', fontSize: 16 }} />
                </div>
                <div
                  className="tabular-nums"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 28,
                    fontWeight: 700,
                    color: 'var(--color-danger)',
                    marginTop: 8,
                  }}
                >
                  {formatNumber(stats?.lowStockCount)}
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-muted)', marginLeft: 4 }}>SKU</span>
                </div>
              </div>
              <div style={{ marginTop: 16, paddingTop: 10, borderTop: '1px solid var(--color-rule-subtle)' }}>
                <span
                  style={{
                    fontSize: 11.5,
                    color: 'var(--color-danger)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  Dưới tồn an toàn
                </span>
              </div>
            </div>

            {/* Cell 3: Công nợ NCC */}
            <div
              className="erp-card"
              style={{
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: '3px solid var(--color-info)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
                    Công nợ NCC
                  </span>
                  <BankOutlined style={{ color: 'var(--color-info)', fontSize: 16 }} />
                </div>
                <div
                  className="tabular-nums"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'var(--color-ink)',
                    marginTop: 8,
                  }}
                >
                  {formatCurrency(stats?.totalSupplierDebt)}
                </div>
              </div>
              <div style={{ marginTop: 16, paddingTop: 10, borderTop: '1px solid var(--color-rule-subtle)' }}>
                <Button
                  type="link"
                  style={{ padding: 0, height: 'auto', color: 'var(--color-accent)', fontSize: 11.5, fontWeight: 600 }}
                  onClick={() => navigate('/supplier-debts')}
                >
                  Xem sổ công nợ <ArrowRightOutlined style={{ fontSize: 10 }} />
                </Button>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Row 2: Secondary Data Tiles (Khách hàng, NCC, Sổ cái) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div className="erp-card" style={{ borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
              Đối tác Khách hàng hoạt động
            </span>
            <TeamOutlined style={{ color: 'var(--color-info)', fontSize: 16 }} />
          </div>
          <div className="tabular-nums" style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-ink)', margin: '6px 0' }}>
            {formatNumber(stats?.totalCustomersCount)} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-muted)' }}>đối tác</span>
          </div>
          <Button
            type="link"
            style={{ padding: 0, height: 'auto', color: 'var(--color-accent)', fontSize: 12, fontWeight: 600 }}
            onClick={() => navigate('/customers')}
          >
            Quản lý khách hàng <ArrowRightOutlined style={{ fontSize: 10 }} />
          </Button>
        </div>

        <div className="erp-card" style={{ borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
              Danh mục SKU & Nhà cung cấp
            </span>
            <ShopOutlined style={{ color: 'var(--color-accent)', fontSize: 16 }} />
          </div>
          <div className="tabular-nums" style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-ink)', margin: '6px 0' }}>
            {formatNumber(stats?.totalProductsCount)} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-muted)' }}>SKU</span> • {formatNumber(stats?.totalSuppliersCount)} <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-muted)' }}>NCC</span>
          </div>
          <Button
            type="link"
            style={{ padding: 0, height: 'auto', color: 'var(--color-accent)', fontSize: 12, fontWeight: 600 }}
            onClick={() => navigate('/suppliers')}
          >
            Hồ sơ nhà cung cấp <ArrowRightOutlined style={{ fontSize: 10 }} />
          </Button>
        </div>

        <div className="erp-card" style={{ borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
              Sổ cái kho Bất biến
            </span>
            <CheckCircleOutlined style={{ color: 'var(--color-accent)', fontSize: 16 }} />
          </div>
          <div className="tabular-nums" style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-accent)', margin: '6px 0' }}>
            Double-Entry Active
          </div>
          <Button
            type="link"
            style={{ padding: 0, height: 'auto', color: 'var(--color-accent)', fontSize: 12, fontWeight: 600 }}
            onClick={() => navigate('/stock-ledger')}
          >
            Tra cứu biến động kho <ArrowRightOutlined style={{ fontSize: 10 }} />
          </Button>
        </div>
      </div>

      {/* Row 3: High-Density Workbench Grid (Sales Trend Matrix & Low Stock Alerts) */}
      <Row gutter={[16, 16]}>
        {/* Left: Sales Trend Histogram Matrix */}
        <Col xs={24} lg={14}>
          <div
            className="erp-card"
            style={{
              borderRadius: 'var(--radius-md)',
              padding: '20px 24px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RiseOutlined style={{ color: 'var(--color-accent)', fontSize: 16 }} />
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 15,
                    color: 'var(--color-ink)',
                  }}
                >
                  Xu hướng Doanh thu (6 tháng gần nhất)
                </span>
              </div>
              <span
                className="telemetry-tag"
                style={{
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-rule)',
                  color: 'var(--color-ink-muted)',
                }}
              >
                Theo thời gian thực
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, justifyContent: 'space-around' }}>
              {salesTrend.map((item) => {
                const percent = Math.max(Math.round((item.revenue / maxRevenue) * 100), 4);
                return (
                  <div key={item.month}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-ink)' }}>
                          Tháng {item.month}
                        </span>
                        <span
                          className="telemetry-tag"
                          style={{
                            backgroundColor: 'var(--color-surface-subtle)',
                            color: 'var(--color-ink-muted)',
                            border: '1px solid var(--color-rule-subtle)',
                            fontSize: 10.5,
                          }}
                        >
                          {item.orderCount} đơn hàng
                        </span>
                      </div>
                      <span className="tabular-nums" style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: 13.5 }}>
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>

                    {/* Industrial Micro-Histogram Bar */}
                    <div
                      style={{
                        width: '100%',
                        height: 7,
                        backgroundColor: 'var(--color-surface-subtle)',
                        borderRadius: 'var(--radius-pill)',
                        overflow: 'hidden',
                        border: '1px solid var(--color-rule-subtle)',
                      }}
                    >
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          backgroundColor: 'var(--color-accent)',
                          borderRadius: 'var(--radius-pill)',
                          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Col>

        {/* Right: Low Stock Alert Table with Direct Action */}
        <Col xs={24} lg={10}>
          <div
            className="erp-card"
            style={{
              borderRadius: 'var(--radius-md)',
              padding: '20px 24px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertOutlined style={{ color: 'var(--color-danger)', fontSize: 16 }} />
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 15,
                    color: 'var(--color-ink)',
                  }}
                >
                  Cảnh báo tồn kho thấp ({lowStockItems.length})
                </span>
              </div>
              <Button
                type="link"
                style={{ color: 'var(--color-accent)', fontSize: 12, fontWeight: 600, padding: 0 }}
                onClick={() => navigate('/inventory')}
              >
                Chi tiết kho <ArrowRightOutlined style={{ fontSize: 10 }} />
              </Button>
            </div>

            <div style={{ flex: 1 }}>
              <Table
                dataSource={lowStockItems.slice(0, 5)}
                columns={lowStockColumns}
                rowKey="id"
                pagination={false}
                size="small"
                locale={{ emptyText: 'Tất cả sản phẩm đều đảm bảo định mức an toàn' }}
              />
            </div>
          </div>
        </Col>
      </Row>

      {/* Row 4: Top 5 Best Selling Products Table */}
      <div
        className="erp-card"
        style={{
          borderRadius: 'var(--radius-md)',
          padding: '20px 24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrophyOutlined style={{ color: 'var(--color-warning)', fontSize: 16 }} />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 15,
                color: 'var(--color-ink)',
              }}
            >
              Top 5 Sản phẩm Bán chạy nhất
            </span>
          </div>
          <Button
            type="link"
            style={{ color: 'var(--color-accent)', fontSize: 12.5, fontWeight: 600, padding: 0 }}
            onClick={() => navigate('/products')}
          >
            Toàn bộ danh mục sản phẩm <ArrowRightOutlined style={{ fontSize: 10 }} />
          </Button>
        </div>

        <Table
          dataSource={topProducts}
          columns={topProductColumns}
          rowKey="productId"
          pagination={false}
          size="middle"
          locale={{ emptyText: 'Chưa có dữ liệu giao dịch bán hàng' }}
        />
      </div>
    </div>
  );
};
