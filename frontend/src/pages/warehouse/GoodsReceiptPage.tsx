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
  Card,
  Form,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageHeader, formatCurrency } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { warehouseService } from '../../services/warehouseService';
import { purchaseService } from '../../services/purchaseService';
import { GoodsReceiptNote, PurchaseOrder } from '../../types';

const { Text, Title } = Typography;

export const GoodsReceiptPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<GoodsReceiptNote[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<GoodsReceiptNote | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [approvedPOs, setApprovedPOs] = useState<PurchaseOrder[]>([]);
  const [createForm] = Form.useForm();

  const fetchReceipts = async (currentPage = page, size = pageSize) => {
    setLoading(true);
    setError(null);
    try {
      const data = await warehouseService.searchReceipts({
        keyword: keyword || undefined,
        status: selectedStatus,
        page: currentPage,
        size,
      });
      setReceipts(data.content);
      setTotal(data.totalElements);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách phiếu nhập kho. Vui lòng kiểm tra kết nối.');
      message.error('Không thể tải danh sách phiếu nhập kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts(0, pageSize);
  }, [selectedStatus]);

  const handleSearch = () => {
    setPage(0);
    fetchReceipts(0, pageSize);
  };

  const handleViewDetail = async (id: number) => {
    try {
      const detail = await warehouseService.getReceiptById(id);
      setSelectedReceipt(detail);
      setDetailModalVisible(true);
    } catch (err) {
      message.error('Không thể tải chi tiết phiếu nhập kho');
    }
  };

  const handleConfirm = async (id: number) => {
    setConfirmLoading(true);
    try {
      await warehouseService.confirmReceipt(id);
      message.success('Xác nhận nhập kho thành công! Đã tăng tồn kho thực tế, ghi sổ cái kho, cập nhật PO và phát sinh công nợ NCC.');
      fetchReceipts();
      if (selectedReceipt && selectedReceipt.id === id) {
        handleViewDetail(id);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi xác nhận nhập kho');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleOpenCreateModal = async () => {
    try {
      const pos = await purchaseService.searchOrders({ status: 'APPROVED', page: 0, size: 50 });
      setApprovedPOs(pos.content);
      createForm.resetFields();
      createForm.setFieldsValue({ receiptDate: dayjs() });
      setCreateModalVisible(true);
    } catch (err) {
      message.error('Không thể tải danh sách PO đã duyệt');
    }
  };

  const handleCreateFromPO = async () => {
    try {
      const values = await createForm.validateFields();
      const po = approvedPOs.find((p) => p.id === values.poId);
      if (!po) return;

      const payload = {
        poId: po.id,
        warehouseId: po.warehouseId,
        receiptDate: values.receiptDate.format('YYYY-MM-DD'),
        notes: values.notes,
        items: po.items?.map((it) => ({
          productId: it.productId,
          orderedQuantity: it.quantity,
          receivedQuantity: it.quantity,
          unitPrice: it.unitPrice,
        })),
      };

      await warehouseService.createReceipt(payload);
      message.success('Lập Phiếu Nhập Kho (GRN) thành công');
      setCreateModalVisible(false);
      fetchReceipts();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const columns = [
    {
      title: 'Mã phiếu nhập (GRN)',
      dataIndex: 'grnCode',
      key: 'grnCode',
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
      title: 'Đơn mua hàng (PO)',
      dataIndex: 'poCode',
      key: 'poCode',
      width: 160,
      render: (code: string) =>
        code ? (
          <span
            className="code-mono"
            style={{
              backgroundColor: '#FAF5FF',
              border: '1px solid #E9D5FF',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 12,
              color: '#7E22CE',
              fontWeight: 600,
            }}
          >
            {code}
          </span>
        ) : (
          <span style={{ color: '#94A3B8', fontSize: 12 }}>Nhập trực tiếp</span>
        ),
    },
    {
      title: 'Kho nhận',
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
      title: 'Ngày nhập kho',
      dataIndex: 'receiptDate',
      key: 'receiptDate',
      width: 130,
      render: (d: string) => (
        <span className="tabular-nums" style={{ color: '#475569', fontSize: 12.5 }}>
          {dayjs(d).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: 'Người lập / Xác nhận',
      key: 'users',
      width: 200,
      render: (_: any, record: GoodsReceiptNote) => (
        <div style={{ fontSize: 12, minWidth: 160 }}>
          <div style={{ whiteSpace: 'nowrap' }}>Lập: <span style={{ fontWeight: 600, color: '#334155' }}>{record.createdBy}</span></div>
          {record.confirmedBy && (
            <div style={{ color: '#059669', fontWeight: 600, whiteSpace: 'nowrap' }}>Duyệt: {record.confirmedBy}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 190,
      render: (status: string) => <StatusBadge status={status} module="WAREHOUSE" />,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: GoodsReceiptNote) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            style={{ color: '#0284C7' }}
            title="Xem chi tiết phiếu nhập"
            onClick={() => handleViewDetail(record.id)}
          />
          {record.status === 'DRAFT' && (
            <Popconfirm
              title="Xác nhận nhập kho thực tế"
              description="Hệ thống sẽ cộng tồn kho, ghi sổ cái, hoàn tất đơn PO và phát sinh công nợ NCC. Tiếp tục?"
              onConfirm={() => handleConfirm(record.id)}
              okText="Xác nhận"
              cancelText="Hủy"
              okButtonProps={{ style: { backgroundColor: '#059669', borderColor: '#059669', borderRadius: 6 } }}
              cancelButtonProps={{ style: { borderRadius: 6 } }}
            >
              <Button type="text" icon={<CheckCircleOutlined />} style={{ color: '#059669' }} title="Xác nhận nhập kho" />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        title="Quản lý Nhập kho (Goods Receipt Notes - GRN)"
        subtitle="Tiếp nhận hàng hóa từ nhà cung cấp, kiểm đếm số lượng thực nhập và kích hoạt công nợ"
        tag={
          <Tag color="cyan" style={{ borderRadius: 4, fontWeight: 600 }}>
            {total} Phiếu nhập
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
            onClick={handleOpenCreateModal}
          >
            Lập phiếu nhập kho từ PO
          </Button>
        }
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message="Lỗi tải danh sách phiếu nhập kho"
          description={error}
          action={
            <Button size="small" danger icon={<ReloadOutlined />} onClick={() => fetchReceipts()}>
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
          placeholder="Tìm theo mã GRN, mã PO..."
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
            { label: 'DRAFT (Chờ nhập)', value: 'DRAFT' },
            { label: 'CONFIRMED (Đã nhập)', value: 'CONFIRMED' },
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
            fetchReceipts(0, pageSize);
          }}
          style={{ borderRadius: 6 }}
        >
          Đặt lại
        </Button>
      </div>

      <div className="erp-card" style={{ background: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}>
        <Table
          dataSource={receipts}
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
              fetchReceipts(p - 1, s);
            },
            showTotal: (totalCount) => `Tổng cộng ${totalCount} phiếu nhập kho`,
          }}
        />
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>Chi tiết Phiếu Nhập Kho:</span>
            <span className="code-mono" style={{ color: '#0369A1' }}>{selectedReceipt?.grnCode}</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={780}
        footer={[
          selectedReceipt?.status === 'DRAFT' && (
            <Popconfirm
              key="confirm"
              title="Xác nhận nhập kho thực tế"
              description="Tồn kho sẽ lập tức tăng lên và ghi vào sổ cái. Xác nhận?"
              onConfirm={() => handleConfirm(selectedReceipt.id)}
            >
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                style={{ backgroundColor: '#059669', borderColor: '#059669', borderRadius: 6 }}
                loading={confirmLoading}
              >
                Xác nhận nhập kho
              </Button>
            </Popconfirm>
          ),
          <Button key="close" onClick={() => setDetailModalVisible(false)} style={{ borderRadius: 6 }}>
            Đóng
          </Button>,
        ]}
      >
        {selectedReceipt && (
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
                <Text type="secondary" style={{ fontSize: 11.5 }}>Kho nhập</Text>
                <div><Text strong style={{ fontSize: 14 }}>{selectedReceipt.warehouseName}</Text></div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11.5 }}>Đơn mua (PO)</Text>
                <div>
                  {selectedReceipt.poCode ? (
                    <span className="code-mono" style={{ color: '#7E22CE', fontWeight: 600 }}>{selectedReceipt.poCode}</span>
                  ) : (
                    <Text strong>Không gắn PO</Text>
                  )}
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11.5 }}>Ngày nhập</Text>
                <div><span className="tabular-nums" style={{ fontWeight: 600 }}>{dayjs(selectedReceipt.receiptDate).format('DD/MM/YYYY')}</span></div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11.5 }}>Trạng thái</Text>
                <div style={{ marginTop: 2 }}><StatusBadge status={selectedReceipt.status} module="WAREHOUSE" /></div>
              </div>
            </div>

            <Title level={5} style={{ marginBottom: 12, fontWeight: 700 }}>Danh sách hàng hóa nhập kho</Title>
            <Table
              dataSource={selectedReceipt.items || []}
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
                  dataIndex: 'orderedQuantity',
                  key: 'orderedQuantity',
                  align: 'right' as const,
                  render: (qty: number) => (
                    <span className="tabular-nums">{qty}</span>
                  ),
                },
                {
                  title: 'Số lượng thực nhập',
                  dataIndex: 'receivedQuantity',
                  key: 'receivedQuantity',
                  align: 'right' as const,
                  render: (qty: number, record: any) => (
                    <span className="tabular-nums" style={{ color: '#059669', fontWeight: 700 }}>
                      {qty} {record.productUnit || ''}
                    </span>
                  ),
                },
                {
                  title: 'Đơn giá vốn',
                  dataIndex: 'unitPrice',
                  key: 'unitPrice',
                  align: 'right' as const,
                  render: (price: number) => (
                    <span className="tabular-nums">{formatCurrency(price)}</span>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* Modal Create GRN from PO */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ImportOutlined style={{ color: '#059669' }} />
            <span>Lập Phiếu Nhập Kho từ Đơn Mua Hàng (PO)</span>
          </div>
        }
        open={createModalVisible}
        onOk={handleCreateFromPO}
        onCancel={() => setCreateModalVisible(false)}
        destroyOnClose
        okText="Tạo phiếu nhập"
        cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: '#059669', borderColor: '#059669', borderRadius: 6 } }}
        cancelButtonProps={{ style: { borderRadius: 6 } }}
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="poId"
            label={<span style={{ fontWeight: 600 }}>Chọn Đơn mua hàng đã duyệt (APPROVED)</span>}
            rules={[{ required: true, message: 'Vui lòng chọn đơn PO' }]}
          >
            <Select
              placeholder="Chọn PO để nhập kho"
              options={approvedPOs.map((p) => ({
                label: `${p.poCode} - ${p.supplierName} (${formatCurrency(p.totalAmount)})`,
                value: p.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="receiptDate"
            label={<span style={{ fontWeight: 600 }}>Ngày nhập kho</span>}
            rules={[{ required: true, message: 'Chọn ngày' }]}
          >
            <Input type="date" style={{ width: '100%', borderRadius: 6 }} />
          </Form.Item>

          <Form.Item name="notes" label={<span style={{ fontWeight: 600 }}>Ghi chú nhập kho</span>}>
            <Input.TextArea rows={2} placeholder="Hàng đủ, nguyên đai nguyên kiện..." style={{ borderRadius: 6 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
