import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import useTranslation from 'next-translate/useTranslation';
import { FaEdit, FaDollarSign, FaTag, FaBoxOpen, FaListUl, FaChartLine } from 'react-icons/fa';

interface Recipe {
  id: number;
  name: string;
}

interface Package {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  cost: number;
  image: string;
  package_id: number;
  options: {
    recipe_id: number;
    recipe?: Recipe;
  }[];
}

interface ProductCardProps {
  product: Product;
  recipes: Recipe[];
  packages: Package[];
  onEdit: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  recipes, 
  packages, 
  onEdit 
}) => {
  const { t } = useTranslation('common');
  
  // Получаем имя пакета
  const packageName = packages?.find(pkg => pkg.id === product.package_id)?.name || t('unknownPackage');
  
  // Получаем имена рецептов
  const recipeNames = product.options
    .map(option => {
      const recipe = recipes?.find(r => r.id === option.recipe_id);
      return recipe ? recipe.name : t('unknownRecipe');
    })
    .join(', ');

  // Вычисляем прибыль
  const profit = product.price - product.cost;
  const profitMargin = product.price > 0 ? ((profit / product.price) * 100).toFixed(1) : '0';

  return (
    <Card className="h-100 product-card-enhanced border-0 shadow-sm">
      <div className="product-card-content d-flex h-100">
        <div className="product-image-section">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="product-image-enhanced"
              loading="lazy"
            />
          ) : (
            <div className="product-image-placeholder-enhanced d-flex align-items-center justify-content-center">
              <FaBoxOpen size={28} className="text-muted" />
            </div>
          )}
        </div>
        
        <div className="product-details-section flex-grow-1 p-3">
          <div className="product-header d-flex justify-content-between align-items-start mb-2">
            <h6 className="product-title-enhanced mb-0">{product.name}</h6>
            <Button
              variant="outline-secondary"
              size="sm"
              className="edit-btn-enhanced"
              onClick={() => onEdit(product)}
              title={t("edit")}
              aria-label={t("edit") + " " + product.name}
            >
              <FaEdit size={14} />
            </Button>
          </div>
          
          <p className="product-description-enhanced text-muted mb-3">{product.description}</p>
          
          <div className="product-metrics mb-3">
            <div className="metrics-row d-flex flex-wrap gap-2 mb-2">
              <div className="metric-item price">
                <FaDollarSign size={12} className="metric-icon" />
                <span className="metric-label">{t('price')}:</span>
                <span className="metric-value price-value">₽{product.price}</span>
              </div>
              <div className="metric-item cost">
                <FaTag size={12} className="metric-icon" />
                <span className="metric-label">{t('cost')}:</span>
                <span className="metric-value cost-value">₽{product.cost}</span>
              </div>
            </div>
            
            <div className="profit-info d-flex align-items-center justify-content-between">
              <div className="profit-metric d-flex align-items-center">
                <FaChartLine size={12} className="text-success me-1" />
                <span className="small text-muted me-1">{t('profit')}:</span>
                <span className={`fw-semibold ${profit >= 0 ? 'text-success' : 'text-danger'}`}>
                  ₽{profit.toFixed(2)}
                </span>
              </div>
              <Badge bg={profit >= 0 ? 'success' : 'danger'} className="profit-badge">
                {profitMargin}%
              </Badge>
            </div>
          </div>
          
          <div className="product-meta">
            <div className="meta-item mb-2">
              <FaBoxOpen size={12} className="meta-icon" />
              <span className="meta-label">{t('package')}:</span>
              <span className="meta-value">{packageName}</span>
            </div>
            
            <div className="meta-item">
              <FaListUl size={12} className="meta-icon" />
              <span className="meta-label">{t('recipes')}:</span>
              <div className="recipes-list">
                {product.options.length > 0 ? (
                  <div className="d-flex flex-wrap gap-1">
                    {product.options.map((option, index) => {
                      const recipe = recipes?.find(r => r.id === option.recipe_id);
                      return recipe ? (
                        <Badge key={index} bg="secondary" className="recipe-badge">
                          {recipe.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <span className="text-muted small">{t('noRecipes')}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
