import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import fetcher from '../utils/fetcher';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useAuth, withAuth } from '../utils/authContext';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Select, { SingleValue } from 'react-select';
import ProductModal from '../components/modal/Products/ProductModal';
import { FaPlus, FaFilter } from 'react-icons/fa';
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
  
      if (!name || !description || !price || !cost || !packageId || selectedRecipes.length === 0) {
        alert(t('fillRequiredFields'));
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
      <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
        <h1 className="mb-0">{t('products')}</h1>
        <div>
          <Button 
            variant="outline-primary" 
            className="me-2" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter className="me-2" /> {t('filter')}
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setShowProductModal(true)}
          >
            <FaPlus className="me-2" /> {t('addProduct')}
          </Button>
        </div>
      </div>
      <div className="p-4">

      {showFilters && (
        <Row className="mb-4 filter-container p-3 rounded shadow-sm">
          <Col md={4} className="mb-3 mb-md-0">
            <label className="form-label">{t('recipe')}</label>
            <Select
              options={recipeOptions}
              onChange={setSelectedRecipe}
              placeholder={t('chooseRecipe')}
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </Col>
          <Col md={4} className="mb-3 mb-md-0">
            <label className="form-label">{t('package')}</label>
            <Select
              options={packageOptions}
              onChange={setSelectedPackage}
              placeholder={t('choosePackage')}
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </Col>
          <Col md={4}>
            <label className="form-label">{t('product')}</label>
            <Select
              options={productOptions}
              onChange={setSelectedProduct}
              placeholder={t('chooseProduct')}
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </Col>
        </Row>
      )}

      {isLoading ? (
        <Row>
          <ProductSkeleton count={8} />
        </Row>
      ) : (
        <>
          {Object.entries(groupedProducts).length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">{t('noProductsFound')}</p>
              <Button 
                variant="primary" 
                onClick={() => setShowProductModal(true)}
                className="mt-3"
              >
                <FaPlus className="me-2" /> {t('addProduct')}
              </Button>
            </div>
          ) : (
            Object.entries(groupedProducts).map(([recipeNames, products]) => (
              <div key={recipeNames} className="mb-5">
                <h2 className="mb-4">{recipeNames}</h2>
                <div className="product-list-container">
                  {Array.isArray(products) && products.map((product: Product) => (
                    <div key={product.id} className="product-list-item">
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
            ))
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
