import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import fetcher from '../utils/fetcher';
import useTranslation from 'next-translate/useTranslation';
import { Container, Row, Col, Card, Button, Form, Modal } from 'react-bootstrap';
import Select from 'react-select';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  image: string;
  recipe_ids: string;
  package_id: string;
}

interface Recipe {
  id: string;
  name: string;
}

interface Package {
  id: string;
  name: string;
}

const Products = () => {
  const { t } = useTranslation('common');
  const { data: products, mutate: mutateProducts } = useSWR<Product[]>('/api/products/', fetcher);
  const { data: recipes, mutate: mutateRecipes } = useSWR<Recipe[]>('/api/recipes/names', fetcher);
  const { data: packages, mutate: mutatePackages } = useSWR<Package[]>('/api/products/packages', fetcher);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [image, setImage] = useState('');
  const [recipeIds, setRecipeIds] = useState<string[]>([]);
  const [packageId, setPackageId] = useState('');

  const [newPackage, setNewPackage] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    console.log('Products:', products);
    console.log('Recipes:', recipes);
    console.log('Packages:', packages);
    setFilteredProducts(products || []);
  }, [products, recipes, packages]);

  useEffect(() => {
    applyFilters();
  }, [selectedRecipe, selectedPackage, selectedProduct]);

  const applyFilters = () => {
    let filtered = products || [];

    if (selectedRecipe) {
      filtered = filtered.filter(product =>
        product.recipe_ids.split(',').map(id => id.trim()).includes(selectedRecipe.value)
      );
    }

    if (selectedPackage) {
      filtered = filtered.filter(product => product.package_id === selectedPackage.value);
    }

    if (selectedProduct) {
      filtered = filtered.filter(product => product.id === selectedProduct.value);
    }

    setFilteredProducts(filtered);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setCost(product.cost.toString());
    setImage(product.image);
    setRecipeIds(product.recipe_ids.split(',').map((id) => id.trim()));
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
    setPackageId('');
    setShowProductModal(false);
  };

  const handleSaveProductChanges = async () => {
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
      alert('Invalid image URL');
      return;
    }

    const product = { name, description, price: parsedPrice, cost: parsedCost, image: image || null, recipeIds, packageId };

    if (editingProduct) {
      await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      mutateProducts();
    } else {
      await fetch('/api/products/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      mutateProducts();
    }

    handleCloseProductModal();
  };

  const handleSavePackage = async () => {
    await fetch('/api/products/packages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newPackage }),
    });
    setNewPackage('');
    mutatePackages();
    setShowPackageModal(false);
  };

  if (!products || !recipes || !packages) return <div>{t('loading')}</div>;

  const recipeOptions = recipes.map((recipe) => ({ value: recipe.id, label: recipe.name }));
  const packageOptions = packages.map((pkg) => ({ value: pkg.id, label: pkg.name }));
  const productOptions = products.map((product) => ({ value: product.id, label: product.name }));

  // Добавляем отладочный вывод для рецептов и продуктов
  console.log('Filtered Products:', filteredProducts);
  console.log('Recipe Options:', recipeOptions);
  console.log('Package Options:', packageOptions);
  console.log('Product Options:', productOptions);

  const groupedProducts = filteredProducts.reduce<{ [key: string]: Product[] }>((acc, product) => {
    const productRecipeIds = product.recipe_ids.split(',').map((id) => id.trim());

    // Выводим идентификаторы рецептов и их названия
    console.log('Product Recipe IDs:', productRecipeIds);

    const recipeNames = productRecipeIds
      .map((recipeId) => {
        const recipe = recipes.find((recipe) => recipe.id == recipeId);
        console.log('Found Recipe:', recipe);
        return recipe ? recipe.name : t('unknownRecipe');
      })
      .join(', ');

    if (!acc[recipeNames]) {
      acc[recipeNames] = [];
    }
    acc[recipeNames].push(product);
    return acc;
  }, {});

  return (
    <Container>
      <h1>{t('products')}</h1>

      <Row className="mb-3">
        <Col md="4">
          <Select
            options={recipeOptions}
            onChange={setSelectedRecipe}
            placeholder={t('recipe')}
          />
        </Col>
        <Col md="4">
          <Select
            options={packageOptions}
            onChange={setSelectedPackage}
            placeholder={t('package')}
          />
        </Col>
        <Col md="4">
          <Select
            options={productOptions}
            onChange={setSelectedProduct}
            placeholder={t('product')}
          />
        </Col>
      </Row>

      <div className="d-flex justify-content-end mb-3">
        <Button variant="primary" onClick={() => setShowProductModal(true)} className="me-2">{t('addProduct')}</Button>
        <Button variant="secondary" onClick={() => setShowPackageModal(true)}>{t('addPackage')}</Button>
      </div>

      {groupedProducts && Object.entries(groupedProducts).map(([recipeNames, products]) => (
        <div key={recipeNames}>
          <h2>{recipeNames}</h2>
          <Row className="mt-4">
            {Array.isArray(products) && products.map((product: Product) => {
              const packageName = packages.find((pkg) => pkg.id === product.package_id)?.name || t('unknownPackage');
              return (
                <Col key={product.id} sm={6} md={4} lg={3}>
                  <Card>
                    <Card.Body>
                      <Card.Title>{product.name}</Card.Title>
                      <Card.Text>
                        {t('price')}: {product.price}
                      </Card.Text>
                      <Card.Text>
                        {t('package')}: {packageName}
                      </Card.Text>
                      <Button variant="primary" onClick={() => handleEditProduct(product)}>{t('edit')}</Button>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      ))}

      <Modal show={showProductModal} onHide={handleCloseProductModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? t('editProduct') : t('addProduct')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="name">
              <Form.Label>{t('name')}</Form.Label>
              <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </Form.Group>
            <Form.Group controlId="description">
              <Form.Label>{t('description')}</Form.Label>
              <Form.Control type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </Form.Group>
            <Form.Group as={Col} md="6" controlId="price">
              <Form.Label>{t('price')}</Form.Label>
              <Form.Control type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </Form.Group>
            <Form.Group as={Col} md="6" controlId="cost">
              <Form.Label>{t('cost')}</Form.Label>
              <Form.Control type="number" value={cost} onChange={(e) => setCost(e.target.value)} required />
            </Form.Group>
            <Form.Group as={Col} md="6" controlId="image">
              <Form.Label>{t('imageUrl')}</Form.Label>
              <Form.Control type="text" value={image} onChange={(e) => setImage(e.target.value)} />
            </Form.Group>
            <Form.Group as={Col} md="6" controlId="recipeIds">
              <Form.Label>{t('recipes')}</Form.Label>
              <Select
                isMulti
                options={recipeOptions}
                value={recipeOptions.filter(option => recipeIds.includes(option.value))}
                onChange={(selectedOptions) => setRecipeIds((selectedOptions || []).map(option => option.value))}
              />
            </Form.Group>
            <Form.Group as={Col} md="6" controlId="packageId">
              <Form.Label>{t('package')}</Form.Label>
              <Select
                options={packageOptions}
                value={packageOptions.find(option => option.value === packageId)}
                onChange={(selectedOption) => setPackageId(selectedOption?.value || '')}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseProductModal}>
            {t('close')}
          </Button>
          <Button variant="primary" onClick={handleSaveProductChanges}>
            {t('saveChanges')}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showPackageModal} onHide={() => setShowPackageModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('addPackage')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="newPackage">
            <Form.Label>{t('packageName')}</Form.Label>
            <Form.Control
              type="text"
              value={newPackage}
              onChange={(e) => setNewPackage(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPackageModal(false)}>
            {t('close')}
          </Button>
          <Button variant="primary" onClick={handleSavePackage}>
            {t('save')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Products;
