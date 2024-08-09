import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import fetcher from '../utils/fetcher';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { Container, Row, Col, Button, ListGroup, Modal, Form } from 'react-bootstrap';
import Select from 'react-select';

const Recipes: React.FC = () => {
  const { t, lang } = useTranslation('common');
  const { data: recipeNames, error: recipeNamesError } = useSWR('/api/recipes/names', fetcher);
  const { data: ingredients, error: ingredientsError } = useSWR('/api/ingredients', fetcher);
  const [recipes, setRecipes] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [filterIngredient, setFilterIngredient] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<any>(null);
  const [recipeName, setRecipeName] = useState('');
  const [ingredientId, setIngredientId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [units, setUnits] = useState([]);
  const [showIngredientForm, setShowIngredientForm] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newIngredients, setNewIngredients] = useState<any[]>([]);
  const [newIngredientId, setNewIngredientId] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newUnit, setNewUnit] = useState<any>(null);
  const [newUnits, setNewUnits] = useState<{ value: string, label: string }[]>([]);

  const router = useRouter();

  useEffect(() => {
    if (recipeNames && ingredients) {
      setIsLoading(false);
    }
  }, [recipeNames, ingredients]);

  useEffect(() => {
    loadRecipes();
  }, [filterName, filterIngredient]);

  useEffect(() => {
    if (ingredientId) {
      updateUnits();
    }
  }, [ingredientId]);

  const loadRecipes = async () => {
    const query = new URLSearchParams();
    if (filterName) query.append('name', filterName);
    if (filterIngredient) query.append('ingredient', filterIngredient);

    try {
      const response = await fetch(`/api/recipes/list?${query.toString()}`);
      const data = await response.json();
      setRecipes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load recipes', error);
    }
  };

  const deleteRecipe = async () => {
    if (!editingRecipe) return;
    try {
      const response = await fetch(`/api/recipes/${editingRecipe.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        loadRecipes();
        closeEditModal();
      } else {
        console.error('Failed to delete recipe');
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const deleteIngredientFromRecipe = async (ingredientId: string) => {
    if (!editingRecipe || !ingredientId) return;
    try {
      await fetch(`/api/recipes/${editingRecipe.id}/ingredients/${ingredientId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      loadRecipeIngredients(editingRecipe.id);
    } catch (error) {
      console.error('Failed to delete ingredient from recipe:', error);
    }
  };

  const openEditModal = (recipe: any) => {
    setEditingRecipe(recipe);
    setRecipeName(recipe.name);
    setShowModal(true);
    setShowIngredientForm(false); // Скрыть форму добавления ингредиента при открытии модалки
  };

  const closeEditModal = () => {
    setEditingRecipe(null);
    setRecipeName('');
    setIngredientId('');
    setQuantity('');
    setUnit('');
    setShowModal(false);
    setShowIngredientForm(false);
  };

  const handleNameChange = (selectedOption: any) => {
    setFilterName(selectedOption ? selectedOption.value : '');
  };

  const handleIngredientChange = (selectedOption: any) => {
    setFilterIngredient(selectedOption ? selectedOption.value : '');
  };

  const handleIngredientSelect = (selectedOption: any) => {
    setIngredientId(selectedOption ? selectedOption.value : '');
  };

  const updateUnits = () => {
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
    setUnits(units.map(unit => ({ value: unit, label: t(unit) })));
    setUnit(units[0] ? { value: units[0], label: t(units[0]) } : null);
  };

  const addIngredientToRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecipe) {
      await fetch('/api/recipes/recipe_ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipe_id: editingRecipe.id, ingredient_id: ingredientId, quantity, unit: unit.value }),
      });
      loadRecipeIngredients(editingRecipe.id);
      setShowIngredientForm(false); // Скрыть форму после добавления ингредиента
    }
  };

  const loadRecipeIngredients = async (recipeId: string) => {
    const response = await fetch(`/api/recipes/${recipeId}`);
    const data = await response.json();
    setEditingRecipe((prev: any) => ({ ...prev, ingredients: data.ingredients }));
  };

  const cloneRecipe = async () => {
    if (!editingRecipe) return;

    const response = await fetch('/api/recipes/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: `${editingRecipe.name} (Copy)`, ingredients: [] }),
    });

    if (!response.ok) {
      console.error('Failed to clone recipe');
      return;
    }

    const newRecipe = await response.json();

    for (const ingredient of editingRecipe.ingredients) {
      if (ingredient.id) {
        await fetch('/api/recipes/recipe_ingredients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipe_id: newRecipe.id,
            ingredient_id: ingredient.id,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
          }),
        });
      } else {
        console.error('Missing ingredient ID:', ingredient);
      }
    }

    loadRecipes();
    closeEditModal();
  };

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newIngredients.length === 0) {
      console.error('No ingredients added');
      return;
    }

    try {
      const response = await fetch('/api/recipes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newRecipeName }),
      });

      if (!response.ok) {
        console.error('Failed to create recipe');
        return;
      }

      const createdRecipe = await response.json();
      const recipeId = createdRecipe.id;

      for (const ingredient of newIngredients) {
        const ingredientResponse = await fetch('/api/recipes/recipe_ingredients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipe_id: recipeId,
            ingredient_id: ingredient.id,
            quantity: ingredient.quantity,
            unit: ingredient.unit.value,
          }),
        });

        if (!ingredientResponse.ok) {
          console.error('Failed to add ingredient:', ingredient.name);
          return;
        }
      }

      setShowCreateModal(false);
      setNewRecipeName('');
      setNewIngredients([]);
      loadRecipes();
    } catch (error) {
      console.error('Error creating recipe or adding ingredients:', error);
    }
  };

  const addNewIngredient = () => {
    const selectedIngredient = ingredients.find((ingredient: any) => ingredient.id === parseInt(newIngredientId));
    if (!selectedIngredient || !newQuantity || !newUnit) return;

    setNewIngredients([...newIngredients, {
      id: newIngredientId,
      name: selectedIngredient.name,
      quantity: newQuantity,
      unit: newUnit,
    }]);

    setNewIngredientId('');
    setNewQuantity('');
    setNewUnit(null);
    setNewUnits([]);
    setShowIngredientForm(false); // Скрыть форму после добавления ингредиента
  };

  const getUnitsForIngredientType = (type: string) => {
    switch (type) {
      case 'base':
        return ['kg', 'g'];
      case 'spice':
        return ['g'];
      case 'sauce':
        return ['ml'];
      case 'electricity':
        return ['hh'];
      case 'packing':
        return ['pieces'];
      default:
        return [];
    }
  };

  const recipeOptions = Array.isArray(recipeNames) ? recipeNames.map((recipe: any) => ({ value: recipe.name, label: recipe.name })) : [];
  const ingredientOptions = Array.isArray(ingredients) ? ingredients.map((ingredient: any) => ({ value: ingredient.id, label: ingredient.name })) : [];
  const unitOptions = units.map((unit: any) => ({ value: unit.value, label: t(unit.label) }));

  if (isLoading || recipeNamesError || ingredientsError) return <div>{t('loading')}</div>;

  return (
    <Container>
      <h1>{t('allRecipes')}</h1>

      <Row className="filters mb-3">
        <Col>
          <Select
            value={recipeOptions.find(option => option.value === filterName) || null}
            onChange={handleNameChange}
            options={recipeOptions}
            isClearable
            placeholder={t('filterByRecipe')}
          />
        </Col>
        <Col>
          <Select
            value={ingredientOptions.find(option => option.value === filterIngredient) || null}
            onChange={handleIngredientChange}
            options={ingredientOptions}
            isClearable
            placeholder={t('filterByIngredient')}
          />
        </Col>
        <Col>
          <Button onClick={loadRecipes}>{t('applyFilters')}</Button>
        </Col>
        <Col>
          <Button variant="success" onClick={() => setShowCreateModal(true)}>
            {t('addRecipe')}
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          {recipes.length === 0 ? (
            <div>{t('noRecipesFound')}</div>
          ) : (
            <ListGroup>
              {recipes.map((recipe: any) => (
                <ListGroup.Item key={recipe.id}>
                  <strong>{recipe.name}</strong>
                  <Button variant="primary" className="ms-2" onClick={() => openEditModal(recipe)}>{t('edit')}</Button>
                  <br />
                  {t('totalCost')}: {parseFloat(recipe.totalCost).toFixed(2)} {t('currency')}
                  <ul>
                    {recipe.ingredients.map((ingredient: any) => (
                      <li key={`${ingredient.id}-${ingredient.name}`}>
                        {ingredient.name} - {ingredient.quantity} {ingredient.unit} ({parseFloat(ingredient.price).toFixed(2)} {t('currency')})
                      </li>
                    ))}
                  </ul>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </Row>

      {/* Модалка редактирования рецепта */}
      <Modal show={showModal} onHide={closeEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>{t('editRecipe')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={addIngredientToRecipe}>
            <Form.Group controlId="recipeName">
              <Form.Label>{t('recipeName')}</Form.Label>
              <Form.Control type="text" value={recipeName} onChange={(e) => setRecipeName(e.target.value)} required />
            </Form.Group>
            
            {/* Ингредиенты в рецепте */}
            <h5 className="mt-4">{t('ingredientsInRecipe')}</h5>
            <ListGroup>
              {editingRecipe?.ingredients.map((ingredient: any) => (
                <ListGroup.Item key={ingredient.id}>
                  {ingredient.name} - {ingredient.quantity} {ingredient.unit.label}
                  <Button
                    variant="danger"
                    size="sm"
                    className="ms-2"
                    onClick={() => deleteIngredientFromRecipe(ingredient.id)}
                  >
                    {t('delete')}
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>

            {/* Кнопка для отображения формы добавления ингредиента */}
            <span
        style={{ color: 'blue', cursor: 'pointer', marginTop: '15px', display: 'block' }}
        onClick={() => setShowIngredientForm(true)}
      >
        <i className="bi bi-plus-circle"></i> {t('addIngredient')}
      </span>

            {/* Форма добавления ингредиента */}
            {showIngredientForm && (
              <>
                <Form.Group controlId="ingredientId" className="mt-3">
                  <Form.Label>{t('chooseIngredient')}</Form.Label>
                  <Select
                    value={ingredientOptions.find(option => option.value === ingredientId) || null}
                    onChange={handleIngredientSelect}
                    options={ingredientOptions}
                    isClearable
                    placeholder={t('chooseIngredient')}
                  />
                </Form.Group>
                <Row className="mt-3">
                  <Col>
                    <Form.Group controlId="quantity">
                      <Form.Label>{t('quantity')}</Form.Label>
                      <Form.Control type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="unit">
                      <Form.Label>{t('unit')}</Form.Label>
                      <Select
                        value={unitOptions.find(option => option.value === unit.value) || null}
                        onChange={(selectedOption) => setUnit(selectedOption || null)}
                        options={unitOptions}
                        isClearable
                        placeholder={t('chooseUnit')}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" type="submit" className="mt-3">{t('apply')}</Button>
              </>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEditModal}>{t('close')}</Button>
          <Button variant="danger" onClick={deleteRecipe}>{t('delete')}</Button>
          <Button variant="primary" onClick={cloneRecipe}>{t('clone')}</Button>
        </Modal.Footer>
      </Modal>

      {/* Модалка создания рецепта */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('addRecipe')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateRecipe}>
            <Form.Group controlId="newRecipeName">
              <Form.Label>{t('recipeName')}</Form.Label>
              <Form.Control
                type="text"
                value={newRecipeName}
                onChange={(e) => setNewRecipeName(e.target.value)}
                required
              />
            </Form.Group>

            {/* Ингредиенты в рецепте */}
            <h5 className="mt-4">{t('ingredients')}</h5>
            <ListGroup>
              {newIngredients.map((ingredient, index) => (
                <ListGroup.Item key={index}>
                  {ingredient.name} - {ingredient.quantity} {ingredient.unit.label}
                </ListGroup.Item>
              ))}
            </ListGroup>

            {/* Кнопка для отображения формы добавления ингредиента */}
            <span
        style={{ color: 'blue', cursor: 'pointer', marginTop: '15px', display: 'block' }}
        onClick={() => setShowIngredientForm(true)}
      >
        <i className="bi bi-plus-circle"></i> {t('addIngredient')}
      </span>

            {/* Форма добавления ингредиента */}
            {showIngredientForm && (
              <>
                <Form.Group controlId="newIngredientId" className="mt-3">
                  <Form.Label>{t('chooseIngredient')}</Form.Label>
                  <Select
                    value={ingredientOptions.find(option => option.value === newIngredientId) || null}
                    onChange={(selectedOption) => {
                      setNewIngredientId(selectedOption ? selectedOption.value : '');
                      if (selectedOption) {
                        const selected = ingredients.find((ingredient: any) => ingredient.id === parseInt(selectedOption.value));
                        if (selected) {
                          const units = getUnitsForIngredientType(selected.type).map(unit => ({ value: unit, label: t(unit) }));
                          setNewUnits(units);
                          setNewUnit(units[0] || null);
                        }
                      }
                    }}
                    options={ingredientOptions}
                    isClearable
                    placeholder={t('chooseIngredient')}
                  />
                </Form.Group>
                <Row className="mt-3">
                  <Col>
                    <Form.Group controlId="newQuantity">
                      <Form.Label>{t('quantity')}</Form.Label>
                      <Form.Control
                        type="number"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group controlId="newUnit">
                      <Form.Label>{t('unit')}</Form.Label>
                      <Select
                        value={newUnit}
                        onChange={(selectedOption) => setNewUnit(selectedOption || null)}
                        options={newUnits}
                        isClearable
                        placeholder={t('chooseUnit')}
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Button variant="secondary" className="mt-4" onClick={addNewIngredient}>
                      {t('apply')}
                    </Button>
                  </Col>
                </Row>
              </>
            )}

            <Button variant="primary" type="submit" className="mt-3">
              {t('create')}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Recipes;
