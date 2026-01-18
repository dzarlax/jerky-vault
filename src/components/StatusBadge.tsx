import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'info',
}) => {
  const getDotVariant = () => {
    switch (variant) {
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
    <div className="status-badge">
      <div className={`status-dot ${getDotVariant()}`}></div>
      <span>{status}</span>
    </div>
  );
};

export default StatusBadge;
