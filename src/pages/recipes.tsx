import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import fetcher from '../utils/fetcher';
import useTranslation from 'next-translate/useTranslation';
import { Container, Row, Col, Button, ListGroup, Form } from 'react-bootstrap';
import Select from 'react-select';
import EditRecipeModal from '../components/modal/Recipe/EditRecipeModal';
import CreateRecipeModal from '../components/modal/Recipe/CreateRecipeModal';
import { useRouter } from 'next/router';

const Recipes: React.FC = () => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [filterName, setFilterName] = useState<string>('');
  const [filterIngredient, setFilterIngredient] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingRecipe, setEditingRecipe] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Проверка токена и перенаправление на логин, если токена нет
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/signin');
    }
  }, [router]);

  // Fetch списков рецептов и ингредиентов
  const { data: recipeNames, error: recipeNamesError } = useSWR(
    '/api/recipes',
    fetcher
  );
  const { data: ingredients, error: ingredientsError } = useSWR(
    '/api/ingredients',
    fetcher
  );

  useEffect(() => {
    if (recipeNames && ingredients) {
      setIsLoading(false);
    }
  }, [recipeNames, ingredients]);

  useEffect(() => {
    if (filterName || filterIngredient) {
      loadRecipes();
    } else {
      setRecipes(recipeNames || []);
    }
  }, [filterName, filterIngredient, recipeNames]);

  const loadRecipes = async () => {
    const query = new URLSearchParams();
    if (filterName) query.append('recipe_id', filterName); // Изменено на recipe_id
    if (filterIngredient) query.append('ingredient_id', filterIngredient); // Изменено на ingredient_id
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/signin');
        return;
      }
  
      // Используем fetcher для получения данных с авторизацией
      const response = await fetcher(`/api/recipes?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (response) {
        setRecipes(response);
      } else {
        console.error('Failed to load recipes');
      }
    } catch (error) {
      console.error('Failed to load recipes', error);
    }
  };  

  const deleteRecipe = async () => {
    if (!editingRecipe) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/signin');
        return;
      }

      const response = await fetcher(`/api/recipes/${editingRecipe.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response) {
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
  
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/signin');
      return;
    }
  
    // Инициализация поля recipe_ingredients как пустого массива, если оно отсутствует
    const recipeIngredients = editingRecipe.recipe_ingredients || []; 
  
    if (!Array.isArray(recipeIngredients)) {
      console.error('recipe_ingredients is not an array:', recipeIngredients);
      return;
    }
  
    // Создаем копию рецепта с новым именем
    const response = await fetcher('/api/recipes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: `${editingRecipe.name} (Copy)`, ingredients: [] }),
    });
  
    if (response) {
      const newRecipe = response;
  
      // Добавляем ингредиенты в новый рецепт
      for (const ingredient of recipeIngredients) {
        if (ingredient.ingredient_id) {  // Используем правильный идентификатор ингредиента
          await fetcher(`/api/recipes/${newRecipe.id}/ingredients`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ingredient_id: ingredient.ingredient_id,  // Используем поле ingredient_id
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
    } else {
      console.error('Failed to clone recipe');
    }
  };

  const handleCreateRecipe = async (name: string, ingredients: any[]) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/signin');
        return;
      }

      const response = await fetcher('/api/recipes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (response) {
        const createdRecipe = response;
        const recipeId = createdRecipe.id;

        for (const ingredient of ingredients) {
          const ingredientResponse = await fetcher(`/api/recipes/${recipeId}/ingredients`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ingredient_id: ingredient.id,
              quantity: ingredient.quantity,
              unit: ingredient.unit.value,
            }),
          });

          if (!ingredientResponse) {
            console.error('Failed to add ingredient:', ingredient.name);
            return;
          }
        }

        loadRecipes();
      } else {
        console.error('Failed to create recipe');
      }
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
                    filterName
                      ? { value: filterName, label: recipeNames.find((recipe: any) => recipe.id === parseInt(filterName))?.name }
                      : null
                  }
                  onChange={(selectedOption: any) => setFilterName(selectedOption ? selectedOption.value : '')}
                  options={
                    recipeNames
                      ? recipeNames.map((recipeName: any) => ({
                          value: recipeName.id,  // Используем ID
                          label: recipeName.name, // Отображаем имя
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
                      ? { value: filterIngredient, label: ingredients.find((ingredient: any) => ingredient.id === parseInt(filterIngredient))?.name }
                      : null
                  }
                  onChange={(selectedOption: any) => setFilterIngredient(selectedOption ? selectedOption.value : '')}
                  options={
                    ingredients
                      ? ingredients.map((ingredient: any) => ({
                          value: ingredient.id,  // Используем ID
                          label: ingredient.name, // Отображаем имя
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
              {recipes.length > 0 ? (
                recipes.map((recipe) => (
                  <ListGroup.Item key={recipe.id}>
                    <h3>{recipe.name}</h3>
                    <p>
                      {t("totalCost")}: {recipe.total_cost ? recipe.total_cost.toFixed(2) : 'N/A'} {t("currency")}
                    </p>
                    <ListGroup>
                      {recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 ? (
                        recipe.recipe_ingredients.map((ri: any) => (
                          <ListGroup.Item key={ri.id}>
                            {ri.ingredient.name} - {ri.quantity} {ri.unit} (
                            {ri.ingredient.prices && ri.ingredient.prices.length > 0
                              ? parseFloat(ri.ingredient.prices[0].price).toFixed(2)
                              : 'N/A'} {t("currency")})
                          </ListGroup.Item>
                        ))
                      ) : (
                        <ListGroup.Item>{t("noIngredientsAvailable")}</ListGroup.Item>
                      )}
                    </ListGroup>
                    <Button onClick={() => {
                      setEditingRecipe(recipe);
                      setShowModal(true);
                    }}>
                      {t("edit")}
                    </Button>
                  </ListGroup.Item>
                ))
              ) : (
                <p>{t("noRecipesFound")}</p>
              )}
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
