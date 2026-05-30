import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'brand' | 'success' | 'warning' | 'error' | 'info';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'info',
}) => {
  const getBadgeVariant = () => {
    switch (variant) {
      case 'brand':
        return 'status-badge-brand';
      case 'success':
        return 'status-badge-success';
      case 'warning':
        return 'status-badge-warning';
      case 'error':
        return 'status-badge-error';
      default:
        return 'status-badge-info';
    }
  };

  const getDotVariant = () => {
    switch (variant) {
      case 'brand':
        return 'status-dot-brand';
      case 'success':
        return 'status-dot-success';
      case 'warning':
        return 'status-dot-warning';
      case 'error':
        return 'status-dot-error';
      default:
        return 'status-dot-info';
    }
  };

  return (
    <div className={`status-badge ${getBadgeVariant()}`}>
      <div className={`status-dot ${getDotVariant()}`}></div>
      <span>{status}</span>
    </div>
  );
};

export default StatusBadge;
