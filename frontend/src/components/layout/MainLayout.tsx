import React, { useState, useEffect, useMemo } from 'react';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Typography,
  Tag,
  Breadcrumb,
  Badge,
  Popover,
  List,
  Modal,
  Input,
  Tooltip,
} from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  DollarOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  FileDoneOutlined,
  CreditCardOutlined,
  InboxOutlined,
  ImportOutlined,
  ExportOutlined,
  AuditOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  ThunderboltFilled,
  BellOutlined,
  PlusOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  DatabaseOutlined,
  SearchOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Responsive breakpoint listener
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      if (width < 992) {
        setCollapsed(true);
      }
    };
    if (window.innerWidth < 992) {
      setCollapsed(true);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth < 992;

  // Listen for Cmd+K / Ctrl+K to toggle Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    if (isMobile) {
      setCollapsed(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Breadcrumb mapping
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const crumbs = [{ title: <Link to="/"><DashboardOutlined style={{ marginRight: 4 }} />Tổng quan</Link> }];

    if (path === '/products') crumbs.push({ title: <span>1. Quản lý Bán hàng / Danh mục sản phẩm</span> });
    else if (path === '/categories') crumbs.push({ title: <span>1. Quản lý Bán hàng / Cây danh mục</span> });
    else if (path === '/price-lists') crumbs.push({ title: <span>1. Quản lý Bán hàng / Bảng giá</span> });
    else if (path === '/customers') crumbs.push({ title: <span>1. Quản lý Bán hàng / Hồ sơ khách hàng</span> });
    else if (path === '/customer-groups') crumbs.push({ title: <span>1. Quản lý Bán hàng / Nhóm khách hàng</span> });
    else if (path === '/sales-orders') crumbs.push({ title: <span>1. Quản lý Bán hàng / Đơn đặt hàng bán</span> });
    else if (path === '/sales-orders/create') crumbs.push({ title: <span>1. Quản lý Bán hàng / Tạo đơn bán mới</span> });
    else if (path === '/suppliers') crumbs.push({ title: <span>2. Mua hàng & NCC / Nhà cung cấp & Đánh giá</span> });
    else if (path === '/purchase-orders') crumbs.push({ title: <span>2. Mua hàng & NCC / Đơn mua (PO)</span> });
    else if (path === '/purchase-orders/create') crumbs.push({ title: <span>2. Mua hàng & NCC / Tạo đơn mua PO</span> });
    else if (path === '/supplier-debts') crumbs.push({ title: <span>2. Mua hàng & NCC / Công nợ NCC & Thanh toán</span> });
    else if (path === '/inventory') crumbs.push({ title: <span>3. Quản lý Kho / Tổng hợp tồn & Cảnh báo</span> });
    else if (path === '/goods-receipts') crumbs.push({ title: <span>3. Quản lý Kho / Phiếu nhập kho (GRN)</span> });
    else if (path === '/goods-issues') crumbs.push({ title: <span>3. Quản lý Kho / Phiếu xuất kho (GIN)</span> });
    else if (path === '/stock-ledger') crumbs.push({ title: <span>3. Quản lý Kho / Sổ cái biến động kho</span> });
    else if (path === '/warehouses') crumbs.push({ title: <span>3. Quản lý Kho / Danh mục kho hàng</span> });

    return crumbs;
  };

  // Command palette navigation items
  const commandItems = useMemo(
    () => [
      { key: '/sales-orders/create', title: 'Tạo đơn đặt hàng bán mới (SO)', category: '1. Quản lý Bán hàng', icon: <ShoppingCartOutlined /> },
      { key: '/sales-orders', title: 'Danh sách đơn bán hàng (SO)', category: '1. Quản lý Bán hàng', icon: <FileDoneOutlined /> },
      { key: '/customers', title: 'Danh sách đối tác khách hàng', category: '1. Quản lý Bán hàng', icon: <TeamOutlined /> },
      { key: '/customer-groups', title: 'Phân loại nhóm khách hàng', category: '1. Quản lý Bán hàng', icon: <UsergroupAddOutlined /> },
      { key: '/products', title: 'Danh mục sản phẩm & Tồn', category: '1. Quản lý Bán hàng', icon: <ShoppingOutlined /> },
      { key: '/categories', title: 'Cây danh mục ngành hàng', category: '1. Quản lý Bán hàng', icon: <AppstoreOutlined /> },
      { key: '/price-lists', title: 'Bảng giá bán buôn & bán lẻ', category: '1. Quản lý Bán hàng', icon: <DollarOutlined /> },
      { key: '/purchase-orders/create', title: 'Lập đơn mua hàng mới (PO)', category: '2. Mua hàng & NCC', icon: <ShopOutlined /> },
      { key: '/purchase-orders', title: 'Danh sách đơn mua hàng (PO)', category: '2. Mua hàng & NCC', icon: <FileDoneOutlined /> },
      { key: '/suppliers', title: 'Danh sách nhà cung cấp & Đánh giá', category: '2. Mua hàng & NCC', icon: <ShopOutlined /> },
      { key: '/supplier-debts', title: 'Quản lý công nợ NCC & Thanh toán', category: '2. Mua hàng & NCC', icon: <CreditCardOutlined /> },
      { key: '/inventory', title: 'Xem tồn kho & Cảnh báo định mức', category: '3. Quản lý Kho', icon: <InboxOutlined /> },
      { key: '/goods-receipts', title: 'Phiếu nhập kho hàng hóa (GRN)', category: '3. Quản lý Kho', icon: <ImportOutlined /> },
      { key: '/goods-issues', title: 'Phiếu xuất kho giao hàng (GIN)', category: '3. Quản lý Kho', icon: <ExportOutlined /> },
      { key: '/stock-ledger', title: 'Sổ cái biến động kho bất biến', category: '3. Quản lý Kho', icon: <AuditOutlined /> },
      { key: '/warehouses', title: 'Danh mục kho hàng', category: '3. Quản lý Kho', icon: <HomeOutlined /> },
    ],
    []
  );

  const filteredCommandItems = useMemo(() => {
    if (!searchQuery.trim()) return commandItems;
    const q = searchQuery.toLowerCase();
    return commandItems.filter((i) => i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
  }, [searchQuery, commandItems]);

  const notifications = [
    {
      id: 1,
      title: 'Đơn hàng SO-20260912-3790 chờ duyệt',
      desc: 'Khách hàng Nguyễn Văn An • Giá trị: 33.000.000 ₫',
      time: '10 phút trước',
      type: 'warning',
    },
    {
      id: 2,
      title: 'Nhập kho GRN-20260912-1552 đã hoàn tất',
      desc: 'Tồn kho SP-IP15PM-256 +2 chiếc • Tự động sinh công nợ',
      time: '15 phút trước',
      type: 'success',
    },
    {
      id: 3,
      title: 'Hệ thống Sổ cái Bất biến hoạt động ổn định',
      desc: 'Database 10.216.1.218 kết nối tốt (Pool 10/10)',
      time: 'Hôm nay',
      type: 'info',
    },
  ];

  const notificationContent = (
    <div style={{ width: 340 }}>
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid var(--color-rule)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--color-surface-subtle)',
        }}
      >
        <Text strong style={{ fontSize: 13, color: 'var(--color-ink)' }}>
          Thông báo vận hành
        </Text>
        <span
          className="telemetry-tag"
          style={{
            backgroundColor: 'var(--color-accent-subtle)',
            color: 'var(--color-accent-text)',
            border: '1px solid var(--color-accent-border)',
          }}
        >
          2 Mới
        </span>
      </div>
      <List
        size="small"
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            style={{
              padding: '12px 14px',
              cursor: 'pointer',
              borderBottom: '1px solid var(--color-rule-subtle)',
              transition: 'background var(--transition-fast)',
            }}
          >
            <List.Item.Meta
              avatar={
                item.type === 'warning' ? (
                  <ClockCircleOutlined style={{ color: 'var(--color-warning)', fontSize: 16, marginTop: 3 }} />
                ) : item.type === 'success' ? (
                  <CheckCircleFilled style={{ color: 'var(--color-accent)', fontSize: 16, marginTop: 3 }} />
                ) : (
                  <DatabaseOutlined style={{ color: 'var(--color-info)', fontSize: 16, marginTop: 3 }} />
                )
              }
              title={
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--color-ink)' }}>
                  {item.title}
                </span>
              }
              description={
                <div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-ink-muted)' }}>{item.desc}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--color-ink-subtle)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                    {item.time}
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );

  const quickActionsMenu = [
    {
      key: 'new-so',
      icon: <ShoppingCartOutlined style={{ color: 'var(--color-accent)' }} />,
      label: 'Tạo đơn đặt hàng bán (SO)',
      onClick: () => navigate('/sales-orders/create'),
    },
    {
      key: 'new-po',
      icon: <ShopOutlined style={{ color: 'var(--color-info)' }} />,
      label: 'Lập đơn mua hàng (PO)',
      onClick: () => navigate('/purchase-orders/create'),
    },
    {
      key: 'view-inventory',
      icon: <InboxOutlined style={{ color: 'var(--color-warning)' }} />,
      label: 'Kiểm kê & Điều chỉnh kho',
      onClick: () => navigate('/inventory'),
    },
  ];

  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '8px 12px', minWidth: 200 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-ink)' }}>{user?.fullName || user?.username}</div>
          <div style={{ fontSize: 12, color: 'var(--color-ink-muted)', marginBottom: 6 }}>{user?.email}</div>
          <Space wrap size={[4, 4]}>
            {user?.roles?.map((r) => (
              <span
                key={r}
                className="telemetry-tag"
                style={{
                  backgroundColor: 'var(--color-accent-subtle)',
                  color: 'var(--color-accent-text)',
                  border: '1px solid var(--color-accent-border)',
                }}
              >
                {r}
              </span>
            ))}
          </Space>
        </div>
      ),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất tài khoản',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined style={{ fontSize: 15 }} />,
      label: 'Bàn làm việc (Dashboard)',
    },
    {
      key: 'module-sales',
      icon: <ShoppingCartOutlined style={{ fontSize: 15 }} />,
      label: '1. Quản lý Bán hàng',
      children: [
        {
          key: 'grp-so',
          type: 'group',
          label: 'ĐƠN HÀNG BÁN (SO)',
          children: [
            { key: '/sales-orders', icon: <FileDoneOutlined />, label: 'Danh sách đơn bán' },
            { key: '/sales-orders/create', icon: <PlusOutlined />, label: 'Tạo đơn bán mới' },
          ],
        },
        {
          key: 'grp-customers',
          type: 'group',
          label: 'KHÁCH HÀNG',
          children: [
            { key: '/customers', icon: <TeamOutlined />, label: 'Hồ sơ khách hàng' },
            { key: '/customer-groups', icon: <UsergroupAddOutlined />, label: 'Phân loại nhóm KH' },
          ],
        },
        {
          key: 'grp-products',
          type: 'group',
          label: 'SẢN PHẨM & BẢNG GIÁ',
          children: [
            { key: '/products', icon: <ShoppingOutlined />, label: 'Danh mục sản phẩm' },
            { key: '/categories', icon: <AppstoreOutlined />, label: 'Cây danh mục ngành hàng' },
            { key: '/price-lists', icon: <DollarOutlined />, label: 'Bảng giá bán buôn & lẻ' },
          ],
        },
      ],
    },
    {
      key: 'module-purchasing',
      icon: <ShopOutlined style={{ fontSize: 15 }} />,
      label: '2. Mua hàng & NCC',
      children: [
        {
          key: 'grp-po',
          type: 'group',
          label: 'ĐƠN MUA HÀNG (PO)',
          children: [
            { key: '/purchase-orders', icon: <FileDoneOutlined />, label: 'Danh sách đơn mua' },
            { key: '/purchase-orders/create', icon: <PlusOutlined />, label: 'Tạo đơn mua PO' },
          ],
        },
        {
          key: 'grp-suppliers',
          type: 'group',
          label: 'NHÀ CUNG CẤP',
          children: [
            { key: '/suppliers', icon: <ShopOutlined />, label: 'Danh sách & Đánh giá NCC' },
          ],
        },
        {
          key: 'grp-debt',
          type: 'group',
          label: 'CÔNG NỢ PHẢI TRẢ',
          children: [
            { key: '/supplier-debts', icon: <CreditCardOutlined />, label: 'Công nợ NCC & Thanh toán' },
          ],
        },
      ],
    },
    {
      key: 'module-warehouse',
      icon: <InboxOutlined style={{ fontSize: 15 }} />,
      label: '3. Quản lý Kho hàng',
      children: [
        {
          key: 'grp-inventory',
          type: 'group',
          label: 'TỒN KHO & ĐỊNH MỨC',
          children: [
            { key: '/inventory', icon: <InboxOutlined />, label: 'Tổng hợp tồn & Cảnh báo' },
            { key: '/warehouses', icon: <HomeOutlined />, label: 'Danh mục kho hàng' },
          ],
        },
        {
          key: 'grp-wh-ops',
          type: 'group',
          label: 'GIAO DỊCH KHO',
          children: [
            { key: '/goods-receipts', icon: <ImportOutlined />, label: 'Phiếu nhập kho (GRN)' },
            { key: '/goods-issues', icon: <ExportOutlined />, label: 'Phiếu xuất kho (GIN)' },
            { key: '/stock-ledger', icon: <AuditOutlined />, label: 'Sổ cái biến động kho' },
          ],
        },
      ],
    },
  ];

  const getOpenKeys = () => {
    const path = location.pathname;
    if (
      path.startsWith('/sales-orders') ||
      path.startsWith('/customers') ||
      path.startsWith('/customer-groups') ||
      path.startsWith('/products') ||
      path.startsWith('/categories') ||
      path.startsWith('/price-lists')
    ) {
      return ['module-sales'];
    }
    if (
      path.startsWith('/purchase-orders') ||
      path.startsWith('/suppliers') ||
      path.startsWith('/supplier-debts')
    ) {
      return ['module-purchasing'];
    }
    if (
      path.startsWith('/inventory') ||
      path.startsWith('/goods-receipts') ||
      path.startsWith('/goods-issues') ||
      path.startsWith('/stock-ledger') ||
      path.startsWith('/warehouses')
    ) {
      return ['module-warehouse'];
    }
    return [];
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: 'var(--color-paper)' }}>
      {/* Mobile Drawer Backdrop */}
      {isMobile && !collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(2px)',
            zIndex: 999,
            transition: 'opacity 0.25s ease',
          }}
        />
      )}

      {/* Sider: High-density Command Rail */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={260}
        collapsedWidth={isMobile ? 0 : 80}
        trigger={null}
        theme="dark"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          backgroundColor: 'var(--color-sider-bg)',
          borderRight: '1px solid var(--color-sider-border)',
          zIndex: isMobile ? 1000 : 100,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isMobile && !collapsed ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
            padding: collapsed && !isMobile ? '0' : '0 18px',
            backgroundColor: 'var(--color-sider-header)',
            borderBottom: '1px solid var(--color-sider-border)',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              minWidth: 0,
              cursor: 'pointer',
              userSelect: 'none',
              width: '100%',
              justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
            }}
            onClick={() => (collapsed ? setCollapsed(false) : navigate('/'))}
            title={collapsed ? 'Nhấp để mở rộng menu' : 'Về trang chủ Dashboard'}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: 18,
                marginRight: collapsed && !isMobile ? 0 : 12,
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              <ThunderboltFilled />
            </div>
            {!collapsed && (
              <div style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      color: '#F8FAFC',
                      fontWeight: 700,
                      fontSize: 16,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                    }}
                  >
                    MINI-ERP
                  </span>
                  <span
                    className="telemetry-tag"
                    style={{
                      backgroundColor: 'rgba(5, 150, 105, 0.2)',
                      color: '#34D399',
                      fontSize: 9.5,
                      padding: '1px 5px',
                      borderRadius: 4,
                      fontWeight: 600,
                      border: '1px solid rgba(5, 150, 105, 0.4)',
                      lineHeight: 1.2,
                    }}
                  >
                    SYS·LIVE
                  </span>
                </div>
                <div
                  style={{
                    color: 'var(--color-ink-muted)',
                    fontSize: 11,
                    fontWeight: 500,
                    lineHeight: 1.2,
                    marginTop: 3,
                    letterSpacing: '0.01em',
                  }}
                >
                  Enterprise Platform v1.0
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            backgroundColor: 'var(--color-sider-bg)',
            borderRight: 'none',
            fontSize: 13,
            padding: '12px 6px 24px 6px',
            fontWeight: 500,
          }}
        />
      </Sider>

      {/* Main Content Area */}
      <Layout
        style={{
          marginLeft: isMobile ? 0 : (collapsed ? 80 : 260),
          transition: 'margin-left var(--transition-normal)',
          minHeight: '100vh',
          backgroundColor: 'var(--color-paper)',
        }}
      >
        {/* Edge-Aligned Minimalist Header */}
        <Header
          style={{
            padding: isMobile ? '0 12px' : '0 20px',
            background: 'var(--color-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--color-rule)',
            position: 'sticky',
            top: 0,
            zIndex: 90,
            height: 64,
            boxShadow: 'var(--shadow-hairline)',
            gap: 10,
          }}
        >
          {/* Left: Collapse Toggle + Breadcrumbs */}
          <Space size={isMobile ? 8 : 12} align="center" style={{ minWidth: 0, flexShrink: 1, overflow: 'hidden' }}>
            <Tooltip title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: 16, width: 36, height: 36, color: 'var(--color-ink-muted)', flexShrink: 0 }}
              />
            </Tooltip>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <Breadcrumb items={getBreadcrumbs()} separator="/" style={{ fontSize: isMobile ? 12 : 13 }} />
            </div>
          </Space>

          {/* Center / Search: Hallmark ⌘K Command Palette Trigger */}
          {windowWidth >= 900 ? (
            <Button
              type="default"
              onClick={() => setCommandOpen(true)}
              style={{
                backgroundColor: 'var(--color-surface-subtle)',
                borderColor: 'var(--color-rule)',
                color: 'var(--color-ink-muted)',
                fontSize: 12.5,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0 12px',
                minWidth: 220,
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <SearchOutlined style={{ fontSize: 13, color: 'var(--color-ink-subtle)' }} />
                Tìm nhanh nghiệp vụ...
              </span>
              <kbd
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  padding: '1px 5px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-rule-strong)',
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--color-ink-secondary)',
                }}
              >
                ⌘K
              </kbd>
            </Button>
          ) : (
            <Tooltip title="Tìm nhanh nghiệp vụ (⌘K)">
              <Button
                type="text"
                icon={<SearchOutlined style={{ fontSize: 16, color: 'var(--color-ink-muted)' }} />}
                onClick={() => setCommandOpen(true)}
                style={{ width: 36, height: 36, flexShrink: 0 }}
              />
            </Tooltip>
          )}

          {/* Right: Quick Action, Notifications, User Profile */}
          <Space size={isMobile ? 8 : 12} align="center" style={{ flexShrink: 0 }}>
            {/* Quick Action Button */}
            <Dropdown menu={{ items: quickActionsMenu }} placement="bottomRight">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{
                  backgroundColor: 'var(--color-accent)',
                  borderColor: 'var(--color-accent)',
                  fontWeight: 600,
                  fontSize: 13,
                  borderRadius: 'var(--radius-sm)',
                  height: 36,
                  padding: isMobile ? '0 10px' : '0 14px',
                }}
              >
                {!isMobile && 'Tạo mới'}
              </Button>
            </Dropdown>

            {/* Notification Bell */}
            <Popover content={notificationContent} trigger="click" placement="bottomRight" arrow={false}>
              <Badge count={2} size="small" offset={[-2, 4]} color="var(--color-warning)">
                <Button
                  type="text"
                  shape="circle"
                  icon={<BellOutlined style={{ fontSize: 16, color: 'var(--color-ink-muted)' }} />}
                  style={{ width: 36, height: 36 }}
                />
              </Badge>
            </Popover>

            <div style={{ width: 1, height: 20, backgroundColor: 'var(--color-rule)' }} />

            {/* User Profile Dropdown */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow={false}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  padding: '4px 6px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <Avatar
                  style={{
                    backgroundColor: 'var(--color-accent)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                  size={32}
                >
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                {windowWidth >= 768 && (
                  <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>
                      {user?.fullName || user?.username}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>
                      {user?.roles?.[0] || 'Nhân viên'}
                    </div>
                  </div>
                )}
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* Content Viewport */}
        <Content
          style={{
            padding: isMobile ? '14px 14px' : '20px 24px',
            backgroundColor: 'var(--color-paper)',
            minHeight: 'calc(100vh - 64px)',
            overflowX: 'hidden',
          }}
        >
          <Outlet />
        </Content>
      </Layout>

      {/* Hallmark ⌘K Command Palette Modal */}
      <Modal
        open={commandOpen}
        onCancel={() => {
          setCommandOpen(false);
          setSearchQuery('');
        }}
        footer={null}
        closable={false}
        width={560}
        destroyOnClose
        styles={{
          content: {
            padding: 0,
            overflow: 'hidden',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-rule)',
            boxShadow: 'var(--shadow-command)',
          },
        }}
      >
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--color-rule)' }}>
          <Input
            prefix={<SearchOutlined style={{ color: 'var(--color-ink-muted)', fontSize: 16, marginRight: 8 }} />}
            placeholder="Tìm kiếm phân hệ, màn hình hoặc tạo mới nghiệp vụ... (Ví dụ: Đơn bán, Nhập kho, Công nợ)"
            variant="borderless"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ fontSize: 14, fontWeight: 500 }}
          />
        </div>

        <div style={{ maxHeight: 360, overflowY: 'auto', padding: '8px' }}>
          {filteredCommandItems.length > 0 ? (
            filteredCommandItems.map((item) => (
              <div
                key={item.key}
                onClick={() => {
                  setCommandOpen(false);
                  setSearchQuery('');
                  navigate(item.key);
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-subtle)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'var(--color-accent)', fontSize: 16 }}>{item.icon}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-ink)' }}>{item.title}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    className="telemetry-tag"
                    style={{
                      backgroundColor: 'var(--color-surface-subtle)',
                      border: '1px solid var(--color-rule)',
                      color: 'var(--color-ink-muted)',
                      fontSize: 10.5,
                    }}
                  >
                    {item.category}
                  </span>
                  <RightOutlined style={{ fontSize: 11, color: 'var(--color-ink-subtle)' }} />
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-ink-muted)', fontSize: 13 }}>
              Không tìm thấy thao tác phù hợp với từ khóa "{searchQuery}"
            </div>
          )}
        </div>

        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--color-rule-subtle)',
            backgroundColor: 'var(--color-surface-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 11.5,
            color: 'var(--color-ink-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span>Nhấn [ESC] để đóng</span>
          <span>Mini-ERP Command Palette</span>
        </div>
      </Modal>
    </Layout>
  );
};
