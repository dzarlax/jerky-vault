import React from 'react';
import { Table } from 'react-bootstrap';
import styles from './Skeleton.module.css';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 6
}) => {
  return (
    <Table striped hover className="mb-0">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index} className={`${styles.skeletonHeader}`}></th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <td key={colIndex}>
                <div className={`${styles.skeletonCell}`}></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TableSkeleton;
