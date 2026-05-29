import React from 'react';
import useTranslation from 'next-translate/useTranslation';
import { FaEdit, FaBoxOpen } from 'react-icons/fa';
import { Product, ProductPackage, Recipe } from '../types/api';

interface ProductCardProps {
  product: Product;
  recipes: Recipe[];
  packages: ProductPackage[];
  onEdit: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  recipes,
  packages,
  onEdit
}) => {
  const { t } = useTranslation('common');

  const packageName = packages?.find(pkg => pkg.id === product.package_id)?.name || t('unknownPackage');

  const recipeNames = (product.options || [])
    .map(option => {
      const recipe = recipes?.find(r => r.id === option.recipe_id);
      return recipe ? recipe.name : t('unknownRecipe');
    })
    .join(', ');

  const profit = product.price - product.cost;
  const profitMargin = product.price > 0 ? ((profit / product.price) * 100).toFixed(1) : '0';

  return (
    <div className="product-card">
      {product.image || product.image_url ? (
        <img
          src={product.image || product.image_url}
          alt={product.name}
          className="product-card-image"
          loading="lazy"
        />
      ) : (
        <div className="product-card-image d-flex align-items-center justify-content-center">
          <FaBoxOpen size={32} className="text-tertiary" />
        </div>
      )}

      <div className="product-card-content">
        <h3 className="product-card-title">{product.name}</h3>
        <p className="product-card-description">{product.description}</p>

        <div className="product-card-metrics">
          <div className="product-metric">
            <span className="product-metric-label">{t('price')}:</span>
            <span className="product-metric-value price">₽{product.price}</span>
          </div>

          <div className="product-metric">
            <span className="product-metric-label">{t('cost')}:</span>
            <span className="product-metric-value cost">₽{product.cost}</span>
          </div>

          <div className="product-metric">
            <span className="product-metric-label">{t('profit')}:</span>
            <span className={`product-metric-value ${profit >= 0 ? 'price' : 'cost'}`}>
              ₽{profit.toFixed(2)}
            </span>
          </div>

          <div className="product-metric">
            <span className="product-metric-label">{t('margin')}:</span>
            <span className={`product-metric-value ${profit >= 0 ? 'price' : 'cost'}`}>
              {profitMargin}%
            </span>
          </div>
        </div>

        <div className="product-card-footer">
          <div className="text-secondary small">
            {t('package')}: {packageName}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onEdit(product)}
            title={t("edit")}
          >
            <FaEdit size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductCard);
