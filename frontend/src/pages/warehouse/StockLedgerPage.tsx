import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Select,
  Tag,
  Typography,
  message,
  Alert,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageHeader, formatCurrency, formatNumber } from '../../components/common/PageHeader';
import { warehouseService } from '../../services/warehouseService';
import { productService } from '../../services/productService';
import { StockLedger, Warehouse, Product } from '../../types';

const { Text } = Typography;

export const StockLedgerPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<StockLedger[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<number | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);

  const fetchDropdowns = async () => {
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

  const fetchLedger = async (currentPage = page, size = pageSize) => {
    setLoading(true);
    setError(null);
    try {
      const data = await warehouseService.getStockLedger({
        warehouseId: selectedWarehouse,
        productId: selectedProduct,
        transactionType: selectedType,
        page: currentPage,
        size,
      });
      setLedgerEntries(data.content);
      setTotal(data.totalElements);
    } catch (err: any) {
      setError(err?.message || 'Không thể tải dữ liệu sổ cái biến động kho. Vui lòng kiểm tra kết nối.');
      message.error('Không thể tải dữ liệu sổ cái biến động kho');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchLedger(0, pageSize);
  }, [selectedWarehouse, selectedProduct, selectedType]);

  const handleSearch = () => {
    setPage(0);
    fetchLedger(0, pageSize);
  };

  const columns = [
    {
      title: 'Thời gian ghi sổ',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (d: string) => (
        <span className="tabular-nums" style={{ color: '#475569', fontSize: 12.5 }}>
          {dayjs(d).format('HH:mm DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: 'Kho hàng',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 140,
      render: (wh: string) => (
        <Tag color="cyan" style={{ borderRadius: 4, fontWeight: 500 }}>
          {wh}
        </Tag>
      ),
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 260,
      render: (_: any, record: StockLedger) => (
        <div style={{ minWidth: 200 }}>
          <Text strong style={{ color: '#0F172A', fontSize: 13, whiteSpace: 'nowrap' }}>{record.productName}</Text>
          <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1, whiteSpace: 'nowrap' }}>
            SKU: <span className="code-mono">{record.productSku}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Biến động',
      dataIndex: 'transactionType',
      key: 'transactionType',
      width: 120,
      align: 'center' as const,
      render: (type: 'IN' | 'OUT') =>
        type === 'IN' ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              borderRadius: 12,
              backgroundColor: '#ECFDF5',
              color: '#059669',
              border: '1px solid #A7F3D0',
              fontWeight: 700,
              fontSize: 11.5,
            }}
          >
            <ArrowDownOutlined /> NHẬP (IN)
          </span>
        ) : (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              borderRadius: 12,
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              border: '1px solid #FECACA',
              fontWeight: 700,
              fontSize: 11.5,
            }}
          >
            <ArrowUpOutlined /> XUẤT (OUT)
          </span>
        ),
    },
    {
      title: 'Nghiệp vụ / Mã phiếu',
      key: 'ref',
      width: 180,
      render: (_: any, record: StockLedger) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Tag color="purple" style={{ width: 'fit-content', borderRadius: 3, fontSize: 10.5, margin: 0 }}>
            {record.referenceType}
          </Tag>
          <span className="code-mono" style={{ color: '#0284C7', fontWeight: 600, fontSize: 12 }}>
            {record.referenceCode}
          </span>
        </div>
      ),
    },
    {
      title: 'Số lượng thay đổi',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right' as const,
      width: 140,
      render: (qty: number, record: StockLedger) => (
        <span
          className="tabular-nums"
          style={{
            fontWeight: 800,
            fontSize: 13.5,
            color: record.transactionType === 'IN' ? '#059669' : '#DC2626',
          }}
        >
          {record.transactionType === 'IN' ? '+' : '-'}{formatNumber(qty)}
        </span>
      ),
    },
    {
      title: 'Tồn sau biến động',
      dataIndex: 'balanceAfter',
      key: 'balanceAfter',
      align: 'right' as const,
      width: 150,
      render: (bal: number) => (
        <span className="tabular-nums" style={{ fontWeight: 700, color: '#0F172A', fontSize: 13.5 }}>
          {formatNumber(bal)}
        </span>
      ),
    },
    {
      title: 'Giá vốn đơn vị',
      dataIndex: 'unitCost',
      key: 'unitCost',
      align: 'right' as const,
      width: 140,
      render: (cost: number) => (
        <span className="tabular-nums" style={{ color: '#64748B', fontSize: 12.5 }}>
          {cost > 0 ? formatCurrency(cost) : '-'}
        </span>
      ),
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 120,
      render: (user: string) => (
        <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>
          {user || 'SYSTEM'}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PageHeader
        title="Sổ cái Biến động Kho (Double-Entry Ledger)"
        subtitle="Hệ thống sổ cái bất biến ghi nhận chi tiết mọi giao dịch Xuất, Nhập, Kiểm kê và đối soát số dư tức thời"
        tag={
          <Tag color="cyan" style={{ borderRadius: 4, fontWeight: 600 }}>
            {total} Giao dịch
          </Tag>
        }
      />

      {error && (
        <Alert
          type="error"
          showIcon
          message="Lỗi tải dữ liệu sổ cái kho"
          description={error}
          action={
            <Button size="small" danger icon={<ReloadOutlined />} onClick={() => fetchLedger()}>
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
        <Select
          placeholder="Lọc theo kho"
          allowClear
          value={selectedWarehouse}
          onChange={(val) => setSelectedWarehouse(val)}
          style={{ width: 220 }}
          options={warehouses.map((w) => ({ label: `${w.name} (${w.code})`, value: w.id }))}
        />

        <Select
          placeholder="Lọc theo sản phẩm"
          allowClear
          showSearch
          value={selectedProduct}
          onChange={(val) => setSelectedProduct(val)}
          style={{ width: 260 }}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={products.map((p) => ({ label: `[${p.sku}] ${p.name}`, value: p.id }))}
        />

        <Select
          placeholder="Chiều giao dịch"
          allowClear
          value={selectedType}
          onChange={(val) => setSelectedType(val)}
          style={{ width: 160 }}
          options={[
            { label: 'NHẬP KHO (IN)', value: 'IN' },
            { label: 'XUẤT KHO (OUT)', value: 'OUT' },
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
            setSelectedWarehouse(undefined);
            setSelectedProduct(undefined);
            setSelectedType(undefined);
            fetchLedger(0, pageSize);
          }}
          style={{ borderRadius: 6 }}
        >
          Đặt lại
        </Button>
      </div>

      <div className="erp-card" style={{ background: '#FFFFFF', borderRadius: 8, overflow: 'hidden' }}>
        <Table
          dataSource={ledgerEntries}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="middle"
          scroll={{ x: 1150 }}
          pagination={{
            current: page + 1,
            pageSize,
            total,
            showSizeChanger: true,
            onChange: (p, s) => {
              setPage(p - 1);
              setPageSize(s);
              fetchLedger(p - 1, s);
            },
            showTotal: (totalCount) => `Tổng cộng ${totalCount} lượt biến động kho`,
          }}
        />
      </div>
    </div>
  );
};
