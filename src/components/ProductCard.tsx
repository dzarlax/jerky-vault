import React from 'react';
import { Card, Button } from 'react-bootstrap';
import useTranslation from 'next-translate/useTranslation';
import { FaEdit, FaDollarSign, FaTag, FaBoxOpen, FaListUl } from 'react-icons/fa';

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

  return (
    <Card className="h-100 product-card border-0">
      <div className="d-flex h-100">
        <div className="product-image-container-compact">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              className="product-image-compact"
            />
          ) : (
            <div className="product-image-placeholder-compact d-flex align-items-center justify-content-center">
              <FaBoxOpen size={24} className="text-muted" />
            </div>
          )}
        </div>
        <div className="flex-grow-1 p-2">
          <div className="d-flex justify-content-between align-items-start">
            <h6 className="product-title-compact mb-1">{product.name}</h6>
            <Button
              variant="link"
              className="p-0 text-primary"
              onClick={() => onEdit(product)}
              title={t("edit")}
              aria-label={t("edit") + " " + product.name}
            >
              <FaEdit size={14} />
            </Button>
          </div>
          <p className="product-description-compact text-muted small mb-2">{product.description}</p>
          <div className="d-flex flex-wrap gap-2">
            <div className="product-detail-compact">
              <FaDollarSign size={12} className="me-1 text-primary" />
              <span className="small">{product.price}</span>
            </div>
            <div className="product-detail-compact">
              <FaTag size={12} className="me-1 text-primary" />
              <span className="small">{product.cost}</span>
            </div>
            <div className="product-detail-compact">
              <FaBoxOpen size={12} className="me-1 text-primary" />
              <span className="small">{packageName}</span>
            </div>
          </div>
          <div className="mt-1">
            <FaListUl size={12} className="me-1 text-primary" />
            <span className="small">{recipeNames}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
