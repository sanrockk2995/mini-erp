import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Modal,
  Tag,
  Typography,
  message,
  Popconfirm,
  Timeline,
  Divider,
  Tooltip,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  SendOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { PageHeader, formatCurrency } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { salesService } from '../../services/salesService';
import { SalesOrder } from '../../types';

const { Text, Title } = Typography;

export const SalesOrderListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  const fetchOrders = async (currentPage = page, size = pageSize) => {
    setLoading(true);
    setError(null);
    try {
      const data = await salesService.searchOrders({
        keyword: keyword || undefined,
        status: selectedStatus,
        page: currentPage,
        size,
      });
      setOrders(data.content);
      setTotal(data.totalElements);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách đơn bán hàng. Vui lòng kiểm tra kết nối.');
      message.error('Không thể tải danh sách đơn bán hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(0, pageSize);
  }, [selectedStatus]);

  const handleSearch = () => {
    setPage(0);
    fetchOrders(0, pageSize);
  };

  const handleViewDetail = async (id: number) => {
    try {
      const detail = await salesService.getOrderById(id);
      setSelectedOrder(detail);
      setDetailModalVisible(true);
    } catch (err) {
      message.error('Không thể tải chi tiết đơn hàng');
    }
  };

  const handleApprove = async (id: number) => {
    setActionLoading(true);
    try {
      await salesService.approveOrder(id);
      message.success('Đã duyệt đơn hàng! Kho đã ghi nhận giữ chỗ (Reserved) và tạo Phiếu xuất kho (GIN) nháp.');
      if (selectedOrder && selectedOrder.id === id) {
        handleViewDetail(id);
      }
      fetchOrders();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi duyệt đơn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    setActionLoading(true);
    try {
      await salesService.cancelOrder(id, 'Hủy bởi người dùng');
      message.success('Đã hủy đơn hàng và hoàn lại số lượng tồn giữ chỗ.');
      if (selectedOrder && selectedOrder.id === id) {
        handleViewDetail(id);
      }
      fetchOrders();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    setActionLoading(true);
    try {
      await salesService.updateStatus(id, { status, note: `Chuyển trạng thái sang ${status}` });
      message.success(`Đã cập nhật trạng thái đơn sang ${status}`);
      if (selectedOrder && selectedOrder.id === id) {
        handleViewDetail(id);
      }
      fetchOrders();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderCode',
      key: 'orderCode',
      width: 150,
      render: (code: string) => (
        <span
          className="code-mono"
          style={{
            backgroundColor: '#F1F5F9',
            border: '1px solid #E2E8F0',
            padding: '3px 8px',
            borderRadius: 4,
            fontSize: 12,
            color: '#0369A1',
            fontWeight: 700,
          }}
        >
          {code}
        </span>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 250,
      render: (_: any, record: SalesOrder) => (
        <div style={{ minWidth: 200 }}>
          <Text strong style={{ color: '#0F172A', fontSize: 13.5, whiteSpace: 'nowrap' }}>{record.customerName}</Text>
          {record.customerPhone && (
            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1, whiteSpace: 'nowrap' }}>
              SĐT: <span className="tabular-nums">{record.customerPhone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Kho xuất hàng',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 150,
      render: (wh: string) => (
        <Tag color="cyan" style={{ borderRadius: 4, fontWeight: 500 }}>
          {wh}
        </Tag>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 120,
      render: (d: string) => (
        <span className="tabular-nums" style={{ color: '#475569', fontSize: 12.5 }}>
          {dayjs(d).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      align: 'right' as const,
      render: (val: number) => (
        <span className="tabular-nums" style={{ color: '#059669', fontWeight: 700, fontSize: 13.5 }}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status: string) => <StatusBadge status={status} module="SALES" />,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 140,
      align: 'center' as const,
      render: (_: any, record: SalesOrder) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết đơn">
            <Button
              type="text"
              icon={<EyeOutlined />}
              style={{ color: '#0284C7' }}
              onClick={() => handleViewDetail(record.id)}
            />
          </Tooltip>
          {record.status === 'DRAFT' && (
            <Popconfirm
              title="Duyệt đơn hàng"
              description="Hệ thống sẽ giữ chỗ (Reserved) tồn kho và tạo Phiếu xuất kho (GIN) tự động. Tiếp tục?"
              onConfirm={() => handleApprove(record.id)}
              okText="Duyệt"
              cancelText="Hủy"
              okButtonProps={{ style: { backgroundColor: '#059669', borderColor: '#059669' } }}
            >
              <Tooltip title="Duyệt đơn giữ chỗ">
                <Button type="text" icon={<CheckCircleOutlined />} style={{ color: '#059669' }} />
              </Tooltip>
            </Popconfirm>
          )}
          {['DRAFT', 'APPROVED'].includes(record.status) && (
            <Popconfirm
              title="Hủy đơn hàng"
              description="Bạn có chắc chắn muốn hủy đơn hàng này?"
              onConfirm={() => handleCancel(record.id)}
              okText="Đồng ý hủy"
              cancelText="Không"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Hủy đơn">
                <Button type="text" icon={<CloseCircleOutlined />} danger />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        title="Quản lý Đơn đặt hàng Bán (Sales Orders)"
        subtitle="Theo dõi toàn trình vòng đời đơn bán từ Khởi tạo, Duyệt giữ kho, Xuất hàng tới Hoàn tất"
        tag={
          <Tag color="emerald" style={{ borderRadius: 4, fontWeight: 600 }}>
            {total} Đơn
          </Tag>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{
              backgroundColor: '#059669',
              borderColor: '#059669',
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 6,
              height: 38,
            }}
            onClick={() => navigate('/sales-orders/create')}
          >
            Tạo đơn bán mới
          </Button>
        }
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message="Lỗi tải danh sách đơn hàng"
          description={error}
          action={
            <Button size="small" danger icon={<ReloadOutlined />} onClick={() => fetchOrders()}>
              Thử lại
            </Button>
          }
          style={{ borderRadius: 8 }}
        />
      )}

      <div
        className="erp-card"
        style={{
          background: '#FFFFFF',
          padding: '14px 18px',
          borderRadius: 8,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Input
          placeholder="Tìm theo mã đơn, tên KH, SĐT..."
          prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 280, borderRadius: 6 }}
          allowClear
        />

        <Select
          placeholder="Lọc trạng thái"
          allowClear
          value={selectedStatus}
          onChange={(val) => setSelectedStatus(val)}
          style={{ width: 220 }}
          options={[
            { label: 'DRAFT (Bản nháp)', value: 'DRAFT' },
            { label: 'APPROVED (Đã duyệt)', value: 'APPROVED' },
            { label: 'DELIVERING (Đang giao)', value: 'DELIVERING' },
            { label: 'COMPLETED (Hoàn thành)', value: 'COMPLETED' },
            { label: 'CANCELLED (Đã hủy)', value: 'CANCELLED' },
          ]}
        />

        <Button
          icon={<SearchOutlined />}
          onClick={handleSearch}
          style={{ borderRadius: 6, fontWeight: 500 }}
        >
          Tìm kiếm
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            setKeyword('');
            setSelectedStatus(undefined);
            fetchOrders(0, pageSize);
          }}
          style={{ borderRadius: 6 }}
        >
          Đặt lại
        </Button>
      </div>

      <div className="erp-card" style={{ background: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}>
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 1100 }}
          pagination={{
            current: page + 1,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (p, s) => {
              setPage(p - 1);
              setPageSize(s);
              fetchOrders(p - 1, s);
            },
            showTotal: (totalCount) => `Tổng cộng ${totalCount} đơn hàng`,
          }}
        />
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>Chi tiết đơn hàng:</span>
            <span className="code-mono" style={{ color: '#0369A1' }}>{selectedOrder?.orderCode}</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={850}
        footer={[
          selectedOrder?.status === 'DRAFT' && (
            <Popconfirm
              key="approve"
              title="Xác nhận duyệt đơn"
              description="Hệ thống sẽ giữ chỗ tồn kho và sinh Phiếu xuất kho DRAFT."
              onConfirm={() => handleApprove(selectedOrder.id)}
            >
              <Button type="primary" style={{ backgroundColor: '#059669', borderColor: '#059669', borderRadius: 6 }} loading={actionLoading}>
                Duyệt đơn hàng
              </Button>
            </Popconfirm>
          ),
          selectedOrder?.status === 'APPROVED' && (
            <Button
              key="delivering"
              icon={<SendOutlined />}
              onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERING')}
              loading={actionLoading}
              style={{ borderRadius: 6 }}
            >
              Đang giao hàng
            </Button>
          ),
          selectedOrder?.status === 'DELIVERING' && (
            <Button
              key="complete"
              type="primary"
              icon={<CheckOutlined />}
              style={{ backgroundColor: '#059669', borderColor: '#059669', borderRadius: 6 }}
              onClick={() => handleUpdateStatus(selectedOrder.id, 'COMPLETED')}
              loading={actionLoading}
            >
              Hoàn thành đơn
            </Button>
          ),
          ['DRAFT', 'APPROVED'].includes(selectedOrder?.status || '') && (
            <Popconfirm
              key="cancel"
              title="Hủy đơn hàng"
              onConfirm={() => handleCancel(selectedOrder!.id)}
            >
              <Button danger loading={actionLoading} style={{ borderRadius: 6 }}>Hủy đơn</Button>
            </Popconfirm>
          ),
          <Button key="close" onClick={() => setDetailModalVisible(false)} style={{ borderRadius: 6 }}>
            Đóng
          </Button>,
        ]}
      >
        {selectedOrder && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
                background: '#F8FAFC',
                padding: '16px 20px',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                marginBottom: 20,
                fontSize: 13,
              }}
            >
              <div>
                <Text type="secondary" style={{ fontSize: 11.5 }}>Khách hàng</Text>
                <div><Text strong style={{ fontSize: 14 }}>{selectedOrder.customerName}</Text></div>
                <div style={{ fontSize: 11.5, color: '#64748B' }}>{selectedOrder.customerPhone}</div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11.5 }}>Kho xuất</Text>
                <div><Text strong style={{ fontSize: 14 }}>{selectedOrder.warehouseName}</Text></div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11.5 }}>Ngày đặt</Text>
                <div><span className="tabular-nums" style={{ fontWeight: 600 }}>{dayjs(selectedOrder.orderDate).format('DD/MM/YYYY')}</span></div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11.5 }}>Trạng thái</Text>
                <div style={{ marginTop: 2 }}><StatusBadge status={selectedOrder.status} module="SALES" /></div>
              </div>
            </div>

            <Title level={5} style={{ marginBottom: 12, fontWeight: 700 }}>Danh sách mặt hàng</Title>
            <Table
              dataSource={selectedOrder.items || []}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Mã SKU',
                  dataIndex: 'productSku',
                  key: 'productSku',
                  render: (sku: string) => (
                    <span className="code-mono" style={{ color: '#0369A1', fontWeight: 600 }}>
                      {sku}
                    </span>
                  ),
                },
                {
                  title: 'Tên sản phẩm',
                  dataIndex: 'productName',
                  key: 'productName',
                  render: (name: string) => <Text strong>{name}</Text>,
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  align: 'right' as const,
                  render: (qty: number, record: any) => (
                    <span className="tabular-nums" style={{ fontWeight: 600 }}>
                      {qty} {record.productUnit || ''}
                    </span>
                  ),
                },
                {
                  title: 'Đơn giá',
                  dataIndex: 'unitPrice',
                  key: 'unitPrice',
                  align: 'right' as const,
                  render: (price: number) => (
                    <span className="tabular-nums">{formatCurrency(price)}</span>
                  ),
                },
                {
                  title: 'CK (%)',
                  dataIndex: 'discountPercent',
                  key: 'discountPercent',
                  align: 'right' as const,
                  render: (pct: number) => <span className="tabular-nums">{pct || 0}%</span>,
                },
                {
                  title: 'Thành tiền',
                  dataIndex: 'lineTotal',
                  key: 'lineTotal',
                  align: 'right' as const,
                  render: (total: number) => (
                    <span className="tabular-nums" style={{ color: '#059669', fontWeight: 700 }}>
                      {formatCurrency(total)}
                    </span>
                  ),
                },
              ]}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: 8, background: '#F8FAFC', padding: 16, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Tiền hàng:</Text>
                  <span className="tabular-nums" style={{ fontWeight: 600 }}>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Chiết khấu:</Text>
                  <span className="tabular-nums" style={{ color: '#DC2626', fontWeight: 600 }}>-{formatCurrency(selectedOrder.discountAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Thuế GTGT (VAT):</Text>
                  <span className="tabular-nums" style={{ fontWeight: 600 }}>+{formatCurrency(selectedOrder.taxAmount)}</span>
                </div>
                <Divider style={{ margin: '6px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: 14 }}>Tổng thanh toán:</Text>
                  <span className="tabular-nums" style={{ color: '#059669', fontSize: 18, fontWeight: 800 }}>
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {selectedOrder.statusHistories && selectedOrder.statusHistories.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Title level={5} style={{ fontWeight: 700, marginBottom: 12 }}>Nhật ký tiến trình đơn hàng</Title>
                <Timeline
                  items={selectedOrder.statusHistories.map((h) => ({
                    children: (
                      <div>
                        <span style={{ fontWeight: 600, color: '#1E293B' }}>{h.fromStatus || 'START'} ➔ {h.toStatus}</span>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                          Thực hiện bởi: <strong>{h.changedBy || 'SYSTEM'}</strong> • <span className="tabular-nums">{dayjs(h.changedAt).format('HH:mm DD/MM/YYYY')}</span>
                        </div>
                        {h.note && <div style={{ fontSize: 12, fontStyle: 'italic', color: '#64748B', marginTop: 2 }}>Ghi chú: {h.note}</div>}
                      </div>
                    ),
                  }))}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
