import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  Tag,
  Typography,
  message,
  Switch,
  Tooltip,
  Alert,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  AlertOutlined,
  ControlOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { PageHeader, formatNumber } from '../../components/common/PageHeader';
import { warehouseService } from '../../services/warehouseService';
import { productService } from '../../services/productService';
import { Inventory, Warehouse, Product } from '../../types';

const { Text } = Typography;

export const InventoryOverviewPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>(undefined);
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchWarehouses = async () => {
    try {
      const [whList, prodList] = await Promise.all([
        warehouseService.getAllWarehouses(),
        productService.getAllActiveProducts(),
      ]);
      setWarehouses(whList);
      setProducts(prodList);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInventory = async (currentPage = page, size = pageSize) => {
    setLoading(true);
    setError(null);
    try {
      if (onlyLowStock) {
        const lowList = await warehouseService.getLowStockAlerts();
        setInventories(lowList);
        setTotal(lowList.length);
      } else {
        const data = await warehouseService.searchInventory({
          keyword: keyword || undefined,
          warehouseId: selectedWarehouse,
          page: currentPage,
          size,
        });
        setInventories(data.content);
        setTotal(data.totalElements);
      }
    } catch (err: any) {
      setError(err?.message || 'Không thể tải dữ liệu tồn kho. Vui lòng kiểm tra kết nối.');
      message.error('Không thể tải dữ liệu tồn kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchInventory(0, pageSize);
  }, [selectedWarehouse, onlyLowStock]);

  const handleSearch = () => {
    setPage(0);
    fetchInventory(0, pageSize);
  };

  const handleOpenAdjust = (record?: Inventory) => {
    form.resetFields();
    form.setFieldsValue({
      warehouseId: record ? record.warehouseId : warehouses[0]?.id,
      productId: record ? record.productId : products[0]?.id,
      transactionType: 'IN',
      quantity: 1,
    });
    setAdjustModalVisible(true);
  };

  const handleSaveAdjust = async () => {
    try {
      const values = await form.validateFields();
      setAdjustSubmitting(true);
      await warehouseService.adjustStock(values);
      message.success('Điều chỉnh tồn kho thành công và đã ghi sổ cái biến động kho');
      setAdjustModalVisible(false);
      fetchInventory();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Kho lưu trữ',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 160,
      render: (name: string, record: Inventory) => (
        <div>
          <Tag color="cyan" style={{ borderRadius: 4, fontWeight: 500 }}>{name}</Tag>
          <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
            Mã: <span className="code-mono">{record.warehouseCode}</span>
          </div>
        </div>
      ),
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
            backgroundColor: '#F1F5F9',
            border: '1px solid #E2E8F0',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 12,
            color: '#0369A1',
            fontWeight: 600,
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
      width: 250,
      render: (name: string) => (
        <div style={{ minWidth: 200 }}>
          <Text strong style={{ color: '#0F172A', fontSize: 13.5, whiteSpace: 'nowrap' }}>{name}</Text>
        </div>
      ),
    },
    {
      title: 'ĐVT',
      dataIndex: 'productUnit',
      key: 'productUnit',
      width: 80,
      align: 'center' as const,
      render: (u: string) => <span style={{ color: '#475569', fontWeight: 500 }}>{u}</span>,
    },
    {
      title: 'Tồn thực tế (On-hand)',
      dataIndex: 'quantityOnHand',
      key: 'quantityOnHand',
      align: 'right' as const,
      width: 160,
      render: (qty: number) => (
        <span
          className="tabular-nums"
          style={{
            fontWeight: 800,
            fontSize: 14,
            color: qty <= 5 ? '#DC2626' : '#0F172A',
          }}
        >
          {formatNumber(qty)}
        </span>
      ),
    },
    {
      title: 'Đã giữ chỗ (Reserved)',
      dataIndex: 'quantityReserved',
      key: 'quantityReserved',
      align: 'right' as const,
      width: 160,
      render: (qty: number) => (
        <span
          className="tabular-nums"
          style={{
            fontWeight: 600,
            color: qty > 0 ? '#D97706' : '#94A3B8',
          }}
        >
          {formatNumber(qty)}
        </span>
      ),
    },
    {
      title: 'Khả dụng (Available)',
      dataIndex: 'quantityAvailable',
      key: 'quantityAvailable',
      align: 'right' as const,
      width: 160,
      render: (qty: number) => (
        <span
          className="tabular-nums"
          style={{
            color: qty > 0 ? '#059669' : '#DC2626',
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          {formatNumber(qty)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 160,
      render: (_: any, record: Inventory) => {
        if (record.quantityOnHand <= 5) {
          return (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '2px 8px',
                borderRadius: 12,
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                border: '1px solid #FECACA',
                fontWeight: 600,
                fontSize: 11.5,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#EF4444' }} />
              Sắp hết hàng
            </span>
          );
        }
        if (record.quantityAvailable <= 0) {
          return (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '2px 8px',
                borderRadius: 12,
                backgroundColor: '#FFFBEB',
                color: '#D97706',
                border: '1px solid #FDE68A',
                fontWeight: 600,
                fontSize: 11.5,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
              Hết khả dụng
            </span>
          );
        }
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '2px 8px',
              borderRadius: 12,
              backgroundColor: '#ECFDF5',
              color: '#059669',
              border: '1px solid #A7F3D0',
              fontWeight: 600,
              fontSize: 11.5,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981' }} />
            Đủ hàng
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: Inventory) => (
        <Tooltip title="Kiểm kê điều chỉnh số dư">
          <Button
            type="link"
            size="small"
            icon={<ControlOutlined />}
            style={{ color: '#059669', fontWeight: 600 }}
            onClick={() => handleOpenAdjust(record)}
          >
            Kiểm kê
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        title="Quản lý Tồn kho & Cảnh báo Dự trữ"
        subtitle="Giám sát tồn kho thực tế, tồn kho giữ chỗ và khả dụng tức thời theo công thức Double-Entry"
        tag={
          <Tag color="emerald" style={{ borderRadius: 4, fontWeight: 600 }}>
            {total} Mặt hàng
          </Tag>
        }
        extra={
          <Button
            type="primary"
            icon={<ControlOutlined />}
            style={{
              backgroundColor: '#059669',
              borderColor: '#059669',
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 6,
              height: 38,
            }}
            onClick={() => handleOpenAdjust()}
          >
            Điều chỉnh kiểm kê kho
          </Button>
        }
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message="Lỗi tải dữ liệu tồn kho"
          description={error}
          action={
            <Button size="small" danger icon={<ReloadOutlined />} onClick={() => fetchInventory()}>
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
          gap: 16,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Input
          placeholder="Tìm theo SKU, tên sản phẩm..."
          prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 260, borderRadius: 6 }}
          allowClear
          disabled={onlyLowStock}
        />

        <Select
          placeholder="Tất cả kho hàng"
          allowClear
          value={selectedWarehouse}
          onChange={(val) => setSelectedWarehouse(val)}
          style={{ width: 220 }}
          options={warehouses.map((w) => ({ label: `${w.name} (${w.code})`, value: w.id }))}
          disabled={onlyLowStock}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Switch
            checked={onlyLowStock}
            onChange={(checked) => setOnlyLowStock(checked)}
          />
          <Text style={{ fontSize: 13, color: onlyLowStock ? '#DC2626' : '#64748B', fontWeight: 600 }}>
            <AlertOutlined /> Chỉ xem sản phẩm dưới định mức tồn
          </Text>
        </div>

        <Button
          icon={<SearchOutlined />}
          onClick={handleSearch}
          disabled={onlyLowStock}
          style={{ borderRadius: 6, fontWeight: 500 }}
        >
          Tìm kiếm
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            setKeyword('');
            setSelectedWarehouse(undefined);
            setOnlyLowStock(false);
            fetchInventory(0, pageSize);
          }}
          style={{ borderRadius: 6 }}
        >
          Đặt lại
        </Button>
      </div>

      <div className="erp-card" style={{ background: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}>
        <Table
          dataSource={inventories}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 1050 }}
          pagination={{
            current: page + 1,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (p, s) => {
              setPage(p - 1);
              setPageSize(s);
              fetchInventory(p - 1, s);
            },
            showTotal: (totalCount) => `Tổng cộng ${totalCount} mặt hàng trong kho`,
          }}
        />
      </div>

      {/* Adjustment Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ControlOutlined style={{ color: '#059669' }} />
            <span>Phiếu Điều chỉnh / Kiểm kê Kho Hàng</span>
          </div>
        }
        open={adjustModalVisible}
        onOk={handleSaveAdjust}
        onCancel={() => setAdjustModalVisible(false)}
        confirmLoading={adjustSubmitting}
        destroyOnClose
        okText="Ghi nhận kiểm kê"
        cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: '#059669', borderColor: '#059669', borderRadius: 6 } }}
        cancelButtonProps={{ style: { borderRadius: 6 } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="warehouseId"
            label={<span style={{ fontWeight: 600 }}>Kho hàng</span>}
            rules={[{ required: true, message: 'Vui lòng chọn kho hàng' }]}
          >
            <Select
              options={warehouses.map((w) => ({ label: `${w.name} (${w.code})`, value: w.id }))}
            />
          </Form.Item>

          <Form.Item
            name="productId"
            label={<span style={{ fontWeight: 600 }}>Sản phẩm điều chỉnh</span>}
            rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
          >
            <Select
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={products.map((p) => ({ label: `[${p.sku}] ${p.name}`, value: p.id }))}
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="transactionType"
              label={<span style={{ fontWeight: 600 }}>Chiều điều chỉnh</span>}
              rules={[{ required: true, message: 'Chọn chiều điều chỉnh' }]}
            >
              <Select
                options={[
                  { label: 'TĂNG TỒN (IN - Kiểm kê thừa)', value: 'IN' },
                  { label: 'GIẢM TỒN (OUT - Kiểm kê thiếu / hao hụt)', value: 'OUT' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="quantity"
              label={<span style={{ fontWeight: 600 }}>Số lượng điều chỉnh</span>}
              rules={[{ required: true, message: 'Nhập số lượng' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item
            name="notes"
            label={<span style={{ fontWeight: 600 }}>Lý do điều chỉnh kiểm kê</span>}
            rules={[{ required: true, message: 'Vui lòng nhập lý do kiểm kê' }]}
          >
            <Input.TextArea rows={2} placeholder="Hao hụt tự nhiên, hàng vỡ hỏng, bù trừ kiểm kê cuối tháng..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
