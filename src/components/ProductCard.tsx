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
    <Card className="h-100 product-card border-0 shadow-sm">
      <div className="product-image-container">
        {product.image ? (
          <Card.Img 
            variant="top" 
            src={product.image} 
            alt={product.name} 
            className="product-image"
          />
        ) : (
          <div className="product-image-placeholder d-flex align-items-center justify-content-center">
            <FaBoxOpen size={40} className="text-muted" />
          </div>
        )}
        <div className="product-actions">
          <Button
            variant="light"
            className="btn-icon shadow-sm"
            onClick={() => onEdit(product)}
            title={t("edit")}
            aria-label={t("edit") + " " + product.name}
          >
            <FaEdit />
          </Button>
        </div>
      </div>
      <Card.Body>
        <Card.Title className="product-title">{product.name}</Card.Title>
        <div className="product-description text-muted mb-3">{product.description}</div>
        <div className="product-details">
          <div className="detail-item">
            <FaDollarSign className="detail-icon" />
            <div>
              <small className="text-muted">{t("price")}</small>
              <div className="fw-bold">{product.price}</div>
            </div>
          </div>
          <div className="detail-item">
            <FaTag className="detail-icon" />
            <div>
              <small className="text-muted">{t("cost")}</small>
              <div className="fw-bold">{product.cost}</div>
            </div>
          </div>
          <div className="detail-item">
            <FaBoxOpen className="detail-icon" />
            <div>
              <small className="text-muted">{t("package")}</small>
              <div>{packageName}</div>
            </div>
          </div>
          <div className="detail-item">
            <FaListUl className="detail-icon" />
            <div>
              <small className="text-muted">{t("recipes")}</small>
              <div>{recipeNames}</div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
