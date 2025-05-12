import React from 'react';
import { Card } from 'react-bootstrap';

interface ProductSkeletonProps {
  count?: number;
}

const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 1 }) => {
  const renderSkeleton = () => (
    <Card className="h-100 product-card border-0 shadow-sm">
      <div className="skeleton-image"></div>
      <Card.Body>
        <div className="skeleton-title mb-3"></div>
        <div className="skeleton-text mb-2"></div>
        <div className="skeleton-text mb-4"></div>
        <div className="d-flex flex-column gap-3">
          <div className="d-flex align-items-center gap-2">
            <div className="skeleton-badge" style={{ width: '30px', height: '30px', borderRadius: '50%' }}></div>
            <div className="w-100">
              <div className="skeleton-text" style={{ height: '12px', width: '40%' }}></div>
              <div className="skeleton-text mt-1" style={{ height: '16px', width: '60%' }}></div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="skeleton-badge" style={{ width: '30px', height: '30px', borderRadius: '50%' }}></div>
            <div className="w-100">
              <div className="skeleton-text" style={{ height: '12px', width: '40%' }}></div>
              <div className="skeleton-text mt-1" style={{ height: '16px', width: '60%' }}></div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="skeleton-badge" style={{ width: '30px', height: '30px', borderRadius: '50%' }}></div>
            <div className="w-100">
              <div className="skeleton-text" style={{ height: '12px', width: '40%' }}></div>
              <div className="skeleton-text mt-1" style={{ height: '16px', width: '60%' }}></div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <>
      {Array(count).fill(0).map((_, index) => (
        <div key={index} className="col-sm-6 col-md-4 col-lg-3 mb-4">
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default ProductSkeleton;
