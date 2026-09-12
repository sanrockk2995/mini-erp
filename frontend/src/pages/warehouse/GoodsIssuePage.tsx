import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Modal,
  Tag,
  Typography,
  message,
  Popconfirm,
  Alert,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { warehouseService } from '../../services/warehouseService';
import { GoodsIssueNote } from '../../types';

const { Text, Title } = Typography;

export const GoodsIssuePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<GoodsIssueNote[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<GoodsIssueNote | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchIssues = async (currentPage = page, size = pageSize) => {
    setLoading(true);
    setError(null);
    try {
      const data = await warehouseService.searchIssues({
        keyword: keyword || undefined,
        status: selectedStatus,
        page: currentPage,
        size,
      });
      setIssues(data.content);
      setTotal(data.totalElements);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải danh sách phiếu xuất kho. Vui lòng kiểm tra kết nối.');
      message.error('Không thể tải danh sách phiếu xuất kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues(0, pageSize);
  }, [selectedStatus]);

  const handleSearch = () => {
    setPage(0);
    fetchIssues(0, pageSize);
  };

  const handleViewDetail = async (id: number) => {
    try {
      const detail = await warehouseService.getIssueById(id);
      setSelectedIssue(detail);
      setDetailModalVisible(true);
    } catch (err) {
      message.error('Không thể tải chi tiết phiếu xuất kho');
    }
  };

  const handleConfirm = async (id: number) => {
    setConfirmLoading(true);
    try {
      await warehouseService.confirmIssue(id);
      message.success('Xác nhận xuất kho thành công! Đã trừ tồn kho thực tế, giải phóng giữ chỗ, ghi sổ cái và chuyển đơn hàng sang trạng thái Giao hàng (DELIVERING).');
      fetchIssues();
      if (selectedIssue && selectedIssue.id === id) {
        handleViewDetail(id);
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi xác nhận xuất kho');
    } finally {
      setConfirmLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã phiếu xuất (GIN)',
      dataIndex: 'ginCode',
      key: 'ginCode',
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
      title: 'Đơn bán hàng (SO)',
      dataIndex: 'soCode',
      key: 'soCode',
      width: 160,
      render: (code: string) =>
        code ? (
          <span
            className="code-mono"
            style={{
              backgroundColor: '#FAF5FF',
              border: '1px solid #E9D5FF',
              padding: '2px 8px',
              borderRadius: 4,
              fontSize: 12,
              color: '#7E22CE',
              fontWeight: 600,
            }}
          >
            {code}
          </span>
        ) : (
          <span style={{ color: '#94A3B8', fontSize: 12 }}>Xuất khác</span>
        ),
    },
    {
      title: 'Kho xuất hàng',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 140,
      render: (wh: string) => (
        <Tag color="purple" style={{ borderRadius: 4, fontWeight: 500 }}>
          {wh}
        </Tag>
      ),
    },
    {
      title: 'Ngày xuất kho',
      dataIndex: 'issueDate',
      key: 'issueDate',
      width: 130,
      render: (d: string) => (
        <span className="tabular-nums" style={{ color: '#475569', fontSize: 12.5 }}>
          {dayjs(d).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: 'Loại xuất',
      dataIndex: 'issueType',
      key: 'issueType',
      width: 130,
      render: (type: string) => (
        <Tag color={type === 'SALES_ORDER' ? 'geekblue' : 'default'} style={{ borderRadius: 4, fontWeight: 500 }}>
          {type === 'SALES_ORDER' ? 'Xuất bán hàng' : type}
        </Tag>
      ),
    },
    {
      title: 'Người lập / Duyệt',
      key: 'users',
      width: 200,
      render: (_: any, record: GoodsIssueNote) => (
        <div style={{ fontSize: 12, minWidth: 160 }}>
          <div style={{ whiteSpace: 'nowrap' }}>Lập: <span style={{ fontWeight: 600, color: '#334155' }}>{record.createdBy}</span></div>
          {record.confirmedBy && (
            <div style={{ color: '#059669', fontWeight: 600, whiteSpace: 'nowrap' }}>Duyệt: {record.confirmedBy}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 190,
      render: (status: string) => <StatusBadge status={status} module="WAREHOUSE" />,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'center' as const,
      render: (_: any, record: GoodsIssueNote) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            style={{ color: '#0284C7' }}
            title="Xem chi tiết phiếu xuất"
            onClick={() => handleViewDetail(record.id)}
          />
          {record.status === 'DRAFT' && (
            <Popconfirm
              title="Xác nhận xuất hàng thực tế"
              description="Hệ thống sẽ trừ tồn kho thực tế, giải phóng giữ chỗ và chuyển đơn bán hàng sang trạng thái Giao hàng (DELIVERING). Tiếp tục?"
              onConfirm={() => handleConfirm(record.id)}
              okText="Xác nhận"
              cancelText="Hủy"
              okButtonProps={{ style: { backgroundColor: '#059669', borderColor: '#059669', borderRadius: 6 } }}
              cancelButtonProps={{ style: { borderRadius: 6 } }}
            >
              <Button type="text" icon={<CheckCircleOutlined />} style={{ color: '#059669' }} title="Xác nhận xuất kho" />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        title="Quản lý Xuất kho (Goods Issue Notes - GIN)"
        subtitle="Quản lý việc bốc dỡ hàng xuất theo đơn đặt hàng bán, trừ tồn kho và đồng bộ trạng thái giao hàng"
        tag={
          <Tag color="cyan" style={{ borderRadius: 4, fontWeight: 600 }}>
            {total} Phiếu xuất
          </Tag>
        }
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message="Lỗi tải danh sách phiếu xuất kho"
          description={error}
          action={
            <Button size="small" danger icon={<ReloadOutlined />} onClick={() => fetchIssues()}>
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
          placeholder="Tìm theo mã GIN, mã SO..."
          prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 280, borderRadius: 6 }}
          allowClear
        />

        <Select
          placeholder="Lọc trạng thái"
          allowClear
          value={selectedStatus}
          onChange={(val) => setSelectedStatus(val)}
          style={{ width: 220 }}
          options={[
            { label: 'DRAFT (Chờ xuất kho)', value: 'DRAFT' },
            { label: 'CONFIRMED (Đã xuất hàng)', value: 'CONFIRMED' },
            { label: 'CANCELLED (Đã hủy)', value: 'CANCELLED' },
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
            setSelectedStatus(undefined);
            fetchIssues(0, pageSize);
          }}
          style={{ borderRadius: 6 }}
        >
          Đặt lại
        </Button>
      </div>

      <div className="erp-card" style={{ background: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}>
        <Table
          dataSource={issues}
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
              fetchIssues(p - 1, s);
            },
            showTotal: (totalCount) => `Tổng cộng ${totalCount} phiếu xuất kho`,
          }}
        />
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>Chi tiết Phiếu Xuất Kho:</span>
            <span className="code-mono" style={{ color: '#0369A1' }}>{selectedIssue?.ginCode}</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={780}
        footer={[
          selectedIssue?.status === 'DRAFT' && (
            <Popconfirm
              key="confirm"
              title="Xác nhận xuất kho thực tế"
              description="Tồn kho thực tế và giữ chỗ sẽ trừ ngay. Tiếp tục?"
              onConfirm={() => handleConfirm(selectedIssue.id)}
            >
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                style={{ backgroundColor: '#059669', borderColor: '#059669', borderRadius: 6 }}
                loading={confirmLoading}
              >
                Xác nhận xuất kho
              </Button>
            </Popconfirm>
          ),
          <Button key="close" onClick={() => setDetailModalVisible(false)} style={{ borderRadius: 6 }}>
            Đóng
          </Button>,
        ]}
      >
        {selectedIssue && (
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
                background: '#F8FAFC',
                padding: '16px 20px',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                marginBottom: 20,
                fontSize: 13,
              }}
            >
              <div>
                <Text type="secondary" style={{ fontSize: 11.5 }}>Kho xuất</Text>
                <div><Text strong style={{ fontSize: 14 }}>{selectedIssue.warehouseName}</Text></div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11.5 }}>Đơn bán (SO)</Text>
                <div>
                  {selectedIssue.soCode ? (
                    <span className="code-mono" style={{ color: '#7E22CE', fontWeight: 600 }}>{selectedIssue.soCode}</span>
                  ) : (
                    <Text strong>Không gắn SO</Text>
                  )}
                </div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11.5 }}>Ngày xuất</Text>
                <div><span className="tabular-nums" style={{ fontWeight: 600 }}>{dayjs(selectedIssue.issueDate).format('DD/MM/YYYY')}</span></div>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11.5 }}>Trạng thái</Text>
                <div style={{ marginTop: 2 }}><StatusBadge status={selectedIssue.status} module="WAREHOUSE" /></div>
              </div>
            </div>

            <Title level={5} style={{ marginBottom: 12, fontWeight: 700 }}>Danh sách hàng hóa xuất kho</Title>
            <Table
              dataSource={selectedIssue.items || []}
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
                  title: 'Số lượng yêu cầu',
                  dataIndex: 'requestedQuantity',
                  key: 'requestedQuantity',
                  align: 'right' as const,
                  render: (qty: number) => (
                    <span className="tabular-nums">{qty}</span>
                  ),
                },
                {
                  title: 'Số lượng thực xuất',
                  dataIndex: 'issuedQuantity',
                  key: 'issuedQuantity',
                  align: 'right' as const,
                  render: (qty: number, record: any) => (
                    <span className="tabular-nums" style={{ color: '#059669', fontWeight: 700 }}>
                      {qty} {record.productUnit || ''}
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
