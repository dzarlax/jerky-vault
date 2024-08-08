import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import fetcher from '../utils/fetcher';
import useTranslation from 'next-translate/useTranslation';
import { Container, Row, Col, Form, Button, ListGroup } from 'react-bootstrap';
import Select from 'react-select';

const AddRecipe = () => {
  const { data: recipes, mutate: mutateRecipes } = useSWR('/api/recipes/list', fetcher);
  const { data: ingredients, mutate: mutateIngredients } = useSWR('/api/ingredients', fetcher);
  const { t } = useTranslation('common');

  const [recipeName, setRecipeName] = useState('');
  const [ingredientType, setIngredientType] = useState('');
  const [ingredientName, setIngredientName] = useState('');
  const [recipeId, setRecipeId] = useState('');
  const [ingredientId, setIngredientId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [units, setUnits] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState([]);

  useEffect(() => {
    console.log("Recipes:", recipes);
    console.log("Ingredients:", ingredients);
  }, [recipes, ingredients]);

  useEffect(() => {
    updateUnits();
  }, [ingredientId]);

  const addRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/recipes/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: recipeName, ingredients: [] }),
    });
    setRecipeName('');
    mutateRecipes();
  };

  const addIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: ingredientType, name: ingredientName }),
    });
    setIngredientType('');
    setIngredientName('');
    mutateIngredients();
  };

  const addIngredientToRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/recipes/recipe_ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipe_id: recipeId, ingredient_id: ingredientId, quantity, unit }),
    });
    setRecipeId('');
    setIngredientId('');
    setQuantity('');
    setUnit('');
    mutateRecipes();
  };

  const deleteIngredientFromRecipe = async (recipeId: string, ingredientId: string) => {
    console.log("Deleting ingredient from recipe:", recipeId, ingredientId); // Логирование
    if (!ingredientId) {
      console.error("Ingredient ID is undefined");
      return;
    }
    await fetch(`/api/recipes/${recipeId}/ingredients/${ingredientId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    loadRecipeIngredients(recipeId);
  };

  const loadRecipeIngredients = async (recipeId: string) => {
    const response = await fetch(`/api/recipes/${recipeId}`);
    const data = await response.json();
    console.log("Loaded recipe ingredients:", data.ingredients); // Логирование
    setRecipeIngredients(data.ingredients);
  };
  

  const updateUnits = () => {
    if (!ingredients || !Array.isArray(ingredients)) return;

    const selectedIngredient = ingredients.find((ingredient: any) => ingredient.id === parseInt(ingredientId));
    if (!selectedIngredient) return;

    let units = [];
    switch (selectedIngredient.type) {
      case 'base':
        units = ['kg', 'g'];
        break;
      case 'spice':
        units = ['g'];
        break;
      case 'sauce':
        units = ['ml'];
        break;
      case 'electricity':
        units = ['hh'];
        break;
      case 'packing':
        units = ['pieces'];
        break;
      default:
        units = [];
    }
    setUnits(units);
    setUnit(units[0] || ''); // Устанавливаем первую единицу измерения по умолчанию
  };

  useEffect(() => {
    if (selectedRecipe) {
      loadRecipeIngredients(selectedRecipe);
    }
  }, [selectedRecipe]);

  const handleRecipeChange = (selectedOption: any) => {
    setRecipeId(selectedOption ? selectedOption.value : '');
  };

  const handleIngredientChange = (selectedOption: any) => {
    setIngredientId(selectedOption ? selectedOption.value : '');
  };

  const handleIngredientTypeChange = (selectedOption: any) => {
    setIngredientType(selectedOption ? selectedOption.value : '');
    updateUnits();
  };

  const handleUnitChange = (selectedOption: any) => {
    setUnit(selectedOption ? selectedOption.value : '');
  };

  const recipeOptions = Array.isArray(recipes) ? recipes.map((recipe: any) => ({ value: recipe.id, label: recipe.name })) : [];
  const ingredientOptions = Array.isArray(ingredients) ? ingredients.map((ingredient: any) => ({ value: ingredient.id, label: ingredient.name })) : [];
  const ingredientTypeOptions = [
    { value: 'base', label: t('base') },
    { value: 'spice', label: t('spice') },
    { value: 'sauce', label: t('sauce') },
    { value: 'electricity', label: t('electricity') },
    { value: 'packing', label: t('packing') }
  ];
  const unitOptions = units.map((unit: string) => ({ value: unit, label: t(unit) }));

  return (
    <Container>
      <h1>{t('addRecipe')}</h1>

      <Form onSubmit={addRecipe}>
        <Row className="align-items-end">
          <Col>
            <Form.Group controlId="recipeName">
              <Form.Control type="text" placeholder={t('recipeName')} value={recipeName} onChange={(e) => setRecipeName(e.target.value)} required />
            </Form.Group>
          </Col>
          <Col xs="auto">
            <Button variant="primary" type="submit" size="sm">{t('addRecipe')}</Button>
          </Col>
        </Row>
      </Form>

      <h2 className="mt-4">{t('addIngredient')}</h2>
      <Form onSubmit={addIngredient} className="mt-2">
        <Row className="align-items-end">
          <Col>
            <Form.Group controlId="ingredientType">
              <Select
                value={ingredientTypeOptions.find(option => option.value === ingredientType) || null}
                onChange={handleIngredientTypeChange}
                options={ingredientTypeOptions}
                isClearable
                placeholder={t('chooseType')}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="ingredientName">
              <Form.Control type="text" placeholder={t('ingredientName')} value={ingredientName} onChange={(e) => setIngredientName(e.target.value)} required />
            </Form.Group>
          </Col>
          <Col xs="auto">
            <Button variant="primary" type="submit" size="sm">{t('addIngredient')}</Button>
          </Col>
        </Row>
      </Form>

      <h2 className="mt-4">{t('addIngredientToRecipe')}</h2>
      <Form onSubmit={addIngredientToRecipe} className="mt-2">
        <Row className="align-items-end">
          <Col>
            <Form.Group controlId="recipeId">
              <Select
                value={recipeOptions.find(option => option.value === recipeId) || null}
                onChange={handleRecipeChange}
                options={recipeOptions}
                isClearable
                placeholder={t('chooseRecipe')}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="ingredientId">
              <Select
                value={ingredientOptions.find(option => option.value === ingredientId) || null}
                onChange={handleIngredientChange}
                options={ingredientOptions}
                isClearable
                placeholder={t('chooseIngredient')}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="quantity">
              <Form.Control type="number" placeholder={t('quantity')} value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="unit">
              <Select
                value={unitOptions.find(option => option.value === unit) || null}
                onChange={handleUnitChange}
                options={unitOptions}
                isClearable
                placeholder={t('unit')}
              />
            </Form.Group>
          </Col>
          <Col xs="auto">
            <Button variant="primary" type="submit" size="sm">{t('addIngredientToRecipe')}</Button>
          </Col>
        </Row>
      </Form>

      <h2 className="mt-4">{t('removeIngredientFromRecipe')}</h2>
      <Form.Group controlId="selectedRecipe">
        <Select
          value={recipeOptions.find(option => option.value === selectedRecipe) || null}
          onChange={(selectedOption: any) => setSelectedRecipe(selectedOption ? selectedOption.value : '')}
          options={recipeOptions}
          isClearable
          placeholder={t('chooseRecipe')}
        />
      </Form.Group>
      {selectedRecipe && (
        <ListGroup className="mt-2">
          {recipeIngredients.map((ingredient: any) => (
  <ListGroup.Item key={ingredient.id}>
    {ingredient.name} - {ingredient.quantity} {ingredient.unit}
    <Button variant="danger" size="sm" className="ms-2" onClick={() => {
      console.log("Deleting ingredient:", ingredient.id); // Логирование
      deleteIngredientFromRecipe(selectedRecipe, ingredient.id);
    }}>
      {t('delete')}
    </Button>
  </ListGroup.Item>
))}

        </ListGroup>
      )}
    </Container>
  );
};

export default AddRecipe;
