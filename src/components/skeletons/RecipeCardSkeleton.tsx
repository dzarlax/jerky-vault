import React from 'react';
import styles from './Skeleton.module.css';

const RecipeCardSkeleton: React.FC = () => {
  return (
    <div className="recipe-card">
      <div className="recipe-card-header">
        <div className={`${styles.skeletonTitle} mb-0`}></div>
        <div className={`${styles.skeletonBadge}`}></div>
      </div>
      <div className="recipe-card-body">
        <div className="recipe-ingredients-list">
          <div className={`${styles.skeletonText} mb-2`}></div>
          <div className={`${styles.skeletonText} mb-2`}></div>
          <div className={`${styles.skeletonText} mb-2`}></div>
        </div>
      </div>
      <div className="recipe-card-footer">
        <div className={`${styles.skeletonBadge} me-2`}></div>
        <div className={`${styles.skeletonBadge}`}></div>
      </div>
    </div>
  );
};

export default RecipeCardSkeleton;
