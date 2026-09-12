import React from 'react';

export type StatusModule = 'SALES' | 'PURCHASE' | 'WAREHOUSE' | 'DEBT' | 'GENERAL';

interface StatusBadgeProps {
  status: string;
  module?: StatusModule;
  text?: string;
}

interface StatusConfig {
  bg: string;
  color: string;
  border: string;
  dot: string;
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, module = 'GENERAL', text }) => {
  const configs: Record<string, StatusConfig> = {
    // Draft states
    DRAFT: {
      bg: '#F1F5F9',
      color: '#475569',
      border: '#CBD5E1',
      dot: '#94A3B8',
      label: module === 'WAREHOUSE' ? 'Chờ nhập/xuất kho (Nháp)' : 'Bản nháp',
    },
    // Approval states
    PENDING_APPROVAL: {
      bg: '#FFFBEB',
      color: '#D97706',
      border: '#FDE68A',
      dot: '#F59E0B',
      label: 'Chờ phê duyệt',
    },
    APPROVED: {
      bg: '#ECFDF5',
      color: '#059669',
      border: '#A7F3D0',
      dot: '#10B981',
      label: module === 'SALES' ? 'Đã duyệt (Giữ kho)' : 'Đã duyệt',
    },
    // Operational states
    DELIVERING: {
      bg: '#EFF6FF',
      color: '#0284C7',
      border: '#BAE6FD',
      dot: '#38BDF8',
      label: 'Đang giao hàng',
    },
    COMPLETED: {
      bg: '#D1FAE5',
      color: '#047857',
      border: '#6EE7B7',
      dot: '#059669',
      label: 'Hoàn tất',
    },
    CANCELLED: {
      bg: '#FEF2F2',
      color: '#DC2626',
      border: '#FECACA',
      dot: '#EF4444',
      label: 'Đã hủy',
    },
    RECEIVED: {
      bg: '#ECFDF5',
      color: '#059669',
      border: '#A7F3D0',
      dot: '#10B981',
      label: 'Đã nhập hàng',
    },
    CLOSED: {
      bg: '#F8FAFC',
      color: '#0F766E',
      border: '#CCFBF1',
      dot: '#14B8A6',
      label: 'Đã đóng đơn',
    },
    REJECTED: {
      bg: '#FEF2F2',
      color: '#DC2626',
      border: '#FECACA',
      dot: '#EF4444',
      label: 'Bị từ chối',
    },
    CONFIRMED: {
      bg: '#ECFDF5',
      color: '#059669',
      border: '#A7F3D0',
      dot: '#10B981',
      label: module === 'WAREHOUSE' ? 'Đã xác nhận kho' : 'Đã xác nhận',
    },
    // Financial/Debt states
    UNPAID: {
      bg: '#FEF2F2',
      color: '#DC2626',
      border: '#FECACA',
      dot: '#EF4444',
      label: 'Chưa thanh toán',
    },
    PARTIAL: {
      bg: '#FFFBEB',
      color: '#D97706',
      border: '#FDE68A',
      dot: '#F59E0B',
      label: 'Thanh toán 1 phần',
    },
    PAID: {
      bg: '#ECFDF5',
      color: '#059669',
      border: '#A7F3D0',
      dot: '#10B981',
      label: 'Đã tất toán',
    },
    // Active states
    ACTIVE: {
      bg: '#ECFDF5',
      color: '#059669',
      border: '#A7F3D0',
      dot: '#10B981',
      label: 'Đang hoạt động',
    },
    true: {
      bg: '#ECFDF5',
      color: '#059669',
      border: '#A7F3D0',
      dot: '#10B981',
      label: 'Đang hoạt động',
    },
    INACTIVE: {
      bg: '#F1F5F9',
      color: '#64748B',
      border: '#CBD5E1',
      dot: '#94A3B8',
      label: 'Ngừng hoạt động',
    },
    false: {
      bg: '#F1F5F9',
      color: '#64748B',
      border: '#CBD5E1',
      dot: '#94A3B8',
      label: 'Ngừng hoạt động',
    },
  };

  const defaultCfg: StatusConfig = {
    bg: '#F1F5F9',
    color: '#64748B',
    border: '#E2E8F0',
    dot: '#94A3B8',
    label: text || status,
  };

  const cfg = configs[status] || defaultCfg;
  const displayLabel = text || cfg.label;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: cfg.dot,
          flexShrink: 0,
        }}
      />
      {displayLabel}
    </span>
  );
};
