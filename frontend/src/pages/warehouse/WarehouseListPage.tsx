import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Tag,
  Typography,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  ReloadOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../components/common/PageHeader';
import { warehouseService } from '../../services/warehouseService';
import { Warehouse } from '../../types';

const { Text } = Typography;

export const WarehouseListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [form] = Form.useForm();

  const fetchWarehouses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await warehouseService.getAllWarehouses();
      setWarehouses(data);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách kho hàng. Vui lòng kiểm tra kết nối.');
      message.error('Không thể tải danh sách kho hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleOpenModal = (wh?: Warehouse) => {
    if (wh) {
      setEditingWarehouse(wh);
      form.setFieldsValue({
        code: wh.code,
        name: wh.name,
        address: wh.address,
        managerName: wh.managerName,
        phone: wh.phone,
        isActive: wh.isActive,
      });
    } else {
      setEditingWarehouse(null);
      form.resetFields();
      form.setFieldsValue({ isActive: true });
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingWarehouse) {
        await warehouseService.updateWarehouse(editingWarehouse.id, values);
        message.success('Cập nhật thông tin kho thành công');
      } else {
        await warehouseService.createWarehouse(values);
        message.success('Thêm mới kho hàng thành công');
      }
      setModalVisible(false);
      fetchWarehouses();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu kho');
    }
  };

  const columns = [
    {
      title: 'Mã kho',
      dataIndex: 'code',
      key: 'code',
      width: 150,
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
      title: 'Tên kho hàng',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (name: string) => (
        <div style={{ minWidth: 180 }}>
          <Space style={{ flexWrap: 'nowrap' }}>
            <HomeOutlined style={{ color: '#059669', flexShrink: 0 }} />
            <Text strong style={{ color: '#0F172A', fontSize: 13.5, whiteSpace: 'nowrap' }}>{name}</Text>
          </Space>
        </div>
      ),
    },
    {
      title: 'Địa chỉ kho',
      dataIndex: 'address',
      key: 'address',
      width: 260,
      render: (addr: string) => (
        <span style={{ color: '#475569', fontSize: 12.5 }}>{addr}</span>
      ),
    },
    {
      title: 'Thủ kho quản lý',
      dataIndex: 'managerName',
      key: 'managerName',
      width: 180,
      render: (mgr: string) => (
        <span style={{ fontWeight: 600, color: '#334155', fontSize: 13 }}>{mgr}</span>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (phone: string) => (
        <span className="tabular-nums" style={{ color: '#475569', fontSize: 12.5 }}>{phone}</span>
      ),
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
          {active ? 'Đang sử dụng' : 'Tạm khóa'}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 90,
      align: 'center' as const,
      render: (_: any, record: Warehouse) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          style={{ color: '#0284C7' }}
          title="Chỉnh sửa thông tin kho"
          onClick={() => handleOpenModal(record)}
        />
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        title="Danh mục Kho hàng (Warehouses)"
        subtitle="Quản lý hệ thống kho hàng chi nhánh, trung tâm phân phối và phụ trách thủ kho"
        tag={
          <Tag color="purple" style={{ borderRadius: 4, fontWeight: 600 }}>
            {warehouses.length} Kho hàng
          </Tag>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchWarehouses} loading={loading} style={{ borderRadius: 6 }}>
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
              Thêm kho hàng mới
            </Button>
          </Space>
        }
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message="Lỗi tải danh sách kho hàng"
          description={error}
          action={
            <Button size="small" danger icon={<ReloadOutlined />} onClick={() => fetchWarehouses()}>
              Thử lại
            </Button>
          }
          style={{ borderRadius: 8 }}
        />
      )}

      <div className="erp-card" style={{ background: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}>
        <Table
          dataSource={warehouses}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="middle"
          scroll={{ x: 950 }}
        />
      </div>

      <Modal
        title={editingWarehouse ? 'Chỉnh sửa thông tin kho' : 'Thêm mới kho hàng'}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="code"
              label={<span style={{ fontWeight: 600 }}>Mã kho</span>}
              rules={[{ required: true, message: 'Vui lòng nhập mã kho' }]}
            >
              <Input autoFocus placeholder="Ví dụ: WH-HCM-01" style={{ borderRadius: 6 }} />
            </Form.Item>

            <Form.Item
              name="name"
              label={<span style={{ fontWeight: 600 }}>Tên kho hàng</span>}
              rules={[{ required: true, message: 'Vui lòng nhập tên kho' }]}
            >
              <Input placeholder="Ví dụ: Kho Tổng Tân Bình" style={{ borderRadius: 6 }} />
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label={<span style={{ fontWeight: 600 }}>Địa chỉ thực tế của kho</span>}
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input placeholder="Số nhà, đường, quận/huyện, tỉnh/thành..." style={{ borderRadius: 6 }} />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="managerName" label={<span style={{ fontWeight: 600 }}>Thủ kho phụ trách</span>}>
              <Input placeholder="Nguyễn Văn A" style={{ borderRadius: 6 }} />
            </Form.Item>

            <Form.Item name="phone" label={<span style={{ fontWeight: 600 }}>Số điện thoại liên hệ</span>}>
              <Input placeholder="0909888777" style={{ borderRadius: 6 }} />
            </Form.Item>
          </div>

          <Form.Item name="isActive" label={<span style={{ fontWeight: 600 }}>Trạng thái hoạt động</span>} valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
