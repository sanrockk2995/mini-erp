import React from 'react';
import { Card, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  accentColor?: string;
  suffix?: string;
  prefix?: string;
  badgeText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendType = 'up',
  accentColor = '#059669',
  suffix,
  prefix,
  badgeText,
}) => {
  return (
    <Card
      variant="borderless"
      className="erp-card"
      style={{
        borderRadius: 10,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: '#FFFFFF',
      }}
      styles={{ body: { padding: '20px 22px' } }}
    >
      {/* Top Accent Strip */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: accentColor,
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Text
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {title}
            </Text>
            {badgeText && (
              <span
                style={{
                  fontSize: 10.5,
                  padding: '1px 6px',
                  borderRadius: 4,
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  fontWeight: 600,
                }}
              >
                {badgeText}
              </span>
            )}
          </div>

          <div style={{ marginTop: 2, marginBottom: 8 }}>
            <span
              className="tabular-nums"
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: -0.5,
                lineHeight: 1.2,
              }}
            >
              {prefix}
              {value}
              {suffix && (
                <span style={{ fontSize: 14, fontWeight: 500, color: '#64748B', marginLeft: 4 }}>
                  {suffix}
                </span>
              )}
            </span>
          </div>

          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 4,
                  backgroundColor:
                    trendType === 'up'
                      ? '#ECFDF5'
                      : trendType === 'down'
                      ? '#FEF2F2'
                      : '#F1F5F9',
                  color:
                    trendType === 'up'
                      ? '#059669'
                      : trendType === 'down'
                      ? '#DC2626'
                      : '#64748B',
                }}
              >
                {trendType === 'up' && <ArrowUpOutlined style={{ fontSize: 10 }} />}
                {trendType === 'down' && <ArrowDownOutlined style={{ fontSize: 10 }} />}
                {trend}
              </span>
            </div>
          )}
        </div>

        {icon && (
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 10,
              backgroundColor: `${accentColor}12`,
              border: `1px solid ${accentColor}25`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: accentColor,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
