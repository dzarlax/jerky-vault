import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, CloseButton } from 'react-bootstrap';
import Select from 'react-select';
import { FaTrash } from 'react-icons/fa';

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

        await loadRecipeIngredients(editingRecipe.id);
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
        <Button variant="danger" onClick={onDeleteRecipe} style={{ position: 'relative',background: 'transparent', color:'darkred' }}>
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
            <p>{t('totalCost')}: {(editingRecipe.totalCost).toFixed(2)} {t('currency')}</p>

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
              {editingRecipe.ingredients.map((ingredient: any, index: number) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                  {ingredient.name} - {ingredient.quantity} {t(ingredient.unit)}({parseFloat(ingredient.ingredientCost).toFixed(2)} {t('currency')})
                  <CloseButton onClick={() => deleteIngredientFromRecipe(ingredient.id)} />
                </ListGroup.Item>
              ))}
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
