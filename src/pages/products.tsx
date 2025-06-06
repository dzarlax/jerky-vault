import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import fetcher from '../utils/fetcher';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useAuth, withAuth } from '../utils/authContext';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Select, { SingleValue } from 'react-select';
import ProductModal from '../components/modal/Products/ProductModal';
import { FaPlus, FaFilter, FaTag, FaUtensils, FaBoxOpen, FaTimes } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import ErrorState from '../components/ErrorState';
import Breadcrumbs from '../components/Breadcrumbs';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  cost: number;
  image: string;
  user_id: number;
  user: User;
  package_id: number;
  options: Option[];
}

interface User {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  username: string;
  password: string;
  recipes: null;
  prices: null;
  clients: null;
  products: null;
  packages: null;
  orders: null;
}

interface Option {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  product_id: number;
  recipe_id: number;
  user_id: number;
  product: Partial<Product>;
  recipe: Recipe;
  user: User;
}

interface Recipe {
  id: number;
  name: string;
}

interface Package {
  id: number;
  name: string;
}

const Products = () => {
  const { t } = useTranslation('common');
  const { auth } = useAuth();
  const { data: products, mutate: mutateProducts, error: productsError } = useSWR<Product[]>('/api/products', fetcher);
  const { data: recipes, error: recipesError } = useSWR<Recipe[]>('/api/recipes', fetcher);
  const { data: packages, mutate: mutatePackages, error: packagesError } = useSWR<Package[]>('/api/packages', fetcher);
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [image, setImage] = useState('');
  const [recipeIds, setRecipeIds] = useState<number[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<{ value: number; label: string }[]>([]);
  const [packageId, setPackageId] = useState<number | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<SingleValue<{ value: number; label: string }> | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<SingleValue<{ value: number; label: string }> | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<SingleValue<{ value: number; label: string }> | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setFilteredProducts(products || []);
  }, [products]);

  useEffect(() => {
    applyFilters();
  }, [selectedRecipe, selectedPackage, selectedProduct]);


  const applyFilters = () => {
    let filtered = products || [];
    if (selectedRecipe) {
      filtered = filtered.filter(product =>
        product.options.some(option => option.recipe_id === selectedRecipe.value)
      );
    }

    if (selectedPackage) {
      filtered = filtered.filter(product =>
        product.package_id === selectedPackage.value
      );
    }

    if (selectedProduct) {
      filtered = filtered.filter(product => product.id === selectedProduct.value);
    }

    setFilteredProducts(filtered);
  };

  const handleEditProduct = (product: Product) => {
    if (!recipes || !packages) {
      console.warn('Recipes or packages data not loaded yet');
      return;
    }

    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setCost(product.cost.toString());
    setImage(product.image);

    const selected = product.options.map(option => {
      const recipe = recipes?.find(recipe => recipe.id === option.recipe_id);
      return recipe ? { value: recipe.id, label: recipe.name } : null;
    }).filter(option => option !== null) as { value: number; label: string }[];

    setSelectedRecipes(selected);
    setRecipeIds(selected.map(r => r.value));
    setPackageId(product.package_id);
    setShowProductModal(true);
  };

  const handleCloseProductModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setCost('');
    setImage('');
    setRecipeIds([]);
    setSelectedRecipes([]);
    setPackageId(null);
    setShowProductModal(false);
  };

  const handleSaveProductChanges = async () => {
    try {
      if (!auth.token) {
        router.push('/auth/signin');
        return;
      }
  
      // Improved validation with specific error messages
      const errors = [];
      
      if (!name) errors.push(t('productNameRequired'));
      if (!description) errors.push(t('productDescriptionRequired'));
      if (!price || parseFloat(price) <= 0) errors.push(t('validPriceRequired'));
      if (!cost || parseFloat(cost) <= 0) errors.push(t('validCostRequired'));
      if (!packageId) errors.push(t('packageRequired'));
      if (selectedRecipes.length === 0) errors.push(t('atLeastOneRecipeRequired'));
      
      if (errors.length > 0) {
        alert(errors.join('\n'));
        return;
      }
  
      const parsedPrice = parseFloat(price);
      const parsedCost = parseFloat(cost);
  
      // Only validate the image URL if it's not empty
      if (image.trim()) {
        try {
          new URL(image);
        } catch (_) {
          alert(t('invalidImageUrl'));
          return;
        }
      }
  
      // Формируем массив recipeIds на основе selectedRecipes
      const recipeIds = selectedRecipes.map(recipe => recipe.value);
  
      const product = {
        name,
        description,
        price: parsedPrice,
        cost: parsedCost,
        image: image || null,
        recipe_ids: recipeIds,
        package_id: packageId,
      };
  
      if (editingProduct) {
        await fetcher(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`,
          },
          body: JSON.stringify(product),
        });
        mutateProducts();
      } else {
        await fetcher('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`,
          },
          body: JSON.stringify(product),
        });
        mutateProducts();
      }
  
      handleCloseProductModal();
    } catch (error) {
      console.error('Failed to save product changes', error);
      alert(t('failedToSaveChanges'));
    }
  };
  

  const handleDeleteProduct = async () => {
    if (!editingProduct) return;

    try {
      if (!auth.token) {
        router.push('/auth/signin');
        return;
      }

      const confirmed = window.confirm(t('confirmDeleteProduct'));
      if (!confirmed) return;

      await fetcher(`/api/products/${editingProduct.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
      });

      mutateProducts();
      handleCloseProductModal();
    } catch (error) {
      console.error('Failed to delete product', error);
      alert(t('failedToDeleteProduct'));
    }
  };

  const recipeOptions = recipes?.map(recipe => ({ value: recipe.id, label: recipe.name })) || [];
  const packageOptions = packages?.map(pkg => ({ value: pkg.id, label: pkg.name })) || [];
  const productOptions = products?.map(product => ({ value: product.id, label: product.name })) || [];

  // Проверяем наличие ошибок
  const hasError = productsError || recipesError || packagesError;
  
  // Проверяем загрузку данных
  const isLoading = !products || !recipes || !packages;

  // Группируем продукты по рецептам
  const groupedProducts = filteredProducts.reduce<{ [key: string]: Product[] }>((acc, product) => {
    const recipeNames = product.options
      .map(option => {
        const recipe = recipes?.find(r => r.id === option.recipe_id);
        return recipe ? recipe.name : t('unknownRecipe');
      })
      .join(', ');

    if (!acc[recipeNames]) {
      acc[recipeNames] = [];
    }
    acc[recipeNames].push(product);
    return acc;
  }, {});

  // Если есть ошибка, показываем компонент ошибки
  if (hasError) {
    return (
      <ErrorState 
        message={t('failedToLoadProducts')} 
        onRetry={() => {
          mutateProducts();
        }} 
      />
    );
  }

  return (
    <div className="p-0">
      <div className="products-header d-flex flex-column flex-md-row justify-content-between align-items-md-center p-3 p-md-4 border-bottom bg-light">
        <div className="header-content">
          <h1 className="mb-2 text-primary">
            <FaTag className="me-2" />
            {t('products')}
          </h1>
          {!isLoading && (
            <div className="stats-summary d-flex flex-wrap gap-3 mb-2 mb-md-0">
              <span className="badge bg-primary">
                {t('totalProducts')}: {products?.length || 0}
              </span>
              {Object.keys(groupedProducts).length > 0 && (
                <span className="badge bg-success">
                  {t('recipes')}: {Object.keys(groupedProducts).length}
                </span>
              )}
              {filteredProducts.length !== products?.length && (
                <span className="badge bg-warning">
                  {t('filtered')}: {filteredProducts.length}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="action-buttons d-flex flex-wrap gap-2">
          <Button 
            variant="outline-primary" 
            className="filter-toggle-btn" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter className="me-2" /> 
            {t('filter')}
            {showFilters && <span className="ms-1">✕</span>}
          </Button>
          <Button 
            variant="primary" 
            className="add-product-btn"
            onClick={() => setShowProductModal(true)}
          >
            <FaPlus className="me-2" /> {t('addProduct')}
          </Button>
        </div>
      </div>
      <div className="products-content p-3 p-md-4">

      {showFilters && (
        <div className="filters-section mb-4 p-4 rounded shadow-sm bg-light border">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="mb-0 text-primary">
              <FaFilter className="me-2" />
              {t('filterProducts')}
            </h5>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => {
                setSelectedRecipe(null);
                setSelectedPackage(null);
                setSelectedProduct(null);
                setFilteredProducts(products || []);
              }}
              disabled={!selectedRecipe && !selectedPackage && !selectedProduct}
            >
              <FaTimes className="me-1" />
              {t('clearFilters')}
            </Button>
          </div>
          <Row className="g-3">
            <Col md={4} className="mb-3 mb-md-0">
              <label className="form-label fw-semibold">
                <FaUtensils className="me-1 text-primary" />
                {t('recipe')}
              </label>
              <Select
                options={recipeOptions}
                onChange={setSelectedRecipe}
                value={selectedRecipe}
                placeholder={t('chooseRecipe')}
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </Col>
            <Col md={4} className="mb-3 mb-md-0">
              <label className="form-label fw-semibold">
                <FaBoxOpen className="me-1 text-primary" />
                {t('package')}
              </label>
              <Select
                options={packageOptions}
                onChange={setSelectedPackage}
                value={selectedPackage}
                placeholder={t('choosePackage')}
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </Col>
            <Col md={4}>
              <label className="form-label fw-semibold">
                <FaTag className="me-1 text-primary" />
                {t('product')}
              </label>
              <Select
                options={productOptions}
                onChange={setSelectedProduct}
                value={selectedProduct}
                placeholder={t('chooseProduct')}
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </Col>
          </Row>
        </div>
      )}

      {isLoading ? (
        <div className="products-loading">
          <Row className="g-3">
            <ProductSkeleton count={8} />
          </Row>
        </div>
      ) : (
        <>
          {Object.entries(groupedProducts).length === 0 ? (
            <div className="empty-state-products text-center py-5 bg-light rounded shadow-sm">
              <FaBoxOpen size={64} className="text-muted mb-3" />
              <h3 className="text-muted mb-3">{t('noProductsFound')}</h3>
              <p className="text-muted mb-4">{t('noProductsFoundDescription')}</p>
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => setShowProductModal(true)}
              >
                <FaPlus className="me-2" /> {t('addProduct')}
              </Button>
            </div>
          ) : (
            <div className="products-sections">
              {Object.entries(groupedProducts).map(([recipeNames, products]) => (
                <div key={recipeNames} className="recipe-section mb-5">
                  <div className="recipe-section-header d-flex align-items-center justify-content-between mb-3 p-3 bg-primary bg-opacity-10 rounded">
                    <div className="d-flex align-items-center">
                      <FaUtensils className="me-2 text-primary" />
                      <h3 className="mb-0 text-primary fw-semibold">{recipeNames}</h3>
                      <span className="badge bg-primary ms-2">{products.length}</span>
                    </div>
                    <div className="section-stats text-muted small">
                      {products.length} {products.length === 1 ? t('product') : t('products')}
                    </div>
                  </div>
                  <div className="products-grid">
                    {Array.isArray(products) && products.map((product: Product) => (
                      <div key={product.id} className="product-grid-item">
                        <ProductCard 
                          product={product} 
                          recipes={recipes || []} 
                          packages={packages || []} 
                          onEdit={handleEditProduct} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Модалка для продукта */}
      <ProductModal
        show={showProductModal}
        onClose={handleCloseProductModal}
        onSave={handleSaveProductChanges}
        onDelete={handleDeleteProduct}
        product={editingProduct}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        price={price}
        setPrice={setPrice}
        cost={cost}
        setCost={setCost}
        image={image}
        setImage={setImage}
        selectedRecipes={selectedRecipes}
        setSelectedRecipes={setSelectedRecipes}
        recipeOptions={recipeOptions}
        packageId={packageId}
        setPackageId={setPackageId}
        packageOptions={packageOptions}
      />
      </div>
    </div>
  );
};

export default withAuth(Products);
