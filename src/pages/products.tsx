import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import fetcher from '../utils/fetcher';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useAuth, withAuth } from '../utils/authContext';
import { Button } from 'react-bootstrap';
import { SingleValue } from 'react-select';
import ProductModal from '../components/modal/Products/ProductModal';
import { FaPlus, FaFilter, FaTag, FaTimes } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/skeletons/ProductCardSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Breadcrumbs from '../components/Breadcrumbs';
import { Product, Recipe, ProductPackage } from '../types/api';
import { useNotification } from '../hooks/useNotification';
import SelectDropdown from '../components/SelectDropdown';

const Products = () => {
  const { t } = useTranslation('common');
  const { auth } = useAuth();
  const { success, error: showError } = useNotification();
  const { data: products, mutate: mutateProducts, error: productsError } = useSWR<Product[]>(
    auth.isAuthenticated ? '/api/products' : null,
    fetcher
  );
  const { data: recipes, error: recipesError } = useSWR<Recipe[]>(
    auth.isAuthenticated ? '/api/recipes' : null,
    fetcher
  );
  const { data: packages, mutate: mutatePackages, error: packagesError } = useSWR<ProductPackage[]>(
    auth.isAuthenticated ? '/api/packages' : null,
    fetcher
  );
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
      success(editingProduct ? t('productUpdated') : t('productCreated'));
    } catch (error) {
      showError(t('failedToSaveProduct'));
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
      success(t('productDeleted'));
    } catch (error) {
      showError(t('failedToDeleteProduct'));
    }
  };

  const recipeOptions = recipes?.map(recipe => ({ value: recipe.id, label: recipe.name })) || [];
  const packageOptions = packages?.map(pkg => ({ value: pkg.id, label: pkg.name })) || [];
  const productOptions = products?.map(product => ({ value: product.id, label: product.name })) || [];

  // Проверяем наличие ошибок
  const hasError = productsError || recipesError || packagesError;
  
  // Проверяем загрузку данных
  const isLoading = !products || !recipes || !packages;

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
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title d-flex align-items-center gap-3">
            <FaTag className="text-primary" />
            {t('products')}
          </h1>
          {!isLoading && (
            <p className="page-subtitle">
              Total: {products?.length || 0} products
              {filteredProducts.length !== products?.length && (
                <span className="text-tertiary"> • {filteredProducts.length} filtered</span>
              )}
            </p>
          )}
        </div>
        <Button
          className="btn btn-primary"
          onClick={() => setShowProductModal(true)}
        >
          <FaPlus className="me-2" />
          {t('addProduct')}
        </Button>
      </div>

      {/* Filter Section */}
      <div className="filter-bar">
        <div className="filter-group">
          <SelectDropdown
            options={recipeOptions}
            onChange={setSelectedRecipe}
            value={selectedRecipe}
            placeholder={t('chooseRecipe')}
            isClearable
            label={t('recipe')}
          />
        </div>
        <div className="filter-group">
          <SelectDropdown
            options={packageOptions}
            onChange={setSelectedPackage}
            value={selectedPackage}
            placeholder={t('choosePackage')}
            isClearable
            label={t('package')}
          />
        </div>
        <div className="filter-group">
          <SelectDropdown
            options={productOptions}
            onChange={setSelectedProduct}
            value={selectedProduct}
            placeholder={t('chooseProduct')}
            isClearable
            label={t('product')}
          />
        </div>
        {selectedRecipe || selectedPackage || selectedProduct ? (
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => {
              setSelectedRecipe(null);
              setSelectedPackage(null);
              setSelectedProduct(null);
              setFilteredProducts(products || []);
            }}
            className="ms-auto"
          >
            <FaTimes className="me-2" />
            Clear
          </Button>
        ) : null}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="products-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          type="products"
          message={t('noProductsFound')}
          actionLabel={t('addProduct')}
          onAction={() => setShowProductModal(true)}
        />
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product: Product) => (
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
      )}

      {/* Product Modal */}
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
  );
};

export default withAuth(Products);
