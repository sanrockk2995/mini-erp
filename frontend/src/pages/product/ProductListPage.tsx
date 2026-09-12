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
  Switch,
  message,
  Popconfirm,
  Tag,
  Typography,
  Tooltip,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { PageHeader, formatCurrency } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { productService } from '../../services/productService';
import { Product, Category } from '../../types';

const { Text } = Typography;

export const ProductListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    try {
      const data = await productService.getCategoryTree();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async (currentPage = page, size = pageSize) => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.searchProducts({
        keyword: keyword || undefined,
        categoryId: selectedCategory,
        page: currentPage,
        size,
      });
      setProducts(data.content);
      setTotal(data.totalElements);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách sản phẩm. Vui lòng kiểm tra kết nối.');
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(0, pageSize);
  }, [selectedCategory]);

  const handleSearch = () => {
    setPage(0);
    fetchProducts(0, pageSize);
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      form.setFieldsValue({
        sku: product.sku,
        barcode: product.barcode,
        name: product.name,
        categoryId: product.categoryId,
        unit: product.unit,
        standardCost: product.standardCost,
        standardPrice: product.standardPrice,
        description: product.description,
        isActive: product.isActive,
      });
    } else {
      setEditingProduct(null);
      form.resetFields();
      form.setFieldsValue({ isActive: true, unit: 'Cái', standardCost: 0, standardPrice: 0 });
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, values);
        message.success('Cập nhật sản phẩm thành công');
      } else {
        await productService.createProduct(values);
        message.success('Thêm mới sản phẩm thành công');
      }
      setModalVisible(false);
      fetchProducts();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await productService.deleteProduct(id);
      message.success('Đã xóa sản phẩm');
      fetchProducts();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xóa sản phẩm');
    }
  };

  const columns = [
    {
      title: 'Mã SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 150,
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
      dataIndex: 'name',
      key: 'name',
      width: 280,
      render: (name: string, record: Product) => (
        <div style={{ minWidth: 200 }}>
          <Text strong style={{ color: '#0F172A', fontSize: 13.5, whiteSpace: 'nowrap' }}>{name}</Text>
          {record.barcode && (
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2, whiteSpace: 'nowrap' }}>
              Barcode: <span className="code-mono">{record.barcode}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 160,
      render: (cat: string) => (
        <Tag color="purple" style={{ borderRadius: 4, fontWeight: 500 }}>
          {cat || 'Chưa phân loại'}
        </Tag>
      ),
    },
    {
      title: 'ĐVT',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      align: 'center' as const,
      render: (u: string) => <span style={{ color: '#475569', fontWeight: 500 }}>{u}</span>,
    },
    {
      title: 'Giá vốn',
      dataIndex: 'standardCost',
      key: 'standardCost',
      align: 'right' as const,
      width: 140,
      render: (cost: number) => (
        <span className="tabular-nums" style={{ color: '#475569', fontWeight: 600 }}>
          {formatCurrency(cost)}
        </span>
      ),
    },
    {
      title: 'Giá bán niêm yết',
      dataIndex: 'standardPrice',
      key: 'standardPrice',
      align: 'right' as const,
      width: 160,
      render: (price: number) => (
        <span className="tabular-nums" style={{ color: '#059669', fontWeight: 700, fontSize: 13.5 }}>
          {formatCurrency(price)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 140,
      align: 'center' as const,
      render: (active: boolean) => <StatusBadge status={String(active)} text={active ? 'Đang KD' : 'Ngừng KD'} />,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 110,
      align: 'center' as const,
      render: (_: any, record: Product) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa sản phẩm">
            <Button
              type="text"
              icon={<EditOutlined />}
              style={{ color: '#0284C7' }}
              onClick={() => handleOpenModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa sản phẩm"
            description="Bạn có chắc chắn muốn xóa sản phẩm này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button type="text" icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        title="Danh mục Sản phẩm & Bảng giá"
        subtitle="Quản lý mã SKU, thông số, giá vốn tiêu chuẩn và giá bán niêm yết của toàn bộ hàng hóa"
        tag={
          <Tag color="blue" style={{ borderRadius: 4, fontWeight: 600 }}>
            {total} SKU
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
            Thêm sản phẩm mới
          </Button>
        }
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message="Lỗi tải danh mục sản phẩm"
          description={error}
          action={
            <Button size="small" danger icon={<ReloadOutlined />} onClick={() => fetchProducts()}>
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
          placeholder="Tìm theo tên, mã SKU, barcode..."
          prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 280, borderRadius: 6 }}
          allowClear
        />

        <Select
          placeholder="Lọc theo danh mục"
          allowClear
          value={selectedCategory}
          onChange={(val) => setSelectedCategory(val)}
          style={{ width: 220 }}
          options={categories.map((c) => ({ label: c.name, value: c.id }))}
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
            setSelectedCategory(undefined);
            fetchProducts(0, pageSize);
          }}
          style={{ borderRadius: 6 }}
        >
          Đặt lại
        </Button>
      </div>

      <div className="erp-card" style={{ background: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}>
        <Table
          dataSource={products}
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
              fetchProducts(p - 1, s);
            },
            showTotal: (totalCount) => `Tổng cộng ${totalCount} sản phẩm`,
          }}
        />
      </div>

      {/* Modal Add / Edit Product */}
      <Modal
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
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
              name="sku"
              label={<span style={{ fontWeight: 600 }}>Mã SKU</span>}
              rules={[{ required: true, message: 'Vui lòng nhập mã SKU' }]}
            >
              <Input autoFocus placeholder="Ví dụ: SKU-IP15-128" />
            </Form.Item>

            <Form.Item name="barcode" label={<span style={{ fontWeight: 600 }}>Mã vạch (Barcode)</span>}>
              <Input placeholder="Ví dụ: 893123456789" />
            </Form.Item>
          </div>

          <Form.Item
            name="name"
            label={<span style={{ fontWeight: 600 }}>Tên sản phẩm</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          >
            <Input placeholder="Ví dụ: iPhone 15 Pro Max 256GB" />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="categoryId"
              label={<span style={{ fontWeight: 600 }}>Danh mục ngành hàng</span>}
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <Select
                placeholder="Chọn danh mục"
                options={categories.map((c) => ({ label: c.name, value: c.id }))}
              />
            </Form.Item>

            <Form.Item
              name="unit"
              label={<span style={{ fontWeight: 600 }}>Đơn vị tính</span>}
              rules={[{ required: true, message: 'Vui lòng nhập ĐVT' }]}
            >
              <Input placeholder="Cái, Hộp, Bộ, Thùng..." />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="standardCost"
              label={<span style={{ fontWeight: 600 }}>Giá vốn tiêu chuẩn (VND)</span>}
              rules={[{ required: true, message: 'Vui lòng nhập giá vốn' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => (val ? Number(val.replace(/\$\s?|(,*)/g, '')) : 0) as any}
                min={0}
              />
            </Form.Item>

            <Form.Item
              name="standardPrice"
              label={<span style={{ fontWeight: 600 }}>Giá bán niêm yết (VND)</span>}
              rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => (val ? Number(val.replace(/\$\s?|(,*)/g, '')) : 0) as any}
                min={0}
              />
            </Form.Item>
          </div>

          <Form.Item name="description" label={<span style={{ fontWeight: 600 }}>Mô tả chi tiết</span>}>
            <Input.TextArea rows={3} placeholder="Thông số kỹ thuật, bảo hành, ghi chú..." />
          </Form.Item>

          <Form.Item name="isActive" label={<span style={{ fontWeight: 600 }}>Kinh doanh</span>} valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
