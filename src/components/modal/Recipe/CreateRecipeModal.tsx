import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, CloseButton } from 'react-bootstrap';
import Select from 'react-select';

const CreateRecipeModal = ({ show, onHide, ingredients, t, onCreateRecipe }) => {
  const [newRecipeName, setNewRecipeName] = useState<string>('');
  const [newIngredients, setNewIngredients] = useState<any[]>([]);
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
    const selectedIngredient = ingredients.find((ingredient: any) => ingredient.id === parseInt(newIngredientId));
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

  const handleIngredientSelect = (selectedOption: any) => {
    setNewIngredientId(selectedOption ? selectedOption.value : '');
  };

  const addNewIngredient = () => {
    const selectedIngredient = ingredients.find((ingredient: any) => ingredient.id === parseInt(newIngredientId));
    if (!selectedIngredient || !newUnit) return;

    setNewIngredients([...newIngredients, {
      id: selectedIngredient.id,
      name: selectedIngredient.name,
      quantity: newQuantity,
      unit: newUnit
    }]);
    setNewIngredientId('');
    setNewQuantity('');
    setNewUnit(null);
  };

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newIngredients.length === 0) {
      console.error('No ingredients added');
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
          <Form.Group>
            <Form.Label>{t('chooseIngredient')}</Form.Label>
            <Select
              value={newIngredientId ? { value: newIngredientId, label: ingredients.find((i: any) => i.id === parseInt(newIngredientId))?.name } : null}
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
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>{t('unit')}</Form.Label>
            <Select
              value={newUnit}
              onChange={(selectedOption) => setNewUnit(selectedOption || null)}
              options={newUnits}
              isClearable
              placeholder={t('chooseUnit')}
            />
          </Form.Group>
          <p 
            style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }} 
            onClick={addNewIngredient}
          >
            {t('addIngredient')}
          </p>
        </Form>
        <ListGroup>
          {newIngredients.map((ingredient, index) => (
            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
              {ingredient.name} - {ingredient.quantity} {t(ingredient.unit.value)}
              <CloseButton onClick={() => setNewIngredients(newIngredients.filter((_, i) => i !== index))} />
            </ListGroup.Item>
          ))}
        </ListGroup>
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
