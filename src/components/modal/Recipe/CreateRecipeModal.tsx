import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, CloseButton } from 'react-bootstrap';
import { useAuth } from '../../../utils/authContext';
import { Ingredient } from '../../../types/api';
import SelectDropdown from '../../../components/SelectDropdown';

const CreateRecipeModal = ({ show, onHide, ingredients, t, onCreateRecipe }) => {
  const { auth } = useAuth();
  const [newRecipeName, setNewRecipeName] = useState<string>('');
  const [newIngredients, setNewIngredients] = useState<Array<{
    id: number;
    name: string;
    quantity: string;
    unit: { value: string; label: string };
  }>>([]);
  const [newIngredientId, setNewIngredientId] = useState<string>('');
  const [newQuantity, setNewQuantity] = useState<string>('');
  const [newUnit, setNewUnit] = useState<{ value: string, label: string } | null>(null);
  const [newUnits, setNewUnits] = useState<{ value: string, label: string }[]>([]);

  useEffect(() => {
    if (newIngredientId) {
      updateNewUnits();
    }
  }, [newIngredientId]);

  const updateNewUnits = () => {
    const selectedIngredient = ingredients.find((ingredient: Ingredient) => ingredient.id === parseInt(newIngredientId));
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
    setNewUnits(units.map(unit => ({ value: unit, label: t(unit) })));
    setNewUnit(units[0] ? { value: units[0], label: t(units[0]) } : null);
  };

  const handleIngredientSelect = (selectedOption: { value: string; label: string } | null) => {
    setNewIngredientId(selectedOption ? selectedOption.value : '');
  };

  const addNewIngredient = () => {
    const selectedIngredient = ingredients.find((ingredient: Ingredient) => ingredient.id === parseInt(newIngredientId));
    if (!selectedIngredient || !newUnit || !newQuantity.trim()) return;

    // Check if ingredient already exists in the recipe
    const existingIngredient = newIngredients.find(ing => ing.id === selectedIngredient.id);
    if (existingIngredient) {
      alert(t('ingredientAlreadyExists'));
      return;
    }

    setNewIngredients([...newIngredients, {
      id: selectedIngredient.id,
      name: selectedIngredient.name,
      quantity: newQuantity.trim(),
      unit: newUnit
    }]);
    
    // Clear form
    setNewIngredientId('');
    setNewQuantity('');
    setNewUnit(null);
    setNewUnits([]);
  };

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRecipeName.trim()) {
      alert(t('recipeNameRequired'));
      return;
    }
    
    if (newIngredients.length === 0) {
      alert(t('atLeastOneIngredientRequired'));
      return;
    }

    await onCreateRecipe(newRecipeName, newIngredients);
    onHide(); // Закрыть модалку после успешного создания
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title className="h4 text-center">{t('addRecipe')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleCreateRecipe}>
          <Form.Group>
            <Form.Label>{t('recipeName')}</Form.Label>
            <Form.Control
              type="text"
              value={newRecipeName}
              onChange={(e) => setNewRecipeName(e.target.value)}
            />
          </Form.Group>
          <SelectDropdown
            value={newIngredientId ? { value: newIngredientId, label: ingredients.find((i: Ingredient) => i.id === parseInt(newIngredientId))?.name } : null}
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
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
            />
          </Form.Group>
          <SelectDropdown
            value={newUnit}
            onChange={(selectedOption) => setNewUnit(selectedOption || null)}
            options={newUnits}
            isClearable
            placeholder={t('chooseUnit')}
            label={t('unit')}
          />
          <div className="d-flex justify-content-end mt-3">
            <Button 
              type="button"
              variant="outline-primary" 
              size="sm"
              onClick={addNewIngredient}
              disabled={!newIngredientId || !newQuantity || !newUnit}
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
        {newIngredients.length > 0 && (
          <div className="mt-3">
            <h6 className="text-muted mb-2">{t('ingredientsInRecipe')} ({newIngredients.length})</h6>
            <ListGroup style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {newIngredients.map((ingredient, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center py-2">
                  <div className="d-flex align-items-center">
                    <span className="me-2">🥄</span>
                    <div>
                      <strong>{ingredient.name}</strong>
                      <div className="text-muted small">
                        {ingredient.quantity} {t(ingredient.unit.value)}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={() => setNewIngredients(newIngredients.filter((_, i) => i !== index))}
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
        )}
        
        {newIngredients.length === 0 && (
          <div className="text-center py-3 mt-3 bg-light rounded">
            <div className="text-muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="mb-2" viewBox="0 0 16 16">
                <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4h-3.5zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5z"/>
              </svg>
              <p className="mb-0 small">{t('noIngredientsAddedYet')}</p>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleCreateRecipe}>
          {t('save')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateRecipeModal;
