import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import fetcher from '../utils/fetcher';
import useTranslation from 'next-translate/useTranslation';
import { Container, Row, Col, Card, Button, Form, Modal } from 'react-bootstrap';
import Select from 'react-select';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';

const Products = () => {
  const { t } = useTranslation('common');
  const { data: products, mutate: mutateProducts } = useSWR('/api/products/', fetcher);
  const { data: recipes, mutate: mutateRecipes } = useSWR('/api/recipes/names', fetcher);
  const { data: packages, mutate: mutatePackages } = useSWR('/api/products/packages', fetcher);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [recipeIds, setRecipeIds] = useState([]);
  const [packageId, setPackageId] = useState('');

  const [newPackage, setNewPackage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    console.log("Products:", products);
    console.log("Recipes:", recipes);
    console.log("Packages:", packages);
  }, [products, recipes, packages]);

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setImage(product.image);
    setRecipeIds(product.recipe_ids.split(',').map((id: string) => parseInt(id, 10)));
    setPackageId(product.package_id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setImage('');
    setRecipeIds([]);
    setPackageId('');
    setShowModal(false);
  };

  const handleSaveChanges = async () => {
    const parsedPrice = parseFloat(price);

    const isValidUrl = (url) => {
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

    const product = { name, description, price: parsedPrice, image: image || null, recipeIds, packageId };

    if (editingProduct) {
      await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
      mutateProducts();
    }

    handleCloseModal();
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);

    const isValidUrl = (url) => {
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

    const product = { name, description, price: parsedPrice, image: image || null, recipeIds, packageId };
    console.log('Sending product:', product);

    await fetch('/api/products/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    setName('');
    setDescription('');
    setPrice('');
    setImage('');
    setRecipeIds([]);
    setPackageId('');
    mutateProducts();
  };

  const addPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/products/packages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newPackage }),
    });
    setNewPackage('');
    mutatePackages();
  };

  if (!products || !recipes || !packages) return <div>{t('loading')}</div>;

  const recipeOptions = recipes.map((recipe: any) => ({ value: recipe.id, label: recipe.name }));
  const packageOptions = packages.map((pkg: any) => ({ value: pkg.id, label: pkg.name }));

  // Группировка продуктов по уникальным наборам рецептов
  const groupedProducts = products.reduce((acc, product) => {
    const productRecipeIds = product.recipe_ids.split(',').map((id) => parseInt(id, 10)).sort((a, b) => a - b);
    const recipeNames = productRecipeIds.map((recipeId) => recipes.find((recipe) => recipe.id === recipeId)?.name || t('unknownRecipe')).join(', ');

    if (!acc[recipeNames]) {
      acc[recipeNames] = [];
    }
    acc[recipeNames].push(product);
    return acc;
  }, {});

  return (
    <Container>
      <h1>{t('products')}</h1>

      <Form onSubmit={addProduct}>
        <Form.Group controlId="name">
          <Form.Label>{t('productName')}</Form.Label>
          <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </Form.Group>
        <Form.Group controlId="description">
          <Form.Label>{t('description')}</Form.Label>
          <Form.Control type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </Form.Group>
        <Form.Group controlId="price">
          <Form.Label>{t('price')}</Form.Label>
          <Form.Control type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </Form.Group>
        <Form.Group controlId="image">
          <Form.Label>{t('image')}</Form.Label>
          <Form.Control type="text" value={image} onChange={(e) => setImage(e.target.value)} />
        </Form.Group>
        <Form.Group controlId="recipeIds">
          <Form.Label>{t('recipe')}</Form.Label>
          <Select
            value={recipeOptions.filter(option => recipeIds.includes(option.value))}
            onChange={(selectedOptions) => setRecipeIds(selectedOptions.map(option => option.value))}
            options={recipeOptions}
            isMulti
            placeholder={t('chooseRecipe')}
          />
        </Form.Group>
        <Form.Group controlId="package">
          <Form.Label>{t('package')}</Form.Label>
          <Select
            value={packageOptions.find(option => option.value === packageId)}
            onChange={(selectedOption) => setPackageId(selectedOption ? selectedOption.value : '')}
            options={packageOptions}
            isClearable
            placeholder={t('choosePackage')}
          />
        </Form.Group>
        <Button variant="primary" type="submit">{t('addProduct')}</Button>
      </Form>

      <Form onSubmit={addPackage} className="mt-4">
        <Form.Group controlId="newPackage">
          <Form.Label>{t('newPackage')}</Form.Label>
          <Form.Control type="text" value={newPackage} onChange={(e) => setNewPackage(e.target.value)} required />
        </Form.Group>
        <Button variant="secondary" type="submit">{t('addPackage')}</Button>
      </Form>

      {Object.entries(groupedProducts).map(([recipeNames, products]) => (
        <div key={recipeNames}>
          <h2>{recipeNames}</h2>
          <Row className="mt-4">
            {products.map((product: any) => {
              const packageName = packages.find((pkg) => pkg.id === product.package_id)?.name || t('unknownPackage');
              return (
                <Col key={product.id} sm={6} md={4} lg={3}>
                  <Card className="mb-4" onClick={() => handleEditProduct(product)} style={{ cursor: 'pointer' }}>
                    <Card.Img variant="top" src={product.image} />
                    <Card.Body>
                      <Card.Title>{product.name}</Card.Title>
                      <Card.Text>{product.description}</Card.Text>
                      <Card.Text>{t('price')}: {product.price}</Card.Text>
                      <Card.Text>{t('recipes')}: {recipeNames}</Card.Text>
                      <Card.Text>{t('package')}: {packageName}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      ))}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{t('editProduct')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="name">
              <Form.Label>{t('productName')}</Form.Label>
              <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </Form.Group>
            <Form.Group controlId="description">
              <Form.Label>{t('description')}</Form.Label>
              <Form.Control type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </Form.Group>
            <Form.Group controlId="price">
              <Form.Label>{t('price')}</Form.Label>
              <Form.Control type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </Form.Group>
            <Form.Group controlId="image">
              <Form.Label>{t('image')}</Form.Label>
              <Form.Control type="text" value={image} onChange={(e) => setImage(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="recipeIds">
              <Form.Label>{t('recipe')}</Form.Label>
              <Select
                value={recipeOptions.filter(option => recipeIds.includes(option.value))}
                onChange={(selectedOptions) => setRecipeIds(selectedOptions.map(option => option.value))}
                options={recipeOptions}
                isMulti
                placeholder={t('chooseRecipe')}
              />
            </Form.Group>
            <Form.Group controlId="package">
              <Form.Label>{t('package')}</Form.Label>
              <Select
                value={packageOptions.find(option => option.value === packageId)}
                onChange={(selectedOption) => setPackageId(selectedOption ? selectedOption.value : '')}
                options={packageOptions}
                isClearable
                placeholder={t('choosePackage')}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>{t('close')}</Button>
          <Button variant="primary" onClick={handleSaveChanges}>{t('saveChanges')}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

export default Products;
