import React from 'react';
import { getIngredientTypeBadgeClass, getIngredientTypeMeta } from '../utils/ingredientTypes';

type IngredientTypeBadgeProps = {
  type?: string;
  label: string;
};

const IngredientTypeBadge: React.FC<IngredientTypeBadgeProps> = ({ type, label }) => {
  const meta = getIngredientTypeMeta(type);
  const IconComponent = meta.icon;

  return (
    <span className={`ingredient-type-badge ${getIngredientTypeBadgeClass(type)}`}>
      <IconComponent className="me-1" />
      {label}
    </span>
  );
};

export default IngredientTypeBadge;
