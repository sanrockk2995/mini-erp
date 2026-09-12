import React, { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
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
import { supplierService } from '../../services/supplierService';
import { warehouseService } from '../../services/warehouseService';
import { productService } from '../../services/productService';
import { purchaseService } from '../../services/purchaseService';
import { Supplier, Warehouse, Product } from '../../types';

const { Text, Title } = Typography;

interface POItemRow {
  key: string;
  productId?: number;
  productSku?: string;
  productName?: string;
  productUnit?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export const PurchaseOrderCreatePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<POItemRow[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDropdowns = async () => {
      setLoading(true);
      try {
        const [supList, whList, prodList] = await Promise.all([
          supplierService.getAllActiveSuppliers(),
          warehouseService.getAllActiveWarehouses(),
          productService.getAllActiveProducts(),
        ]);
        setSuppliers(supList);
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
    const newItem: POItemRow = {
      key: Date.now().toString(),
      quantity: 1,
      unitPrice: 0,
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
          const cost = prod.standardCost || 0;
          return {
            ...item,
            productId: prod.id,
            productSku: prod.sku,
            productName: prod.name,
            productUnit: prod.unit,
            unitPrice: cost,
            lineTotal: qty * cost,
          };
        }
        return item;
      })
    );
  };

  const handleFieldChange = (key: string, field: 'quantity' | 'unitPrice', val: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key === key) {
          const updated = { ...item, [field]: val || 0 };
          updated.lineTotal = (updated.quantity || 0) * (updated.unitPrice || 0);
          return updated;
        }
        return item;
      })
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxAmount = Math.round(subtotal * 0.1); // VAT 10%
  const totalAmount = subtotal + taxAmount;

  const handleSubmit = async () => {
    if (items.length === 0) {
      message.warning('Vui lòng thêm ít nhất một sản phẩm vào đơn mua hàng');
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
        supplierId: values.supplierId,
        warehouseId: values.warehouseId,
        orderDate: values.orderDate ? values.orderDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        expectedDate: values.expectedDate ? values.expectedDate.format('YYYY-MM-DD') : undefined,
        notes: values.notes,
        subtotal,
        taxAmount,
        totalAmount,
        items: items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          lineTotal: it.lineTotal,
        })),
      };

      await purchaseService.createOrder(payload);
      message.success('Tạo đơn mua hàng (PO) thành công (Trạng thái DRAFT)');
      navigate('/purchase-orders');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi tạo PO');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (items.length > 0) {
      Modal.confirm({
        title: 'Hủy tạo đơn mua hàng?',
        content: 'Bạn đã nhập các mặt hàng trong đơn PO. Rời khỏi trang sẽ làm mất dữ liệu chưa lưu.',
        okText: 'Rời đi',
        okButtonProps: { danger: true },
        cancelText: 'Tiếp tục soạn đơn',
        onOk: () => navigate('/purchase-orders'),
      });
    } else {
      navigate('/purchase-orders');
    }
  };

  const columns = [
    {
      title: 'STT',
      width: 50,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Sản phẩm đặt mua',
      width: 320,
      render: (_: any, record: POItemRow) => (
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
            label: `[${p.sku}] ${p.name} (Giá vốn: ${formatCurrency(p.standardCost)})`,
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
      title: 'Số lượng mua',
      width: 130,
      render: (_: any, record: POItemRow) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(val) => handleFieldChange(record.key, 'quantity', val || 1)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Đơn giá mua (VND)',
      width: 180,
      render: (_: any, record: POItemRow) => (
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
      title: 'Thành tiền',
      align: 'right' as const,
      width: 180,
      render: (_: any, record: POItemRow) => (
        <Text strong style={{ color: '#059669' }}>
          {formatCurrency(record.lineTotal)}
        </Text>
      ),
    },
    {
      title: '',
      width: 50,
      align: 'center' as const,
      render: (_: any, record: POItemRow) => (
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
        title="Lập Đơn Mua hàng Nhà cung cấp (PO)"
        subtitle="Tạo đơn mua hàng gửi NCC, dự kiến ngày nhận và địa điểm kho nhập"
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
            Quay lại danh sách
          </Button>
        }
      />

      <Form form={form} layout="vertical" initialValues={{ orderDate: dayjs() }}>
        <Card title="Thông tin lệnh mua" style={{ marginBottom: 20, borderRadius: 8, border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <Form.Item
              name="supplierId"
              label="Nhà cung cấp"
              rules={[{ required: true, message: 'Vui lòng chọn NCC' }]}
            >
              <Select
                autoFocus
                placeholder="Chọn nhà cung cấp"
                showSearch
                loading={loading}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={suppliers.map((s) => ({
                  label: `${s.name} (${s.code})`,
                  value: s.id,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="warehouseId"
              label="Kho nhận hàng"
              rules={[{ required: true, message: 'Vui lòng chọn kho' }]}
            >
              <Select
                placeholder="Chọn kho"
                options={warehouses.map((w) => ({ label: `${w.name} (${w.code})`, value: w.id }))}
              />
            </Form.Item>

            <Form.Item
              name="orderDate"
              label="Ngày lập đơn"
              rules={[{ required: true, message: 'Chọn ngày' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item name="expectedDate" label="Ngày dự kiến nhận">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </div>

          <Form.Item name="notes" label="Ghi chú đơn mua" style={{ marginBottom: 0 }}>
            <Input.TextArea rows={2} placeholder="Điều khoản thanh toán, giao hàng tại kho..." />
          </Form.Item>
        </Card>

        <Card
          title="Danh mục Hàng hóa Cần Nhập"
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
                <Text type="secondary">Tổng tiền mua trước thuế:</Text>
                <Text strong>{formatCurrency(subtotal)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Thuế GTGT (VAT 10%):</Text>
                <Text>+{formatCurrency(taxAmount)}</Text>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>Tổng giá trị PO:</Title>
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
            Lưu đơn mua (DRAFT)
          </Button>
        </div>
      </Form>
    </div>
  );
};
