import React from 'react';
import { Sparkline } from './charts';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeType?: 'increase' | 'decrease';
  sparklineData?: number[];
  sparklineColor?: string;
  iconVariant?: 'primary' | 'success' | 'warning' | 'info';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  change,
  changeType = 'increase',
  sparklineData = [],
  sparklineColor = 'var(--success-500)',
  iconVariant = 'primary',
}) => {
  const getIconVariantClass = () => {
    switch (iconVariant) {
      case 'success':
        return 'stat-icon-success';
      case 'warning':
        return 'stat-icon-warning';
      case 'info':
        return 'stat-icon-info';
      default:
        return 'stat-icon-primary';
    }
  };

  return (
    <div className="stat-card">
      <div className="stat-card-heading">
        <div className={`stat-icon ${getIconVariantClass()}`}>{icon}</div>
        <div className="stat-label">{title}</div>
      </div>
      <div className="stat-content">
        <div className="stat-primary">
          <div className="stat-value">{value}</div>
          {change !== undefined && (
            <div className="stat-change">
              {changeType === 'increase' ? (
                <span style={{ color: 'var(--success-500)' }}>+{change}%</span>
              ) : (
                <span style={{ color: 'var(--error-500)' }}>{change}%</span>
              )}
              <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>
                vs last 7 days
              </span>
            </div>
          )}
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <div className="stat-sparkline">
            <Sparkline data={sparklineData} color={sparklineColor} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
