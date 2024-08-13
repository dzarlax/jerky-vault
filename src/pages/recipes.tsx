import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import fetcher from '../utils/fetcher';
import useTranslation from 'next-translate/useTranslation';
import { Container, Row, Col, Button, ListGroup, Form } from 'react-bootstrap';
import Select from 'react-select';
import EditRecipeModal from '../components/modal/Recipe/EditRecipeModal';
import CreateRecipeModal from '../components/modal/Recipe/CreateRecipeModal';

const Recipes: React.FC = () => {
  const { t, lang } = useTranslation('common');
  const { data: recipeNames, error: recipeNamesError } = useSWR('/api/recipes/names', fetcher);
  const { data: ingredients, error: ingredientsError } = useSWR('/api/ingredients', fetcher);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [filterName, setFilterName] = useState<string>('');
  const [filterIngredient, setFilterIngredient] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingRecipe, setEditingRecipe] = useState<any>(null);

  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  useEffect(() => {
    if (recipeNames && ingredients) {
      setIsLoading(false);
    }
  }, [recipeNames, ingredients]);

  useEffect(() => {
    loadRecipes();
  }, [filterName, filterIngredient]);

  const loadRecipes = async () => {
    const query = new URLSearchParams();
    if (filterName) query.append('name', filterName);
    if (filterIngredient) query.append('ingredient', filterIngredient);

    try {
      const response = await fetch(`/api/recipes/list?${query.toString()}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        const recipesWithCost = data.map(recipe => {
          const totalCost = recipe.totalCost;
          return { ...recipe, totalCost };
        });
        setRecipes(recipesWithCost);
      } else {
        setRecipes([]);
      }
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
        setShowModal(false);
      } else {
        console.error('Failed to delete recipe');
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
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
    setShowModal(false);
  };

  const handleCreateRecipe = async (name: string, ingredients: any[]) => {
    try {
      const response = await fetch('/api/recipes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        console.error('Failed to create recipe');
        return;
      }

      const createdRecipe = await response.json();
      const recipeId = createdRecipe.id;

      for (const ingredient of ingredients) {
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

      loadRecipes();
    } catch (error) {
      console.error('Error creating recipe or adding ingredients:', error);
    }
  };

  return (
    <Container>
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1>{t("recipes")}</h1>
            <Button onClick={() => setShowCreateModal(true)}>
              {t("addRecipe")}
            </Button>
          </div>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t("filterByRecipe")}</Form.Label>
                <Select
                  value={
                    filterName ? { value: filterName, label: filterName } : null
                  }
                  onChange={(selectedOption: any) => setFilterName(selectedOption ? selectedOption.label : '')}
                  options={
                    recipeNames
                      ? recipeNames.map((recipeName: any) => ({
                        value: recipeName.id,
                        label: recipeName.name,
                      }))
                    : []
                }
                  isClearable
                  placeholder={t("recipeName")}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t("filterByIngredient")}</Form.Label>
                <Select
                  value={
                    filterIngredient
                      ? { value: filterIngredient, label: filterIngredient }
                      : null
                  }
                  onChange={(selectedOption: any) => setFilterIngredient(selectedOption ? selectedOption.value : '')}
                  options={
                    ingredients
                      ? ingredients.map((ingredient: any) => ({
                          value: ingredient.id,
                          label: ingredient.name,
                        }))
                      : []
                  }
                  isClearable
                  placeholder={t("ingredientName")}
                />
              </Form.Group>
            </Col>
          </Row>
          {isLoading ? (
            <p>{t("loading")}</p>
          ) : (
            <ListGroup>
              {recipes.map((recipe) => (
                <ListGroup.Item key={recipe.id}>
                  <h3>{recipe.name}</h3>
                  <p>
                    {t("totalCost")}: {recipe.totalCost.toFixed(2)}{" "}
                    {t("currency")}
                  </p>
                  <ListGroup>
                    {recipe.ingredients.map((ingredient: any) => (
                      <li key={`${ingredient.id}-${ingredient.name}`}>
                        {ingredient.name} - {ingredient.quantity}{" "}
                        {t(ingredient.unit)} (
                        {parseFloat(ingredient.ingredientCost).toFixed(2)}{" "}
                        {t("currency")})
                      </li>
                    ))}
                  </ListGroup>
                  <Button onClick={() => {
                    setEditingRecipe(recipe);
                    setShowModal(true);
                  }}>
                    {t("edit")}
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </Row>

      <EditRecipeModal
        show={showModal}
        onHide={() => setShowModal(false)}
        recipe={editingRecipe}
        ingredients={ingredients}
        t={t}
        onDeleteRecipe={deleteRecipe}
        onCloneRecipe={cloneRecipe}
        onUpdateRecipe={loadRecipes}
      />

      <CreateRecipeModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        ingredients={ingredients}
        t={t}
        onCreateRecipe={handleCreateRecipe}
      />
    </Container>
  );
};

export default Recipes;
