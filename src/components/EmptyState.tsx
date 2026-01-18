import React from 'react';
import { Alert, Button } from 'react-bootstrap';
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
        return <FaBoxOpen size={64} className="text-muted mb-3" />;
      case 'clients':
        return <FaUsers size={64} className="text-muted mb-3" />;
      case 'orders':
        return <FaShoppingCart size={64} className="text-muted mb-3" />;
      case 'recipes':
        return <FaUtensils size={64} className="text-muted mb-3" />;
      case 'ingredients':
        return <FaClipboardList size={64} className="text-muted mb-3" />;
      case 'prices':
        return <FaDollarSign size={64} className="text-muted mb-3" />;
      case 'packages':
        return <FaTags size={64} className="text-muted mb-3" />;
      default:
        return <FaExclamationTriangle size={64} className="text-muted mb-3" />;
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
    <Alert variant="light" className="text-center py-5">
      <div className="d-flex flex-column align-items-center">
        {displayIcon}
        <h5 className="text-muted mb-3">{displayMessage}</h5>
        {actionLabel && onAction && (
          <Button variant="primary" onClick={onAction} className="mt-2">
            {actionLabel}
          </Button>
        )}
      </div>
    </Alert>
  );
};

export default EmptyState;
