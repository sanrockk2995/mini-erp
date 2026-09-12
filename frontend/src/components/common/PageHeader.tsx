import React from 'react';
import { Breadcrumb, Space, Typography } from 'antd';

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { title: string; href?: string }[];
  extra?: React.ReactNode;
  tag?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  extra,
  tag,
}) => {
  return (
    <div style={{ marginBottom: 20 }}>
      {breadcrumbs && (
        <Breadcrumb
          style={{ marginBottom: 10, fontSize: 12.5 }}
          items={breadcrumbs.map((b) => ({ title: b.title, href: b.href }))}
        />
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Title
              level={4}
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                color: 'var(--color-ink)',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                fontSize: 20,
              }}
            >
              {title}
            </Title>
            {tag}
          </div>
          {subtitle && (
            <Text style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginTop: 4, display: 'block' }}>
              {subtitle}
            </Text>
          )}
        </div>
        {extra && <Space size={10}>{extra}</Space>}
      </div>
    </div>
  );
};

export const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

export const formatNumber = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return '0';
  return new Intl.NumberFormat('vi-VN').format(val);
};
