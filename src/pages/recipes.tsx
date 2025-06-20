import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import fetcher from '../utils/fetcher';
import useTranslation from 'next-translate/useTranslation';
import { Container, Row, Col, Button, ListGroup, Form } from 'react-bootstrap';
import Select from 'react-select';
import EditRecipeModal from '../components/modal/Recipe/EditRecipeModal';
import CreateRecipeModal from '../components/modal/Recipe/CreateRecipeModal';
import RecipeCalculator from '../components/calculator/RecipeCalculator';
import { useRouter } from 'next/router';
import { useAuth, withAuth } from '../utils/authContext';
import { FaPlus, FaUtensils, FaFilter, FaTimes, FaCalculator } from 'react-icons/fa';

const Recipes: React.FC = () => {
  const { auth } = useAuth();
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [filterName, setFilterName] = useState<string>('');
  const [filterIngredient, setFilterIngredient] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingRecipe, setEditingRecipe] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [calculatorRecipe, setCalculatorRecipe] = useState<any>(null);

  // Проверка аутентификации и перенаправление на логин, если пользователь не аутентифицирован
  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [auth.isAuthenticated, router]);

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
    if (filterName) query.append('recipe_id', filterName);
    if (filterIngredient) query.append('ingredient_id', filterIngredient);
  
    try {
      if (!auth.isAuthenticated || !auth.token) {
        router.push('/auth/signin');
        return;
      }
  
      // Используем fetcher для получения данных с авторизацией
      const response = await fetcher(`/api/recipes?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
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
      if (!auth.isAuthenticated || !auth.token) {
        router.push('/auth/signin');
        return;
      }

      const response = await fetcher(`/api/recipes/${editingRecipe.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
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
  
    if (!auth.isAuthenticated || !auth.token) {
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
        'Authorization': `Bearer ${auth.token}`,
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
              'Authorization': `Bearer ${auth.token}`,
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
      if (!auth.isAuthenticated || !auth.token) {
        router.push('/auth/signin');
        return;
      }

      const response = await fetcher('/api/recipes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
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
              'Authorization': `Bearer ${auth.token}`,
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

  const clearFilters = () => {
    setFilterName('');
    setFilterIngredient('');
  };

  const hasActiveFilters = filterName || filterIngredient;

  return (
    <div className="p-0">
      <div className="recipes-header d-flex flex-column flex-md-row justify-content-between align-items-md-center p-3 p-md-4 border-bottom bg-light">
        <div className="header-content">
          <h1 className="mb-2 text-primary">
            <FaUtensils className="me-2" />
            {t('recipes')}
          </h1>
          <div className="stats-summary d-flex flex-wrap gap-2">
            <span className="badge bg-primary">
              {t('total')}: {recipes?.length || 0}
            </span>
            {hasActiveFilters && (
              <span className="badge bg-warning">
                {t('filtered')}
              </span>
            )}
          </div>
        </div>
        <div className="action-buttons d-flex gap-2">
          <Button 
            variant="primary" 
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus className="me-2" /> 
            {t('addRecipe')}
          </Button>
        </div>
      </div>
      <div className="recipes-content p-3 p-md-4">

        <div className="filter-section mb-4 p-4 rounded shadow-sm bg-light border">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="mb-0 text-primary">
              <FaFilter className="me-2" />
              {t('filterRecipes')}
            </h5>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
            >
              <FaTimes className="me-1" />
              {t('clearFilters')}
            </Button>
          </div>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label className="fw-semibold">{t('filterByRecipe')}</Form.Label>
              <Form.Group>
                <Select
                  value={
                    filterName
                      ? { value: filterName, label: recipeNames?.find((recipe: any) => recipe.id === parseInt(filterName))?.name }
                      : null
                  }
                  onChange={(selectedOption: any) => setFilterName(selectedOption ? selectedOption.value : '')}
                  options={
                    recipeNames
                      ? recipeNames.map((recipeName: any) => ({
                          value: recipeName.id,
                          label: recipeName.name,
                        }))
                      : []
                  }
                  isClearable
                  placeholder={t('recipeName')}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Label className="fw-semibold">{t('filterByIngredient')}</Form.Label>
              <Form.Group>
                <Select
                  value={
                    filterIngredient
                      ? { value: filterIngredient, label: ingredients?.find((ingredient: any) => ingredient.id === parseInt(filterIngredient))?.name }
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
                  placeholder={t('ingredientName')}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </Form.Group>
            </Col>
          </Row>
        </div>
          {isLoading ? (
            <p>{t("loading")}</p>
          ) : (
            <div className="recipe-grid">
              {recipes.length > 0 ? (
                recipes.map((recipe) => (
                  <div key={recipe.id} className="recipe-card">
                    <div className="recipe-card-header">
                      <h3 className="recipe-card-title">{recipe.name}</h3>
                      <div className="recipe-card-cost">
                        <span className="recipe-cost-label">{t("totalCost")}:</span>
                        <span className="recipe-cost-value">{recipe.total_cost ? recipe.total_cost.toFixed(2) : 'N/A'} {t("currency")}</span>
                      </div>
                    </div>
                    <div className="recipe-card-body">
                      <div className="recipe-ingredients-list">
                        {recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 ? (
                          recipe.recipe_ingredients.map((ri: any) => (
                            <div key={ri.id} className="recipe-ingredient-item">
                              <div className="ingredient-name">{ri.ingredient.name}</div>
                              <div className="ingredient-details">
                                <span className="ingredient-quantity">{ri.quantity} {ri.unit}</span>
                                <span className="ingredient-price">
                                  ({ri.calculated_cost 
                                    ? parseFloat(ri.calculated_cost).toFixed(2)
                                    : 'N/A'} {t("currency")})
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-ingredients">{t("noIngredientsAvailable")}</div>
                        )}
                      </div>
                    </div>
                    <div className="recipe-card-footer">
                      <div className="d-flex justify-content-between">
                        <Button 
                          variant="outline-success" 
                          size="sm" 
                          onClick={() => {
                            setCalculatorRecipe(recipe);
                            setShowCalculator(true);
                          }}
                          title={t("calculate")}
                        >
                          <FaCalculator />
                        </Button>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => {
                            setEditingRecipe(recipe);
                            setShowModal(true);
                          }}
                        >
                          {t("edit")}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-recipes-message">
                  <p>{t("noRecipesFound")}</p>
                </div>
              )}
            </div>
          )}
        </div>

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

      <RecipeCalculator
        show={showCalculator}
        onHide={() => setShowCalculator(false)}
        recipe={calculatorRecipe}
        t={t}
      />
    </div>
  );
};

export default withAuth(Recipes);
