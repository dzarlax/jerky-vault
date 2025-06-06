import React from 'react';
import { Card } from 'react-bootstrap';

interface ProductSkeletonProps {
  count?: number;
}

const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 1 }) => {
  const renderSkeleton = () => (
    <Card className="h-100 product-card-enhanced border-0 shadow-sm">
      <div className="product-card-content d-flex h-100">
        <div className="product-image-section">
          <div className="skeleton-image" style={{ width: '100%', height: '100%', minHeight: '120px' }}></div>
        </div>
        
        <div className="product-details-section flex-grow-1 p-3">
          <div className="product-header d-flex justify-content-between align-items-start mb-2">
            <div className="skeleton-title" style={{ width: '70%', height: '20px' }}></div>
            <div className="skeleton-badge" style={{ width: '24px', height: '24px', borderRadius: '4px' }}></div>
          </div>
          
          <div className="skeleton-text mb-3" style={{ width: '100%', height: '16px' }}></div>
          <div className="skeleton-text mb-3" style={{ width: '80%', height: '16px' }}></div>
          
          <div className="product-metrics mb-3">
            <div className="d-flex gap-2 mb-2">
              <div className="skeleton-badge" style={{ width: '80px', height: '24px', borderRadius: '12px' }}></div>
              <div className="skeleton-badge" style={{ width: '70px', height: '24px', borderRadius: '12px' }}></div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <div className="skeleton-text" style={{ width: '90px', height: '16px' }}></div>
              <div className="skeleton-badge" style={{ width: '50px', height: '20px', borderRadius: '10px' }}></div>
            </div>
          </div>
          
          <div className="product-meta">
            <div className="mb-2">
              <div className="skeleton-text" style={{ width: '60%', height: '14px' }}></div>
            </div>
            <div className="d-flex gap-1">
              <div className="skeleton-badge" style={{ width: '60px', height: '18px', borderRadius: '9px' }}></div>
              <div className="skeleton-badge" style={{ width: '70px', height: '18px', borderRadius: '9px' }}></div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <>
      {Array(count).fill(0).map((_, index) => (
        <div key={index} className="product-grid-item">
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default ProductSkeleton;
