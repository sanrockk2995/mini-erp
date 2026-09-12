import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  message,
  Tag,
  Typography,
  InputNumber,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  ReloadOutlined,
  DollarOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageHeader, formatCurrency } from '../../components/common/PageHeader';
import { productService } from '../../services/productService';
import { customerService } from '../../services/customerService';
import { PriceList, CustomerGroup, Product } from '../../types';

const { Text } = Typography;

export const PriceListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceLists, setPriceLists] = useState<PriceList[]>([]);
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPriceList, setSelectedPriceList] = useState<PriceList | null>(null);
  const [form] = Form.useForm();

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [plData, cgData, prodData] = await Promise.all([
        productService.getAllPriceLists(false),
        customerService.getAllCustomerGroups(),
        productService.getAllActiveProducts(),
      ]);
      setPriceLists(plData);
      setCustomerGroups(cgData);
      setProducts(prodData);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải dữ liệu bảng giá. Vui lòng kiểm tra kết nối.');
      message.error('Không thể tải dữ liệu bảng giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleOpenModal = () => {
    form.resetFields();
    form.setFieldsValue({
      isActive: true,
      startDate: dayjs(),
      items: products.map((p) => ({
        productId: p.id,
        productSku: p.sku,
        productName: p.name,
        unitPrice: p.standardPrice,
      })),
    });
    setModalVisible(true);
  };

  const handleViewDetails = async (record: PriceList) => {
    try {
      const detail = await productService.getPriceListById(record.id);
      setSelectedPriceList(detail);
      setDetailModalVisible(true);
    } catch (err) {
      message.error('Không thể tải chi tiết bảng giá');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        code: values.code,
        name: values.name,
        customerGroupId: values.customerGroupId,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        isActive: values.isActive,
        items: values.items.filter((it: any) => it.unitPrice > 0),
      };

      await productService.createPriceList(payload);
      message.success('Tạo mới bảng giá thành công');
      setModalVisible(false);
      fetchInitialData();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu bảng giá');
    }
  };

  const columns = [
    {
      title: 'Mã bảng giá',
      dataIndex: 'code',
      key: 'code',
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
      title: 'Tên bảng giá',
      dataIndex: 'name',
      key: 'name',
      width: 240,
      render: (name: string) => (
        <div style={{ minWidth: 180 }}>
          <Text strong style={{ color: '#0F172A', fontSize: 13.5, whiteSpace: 'nowrap' }}>{name}</Text>
        </div>
      ),
    },
    {
      title: 'Nhóm khách áp dụng',
      dataIndex: 'customerGroupName',
      key: 'customerGroupName',
      width: 170,
      render: (grp: string) => (
        <Tag color="cyan" style={{ borderRadius: 4, fontWeight: 500 }}>
          {grp || 'Tất cả nhóm'}
        </Tag>
      ),
    },
    {
      title: 'Thời gian áp dụng',
      key: 'dateRange',
      width: 200,
      render: (_: any, record: PriceList) => (
        <Space direction="vertical" size={2}>
          <span className="tabular-nums" style={{ fontSize: 12, color: '#334155' }}>
            <CalendarOutlined style={{ marginRight: 4, color: '#059669' }} />
            Từ: {dayjs(record.startDate).format('DD/MM/YYYY')}
          </span>
          {record.endDate && (
            <span className="tabular-nums" style={{ fontSize: 12, color: '#64748B' }}>
              <CalendarOutlined style={{ marginRight: 4, color: '#94A3B8' }} />
              Đến: {dayjs(record.endDate).format('DD/MM/YYYY')}
            </span>
          )}
        </Space>
      ),
    },
    {
      title: 'Số mặt hàng',
      key: 'itemCount',
      width: 130,
      align: 'right' as const,
      render: (_: any, record: PriceList) => (
        <span className="tabular-nums" style={{ fontWeight: 600, color: '#334155' }}>
          {record.items ? record.items.length : 0} mặt hàng
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 160,
      render: (active: boolean) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '2px 9px',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            backgroundColor: active ? '#ECFDF5' : '#F1F5F9',
            color: active ? '#059669' : '#64748B',
            border: `1px solid ${active ? '#A7F3D0' : '#E2E8F0'}`,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: active ? '#10B981' : '#94A3B8',
            }}
          />
          {active ? 'Đang hiệu lực' : 'Hết hạn / Dừng'}
        </span>
      ),
    },
    {
      title: 'Chi tiết',
      key: 'action',
      width: 90,
      align: 'center' as const,
      render: (_: any, record: PriceList) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          style={{ color: '#0284C7' }}
          onClick={() => handleViewDetails(record)}
          title="Xem chi tiết bảng giá"
        />
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        title="Bảng giá Bán lẻ & Bán buôn"
        subtitle="Thiết lập các chính sách giá bán tùy biến theo nhóm đối tượng khách hàng và thời hạn"
        tag={
          <Tag color="purple" style={{ borderRadius: 4, fontWeight: 600 }}>
            {priceLists.length} Bảng giá
          </Tag>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchInitialData} loading={loading} style={{ borderRadius: 6 }}>
              Làm mới
            </Button>
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
              onClick={handleOpenModal}
            >
              Tạo bảng giá mới
            </Button>
          </Space>
        }
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message="Lỗi tải dữ liệu bảng giá"
          description={error}
          action={
            <Button size="small" danger icon={<ReloadOutlined />} onClick={() => fetchInitialData()}>
              Thử lại
            </Button>
          }
          style={{ borderRadius: 8 }}
        />
      )}

      <div className="erp-card" style={{ background: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}>
        <Table
          dataSource={priceLists}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Modal Add Price List */}
      <Modal
        title="Tạo mới Bảng giá Bán hàng"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={780}
        destroyOnClose
        okText="Lưu bảng giá"
        cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: '#059669', borderColor: '#059669', borderRadius: 6 } }}
        cancelButtonProps={{ style: { borderRadius: 6 } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="code"
              label={<span style={{ fontWeight: 600 }}>Mã bảng giá</span>}
              rules={[{ required: true, message: 'Vui lòng nhập mã bảng giá' }]}
            >
              <Input autoFocus placeholder="Ví dụ: PRICE-VIP-2026" style={{ borderRadius: 6 }} />
            </Form.Item>

            <Form.Item
              name="name"
              label={<span style={{ fontWeight: 600 }}>Tên bảng giá</span>}
              rules={[{ required: true, message: 'Vui lòng nhập tên bảng giá' }]}
            >
              <Input placeholder="Ví dụ: Bảng giá đại lý cấp 1 năm 2026" style={{ borderRadius: 6 }} />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item
              name="customerGroupId"
              label={<span style={{ fontWeight: 600 }}>Nhóm khách áp dụng</span>}
              rules={[{ required: true, message: 'Vui lòng chọn nhóm khách' }]}
            >
              <Select
                placeholder="Chọn nhóm KH"
                options={customerGroups.map((g) => ({ label: g.name, value: g.id }))}
              />
            </Form.Item>

            <Form.Item
              name="startDate"
              label={<span style={{ fontWeight: 600 }}>Ngày bắt đầu</span>}
              rules={[{ required: true, message: 'Chọn ngày bắt đầu' }]}
            >
              <DatePicker style={{ width: '100%', borderRadius: 6 }} format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item name="endDate" label={<span style={{ fontWeight: 600 }}>Ngày kết thúc</span>}>
              <DatePicker style={{ width: '100%', borderRadius: 6 }} format="DD/MM/YYYY" placeholder="Không bắt buộc" />
            </Form.Item>
          </div>

          <Form.Item name="isActive" label={<span style={{ fontWeight: 600 }}>Trạng thái hiệu lực</span>} valuePropName="checked">
            <Switch checkedChildren="Hiệu lực" unCheckedChildren="Tạm dừng" />
          </Form.Item>

          <Text strong style={{ display: 'block', marginBottom: 8, color: '#0F172A' }}>
            Cấu hình giá cho từng sản phẩm:
          </Text>

          <Form.List name="items">
            {(fields) => (
              <div
                style={{
                  maxHeight: 300,
                  overflowY: 'auto',
                  border: '1px solid #E2E8F0',
                  borderRadius: 6,
                  padding: 12,
                  background: '#F8FAFC',
                }}
              >
                {fields.map((field) => {
                  const prod = form.getFieldValue(['items', field.name]);
                  return (
                    <div
                      key={field.key}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '140px 1fr 180px',
                        gap: 12,
                        alignItems: 'center',
                        marginBottom: 8,
                        paddingBottom: 8,
                        borderBottom: '1px dashed #E2E8F0',
                      }}
                    >
                      <span className="code-mono" style={{ color: '#0369A1', fontWeight: 600 }}>
                        {prod?.productSku}
                      </span>
                      <Text strong style={{ fontSize: 13, color: '#0F172A' }}>
                        {prod?.productName}
                      </Text>
                      <Form.Item
                        {...field}
                        name={[field.name, 'unitPrice']}
                        noStyle
                        rules={[{ required: true, message: 'Nhập giá' }]}
                      >
                        <InputNumber
                          prefix={<DollarOutlined />}
                          style={{ width: '100%', borderRadius: 6 }}
                          formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(val) => (val ? Number(val.replace(/\$\s?|(,*)/g, '')) : 0) as any}
                          min={0}
                        />
                      </Form.Item>
                    </div>
                  );
                })}
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* Modal View Price List Detail */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>Chi tiết:</span>
            <span style={{ fontWeight: 700 }}>{selectedPriceList?.name}</span>
            <span className="code-mono" style={{ color: '#0369A1' }}>({selectedPriceList?.code})</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)} style={{ borderRadius: 6 }}>
            Đóng
          </Button>,
        ]}
        width={720}
      >
        {selectedPriceList && (
          <div>
            <div
              style={{
                marginBottom: 16,
                display: 'flex',
                gap: 24,
                fontSize: 13,
                background: '#F8FAFC',
                padding: '14px 18px',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
              }}
            >
              <div>
                <Text type="secondary" style={{ fontSize: 11.5 }}>Nhóm áp dụng</Text>
                <div>
                  <Tag color="cyan" style={{ borderRadius: 4, fontWeight: 500, marginTop: 2 }}>
                    {selectedPriceList.customerGroupName}
                  </Tag>
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11.5 }}>Ngày hiệu lực</Text>
                <div>
                  <span className="tabular-nums" style={{ fontWeight: 600 }}>
                    {dayjs(selectedPriceList.startDate).format('DD/MM/YYYY')}
                  </span>
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11.5 }}>Trạng thái</Text>
                <div style={{ marginTop: 2 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '1px 8px',
                      borderRadius: 10,
                      fontSize: 11.5,
                      fontWeight: 600,
                      backgroundColor: selectedPriceList.isActive ? '#ECFDF5' : '#F1F5F9',
                      color: selectedPriceList.isActive ? '#059669' : '#64748B',
                      border: `1px solid ${selectedPriceList.isActive ? '#A7F3D0' : '#E2E8F0'}`,
                    }}
                  >
                    {selectedPriceList.isActive ? 'Đang áp dụng' : 'Hết hạn'}
                  </span>
                </div>
              </div>
            </div>

            <Table
              dataSource={selectedPriceList.items || []}
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
                  title: 'Giá áp dụng',
                  dataIndex: 'unitPrice',
                  key: 'unitPrice',
                  align: 'right' as const,
                  render: (price: number) => (
                    <span className="tabular-nums" style={{ color: '#059669', fontWeight: 700, fontSize: 13.5 }}>
                      {formatCurrency(price)}
                    </span>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
