import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Modal,
  Form,
  Tag,
  Typography,
  Drawer,
  message,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  HistoryOutlined,
  ReloadOutlined,
  UserOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageHeader, formatCurrency } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { customerService } from '../../services/customerService';
import { Customer, CustomerGroup, CustomerPurchaseHistory } from '../../types';

const { Text, Title } = Typography;

export const CustomerListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<number | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
  const [purchaseHistory, setPurchaseHistory] = useState<CustomerPurchaseHistory | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [form] = Form.useForm();

  const fetchGroups = async () => {
    try {
      const data = await customerService.getAllGroups();
      setGroups(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomers = async (currentPage = page, size = pageSize) => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerService.searchCustomers({
        keyword: keyword || undefined,
        groupId: selectedGroup,
        customerType: selectedType,
        page: currentPage,
        size,
      });
      setCustomers(data.content);
      setTotal(data.totalElements);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách khách hàng. Vui lòng kiểm tra kết nối.');
      message.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchCustomers(0, pageSize);
  }, [selectedGroup, selectedType]);

  const handleSearch = () => {
    setPage(0);
    fetchCustomers(0, pageSize);
  };

  const handleOpenModal = (cust?: Customer) => {
    if (cust) {
      setEditingCustomer(cust);
      form.setFieldsValue({
        code: cust.code,
        name: cust.name,
        customerType: cust.customerType,
        phone: cust.phone,
        email: cust.email,
        address: cust.address,
        taxCode: cust.taxCode,
        groupId: cust.groupId,
        isActive: cust.isActive,
      });
    } else {
      setEditingCustomer(null);
      form.resetFields();
      form.setFieldsValue({ customerType: 'INDIVIDUAL', isActive: true });
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, values);
        message.success('Cập nhật thông tin khách hàng thành công');
      } else {
        await customerService.createCustomer(values);
        message.success('Thêm mới khách hàng thành công');
      }
      setModalVisible(false);
      fetchCustomers();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu khách hàng');
    }
  };

  const handleViewHistory = async (cust: Customer) => {
    setHistoryDrawerVisible(true);
    setHistoryLoading(true);
    try {
      const history = await customerService.getPurchaseHistory(cust.id);
      setPurchaseHistory(history);
    } catch (err) {
      message.error('Không thể tải lịch sử mua hàng của khách hàng này');
    } finally {
      setHistoryLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã KH',
      dataIndex: 'code',
      key: 'code',
      width: 120,
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
            whiteSpace: 'nowrap',
          }}
        >
          {code}
        </span>
      ),
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (name: string, record: Customer) => (
        <div style={{ minWidth: 200 }}>
          <Space align="center" style={{ flexWrap: 'nowrap' }}>
            <UserOutlined style={{ color: '#059669', flexShrink: 0 }} />
            <Text strong style={{ color: '#0F172A', fontSize: 13.5, whiteSpace: 'nowrap' }}>{name}</Text>
          </Space>
          {record.taxCode && (
            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2, whiteSpace: 'nowrap' }}>
              MST: <span className="code-mono">{record.taxCode}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Phân loại',
      dataIndex: 'customerType',
      key: 'customerType',
      width: 150,
      render: (type: string) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '2px 9px',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            backgroundColor: type === 'BUSINESS' ? '#EFF6FF' : '#ECFDF5',
            color: type === 'BUSINESS' ? '#0284C7' : '#059669',
            border: `1px solid ${type === 'BUSINESS' ? '#BAE6FD' : '#A7F3D0'}`,
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: type === 'BUSINESS' ? '#38BDF8' : '#10B981',
              flexShrink: 0,
            }}
          />
          {type === 'BUSINESS' ? 'Doanh nghiệp' : 'Cá nhân'}
        </span>
      ),
    },
    {
      title: 'Nhóm khách',
      dataIndex: 'groupName',
      key: 'groupName',
      width: 150,
      render: (grp: string) => (
        <Tag color="cyan" style={{ borderRadius: 4, fontWeight: 500, whiteSpace: 'nowrap' }}>
          {grp || 'Mặc định'}
        </Tag>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (phone: string) => (
        <span className="tabular-nums" style={{ color: '#475569', fontSize: 12.5, whiteSpace: 'nowrap' }}>
          {phone}
        </span>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      ellipsis: true,
      render: (email: string) => (
        <span style={{ color: '#64748B', fontSize: 12.5, whiteSpace: 'nowrap' }} title={email}>{email || '—'}</span>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      width: 240,
      ellipsis: true,
      render: (addr: string) => (
        <span style={{ color: '#475569', fontSize: 12.5 }} title={addr}>{addr || '—'}</span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 110,
      align: 'center' as const,
      fixed: 'right' as const,
      render: (_: any, record: Customer) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            style={{ color: '#0284C7' }}
            title="Chỉnh sửa thông tin"
            onClick={() => handleOpenModal(record)}
          />
          <Button
            type="text"
            icon={<HistoryOutlined />}
            style={{ color: '#059669' }}
            title="Lịch sử mua hàng"
            onClick={() => handleViewHistory(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        title="Quản lý Khách hàng"
        subtitle="Hồ sơ đối tượng khách hàng cá nhân & doanh nghiệp, phân nhóm và theo dõi lịch sử doanh số"
        tag={
          <Tag color="purple" style={{ borderRadius: 4, fontWeight: 600 }}>
            {total} Khách hàng
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
            onClick={() => handleOpenModal()}
          >
            Thêm khách hàng mới
          </Button>
        }
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message="Lỗi tải danh sách khách hàng"
          description={error}
          action={
            <Button size="small" danger icon={<ReloadOutlined />} onClick={() => fetchCustomers()}>
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
          placeholder="Tìm theo tên, mã KH, SĐT, email..."
          prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 280, borderRadius: 6 }}
          allowClear
        />

        <Select
          placeholder="Nhóm khách hàng"
          allowClear
          value={selectedGroup}
          onChange={(val) => setSelectedGroup(val)}
          style={{ width: 200 }}
          options={groups.map((g) => ({ label: g.name, value: g.id }))}
        />

        <Select
          placeholder="Loại đối tượng"
          allowClear
          value={selectedType}
          onChange={(val) => setSelectedType(val)}
          style={{ width: 160 }}
          options={[
            { label: 'Cá nhân', value: 'INDIVIDUAL' },
            { label: 'Doanh nghiệp', value: 'BUSINESS' },
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
            setSelectedGroup(undefined);
            setSelectedType(undefined);
            fetchCustomers(0, pageSize);
          }}
          style={{ borderRadius: 6 }}
        >
          Đặt lại
        </Button>
      </div>

      <div className="erp-card" style={{ background: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}>
        <Table
          dataSource={customers}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 1250 }}
          pagination={{
            current: page + 1,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (p, s) => {
              setPage(p - 1);
              setPageSize(s);
              fetchCustomers(p - 1, s);
            },
            showTotal: (totalCount) => `Tổng cộng ${totalCount} khách hàng`,
          }}
        />
      </div>

      {/* Modal Add / Edit Customer */}
      <Modal
        title={editingCustomer ? 'Chỉnh sửa hồ sơ khách hàng' : 'Thêm mới khách hàng'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={640}
        destroyOnClose
        okText="Lưu thông tin"
        cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: '#059669', borderColor: '#059669', borderRadius: 6 } }}
        cancelButtonProps={{ style: { borderRadius: 6 } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="code"
              label={<span style={{ fontWeight: 600 }}>Mã khách hàng</span>}
              rules={[{ required: true, message: 'Vui lòng nhập mã KH' }]}
            >
              <Input autoFocus placeholder="Ví dụ: CUST-001" style={{ borderRadius: 6 }} />
            </Form.Item>

            <Form.Item
              name="name"
              label={<span style={{ fontWeight: 600 }}>Tên khách hàng / Đơn vị</span>}
              rules={[{ required: true, message: 'Vui lòng nhập tên KH' }]}
            >
              <Input placeholder="Ví dụ: Công ty TNHH Á Châu" style={{ borderRadius: 6 }} />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="customerType"
              label={<span style={{ fontWeight: 600 }}>Loại khách hàng</span>}
              rules={[{ required: true, message: 'Chọn loại KH' }]}
            >
              <Select
                options={[
                  { label: 'Cá nhân', value: 'INDIVIDUAL' },
                  { label: 'Doanh nghiệp', value: 'BUSINESS' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="groupId"
              label={<span style={{ fontWeight: 600 }}>Nhóm khách hàng</span>}
              rules={[{ required: true, message: 'Chọn nhóm KH' }]}
            >
              <Select
                placeholder="Chọn nhóm"
                options={groups.map((g) => ({ label: g.name, value: g.id }))}
              />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="phone"
              label={<span style={{ fontWeight: 600 }}>Số điện thoại</span>}
              rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}
            >
              <Input placeholder="0901234567" style={{ borderRadius: 6 }} />
            </Form.Item>

            <Form.Item name="email" label={<span style={{ fontWeight: 600 }}>Email</span>}>
              <Input placeholder="contact@example.com" style={{ borderRadius: 6 }} />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <Form.Item name="address" label={<span style={{ fontWeight: 600 }}>Địa chỉ</span>}>
              <Input placeholder="Số nhà, đường, quận/huyện, tỉnh/thành..." style={{ borderRadius: 6 }} />
            </Form.Item>

            <Form.Item name="taxCode" label={<span style={{ fontWeight: 600 }}>Mã số thuế</span>}>
              <Input placeholder="0101234567" style={{ borderRadius: 6 }} />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Drawer Customer Purchase History */}
      <Drawer
        title={
          <Space>
            <ShoppingOutlined style={{ color: '#059669' }} />
            <span>Lịch sử Mua hàng: {purchaseHistory?.customerName}</span>
          </Space>
        }
        open={historyDrawerVisible}
        onClose={() => setHistoryDrawerVisible(false)}
        width={600}
        loading={historyLoading}
      >
        {purchaseHistory && (
          <div>
            <div
              style={{
                background: '#F8FAFC',
                padding: '16px 20px',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Tổng số đơn hàng</Text>
                  <div style={{ marginTop: 2 }}>
                    <span className="tabular-nums" style={{ fontSize: 22, fontWeight: 800, color: '#0F172A' }}>
                      {purchaseHistory.totalOrders}
                    </span>
                    <span style={{ fontSize: 13, color: '#64748B', marginLeft: 4 }}>đơn</span>
                  </div>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Tổng giá trị đã mua</Text>
                  <div style={{ marginTop: 2 }}>
                    <span className="tabular-nums" style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>
                      {formatCurrency(purchaseHistory.totalSpent)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Title level={5} style={{ marginBottom: 12, fontWeight: 700 }}>Danh sách đơn hàng đã mua</Title>
            <Table
              dataSource={purchaseHistory.orders || []}
              rowKey="orderId"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Mã đơn hàng',
                  dataIndex: 'orderCode',
                  key: 'orderCode',
                  render: (code: string) => (
                    <span className="code-mono" style={{ color: '#0369A1', fontWeight: 600 }}>
                      {code}
                    </span>
                  ),
                },
                {
                  title: 'Ngày đặt',
                  dataIndex: 'orderDate',
                  key: 'orderDate',
                  render: (d: string) => (
                    <span className="tabular-nums" style={{ color: '#475569' }}>
                      {dayjs(d).format('DD/MM/YYYY')}
                    </span>
                  ),
                },
                {
                  title: 'Giá trị đơn',
                  dataIndex: 'totalAmount',
                  key: 'totalAmount',
                  align: 'right' as const,
                  render: (val: number) => (
                    <span className="tabular-nums" style={{ color: '#059669', fontWeight: 700 }}>
                      {formatCurrency(val)}
                    </span>
                  ),
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  render: (st: string) => <StatusBadge status={st} module="SALES" />,
                },
              ]}
              locale={{ emptyText: 'Khách hàng này chưa phát sinh đơn hàng' }}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
};
