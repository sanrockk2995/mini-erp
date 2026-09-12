import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Modal,
  Form,
  InputNumber,
  Tag,
  Typography,
  message,
  Drawer,
  DatePicker,
  Tooltip,
  Alert,
} from 'antd';
import {
  SearchOutlined,
  CreditCardOutlined,
  HistoryOutlined,
  ReloadOutlined,
  BankOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageHeader, formatCurrency } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { purchaseService } from '../../services/purchaseService';
import { supplierService } from '../../services/supplierService';
import { SupplierDebt, SupplierPayment, Supplier } from '../../types';

const { Text } = Typography;

export const SupplierDebtPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debts, setDebts] = useState<SupplierDebt[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [selectedSupplier, setSelectedSupplier] = useState<number | undefined>(undefined);

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [payingDebt, setPayingDebt] = useState<SupplierDebt | null>(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
  const [debtPayments, setDebtPayments] = useState<SupplierPayment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [form] = Form.useForm();

  const fetchSuppliers = async () => {
    try {
      const data = await supplierService.getAllActiveSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDebts = async (currentPage = page, size = pageSize) => {
    setLoading(true);
    setError(null);
    try {
      const data = await purchaseService.searchDebts({
        keyword: keyword || undefined,
        status: selectedStatus,
        supplierId: selectedSupplier,
        page: currentPage,
        size,
      });
      setDebts(data.content);
      setTotal(data.totalElements);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách công nợ. Vui lòng kiểm tra kết nối.');
      message.error('Không thể tải danh sách công nợ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    fetchDebts(0, pageSize);
  }, [selectedStatus, selectedSupplier]);

  const handleSearch = () => {
    setPage(0);
    fetchDebts(0, pageSize);
  };

  const handleOpenPayment = (debt: SupplierDebt) => {
    setPayingDebt(debt);
    form.resetFields();
    form.setFieldsValue({
      amount: debt.remainingAmount,
      paymentMethod: 'BANK_TRANSFER',
      paymentDate: dayjs(),
    });
    setPaymentModalVisible(true);
  };

  const handleSavePayment = async () => {
    if (!payingDebt) return;
    try {
      const values = await form.validateFields();
      if (values.amount > payingDebt.remainingAmount) {
        message.warning('Số tiền thanh toán không được lớn hơn số nợ còn lại');
        return;
      }
      setPaymentSubmitting(true);
      await purchaseService.recordPayment({
        debtId: payingDebt.id,
        amount: values.amount,
        paymentDate: values.paymentDate.format('YYYY-MM-DD'),
        paymentMethod: values.paymentMethod,
        referenceNumber: values.referenceNumber,
        notes: values.notes,
      });
      message.success('Ghi nhận thanh toán phiếu chi thành công!');
      setPaymentModalVisible(false);
      fetchDebts();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thanh toán');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleViewPayments = async (debt: SupplierDebt) => {
    setPayingDebt(debt);
    setHistoryDrawerVisible(true);
    setHistoryLoading(true);
    try {
      const list = await purchaseService.getDebtPayments(debt.id);
      setDebtPayments(list);
    } catch (err) {
      message.error('Không thể tải lịch sử thanh toán');
    } finally {
      setHistoryLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã công nợ',
      dataIndex: 'invoiceCode',
      key: 'invoiceCode',
      width: 160,
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
      title: 'Đơn mua (PO)',
      dataIndex: 'poCode',
      key: 'poCode',
      width: 150,
      render: (code: string) => (
        <span className="code-mono" style={{ color: '#7C3AED', fontWeight: 600 }}>
          {code || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 250,
      render: (name: string, record: SupplierDebt) => (
        <div style={{ minWidth: 200 }}>
          <Text strong style={{ color: '#0F172A', fontSize: 13.5, whiteSpace: 'nowrap' }}>{name}</Text>
          <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1, whiteSpace: 'nowrap' }}>
            Mã NCC: <span className="code-mono">{record.supplierCode}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày phát sinh',
      dataIndex: 'debtDate',
      key: 'debtDate',
      width: 120,
      render: (d: string) => (
        <span className="tabular-nums" style={{ color: '#475569', fontSize: 12.5 }}>
          {dayjs(d).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: 'Hạn thanh toán',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (d: string) => (
        <span className="tabular-nums" style={{ color: '#64748B', fontSize: 12.5 }}>
          {d ? dayjs(d).format('DD/MM/YYYY') : 'Không có'}
        </span>
      ),
    },
    {
      title: 'Tổng nợ (VND)',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right' as const,
      width: 150,
      render: (val: number) => (
        <span className="tabular-nums" style={{ color: '#334155', fontWeight: 600 }}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      align: 'right' as const,
      width: 150,
      render: (val: number) => (
        <span className="tabular-nums" style={{ color: '#059669', fontWeight: 600 }}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: 'Còn lại',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      align: 'right' as const,
      width: 150,
      render: (val: number) => (
        <span
          className="tabular-nums"
          style={{ color: val > 0 ? '#DC2626' : '#64748B', fontWeight: 700, fontSize: 13.5 }}
        >
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 170,
      render: (status: string) => <StatusBadge status={status} module="DEBT" />,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      align: 'center' as const,
      render: (_: any, record: SupplierDebt) => (
        <Space size="small">
          {record.remainingAmount > 0 && (
            <Button
              type="primary"
              size="small"
              icon={<CreditCardOutlined />}
              style={{ backgroundColor: '#059669', borderColor: '#059669', borderRadius: 4, fontWeight: 600, fontSize: 12 }}
              onClick={() => handleOpenPayment(record)}
            >
              Chi trả
            </Button>
          )}
          <Tooltip title="Lịch sử phiếu chi">
            <Button
              type="text"
              icon={<HistoryOutlined />}
              style={{ color: '#0284C7' }}
              onClick={() => handleViewPayments(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        title="Công nợ & Thanh toán Nhà Cung Cấp"
        subtitle="Quản lý các khoản nợ tự động phát sinh từ Phiếu Nhập Kho GRN, theo dõi kỳ hạn 30 ngày và lập phiếu chi"
        tag={
          <Tag color="red" style={{ borderRadius: 4, fontWeight: 600 }}>
            {total} Khoản nợ
          </Tag>
        }
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message="Lỗi tải danh sách công nợ"
          description={error}
          action={
            <Button size="small" danger icon={<ReloadOutlined />} onClick={() => fetchDebts()}>
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
          placeholder="Tìm theo mã nợ, mã PO, tên NCC..."
          prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 280, borderRadius: 6 }}
          allowClear
        />

        <Select
          placeholder="Lọc theo NCC"
          allowClear
          value={selectedSupplier}
          onChange={(val) => setSelectedSupplier(val)}
          style={{ width: 240 }}
          options={suppliers.map((s) => ({ label: `${s.name} (${s.code})`, value: s.id }))}
        />

        <Select
          placeholder="Lọc trạng thái nợ"
          allowClear
          value={selectedStatus}
          onChange={(val) => setSelectedStatus(val)}
          style={{ width: 180 }}
          options={[
            { label: 'UNPAID (Chưa trả)', value: 'UNPAID' },
            { label: 'PARTIAL (Trả 1 phần)', value: 'PARTIAL' },
            { label: 'PAID (Đã trả xong)', value: 'PAID' },
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
            setSelectedSupplier(undefined);
            fetchDebts(0, pageSize);
          }}
          style={{ borderRadius: 6 }}
        >
          Đặt lại
        </Button>
      </div>

      <div className="erp-card" style={{ background: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}>
        <Table
          dataSource={debts}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 1200 }}
          pagination={{
            current: page + 1,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (p, s) => {
              setPage(p - 1);
              setPageSize(s);
              fetchDebts(p - 1, s);
            },
            showTotal: (totalCount) => `Tổng cộng ${totalCount} bản ghi nợ`,
          }}
        />
      </div>

      {/* Payment Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BankOutlined style={{ color: '#059669' }} />
            <span>Lập phiếu chi thanh toán nợ:</span>
            <span className="code-mono" style={{ color: '#0369A1' }}>{payingDebt?.invoiceCode}</span>
          </div>
        }
        open={paymentModalVisible}
        onOk={handleSavePayment}
        onCancel={() => setPaymentModalVisible(false)}
        confirmLoading={paymentSubmitting}
        destroyOnClose
        okText="Xác nhận chi tiền"
        cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: '#059669', borderColor: '#059669', borderRadius: 6 } }}
        cancelButtonProps={{ style: { borderRadius: 6 } }}
      >
        {payingDebt && (
          <div style={{ marginBottom: 20, background: '#F8FAFC', padding: 14, borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13 }}>
            <div><Text type="secondary">Nhà cung cấp: </Text><Text strong>{payingDebt.supplierName}</Text></div>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary">Đơn mua (PO): </Text>
              <span className="code-mono" style={{ color: '#7C3AED' }}>{payingDebt.poCode || 'N/A'}</span>
            </div>
            <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary">Số nợ còn phải trả: </Text>
              <span className="tabular-nums" style={{ color: '#DC2626', fontSize: 16, fontWeight: 800 }}>
                {formatCurrency(payingDebt.remainingAmount)}
              </span>
            </div>
          </div>
        )}

        <Form form={form} layout="vertical">
          <Form.Item
            name="amount"
            label={<span style={{ fontWeight: 600 }}>Số tiền chi trả (VND)</span>}
            rules={[{ required: true, message: 'Vui lòng nhập số tiền chi' }]}
          >
            <InputNumber
              autoFocus
              style={{ width: '100%' }}
              min={1}
              formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(val) => (val ? Number(val.replace(/\$\s?|(,*)/g, '')) : 0) as any}
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="paymentMethod"
              label={<span style={{ fontWeight: 600 }}>Phương thức</span>}
              rules={[{ required: true, message: 'Chọn phương thức' }]}
            >
              <Select
                options={[
                  { label: 'Chuyển khoản (Bank Transfer)', value: 'BANK_TRANSFER' },
                  { label: 'Tiền mặt (Cash)', value: 'CASH' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="paymentDate"
              label={<span style={{ fontWeight: 600 }}>Ngày chi</span>}
              rules={[{ required: true, message: 'Chọn ngày chi' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </div>

          <Form.Item name="referenceNumber" label={<span style={{ fontWeight: 600 }}>Số tham chiếu / Mã UNC</span>}>
            <Input placeholder="Ví dụ: UNC-2026-0912-01" />
          </Form.Item>

          <Form.Item name="notes" label={<span style={{ fontWeight: 600 }}>Ghi chú chứng từ</span>}>
            <Input.TextArea rows={2} placeholder="Thanh toán đợt 1..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* History Drawer */}
      <Drawer
        title={
          <Space>
            <BankOutlined style={{ color: '#059669' }} />
            <span>Lịch sử thanh toán: <span className="code-mono">{payingDebt?.invoiceCode}</span></span>
          </Space>
        }
        open={historyDrawerVisible}
        onClose={() => setHistoryDrawerVisible(false)}
        width={560}
        loading={historyLoading}
      >
        <Table
          dataSource={debtPayments}
          rowKey="id"
          pagination={false}
          size="small"
          columns={[
            {
              title: 'Mã phiếu chi',
              dataIndex: 'paymentCode',
              key: 'paymentCode',
              render: (code: string) => (
                <span className="code-mono" style={{ color: '#0369A1', fontWeight: 600 }}>
                  {code}
                </span>
              ),
            },
            {
              title: 'Ngày chi',
              dataIndex: 'paymentDate',
              key: 'paymentDate',
              render: (d: string) => (
                <span className="tabular-nums">{dayjs(d).format('DD/MM/YYYY')}</span>
              ),
            },
            {
              title: 'Số tiền',
              dataIndex: 'amount',
              key: 'amount',
              align: 'right' as const,
              render: (amt: number) => (
                <span className="tabular-nums" style={{ color: '#059669', fontWeight: 700 }}>
                  {formatCurrency(amt)}
                </span>
              ),
            },
            {
              title: 'Hình thức',
              dataIndex: 'paymentMethod',
              key: 'paymentMethod',
              render: (m: string) => (
                <Tag color={m === 'BANK_TRANSFER' ? 'blue' : 'gold'} style={{ borderRadius: 4 }}>
                  {m}
                </Tag>
              ),
            },
          ]}
          locale={{ emptyText: 'Chưa có khoản thanh toán nào cho hóa đơn này' }}
        />
      </Drawer>
    </div>
  );
};
