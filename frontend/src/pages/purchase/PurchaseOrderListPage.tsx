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
  Divider,
  Tooltip,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  SendOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { PageHeader, formatCurrency } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { purchaseService } from '../../services/purchaseService';
import { PurchaseOrder } from '../../types';

const { Text, Title } = Typography;

export const PurchaseOrderListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();

  const fetchOrders = async (currentPage = page, size = pageSize) => {
    setLoading(true);
    setError(null);
    try {
      const data = await purchaseService.searchOrders({
        keyword: keyword || undefined,
        status: selectedStatus,
        page: currentPage,
        size,
      });
      setOrders(data.content);
      setTotal(data.totalElements);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách đơn mua hàng. Vui lòng kiểm tra kết nối.');
      message.error('Không thể tải danh sách đơn mua hàng');
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
      const detail = await purchaseService.getOrderById(id);
      setSelectedOrder(detail);
      setDetailModalVisible(true);
    } catch (err) {
      message.error('Không thể tải chi tiết đơn mua hàng');
    }
  };

  const handleSubmitApproval = async (id: number) => {
    setActionLoading(true);
    try {
      await purchaseService.submitForApproval(id);
      message.success('Đã gửi đơn mua hàng lên cấp quản lý chờ duyệt');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === id) {
        handleViewDetail(id);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setActionLoading(true);
    try {
      await purchaseService.approveOrder(id);
      message.success('Đã duyệt đơn mua hàng (APPROVED)! Kho đã sẵn sàng lập Phiếu Nhập Kho (GRN).');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === id) {
        handleViewDetail(id);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi duyệt đơn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading(true);
    try {
      await purchaseService.rejectOrder(id, 'Từ chối bởi cấp quản lý');
      message.success('Đã từ chối đơn mua hàng');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === id) {
        handleViewDetail(id);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã đơn mua (PO)',
      dataIndex: 'poCode',
      key: 'poCode',
      width: 170,
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
      title: 'Nhà cung cấp',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 250,
      render: (name: string, record: PurchaseOrder) => (
        <div style={{ minWidth: 200 }}>
          <Text strong style={{ color: '#0F172A', fontSize: 13.5, whiteSpace: 'nowrap' }}>{name}</Text>
          <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1, whiteSpace: 'nowrap' }}>
            Mã NCC: <span className="code-mono">{record.supplierCode}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Kho nhận hàng',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 140,
      render: (wh: string) => (
        <Tag color="purple" style={{ borderRadius: 4, fontWeight: 500 }}>
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
      title: 'Tổng tiền mua',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      width: 160,
      render: (val: number) => (
        <span className="tabular-nums" style={{ color: '#059669', fontWeight: 700, fontSize: 14 }}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status: string) => <StatusBadge status={status} module="PURCHASE" />,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 140,
      align: 'center' as const,
      render: (_: any, record: PurchaseOrder) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết đơn mua">
            <Button
              type="text"
              icon={<EyeOutlined />}
              style={{ color: '#0284C7' }}
              onClick={() => handleViewDetail(record.id)}
            />
          </Tooltip>
          {record.status === 'DRAFT' && (
            <Popconfirm
              title="Gửi duyệt đơn mua"
              description="Gửi đơn mua hàng này lên cấp thẩm quyền để duyệt?"
              onConfirm={() => handleSubmitApproval(record.id)}
            >
              <Tooltip title="Gửi duyệt">
                <Button type="text" icon={<SendOutlined />} style={{ color: '#F59E0B' }} />
              </Tooltip>
            </Popconfirm>
          )}
          {record.status === 'PENDING_APPROVAL' && (
            <>
              <Popconfirm
                title="Duyệt đơn mua hàng"
                description="Xác nhận phê duyệt đơn mua hàng này?"
                onConfirm={() => handleApprove(record.id)}
              >
                <Tooltip title="Duyệt đơn">
                  <Button type="text" icon={<CheckCircleOutlined />} style={{ color: '#059669' }} />
                </Tooltip>
              </Popconfirm>
              <Popconfirm
                title="Từ chối đơn"
                description="Bạn có chắc muốn từ chối đơn mua này?"
                onConfirm={() => handleReject(record.id)}
              >
                <Tooltip title="Từ chối">
                  <Button type="text" icon={<CloseCircleOutlined />} danger />
                </Tooltip>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        title="Đơn Mua hàng Nhà cung cấp (Purchase Orders - PO)"
        subtitle="Quy trình lập lệnh mua, phê duyệt theo thẩm quyền và tự động kích hoạt nhập kho & công nợ"
        tag={
          <Tag color="purple" style={{ borderRadius: 4, fontWeight: 600 }}>
            {total} Đơn mua
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
            onClick={() => navigate('/purchase-orders/create')}
          >
            Tạo đơn mua (PO) mới
          </Button>
        }
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message="Lỗi tải danh sách đơn mua hàng"
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
          placeholder="Tìm theo mã PO, tên NCC..."
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
            { label: 'PENDING_APPROVAL (Chờ duyệt)', value: 'PENDING_APPROVAL' },
            { label: 'APPROVED (Đã duyệt)', value: 'APPROVED' },
            { label: 'RECEIVED (Đã nhập kho)', value: 'RECEIVED' },
            { label: 'CLOSED (Hoàn tất)', value: 'CLOSED' },
            { label: 'REJECTED (Từ chối)', value: 'REJECTED' },
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
            showTotal: (totalCount) => `Tổng cộng ${totalCount} đơn mua hàng`,
          }}
        />
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>Chi tiết đơn mua:</span>
            <span className="code-mono" style={{ color: '#0369A1' }}>{selectedOrder?.poCode}</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={820}
        footer={[
          selectedOrder?.status === 'DRAFT' && (
            <Button
              key="submit"
              type="primary"
              icon={<SendOutlined />}
              style={{ backgroundColor: '#F59E0B', borderColor: '#F59E0B', borderRadius: 6 }}
              onClick={() => handleSubmitApproval(selectedOrder.id)}
              loading={actionLoading}
            >
              Gửi chờ duyệt
            </Button>
          ),
          selectedOrder?.status === 'PENDING_APPROVAL' && (
            <Button
              key="approve"
              type="primary"
              icon={<CheckCircleOutlined />}
              style={{ backgroundColor: '#059669', borderColor: '#059669', borderRadius: 6 }}
              onClick={() => handleApprove(selectedOrder.id)}
              loading={actionLoading}
            >
              Duyệt đơn hàng
            </Button>
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
                <Text type="secondary" style={{ fontSize: 11.5 }}>Nhà cung cấp</Text>
                <div><Text strong style={{ fontSize: 14 }}>{selectedOrder.supplierName}</Text></div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11.5 }}>Kho nhận hàng</Text>
                <div><Text strong style={{ fontSize: 14 }}>{selectedOrder.warehouseName}</Text></div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11.5 }}>Ngày đặt hàng</Text>
                <div><span className="tabular-nums" style={{ fontWeight: 600 }}>{dayjs(selectedOrder.orderDate).format('DD/MM/YYYY')}</span></div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11.5 }}>Trạng thái</Text>
                <div style={{ marginTop: 2 }}><StatusBadge status={selectedOrder.status} module="PURCHASE" /></div>
              </div>
            </div>

            <Title level={5} style={{ marginBottom: 12, fontWeight: 700 }}>Danh sách hàng hóa đặt mua</Title>
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
                  title: 'Số lượng đặt',
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
                  title: 'Đơn giá mua',
                  dataIndex: 'unitPrice',
                  key: 'unitPrice',
                  align: 'right' as const,
                  render: (price: number) => (
                    <span className="tabular-nums">{formatCurrency(price)}</span>
                  ),
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
                  <Text type="secondary">Tổng tiền hàng:</Text>
                  <span className="tabular-nums" style={{ fontWeight: 600 }}>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Thuế GTGT (VAT):</Text>
                  <span className="tabular-nums" style={{ fontWeight: 600 }}>+{formatCurrency(selectedOrder.taxAmount)}</span>
                </div>
                <Divider style={{ margin: '6px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: 14 }}>Tổng tiền mua (PO):</Text>
                  <span className="tabular-nums" style={{ color: '#059669', fontSize: 18, fontWeight: 800 }}>
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
