import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import fetcher from '../utils/fetcher';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import Select, { SingleValue } from 'react-select';
import ProductModal from '../components/modal/Products/ProductModal'; // Импортируем модалку
import { FaEdit, FaTag, FaBoxOpen, FaListUl, FaDollarSign } from 'react-icons/fa'; // Импортируем иконки


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
  const { data: products, mutate: mutateProducts } = useSWR<Product[]>('/api/products', fetcher);
  const { data: recipes } = useSWR<Recipe[]>('/api/recipes', fetcher);
  const { data: packages } = useSWR<Package[]>('/api/packages', fetcher);
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/signin');
    }
  }, [router]);

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
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/signin');
        return;
      }
  
      if (!name || !description || !price || !cost || !packageId || selectedRecipes.length === 0) {
        alert(t('fillRequiredFields'));
        return;
      }
  
      const parsedPrice = parseFloat(price);
      const parsedCost = parseFloat(cost);
  
      const isValidUrl = (url: string) => {
        if (!url) return true;
        try {
          new URL(url);
          return true;
        } catch (_) {
          return false;
        }
      };
  
      if (!isValidUrl(image)) {
        alert(t('invalidImageUrl'));
        return;
      }
  
      // Формируем массив recipeIds на основе selectedRecipes
      const recipeIds = selectedRecipes.map(recipe => recipe.value);
  
      const product = {
        name,
        description,
        price: parsedPrice,
        cost: parsedCost,
        image: image || null,
        recipe_ids: recipeIds, // Убедитесь, что recipeIds правильно передается
        package_id: packageId,
      };
  
      console.log('Product to save:', product); // Debug: Проверьте, что передается правильный объект
  
      if (editingProduct) {
        await fetcher(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(product),
        });
        mutateProducts();
      } else {
        await fetcher('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
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
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/signin');
        return;
      }

      const confirmed = window.confirm(t('confirmDeleteProduct'));
      if (!confirmed) return;

      await fetcher(`/api/products/${editingProduct.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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

  if (!products || !recipes || !packages) return <div>{t('loading')}</div>;

  return (
    <Container>
      <h1>{t('products')}</h1>

      <Row className="mb-3">
        <Col md="4">
          <Select
            options={recipeOptions}
            onChange={setSelectedRecipe}
            placeholder={t('recipe')}
            isClearable
          />
        </Col>
        <Col md="4">
          <Select
            options={packageOptions}
            onChange={setSelectedPackage}
            placeholder={t('package')}
            isClearable
          />
        </Col>
        <Col md="4">
          <Select
            options={productOptions}
            onChange={setSelectedProduct}
            placeholder={t('product')}
            isClearable
          />
        </Col>
      </Row>

      <div className="d-flex justify-content-end mb-3">
        <Button variant="primary" onClick={() => setShowProductModal(true)} className="me-2">
          {t('addProduct')}
        </Button>
      </div>

      {groupedProducts && Object.entries(groupedProducts).map(([recipeNames, products]) => (
  <div key={recipeNames}>
    <h2>{recipeNames}</h2>
    <Row className="mt-4">
      {Array.isArray(products) && products.map((product: Product) => {
        const packageName = packages?.find(pkg => pkg.id === product.package_id)?.name || t('unknownPackage');

        return (
          <Col key={product.id} sm={6} md={4} lg={3}>
            <Card className="h-100 shadow-sm">
              {product.image && (
                <Card.Img variant="top" src={product.image} alt={product.name} style={{ height: '150px', objectFit: 'cover' }} />
              )}
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-truncate" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                  {product.name}
                </Card.Title>
                <div className="mt-2">
                  <Card.Text className="d-flex align-items-center">
                    <FaDollarSign className="me-2 text-secondary" />
                    <span className="text-muted">{t('price')}: </span> {product.price}
                  </Card.Text>
                  <Card.Text className="d-flex align-items-center">
                    <FaTag className="me-2 text-secondary" />
                    <span className="text-muted">{t('cost')}: </span> {product.cost}
                  </Card.Text>
                  <Card.Text className="d-flex align-items-center">
                    <FaBoxOpen className="me-2 text-secondary" />
                    <span className="text-muted">{t('package')}: </span> {packageName}
                  </Card.Text>
                  <Card.Text className="d-flex align-items-center">
                    <FaListUl className="me-2 text-secondary" />
                    <span className="text-muted">{t('recipes')}: </span> {recipeNames}
                  </Card.Text>
                </div>
                <Button
                  variant="outline-primary"
                  className="mt-auto align-self-end"
                  onClick={() => handleEditProduct(product)}
                >
                  <FaEdit className="me-1" />
                </Button>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  </div>
))}
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
    </Container>
  );
};

export default Products;
