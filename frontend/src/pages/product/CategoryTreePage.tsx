import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  message,
  Popconfirm,
  Tag,
  TreeSelect,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../components/common/PageHeader';
import { productService } from '../../services/productService';
import { Category } from '../../types';

export const CategoryTreePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getCategoryTree(false);
      setCategories(data);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh mục sản phẩm. Vui lòng kiểm tra kết nối.');
      message.error('Không thể tải danh mục sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      form.setFieldsValue({
        code: cat.code,
        name: cat.name,
        parentId: cat.parentId,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
      });
    } else {
      setEditingCategory(null);
      form.resetFields();
      form.setFieldsValue({ isActive: true, sortOrder: 0 });
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCategory) {
        await productService.updateCategory(editingCategory.id, values);
        message.success('Cập nhật danh mục thành công');
      } else {
        await productService.createCategory(values);
        message.success('Tạo mới danh mục thành công');
      }
      setModalVisible(false);
      fetchCategories();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await productService.deleteCategory(id);
      message.success('Đã xóa danh mục');
      fetchCategories();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể xóa danh mục');
    }
  };

  // Convert categories to TreeSelect format
  const formatTreeData = (items: Category[]): any[] => {
    return items.map((item) => ({
      title: `${item.name} (${item.code})`,
      value: item.id,
      key: item.id,
      children: item.children && item.children.length > 0 ? formatTreeData(item.children) : undefined,
    }));
  };

  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      width: 320,
      render: (name: string) => (
        <div style={{ minWidth: 240 }}>
          <Space style={{ flexWrap: 'nowrap' }}>
            <FolderOutlined style={{ color: '#F59E0B', flexShrink: 0 }} />
            <span style={{ fontWeight: 600, color: '#0F172A', fontSize: 13.5, whiteSpace: 'nowrap' }}>{name}</span>
          </Space>
        </div>
      ),
    },
    {
      title: 'Mã danh mục',
      dataIndex: 'code',
      key: 'code',
      width: 220,
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
      title: 'Thứ tự',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 100,
      align: 'center' as const,
      render: (so: number) => <span className="tabular-nums" style={{ color: '#475569' }}>{so}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 150,
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
          {active ? 'Hoạt động' : 'Tạm dừng'}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: Category) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            style={{ color: '#0284C7' }}
            title="Chỉnh sửa danh mục"
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="Xóa danh mục"
            description="Lưu ý: Không thể xóa danh mục nếu đang có sản phẩm thuộc danh mục này!"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true, style: { borderRadius: 6 } }}
            cancelButtonProps={{ style: { borderRadius: 6 } }}
          >
            <Button type="text" icon={<DeleteOutlined />} danger title="Xóa danh mục" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        title="Danh mục Ngành hàng"
        subtitle="Cấu trúc phân cấp ngành hàng đa cấp phục vụ phân loại và báo cáo doanh số"
        tag={
          <Tag color="purple" style={{ borderRadius: 4, fontWeight: 600 }}>
            {categories.length} Nhánh gốc
          </Tag>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchCategories} loading={loading} style={{ borderRadius: 6 }}>
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
              onClick={() => handleOpenModal()}
            >
              Thêm danh mục
            </Button>
          </Space>
        }
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message="Lỗi tải danh mục sản phẩm"
          description={error}
          action={
            <Button size="small" danger icon={<ReloadOutlined />} onClick={() => fetchCategories()}>
              Thử lại
            </Button>
          }
          style={{ borderRadius: 8 }}
        />
      )}

      <div className="erp-card" style={{ background: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}>
        <Table
          dataSource={categories}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="middle"
          expandable={{ defaultExpandAllRows: true }}
          scroll={{ x: 850 }}
        />
      </div>

      <Modal
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
        okText="Lưu thông tin"
        cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: '#059669', borderColor: '#059669', borderRadius: 6 } }}
        cancelButtonProps={{ style: { borderRadius: 6 } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="code"
            label={<span style={{ fontWeight: 600 }}>Mã danh mục</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mã danh mục' }]}
          >
            <Input autoFocus placeholder="Ví dụ: MEN" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item
            name="name"
            label={<span style={{ fontWeight: 600 }}>Tên danh mục</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input placeholder="Ví dụ: Thời trang Nam" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item name="parentId" label={<span style={{ fontWeight: 600 }}>Danh mục cha (nếu có)</span>}>
            <TreeSelect
              placeholder="Chọn danh mục cha (để trống nếu là cấp 1)"
              allowClear
              treeData={formatTreeData(categories)}
              style={{ borderRadius: 6 }}
            />
          </Form.Item>

          <Form.Item name="sortOrder" label={<span style={{ fontWeight: 600 }}>Thứ tự hiển thị</span>}>
            <InputNumber min={0} style={{ width: '100%', borderRadius: 6 }} />
          </Form.Item>

          <Form.Item name="isActive" label={<span style={{ fontWeight: 600 }}>Trạng thái hoạt động</span>} valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
