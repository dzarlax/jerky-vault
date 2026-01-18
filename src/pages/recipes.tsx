import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import fetcher from '../utils/fetcher';
import useTranslation from 'next-translate/useTranslation';
import { Container, Row, Col, Button, ListGroup, Form } from 'react-bootstrap';
import EditRecipeModal from '../components/modal/Recipe/EditRecipeModal';
import CreateRecipeModal from '../components/modal/Recipe/CreateRecipeModal';
import RecipeCalculator from '../components/calculator/RecipeCalculator';
import RecipeCardSkeleton from '../components/skeletons/RecipeCardSkeleton';
import EmptyState from '../components/EmptyState';
import { useRouter } from 'next/router';
import { useAuth, withAuth } from '../utils/authContext';
import { useNotification } from '../hooks/useNotification';
import { FaPlus, FaUtensils, FaFilter, FaTimes, FaCalculator, FaEdit } from 'react-icons/fa';
import SelectDropdown from '../components/SelectDropdown';

const Recipes: React.FC = () => {
  const { auth } = useAuth();
  const { t, lang } = useTranslation('common');
  const { success, error: showError } = useNotification();
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
    auth.isAuthenticated ? '/api/recipes' : null,
    fetcher
  );
  const { data: ingredients, error: ingredientsError } = useSWR(
    auth.isAuthenticated ? '/api/ingredients' : null,
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
        showError(t('failedToLoadRecipes'));
      }
    } catch (error) {
      showError(t('failedToLoadRecipes'));
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
        success(t('recipeDeleted'));
      } else {
        showError(t('failedToDeleteRecipe'));
      }
    } catch (error) {
      showError(t('failedToDeleteRecipe'));
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
      showError(t('invalidRecipeFormat'));
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
          console.warn('Missing ingredient ID:', ingredient);
        }
      }

      loadRecipes();
      setShowModal(false);
      success(t('recipeCloned'));
    } else {
      showError(t('failedToCloneRecipe'));
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
            showError(t('failedToAddIngredient'));
            return;
          }
        }

        loadRecipes();
        setShowCreateModal(false);
        success(t('recipeCreated'));
      } else {
        showError(t('failedToCreateRecipe'));
      }
    } catch (error) {
      showError(t('failedToCreateRecipe'));
    }
  };

  const clearFilters = () => {
    setFilterName('');
    setFilterIngredient('');
  };

  const hasActiveFilters = filterName || filterIngredient;

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title d-flex align-items-center gap-3">
            <FaUtensils className="text-primary" />
            {t('recipes')}
          </h1>
          <div className="page-subtitle">
            Total: {recipes?.length || 0} recipes
            {hasActiveFilters && (
              <span className="text-tertiary"> • filtered</span>
            )}
          </div>
        </div>
        <Button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus className="me-2" />
          {t('addRecipe')}
        </Button>
      </div>

      {/* Filter Section */}
      <div className="filter-bar">
        <div className="filter-group">
          <SelectDropdown
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
            label="Recipe"
          />
        </div>
        <div className="filter-group">
          <SelectDropdown
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
            label="Ingredient"
          />
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={clearFilters}
            className="ms-auto"
          >
            <FaTimes className="me-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Recipes Grid */}
      {isLoading ? (
        <div className="recipe-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <RecipeCardSkeleton key={index} />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <EmptyState
          type="recipes"
          message={hasActiveFilters ? t('noRecipesFound') : t('noRecipes')}
          actionLabel={t('addRecipe')}
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="recipe-grid">
          {recipes.map((recipe) => (
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
                  <div className="d-flex justify-content-start gap-2">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setCalculatorRecipe(recipe);
                        setShowCalculator(true);
                      }}
                      title={t("calculate")}
                    >
                      <FaCalculator size={14} />
                    </button>
                    <div className="ms-auto">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setEditingRecipe(recipe);
                          setShowModal(true);
                        }}
                        title={t("edit")}
                      >
                        <FaEdit size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

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
