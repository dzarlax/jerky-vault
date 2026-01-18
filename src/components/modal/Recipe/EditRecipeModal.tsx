import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, CloseButton } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import fetcher from '../../../utils/fetcher';
import { useAuth } from '../../../utils/authContext';
import { Ingredient, Recipe } from '../../../types/api';
import SelectDropdown from '../../../components/SelectDropdown';

const EditRecipeModal = ({ show, onHide, recipe, ingredients, t, onDeleteRecipe, onCloneRecipe, onUpdateRecipe }) => {
  const { auth } = useAuth();
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
    const selectedIngredient = ingredients.find((ingredient: Ingredient) => ingredient.id === parseInt(ingredientId));
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

  const handleIngredientSelect = (selectedOption: { value: string; label: string } | null) => {
    setIngredientId(selectedOption ? selectedOption.value : '');
  };

  const addIngredientToRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!ingredientId || !quantity.trim() || !unit) {
      alert(t('fillRequiredFields'));
      return;
    }

    // Check if ingredient already exists in the recipe
    const existingIngredient = editingRecipe.recipe_ingredients?.find(
      (ing: { ingredient_id: number }) => ing.ingredient_id === parseInt(ingredientId, 10)
    );
    if (existingIngredient) {
      alert(t('ingredientAlreadyExists'));
      return;
    }
  
    try {
      if (!auth.isAuthenticated || !auth.token) {
        alert(t('authenticationFailed'));
        return;
      }
  
      const requestData = {
        ingredient_id: parseInt(ingredientId, 10),
        quantity: quantity.trim(),
        unit: unit.value
      };
  
      const response = await fetcher(`/api/recipes/${editingRecipe.id}/ingredients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
  
      // Обновление ингредиентов после успешного добавления
      if (response) {
        await loadRecipeIngredients(editingRecipe.id);
        // Clear form after successful addition
        setIngredientId('');
        setQuantity('');
        setUnit(null);
        setUnits([]);
      }
    } catch (error) {
      alert(t('errorOccurred'));
    }
  };
  
  

  const loadRecipeIngredients = async (recipeId: string) => {
    try {
      if (!auth.isAuthenticated || !auth.token) {
        return;
      }

      const data = await fetcher(`/api/recipes/${recipeId}`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
        }
      });

      // Убедитесь, что вы обновляете состояние правильно
      setEditingRecipe((prev: Recipe) => ({
        ...prev,
        recipe_ingredients: data.recipe_ingredients || []
      }));
    } catch (error) {
      // Error handled by parent
    }
  };
  
  

  const deleteIngredientFromRecipe = async (ingredientId: string) => {
    if (!editingRecipe || !ingredientId) return;
    try {
      if (!auth.isAuthenticated || !auth.token) {
        return;
      }

      const response = await fetcher(`/api/recipes/${editingRecipe.id}/ingredients/${ingredientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });

      await loadRecipeIngredients(editingRecipe.id);
    } catch (error) {
      // Error handled by parent
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
              <SelectDropdown
                value={ingredientId ? { value: ingredientId, label: ingredients.find((i: Ingredient) => i.id === parseInt(ingredientId))?.name } : null}
                onChange={handleIngredientSelect}
                options={ingredients ? ingredients.map((ingredient: Ingredient) => ({ value: ingredient.id, label: ingredient.name })) : []}
                isClearable
                placeholder={t('chooseIngredient')}
                label={t('chooseIngredient')}
              />
              <Form.Group>
                <Form.Label>{t('quantity')}</Form.Label>
                <Form.Control
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </Form.Group>
              <SelectDropdown
                value={unit}
                onChange={(selectedOption) => setUnit(selectedOption || null)}
                options={units}
                isClearable
                placeholder={t('chooseUnit')}
                label={t('unit')}
              />
              <div className="d-flex justify-content-end mt-3">
                <Button 
                  type="button"
                  variant="outline-primary" 
                  size="sm"
                  onClick={addIngredientToRecipe}
                  disabled={!ingredientId || !quantity || !unit}
                  className="d-flex align-items-center add-ingredient-button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                  </svg>
                  {t('addIngredient')}
                </Button>
              </div>
            </Form>

            {editingRecipe.recipe_ingredients && editingRecipe.recipe_ingredients.length > 0 ? (
              <div className="mt-3">
                <h6 className="text-muted mb-2">{t('ingredientsInRecipe')} ({editingRecipe.recipe_ingredients.length})</h6>
                <ListGroup style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {editingRecipe.recipe_ingredients.map((ingredient: { ingredient_id: number; quantity: string; unit: string; ingredient: { name: string }; ingredientCost?: string }, index: number) => (
                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center py-2">
                      <div className="d-flex align-items-center">
                        <span className="me-2">🥄</span>
                        <div>
                          <strong>{ingredient.ingredient.name}</strong>
                          <div className="text-muted small">
                            {ingredient.quantity} {ingredient.unit}
                            {ingredient.ingredientCost && (
                              <span className="ms-2 text-success">
                                ({parseFloat(ingredient.ingredientCost).toFixed(2)} {t('currency')})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => deleteIngredientFromRecipe(ingredient.ingredient_id.toString())}
                        className="btn-icon-small"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                          <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            ) : (
              <div className="text-center py-3 mt-3 bg-light rounded">
                <div className="text-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="mb-2" viewBox="0 0 16 16">
                    <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z"/>
                  </svg>
                  <p className="mb-0 small">{t('noIngredientsInRecipe')}</p>
                </div>
              </div>
            )}
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
