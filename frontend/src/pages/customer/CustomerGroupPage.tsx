import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Tag,
  Typography,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  ReloadOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../components/common/PageHeader';
import { customerService } from '../../services/customerService';
import { CustomerGroup } from '../../types';

const { Text } = Typography;

export const CustomerGroupPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null);
  const [form] = Form.useForm();

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerService.getAllGroups();
      setGroups(data);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách nhóm khách hàng. Vui lòng kiểm tra kết nối.');
      message.error('Không thể tải danh sách nhóm khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleOpenModal = (group?: CustomerGroup) => {
    if (group) {
      setEditingGroup(group);
      form.setFieldsValue({
        code: group.code,
        name: group.name,
        discountPercent: group.discountPercent,
        description: group.description,
      });
    } else {
      setEditingGroup(null);
      form.resetFields();
      form.setFieldsValue({ discountPercent: 0 });
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingGroup) {
        await customerService.updateGroup(editingGroup.id, values);
        message.success('Cập nhật nhóm khách hàng thành công');
      } else {
        await customerService.createGroup(values);
        message.success('Tạo mới nhóm khách hàng thành công');
      }
      setModalVisible(false);
      fetchGroups();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu nhóm khách hàng');
    }
  };

  const columns = [
    {
      title: 'Mã nhóm',
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
      title: 'Tên nhóm khách hàng',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (name: string) => (
        <Space style={{ flexWrap: 'nowrap', minWidth: 180 }}>
          <UsergroupAddOutlined style={{ color: '#059669', flexShrink: 0 }} />
          <Text strong style={{ color: '#0F172A', fontSize: 13.5, whiteSpace: 'nowrap' }}>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Chiết khấu mặc định',
      dataIndex: 'discountPercent',
      key: 'discountPercent',
      width: 180,
      align: 'right' as const,
      render: (pct: number) => (
        <span
          className="tabular-nums"
          style={{
            fontWeight: 700,
            fontSize: 13.5,
            color: pct > 0 ? '#D97706' : '#64748B',
            backgroundColor: pct > 0 ? '#FFFBEB' : '#F1F5F9',
            border: `1px solid ${pct > 0 ? '#FDE68A' : '#E2E8F0'}`,
            padding: '2px 8px',
            borderRadius: 6,
          }}
        >
          {pct}%
        </span>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => (
        <span style={{ color: '#475569', fontSize: 12.5 }}>{desc || '—'}</span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 90,
      align: 'center' as const,
      render: (_: any, record: CustomerGroup) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          style={{ color: '#0284C7' }}
          title="Chỉnh sửa thông tin nhóm"
          onClick={() => handleOpenModal(record)}
        />
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        title="Nhóm Khách hàng & Chính sách Chiết khấu"
        subtitle="Phân hạng khách hàng (VIP, Đại lý cấp 1, Khách lẻ) để cấu hình chiết khấu và bảng giá riêng"
        tag={
          <Tag color="purple" style={{ borderRadius: 4, fontWeight: 600 }}>
            {groups.length} Nhóm khách
          </Tag>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchGroups} loading={loading} style={{ borderRadius: 6 }}>
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
              Thêm nhóm khách
            </Button>
          </Space>
        }
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message="Lỗi tải danh sách nhóm khách hàng"
          description={error}
          action={
            <Button size="small" danger icon={<ReloadOutlined />} onClick={() => fetchGroups()}>
              Thử lại
            </Button>
          }
          style={{ borderRadius: 8 }}
        />
      )}

      <div className="erp-card" style={{ background: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}>
        <Table
          dataSource={groups}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="middle"
          scroll={{ x: 750 }}
        />
      </div>

      <Modal
        title={editingGroup ? 'Chỉnh sửa nhóm khách hàng' : 'Thêm mới nhóm khách hàng'}
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
            label={<span style={{ fontWeight: 600 }}>Mã nhóm khách hàng</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mã nhóm' }]}
          >
            <Input autoFocus placeholder="Ví dụ: GRP_VIP" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item
            name="name"
            label={<span style={{ fontWeight: 600 }}>Tên nhóm khách hàng</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tên nhóm' }]}
          >
            <Input placeholder="Ví dụ: Khách hàng thân thiết VIP" style={{ borderRadius: 6 }} />
          </Form.Item>

          <Form.Item
            name="discountPercent"
            label={<span style={{ fontWeight: 600 }}>Phần trăm chiết khấu (%)</span>}
            rules={[{ required: true, message: 'Vui lòng nhập % chiết khấu' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%', borderRadius: 6 }} addonAfter="%" />
          </Form.Item>

          <Form.Item name="description" label={<span style={{ fontWeight: 600 }}>Mô tả</span>}>
            <Input.TextArea rows={3} placeholder="Điều kiện hưởng nhóm, chính sách chăm sóc..." style={{ borderRadius: 6 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
