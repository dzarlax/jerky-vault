import React from 'react';
import { Button } from 'react-bootstrap';
import {
  FaBoxOpen,
  FaUsers,
  FaUtensils,
  FaShoppingCart,
  FaClipboardList,
  FaTags,
  FaDollarSign,
  FaExclamationTriangle
} from 'react-icons/fa';

interface EmptyStateProps {
  type: 'products' | 'clients' | 'orders' | 'recipes' | 'ingredients' | 'prices' | 'packages' | 'general';
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  message,
  actionLabel,
  onAction,
  icon
}) => {
  const getDefaultIcon = () => {
    switch (type) {
      case 'products':
        return <FaBoxOpen size={64} />;
      case 'clients':
        return <FaUsers size={64} />;
      case 'orders':
        return <FaShoppingCart size={64} />;
      case 'recipes':
        return <FaUtensils size={64} />;
      case 'ingredients':
        return <FaClipboardList size={64} />;
      case 'prices':
        return <FaDollarSign size={64} />;
      case 'packages':
        return <FaTags size={64} />;
      default:
        return <FaExclamationTriangle size={64} />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'products':
        return 'No products found';
      case 'clients':
        return 'No clients found';
      case 'orders':
        return 'No orders found';
      case 'recipes':
        return 'No recipes found';
      case 'ingredients':
        return 'No ingredients found';
      case 'prices':
        return 'No prices found';
      case 'packages':
        return 'No packages found';
      default:
        return 'No data found';
    }
  };

  const displayIcon = icon || getDefaultIcon();
  const displayMessage = message || getDefaultMessage();

  return (
    <div className={`empty-state empty-state-${type}`} role="status">
      <div className="empty-state-content">
        <div className="empty-state-icon">
        {displayIcon}
        </div>
        <h5 className="empty-state-title">{displayMessage}</h5>
        {actionLabel && onAction && (
          <Button variant="primary" onClick={onAction} className="empty-state-action">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
