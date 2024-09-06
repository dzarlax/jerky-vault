import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, CloseButton } from 'react-bootstrap';
import Select from 'react-select';
import { FaTrash } from 'react-icons/fa';
import fetcher from '../../../utils/fetcher';

const EditRecipeModal = ({ show, onHide, recipe, ingredients, t, onDeleteRecipe, onCloneRecipe, onUpdateRecipe }) => {
  const [ingredientId, setIngredientId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState<{ value: string, label: string } | null>(null);
  const [units, setUnits] = useState<{ value: string, label: string }[]>([]);
  const [editingRecipe, setEditingRecipe] = useState(recipe);

  useEffect(() => {
    if (recipe) {
      setEditingRecipe(recipe);
      setIngredientId('');
      setQuantity('');
      setUnit(null);
      setUnits([]);
    }
  }, [recipe]);

  useEffect(() => {
    if (ingredientId) {
      updateUnits();
    }
  }, [ingredientId]);

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

  const handleIngredientSelect = (selectedOption: any) => {
    setIngredientId(selectedOption ? selectedOption.value : '');
  };

  const addIngredientToRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!ingredientId || !quantity || !unit) {
      console.error('Missing data for ingredient:', { ingredientId, quantity, unit });
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
  
      const requestData = {
        ingredient_id: parseInt(ingredientId, 10),
        quantity,
        unit: unit.value
      };
  
      console.log('Sending data to add ingredient:', requestData); // Логирование данных перед отправкой
  
      const response = await fetcher(`/api/recipes/${editingRecipe.id}/ingredients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
  
      console.log('Response from adding ingredient:', response); // Логирование ответа
  
      // Обновление ингредиентов после успешного добавления
      if (response) {
        await loadRecipeIngredients(editingRecipe.id); // Перезагрузите ингредиенты
      }
    } catch (error) {
      console.error('Error adding ingredient:', error);
    }
  };
  
  

  const loadRecipeIngredients = async (recipeId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
  
      console.log('Fetching recipe ingredients from API'); // Логирование запроса
      const data = await fetcher(`/api/recipes/${recipeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
  
      console.log('Response from loading ingredients:', data); // Логирование ответа
      // Убедитесь, что вы обновляете состояние правильно
      setEditingRecipe((prev: any) => ({
        ...prev,
        recipe_ingredients: data.recipe_ingredients || []
      }));
    } catch (error) {
      console.error('Failed to load ingredients:', error);
    }
  };
  
  

  const deleteIngredientFromRecipe = async (ingredientId: string) => {
    if (!editingRecipe || !ingredientId) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
  
      console.log('Sending request to delete ingredient by ingredientId:', { ingredientId }); // Логирование запроса
      const response = await fetcher(`/api/recipes/${editingRecipe.id}/ingredients/${ingredientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      console.log('Response from deleting ingredient:', response); // Логирование ответа
      await loadRecipeIngredients(editingRecipe.id);
    } catch (error) {
      console.error('Failed to delete ingredient from recipe:', error);
    }
  };  
  

  const handleSave = () => {
    onUpdateRecipe(editingRecipe);
    onHide(); // Закрываем модальное окно после сохранения
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Button variant="danger" onClick={onDeleteRecipe} style={{ position: 'relative', background: 'transparent', color: 'darkred' }}>
          <FaTrash />
        </Button>
        <Modal.Title>{t('editRecipe')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {editingRecipe && (
          <>
            <Form>
              <Form.Group>
                <Form.Label>{t('recipeName')}</Form.Label>
                <Form.Control
                  type="text"
                  value={editingRecipe.name}
                  onChange={(e) => setEditingRecipe({ ...editingRecipe, name: e.target.value })}
                />
              </Form.Group>
            </Form>
            <p>{t('totalCost')}: {editingRecipe.totalCost ? editingRecipe.totalCost.toFixed(2) : 'N/A'} {t('currency')}</p>

            <Form onSubmit={addIngredientToRecipe}>
              <Form.Group>
                <Form.Label>{t('chooseIngredient')}</Form.Label>
                <Select
                  value={ingredientId ? { value: ingredientId, label: ingredients.find((i: any) => i.id === parseInt(ingredientId))?.name } : null}
                  onChange={handleIngredientSelect}
                  options={ingredients ? ingredients.map((ingredient: any) => ({ value: ingredient.id, label: ingredient.name })) : []}
                  isClearable
                  placeholder={t('chooseIngredient')}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>{t('quantity')}</Form.Label>
                <Form.Control
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>{t('unit')}</Form.Label>
                <Select
                  value={unit}
                  onChange={(selectedOption) => setUnit(selectedOption || null)}
                  options={units}
                  isClearable
                  placeholder={t('chooseUnit')}
                />
              </Form.Group>
              <p
                style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                onClick={addIngredientToRecipe}
              >
                {t('addIngredient')}
              </p>
            </Form>

            <ListGroup>
              {editingRecipe.recipe_ingredients && editingRecipe.recipe_ingredients.length > 0 ? (
                editingRecipe.recipe_ingredients.map((ingredient: any, index: number) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
  {ingredient.ingredient.name} - {ingredient.quantity} {ingredient.unit} ({ingredient.ingredientCost ? parseFloat(ingredient.ingredientCost).toFixed(2) : 'N/A'} {t('currency')})
  <CloseButton onClick={() => deleteIngredientFromRecipe(ingredient.ingredient_id.toString())} />
</ListGroup.Item>

                ))
              ) : (
                <ListGroup.Item>{t('noIngredientsAvailable')}</ListGroup.Item>
              )}
            </ListGroup>
          </>
        )}
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button onClick={onCloneRecipe}>
          {t('cloneRecipe')}
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {t('save')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditRecipeModal;
