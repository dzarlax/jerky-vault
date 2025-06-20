import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, ListGroup } from 'react-bootstrap';
import { FaCalculator } from 'react-icons/fa';

interface RecipeCalculatorProps {
  show: boolean;
  onHide: () => void;
  recipe: any;
  t: (key: string) => string;
}

const RecipeCalculator: React.FC<RecipeCalculatorProps> = ({ show, onHide, recipe, t }) => {
  const [baseIngredient, setBaseIngredient] = useState<any>(null);
  const [baseWeight, setBaseWeight] = useState<string>('');
  const [calculatedIngredients, setCalculatedIngredients] = useState<any[]>([]);

  useEffect(() => {
    if (recipe && recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0) {
      const firstIngredient = recipe.recipe_ingredients[0];
      setBaseIngredient(firstIngredient);
      setBaseWeight(firstIngredient.quantity.toString());
      setCalculatedIngredients(recipe.recipe_ingredients);
    } else {
      setBaseIngredient(null);
      setBaseWeight('');
      setCalculatedIngredients([]);
    }
  }, [recipe]);

  useEffect(() => {
    if (baseIngredient && baseWeight) {
      const originalWeight = parseFloat(baseIngredient.quantity);
      const newWeight = parseFloat(baseWeight);

      if (!isNaN(originalWeight) && !isNaN(newWeight) && originalWeight > 0) {
        const ratio = newWeight / originalWeight;
        const newCalculatedIngredients = recipe.recipe_ingredients.map((ing: any) => {
          const newQuantity = parseFloat(ing.quantity) * ratio;
          return {
            ...ing,
            quantity: newQuantity.toFixed(2),
          };
        });
        setCalculatedIngredients(newCalculatedIngredients);
      }
    } else if (recipe && recipe.recipe_ingredients) {
        setCalculatedIngredients(recipe.recipe_ingredients)
    }
  }, [baseWeight, baseIngredient, recipe]);

  if (!recipe) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaCalculator className="me-2" />
          {t('recipeCalculator')} - {recipe.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {baseIngredient && (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                {t('baseIngredient')}: <strong>{baseIngredient.ingredient.name}</strong>
              </Form.Label>
              <Form.Control
                type="number"
                value={baseWeight}
                onChange={(e) => setBaseWeight(e.target.value)}
                placeholder={t('enterNewWeight')}
              />
            </Form.Group>
          </Form>
        )}
        <ListGroup>
          {calculatedIngredients.map((ing: any) => (
            <ListGroup.Item key={ing.id}>
              <div className="d-flex justify-content-between align-items-center">
                <span>{ing.ingredient.name}</span>
                <span>
                  {ing.quantity} {ing.unit}
                </span>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t('close')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RecipeCalculator; 