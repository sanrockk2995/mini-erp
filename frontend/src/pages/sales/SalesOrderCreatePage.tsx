import React, { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Table,
  InputNumber,
  Typography,
  message,
  Divider,
  Modal,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { PageHeader, formatCurrency } from '../../components/common/PageHeader';
import { customerService } from '../../services/customerService';
import { warehouseService } from '../../services/warehouseService';
import { productService } from '../../services/productService';
import { salesService } from '../../services/salesService';
import { Customer, Warehouse, Product } from '../../types';

const { Text, Title } = Typography;

interface OrderItemRow {
  key: string;
  productId?: number;
  productSku?: string;
  productName?: string;
  productUnit?: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  lineTotal: number;
}

export const SalesOrderCreatePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDropdowns = async () => {
      setLoading(true);
      try {
        const [custList, whList, prodList] = await Promise.all([
          customerService.getAllActiveCustomers(),
          warehouseService.getAllActiveWarehouses(),
          productService.getAllActiveProducts(),
        ]);
        setCustomers(custList);
        setWarehouses(whList);
        setProducts(prodList);
        if (whList.length > 0) {
          form.setFieldsValue({ warehouseId: whList[0].id });
        }
      } catch (err) {
        message.error('Không thể tải dữ liệu ban đầu');
      } finally {
        setLoading(false);
      }
    };
    fetchDropdowns();
  }, []);

  const handleAddItem = () => {
    const newItem: OrderItemRow = {
      key: Date.now().toString(),
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      lineTotal: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const handleProductChange = (key: string, productId: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setItems((prev) =>
      prev.map((item) => {
        if (item.key === key) {
          const qty = item.quantity || 1;
          const price = prod.standardPrice || 0;
          const disc = item.discountPercent || 0;
          const total = qty * price * (1 - disc / 100);
          return {
            ...item,
            productId: prod.id,
            productSku: prod.sku,
            productName: prod.name,
            productUnit: prod.unit,
            unitPrice: price,
            lineTotal: total,
          };
        }
        return item;
      })
    );
  };

  const handleFieldChange = (key: string, field: 'quantity' | 'unitPrice' | 'discountPercent', val: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key === key) {
          const updated = { ...item, [field]: val || 0 };
          const qty = updated.quantity || 0;
          const price = updated.unitPrice || 0;
          const disc = updated.discountPercent || 0;
          updated.lineTotal = qty * price * (1 - disc / 100);
          return updated;
        }
        return item;
      })
    );
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalAfterDiscount = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discountAmount = subtotal - totalAfterDiscount;
  const taxAmount = Math.round(totalAfterDiscount * 0.1); // VAT 10%
  const totalAmount = totalAfterDiscount + taxAmount;

  const handleSubmit = async () => {
    if (items.length === 0) {
      message.warning('Vui lòng thêm ít nhất một sản phẩm vào đơn hàng');
      return;
    }

    const invalidItem = items.find((it) => !it.productId || it.quantity <= 0);
    if (invalidItem) {
      message.warning('Vui lòng chọn sản phẩm và nhập số lượng lớn hơn 0');
      return;
    }

    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        customerId: values.customerId,
        warehouseId: values.warehouseId,
        orderDate: values.orderDate ? values.orderDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        notes: values.notes,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        items: items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          discountPercent: it.discountPercent,
          lineTotal: it.lineTotal,
        })),
      };

      await salesService.createOrder(payload);
      message.success('Tạo đơn đặt hàng thành công (Trạng thái DRAFT)');
      navigate('/sales-orders');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (items.length > 0) {
      Modal.confirm({
        title: 'Hủy tạo đơn hàng?',
        content: 'Bạn đã nhập các mặt hàng trong đơn. Rời khỏi trang sẽ làm mất dữ liệu chưa lưu.',
        okText: 'Rời đi',
        okButtonProps: { danger: true },
        cancelText: 'Tiếp tục soạn đơn',
        onOk: () => navigate('/sales-orders'),
      });
    } else {
      navigate('/sales-orders');
    }
  };

  const columns = [
    {
      title: 'STT',
      width: 50,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Sản phẩm',
      width: 320,
      render: (_: any, record: OrderItemRow) => (
        <Select
          placeholder="Tìm chọn sản phẩm..."
          showSearch
          style={{ width: '100%' }}
          value={record.productId}
          onChange={(val) => handleProductChange(record.key, val)}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={products.map((p) => ({
            label: `[${p.sku}] ${p.name} (${formatCurrency(p.standardPrice)})`,
            value: p.id,
          }))}
        />
      ),
    },
    {
      title: 'Đơn vị tính',
      width: 100,
      dataIndex: 'productUnit',
    },
    {
      title: 'Số lượng',
      width: 120,
      render: (_: any, record: OrderItemRow) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(val) => handleFieldChange(record.key, 'quantity', val || 1)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Đơn giá (VND)',
      width: 160,
      render: (_: any, record: OrderItemRow) => (
        <InputNumber
          min={0}
          value={record.unitPrice}
          formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(val) => (val ? Number(val.replace(/\$\s?|(,*)/g, '')) : 0) as any}
          onChange={(val) => handleFieldChange(record.key, 'unitPrice', val || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Chiết khấu (%)',
      width: 120,
      render: (_: any, record: OrderItemRow) => (
        <InputNumber
          min={0}
          max={100}
          value={record.discountPercent}
          onChange={(val) => handleFieldChange(record.key, 'discountPercent', val || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Thành tiền',
      align: 'right' as const,
      width: 160,
      render: (_: any, record: OrderItemRow) => (
        <Text strong style={{ color: '#059669' }}>
          {formatCurrency(record.lineTotal)}
        </Text>
      ),
    },
    {
      title: '',
      width: 50,
      align: 'center' as const,
      render: (_: any, record: OrderItemRow) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.key)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tạo Đơn đặt hàng Bán Mới"
        subtitle="Lập đơn hàng bán cho khách hàng, tự động tính thuế VAT và chiết khấu"
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
            Quay lại danh sách
          </Button>
        }
      />

      <Form form={form} layout="vertical" initialValues={{ orderDate: dayjs() }}>
        <Card title="Thông tin chung" style={{ marginBottom: 20, borderRadius: 8, border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <Form.Item
              name="customerId"
              label="Khách hàng"
              rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
            >
              <Select
                autoFocus
                placeholder="Tìm chọn khách hàng"
                showSearch
                loading={loading}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={customers.map((c) => ({
                  label: `${c.name} (${c.phone || c.code})`,
                  value: c.id,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="warehouseId"
              label="Kho xuất hàng"
              rules={[{ required: true, message: 'Vui lòng chọn kho hàng' }]}
            >
              <Select
                placeholder="Chọn kho xuất"
                options={warehouses.map((w) => ({ label: `${w.name} (${w.code})`, value: w.id }))}
              />
            </Form.Item>

            <Form.Item
              name="orderDate"
              label="Ngày đặt hàng"
              rules={[{ required: true, message: 'Vui lòng chọn ngày đặt' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </div>

          <Form.Item name="notes" label="Ghi chú đơn hàng" style={{ marginBottom: 0 }}>
            <Input.TextArea rows={2} placeholder="Yêu cầu giao hàng, điều kiện thanh toán..." />
          </Form.Item>
        </Card>

        <Card
          title="Danh sách Hàng hóa"
          extra={
            <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddItem}>
              Thêm dòng sản phẩm
            </Button>
          }
          style={{ marginBottom: 20, borderRadius: 8, border: '1px solid #E2E8F0' }}
        >
          <Table
            dataSource={items}
            columns={columns}
            pagination={false}
            size="middle"
            locale={{ emptyText: 'Chưa có sản phẩm nào. Nhấn "Thêm dòng sản phẩm" để bắt đầu.' }}
          />

          <Divider />

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Tổng tiền hàng (chưa giảm):</Text>
                <Text strong>{formatCurrency(subtotal)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Tiền chiết khấu:</Text>
                <Text style={{ color: '#DC2626' }}>-{formatCurrency(discountAmount)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Thuế GTGT (VAT 10%):</Text>
                <Text>+{formatCurrency(taxAmount)}</Text>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>Tổng cộng:</Title>
                <Title level={3} style={{ margin: 0, color: '#059669' }}>
                  {formatCurrency(totalAmount)}
                </Title>
              </div>
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button size="large" onClick={handleCancel}>
            Hủy bỏ
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            style={{ backgroundColor: '#059669', borderColor: '#059669' }}
            loading={submitting}
            onClick={handleSubmit}
          >
            Lưu đơn hàng (DRAFT)
          </Button>
        </div>
      </Form>
    </div>
  );
};
