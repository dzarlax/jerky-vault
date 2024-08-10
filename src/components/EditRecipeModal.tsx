import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup } from 'react-bootstrap';
import Select from 'react-select';

const EditRecipeModal = ({ show, onHide, recipe, ingredients, t, onDeleteRecipe, onCloneRecipe, onUpdateRecipe }) => {
  const [ingredientId, setIngredientId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState<{ value: string, label: string } | null>(null);
  const [units, setUnits] = useState<{ value: string, label: string }[]>([]);
  const [showIngredientForm, setShowIngredientForm] = useState<boolean>(false);
  const [editingRecipe, setEditingRecipe] = useState(recipe);

  useEffect(() => {
    if (recipe) {
      setEditingRecipe(recipe);
      setIngredientId('');
      setQuantity('');
      setUnit(null);
      setShowIngredientForm(false);
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

    console.log('Adding ingredient with data:', {
        recipe_id: editingRecipe.id,
        ingredient_id: ingredientId,
        quantity,
        unit: unit ? unit.value : ''
    });

    try {
        // Если `onUpdateRecipe` возвращает ответ от сервера, проверяем его
        const response = await fetch('/api/recipes/recipe_ingredients', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recipe_id: editingRecipe.id,
                ingredient_id: ingredientId,
                quantity,
                unit: unit ? unit.value : ''
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to add ingredient');
        }

        console.log('Response from server:', await response.json());

        // Обновляем состояние `editingRecipe`
        await loadRecipeIngredients(editingRecipe.id);
        setShowIngredientForm(false);
    } catch (error) {
        console.error('Error adding ingredient:', error);
    }
};


  const loadRecipeIngredients = async (recipeId: string) => {
    try {
        const response = await fetch(`/api/recipes/${recipeId}`);
        const data = await response.json();
        setEditingRecipe((prev: any) => ({ ...prev, ingredients: data.ingredients }));
    } catch (error) {
        console.error('Failed to load ingredients:', error);
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
        // Обновляем состояние `editingRecipe`
        await loadRecipeIngredients(editingRecipe.id);
    } catch (error) {
        console.error('Failed to delete ingredient from recipe:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{t('editRecipe')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {editingRecipe && (
          <>
            <h4>{editingRecipe.name}</h4>
            <p>{t('totalCost')}: {(editingRecipe.totalCost).toFixed(2)} {t('currency')}</p>
            <Button onClick={onCloneRecipe}>{t('cloneRecipe')}</Button>
            <Button onClick={onDeleteRecipe} variant="danger">{t('deleteRecipe')}</Button>
            <Button onClick={() => setShowIngredientForm(!showIngredientForm)}>
              {showIngredientForm ? t('hideIngredientForm') : t('showIngredientForm')}
            </Button>

            {showIngredientForm && (
              <Form onSubmit={addIngredientToRecipe}>
                <Form.Group>
                  <Form.Label>{t('selectIngredient')}</Form.Label>
                  <Select
                    value={ingredientId ? { value: ingredientId, label: ingredients.find((i: any) => i.id === parseInt(ingredientId))?.name } : null}
                    onChange={handleIngredientSelect}
                    options={ingredients ? ingredients.map((ingredient: any) => ({ value: ingredient.id, label: ingredient.name })) : []}
                    isClearable
                    placeholder={t('selectIngredient')}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>{t('quantity')}</Form.Label>
                  <Form.Control
                    type="number"
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
                <Button type="submit">{t('addIngredient')}</Button>
              </Form>
            )}

            <ListGroup>
              {editingRecipe.ingredients.map((ingredient: any) => (
                <ListGroup.Item key={ingredient.id}>
                  {ingredient.name} - {ingredient.quantity} {t(ingredient.unit)}({parseFloat(ingredient.ingredientCost).toFixed(2)} {t('currency')})
                  <Button onClick={() => deleteIngredientFromRecipe(ingredient.id)} variant="danger">{t('delete')}</Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t('close')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditRecipeModal;
