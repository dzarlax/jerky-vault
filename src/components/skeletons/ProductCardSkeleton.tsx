import React from 'react';
import { Card } from 'react-bootstrap';
import styles from './Skeleton.module.css';

const ProductCardSkeleton: React.FC = () => {
  return (
    <Card className={`h-100 ${styles.skeletonCard}`}>
      <div className={`${styles.skeletonImage} position-relative`}>
        <div className={styles.shimmer}></div>
      </div>
      <div className="p-3">
        <div className={`${styles.skeletonTitle} mb-2`}></div>
        <div className={`${styles.skeletonText} mb-3`}></div>
        <div className="d-flex gap-2 mb-2">
          <div className={`${styles.skeletonBadge} flex-grow-1`}></div>
          <div className={`${styles.skeletonBadge} flex-grow-1`}></div>
        </div>
        <div className="metrics-row d-flex flex-wrap gap-2">
          <div className={`${styles.skeletonMetric} mb-2`}></div>
          <div className={`${styles.skeletonMetric} mb-2`}></div>
          <div className={`${styles.skeletonMetric} mb-2`}></div>
        </div>
      </div>
    </Card>
  );
};

export default ProductCardSkeleton;
