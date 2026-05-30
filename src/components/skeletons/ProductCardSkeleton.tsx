import React from 'react';
import styles from './Skeleton.module.css';

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className={`product-card product-card-skeleton ${styles.skeletonCard}`}>
      <div className="product-card-content">
        <div className="product-card-header">
          <div className="product-card-heading">
            <div className={`${styles.skeletonTitle} mb-2`}></div>
            <div className={`${styles.skeletonBadge} product-skeleton-package`}></div>
          </div>
          <div className={`${styles.skeletonBadge} product-skeleton-action`}></div>
        </div>
        <div className={`${styles.skeletonText} mb-2`}></div>
        <div className={`${styles.skeletonText} product-skeleton-description mb-3`}></div>
        <div className={`${styles.skeletonBadge} product-skeleton-recipes mb-3`}></div>
        <div className="product-card-metrics">
          <div className={styles.skeletonMetric}></div>
          <div className={styles.skeletonMetric}></div>
          <div className={styles.skeletonMetric}></div>
          <div className={styles.skeletonMetric}></div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
