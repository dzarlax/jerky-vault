import React from 'react';
import styles from './Skeleton.module.css';

const ClientCardSkeleton: React.FC = () => {
  return (
    <div className="client-card">
      <div className="client-card-header">
        <div className={`${styles.skeletonTitle} mb-0`}></div>
        <div className={`${styles.skeletonBadge}`}></div>
      </div>
      <div className="client-card-body">
        <div className="client-contact-info">
          <div className={`${styles.skeletonText} mb-2`}></div>
          <div className={`${styles.skeletonText} mb-2`}></div>
          <div className={`${styles.skeletonText} mb-2`}></div>
        </div>
        <div className="client-source">
          <div className={`${styles.skeletonText} mb-2`}></div>
        </div>
      </div>
    </div>
  );
};

export default ClientCardSkeleton;
