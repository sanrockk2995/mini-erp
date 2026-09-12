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
  Rate,
  message,
  Card,
  Divider,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  StarOutlined,
  ShopOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { PageHeader, formatCurrency } from '../../components/common/PageHeader';
import { supplierService } from '../../services/supplierService';
import { Supplier, SupplierReview } from '../../types';

const { Text } = Typography;

export const SupplierListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [selectedTier, setSelectedTier] = useState<string | undefined>(undefined);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewSupplier, setReviewSupplier] = useState<Supplier | null>(null);
  const [supplierReviews, setSupplierReviews] = useState<SupplierReview[]>([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [form] = Form.useForm();
  const [reviewForm] = Form.useForm();

  const fetchSuppliers = async (currentPage = page, size = pageSize) => {
    setLoading(true);
    setError(null);
    try {
      const data = await supplierService.searchSuppliers({
        keyword: keyword || undefined,
        tier: selectedTier,
        page: currentPage,
        size,
      });
      setSuppliers(data.content);
      setTotal(data.totalElements);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách nhà cung cấp. Vui lòng kiểm tra kết nối.');
      message.error('Không thể tải danh sách nhà cung cấp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers(0, pageSize);
  }, [selectedTier]);

  const handleSearch = () => {
    setPage(0);
    fetchSuppliers(0, pageSize);
  };

  const handleOpenModal = (sup?: Supplier) => {
    if (sup) {
      setEditingSupplier(sup);
      form.setFieldsValue({
        code: sup.code,
        name: sup.name,
        phone: sup.phone,
        email: sup.email,
        address: sup.address,
        taxCode: sup.taxCode,
        productGroups: sup.productGroups,
        isActive: sup.isActive,
      });
    } else {
      setEditingSupplier(null);
      form.resetFields();
      form.setFieldsValue({ isActive: true });
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingSupplier) {
        await supplierService.updateSupplier(editingSupplier.id, values);
        message.success('Cập nhật nhà cung cấp thành công');
      } else {
        await supplierService.createSupplier(values);
        message.success('Thêm mới nhà cung cấp thành công');
      }
      setModalVisible(false);
      fetchSuppliers();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu');
    }
  };

  const handleOpenReview = async (sup: Supplier) => {
    setReviewSupplier(sup);
    reviewForm.resetFields();
    reviewForm.setFieldsValue({ qualityScore: 8, deliveryScore: 8, priceScore: 8 });
    try {
      const revs = await supplierService.getReviews(sup.id);
      setSupplierReviews(revs);
    } catch (err) {
      setSupplierReviews([]);
    }
    setReviewModalVisible(true);
  };

  const handleSaveReview = async () => {
    if (!reviewSupplier) return;
    try {
      const values = await reviewForm.validateFields();
      setReviewSubmitting(true);
      await supplierService.addReview(reviewSupplier.id, values);
      message.success('Đã ghi nhận đánh giá và tự động cập nhật xếp hạng NCC!');
      setReviewModalVisible(false);
      fetchSuppliers();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi khi lưu đánh giá');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const renderTierTag = (tier: string) => {
    switch (tier) {
      case 'A':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '2px 10px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 700,
              backgroundColor: '#FEF3C7',
              color: '#B45309',
              border: '1px solid #FDE68A',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
            Hạng A (Xuất sắc)
          </span>
        );
      case 'B':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '2px 10px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: '#EFF6FF',
              color: '#0284C7',
              border: '1px solid #BAE6FD',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#38BDF8' }} />
            Hạng B (Đạt chuẩn)
          </span>
        );
      case 'C':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '2px 10px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: '#FFFBEB',
              color: '#D97706',
              border: '1px solid #FDE68A',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
            Hạng C (Cần cải thiện)
          </span>
        );
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: 11.5,
              backgroundColor: '#F1F5F9',
              color: '#64748B',
            }}
          >
            {tier || 'Chưa đánh giá'}
          </span>
        );
    }
  };

  const columns = [
    {
      title: 'Mã NCC',
      dataIndex: 'code',
      key: 'code',
      width: 140,
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
      title: 'Tên Nhà cung cấp',
      dataIndex: 'name',
      key: 'name',
      width: 260,
      render: (name: string, record: Supplier) => (
        <div style={{ minWidth: 200 }}>
          <Space align="center" style={{ flexWrap: 'nowrap' }}>
            <ShopOutlined style={{ color: '#059669', flexShrink: 0 }} />
            <Text strong style={{ color: '#0F172A', fontSize: 13.5, whiteSpace: 'nowrap' }}>{name}</Text>
          </Space>
          {record.taxCode && (
            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1, whiteSpace: 'nowrap' }}>
              MST: <span className="code-mono">{record.taxCode}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Nhóm mặt hàng cung cấp',
      dataIndex: 'productGroups',
      key: 'productGroups',
      width: 200,
      render: (groups: string) => (
        <Tag color="cyan" style={{ borderRadius: 4, fontWeight: 500, whiteSpace: 'nowrap' }}>
          {groups || 'Nhiều loại'}
        </Tag>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (phone: string) => (
        <span className="tabular-nums" style={{ color: '#475569', fontSize: 12.5 }}>
          {phone}
        </span>
      ),
    },
    {
      title: 'Điểm đánh giá',
      dataIndex: 'ratingScore',
      key: 'ratingScore',
      width: 140,
      align: 'center' as const,
      render: (score: number) => (
        <span
          className="tabular-nums"
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: score >= 8.5 ? '#D97706' : score >= 6.5 ? '#0284C7' : '#DC2626',
          }}
        >
          {score ? score.toFixed(1) : '0.0'} <span style={{ fontSize: 11, fontWeight: 500, color: '#94A3B8' }}>/ 10</span>
        </span>
      ),
    },
    {
      title: 'Phân hạng',
      dataIndex: 'ratingTier',
      key: 'ratingTier',
      width: 180,
      align: 'center' as const,
      render: (tier: string) => renderTierTag(tier),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 130,
      align: 'center' as const,
      render: (_: any, record: Supplier) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            style={{ color: '#0284C7' }}
            title="Chỉnh sửa thông tin NCC"
            onClick={() => handleOpenModal(record)}
          />
          <Button
            type="text"
            icon={<StarOutlined />}
            style={{ color: '#F59E0B' }}
            title="Đánh giá chất lượng NCC"
            onClick={() => handleOpenReview(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        title="Quản lý Nhà cung cấp (Suppliers)"
        subtitle="Hồ sơ đối tác cung ứng, năng lực giao hàng và chấm điểm phân loại A/B/C định kỳ"
        tag={
          <Tag color="purple" style={{ borderRadius: 4, fontWeight: 600 }}>
            {total} Nhà cung cấp
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
            Thêm nhà cung cấp mới
          </Button>
        }
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message="Lỗi tải danh sách nhà cung cấp"
          description={error}
          action={
            <Button size="small" danger icon={<ReloadOutlined />} onClick={() => fetchSuppliers()}>
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
          placeholder="Tìm theo tên, mã NCC, MST, SĐT..."
          prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 280, borderRadius: 6 }}
          allowClear
        />

        <Select
          placeholder="Lọc phân hạng"
          allowClear
          value={selectedTier}
          onChange={(val) => setSelectedTier(val)}
          style={{ width: 200 }}
          options={[
            { label: 'Hạng A (>= 8.5 điểm)', value: 'A' },
            { label: 'Hạng B (>= 6.5 điểm)', value: 'B' },
            { label: 'Hạng C (< 6.5 điểm)', value: 'C' },
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
            setSelectedTier(undefined);
            fetchSuppliers(0, pageSize);
          }}
          style={{ borderRadius: 6 }}
        >
          Đặt lại
        </Button>
      </div>

      <div className="erp-card" style={{ background: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}>
        <Table
          dataSource={suppliers}
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
              fetchSuppliers(p - 1, s);
            },
            showTotal: (totalCount) => `Tổng cộng ${totalCount} nhà cung cấp`,
          }}
        />
      </div>

      {/* Modal Add / Edit Supplier */}
      <Modal
        title={editingSupplier ? 'Chỉnh sửa hồ sơ NCC' : 'Thêm mới Nhà cung cấp'}
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
              label={<span style={{ fontWeight: 600 }}>Mã NCC</span>}
              rules={[{ required: true, message: 'Vui lòng nhập mã NCC' }]}
            >
              <Input autoFocus placeholder="Ví dụ: SUP-001" style={{ borderRadius: 6 }} />
            </Form.Item>

            <Form.Item
              name="name"
              label={<span style={{ fontWeight: 600 }}>Tên nhà cung cấp</span>}
              rules={[{ required: true, message: 'Vui lòng nhập tên NCC' }]}
            >
              <Input placeholder="Ví dụ: Công ty CP Thiết bị Việt Nam" style={{ borderRadius: 6 }} />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="phone"
              label={<span style={{ fontWeight: 600 }}>Số điện thoại</span>}
              rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}
            >
              <Input placeholder="0243888999" style={{ borderRadius: 6 }} />
            </Form.Item>

            <Form.Item name="email" label={<span style={{ fontWeight: 600 }}>Email</span>}>
              <Input placeholder="supplier@example.com" style={{ borderRadius: 6 }} />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item name="taxCode" label={<span style={{ fontWeight: 600 }}>Mã số thuế</span>}>
              <Input placeholder="0109998887" style={{ borderRadius: 6 }} />
            </Form.Item>

            <Form.Item name="productGroups" label={<span style={{ fontWeight: 600 }}>Nhóm sản phẩm cung ứng</span>}>
              <Input placeholder="Điện thoại, Linh kiện, Thiết bị..." style={{ borderRadius: 6 }} />
            </Form.Item>
          </div>

          <Form.Item name="address" label={<span style={{ fontWeight: 600 }}>Địa chỉ trụ sở/kho</span>}>
            <Input.TextArea rows={2} placeholder="Địa chỉ giao dịch, nhận hóa đơn..." style={{ borderRadius: 6 }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Review Supplier */}
      <Modal
        title={`Đánh giá & Chấm điểm Nhà cung cấp: ${reviewSupplier?.name}`}
        open={reviewModalVisible}
        onOk={handleSaveReview}
        onCancel={() => setReviewModalVisible(false)}
        confirmLoading={reviewSubmitting}
        width={680}
        destroyOnClose
        okText="Gửi đánh giá"
        cancelText="Đóng"
        okButtonProps={{ style: { backgroundColor: '#059669', borderColor: '#059669', borderRadius: 6 } }}
        cancelButtonProps={{ style: { borderRadius: 6 } }}
      >
        <Card variant="borderless" style={{ background: '#F8FAFC', marginBottom: 16, border: '1px solid #E2E8F0', borderRadius: 8 }}>
          <Text style={{ fontSize: 13, color: '#475569' }}>
            Chấm điểm thang 1 - 10 trên 3 tiêu chí: Chất lượng hàng hóa, Tiến độ giao hàng và Tính cạnh tranh của giá. Điểm trung bình sẽ tự động xếp hạng NCC:
            <Tag color="gold" style={{ marginLeft: 8, borderRadius: 4, fontWeight: 600 }}>Hạng A &gt;= 8.5</Tag>
            <Tag color="blue" style={{ borderRadius: 4, fontWeight: 600 }}>Hạng B &gt;= 6.5</Tag>
            <Tag color="warning" style={{ borderRadius: 4, fontWeight: 600 }}>Hạng C &lt; 6.5</Tag>
          </Text>
        </Card>

        <Form form={reviewForm} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <Form.Item
              name="qualityScore"
              label={<span style={{ fontWeight: 600 }}>Chất lượng (1-10)</span>}
              rules={[{ required: true, message: 'Nhập điểm CL' }]}
            >
              <Input type="number" min={1} max={10} style={{ width: '100%', borderRadius: 6 }} />
            </Form.Item>

            <Form.Item
              name="deliveryScore"
              label={<span style={{ fontWeight: 600 }}>Tiến độ giao hàng (1-10)</span>}
              rules={[{ required: true, message: 'Nhập điểm giao hàng' }]}
            >
              <Input type="number" min={1} max={10} style={{ width: '100%', borderRadius: 6 }} />
            </Form.Item>

            <Form.Item
              name="priceScore"
              label={<span style={{ fontWeight: 600 }}>Cạnh tranh giá (1-10)</span>}
              rules={[{ required: true, message: 'Nhập điểm giá' }]}
            >
              <Input type="number" min={1} max={10} style={{ width: '100%', borderRadius: 6 }} />
            </Form.Item>
          </div>

          <Form.Item name="comments" label={<span style={{ fontWeight: 600 }}>Nhận xét chi tiết</span>}>
            <Input.TextArea rows={3} placeholder="Ghi chú về lô hàng vừa qua, thái độ phục vụ..." style={{ borderRadius: 6 }} />
          </Form.Item>
        </Form>

        {supplierReviews.length > 0 && (
          <div>
            <Divider style={{ margin: '16px 0 12px' }} />
            <Text strong style={{ color: '#0F172A' }}>Lịch sử đánh giá gần đây ({supplierReviews.length}):</Text>
            <div style={{ maxHeight: 180, overflowY: 'auto', marginTop: 8 }}>
              {supplierReviews.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid #F1F5F9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                  }}
                >
                  <div>
                    <span>CL: <b className="tabular-nums">{r.qualityScore}</b> | Giao: <b className="tabular-nums">{r.deliveryScore}</b> | Giá: <b className="tabular-nums">{r.priceScore}</b></span>
                    {r.comments && <div style={{ color: '#64748B', fontStyle: 'italic' }}>{r.comments}</div>}
                  </div>
                  <div>
                    <Tag color="cyan" style={{ borderRadius: 4, fontWeight: 600 }}>
                      TB: <span className="tabular-nums">{r.averageScore.toFixed(1)}</span>
                    </Tag>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
