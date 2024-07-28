import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import fetcher from '../utils/fetcher';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { Container, Row, Col, Button, ListGroup } from 'react-bootstrap';
import Select from 'react-select';

const Home: React.FC = () => {
  const { t, lang } = useTranslation('common');
  const { data: recipeNames, error: recipeNamesError } = useSWR('/api/recipes/names', fetcher);
  const { data: ingredients, error: ingredientsError } = useSWR('/api/ingredients', fetcher);
  const [recipes, setRecipes] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [filterIngredient, setFilterIngredient] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    console.log("Router Locale: ", router.locale);
    console.log("Current Language in useEffect: ", lang);
    if (recipeNames && ingredients) {
      setIsLoading(false);
    }
  }, [recipeNames, ingredients, lang]);

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
      setRecipes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load recipes', error);
    }
  };

  const deleteRecipe = async (id: number) => {
    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        loadRecipes();
      } else {
        console.error('Failed to delete recipe');
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const handleNameChange = (selectedOption: any) => {
    setFilterName(selectedOption ? selectedOption.value : '');
  };

  const handleIngredientChange = (selectedOption: any) => {
    setFilterIngredient(selectedOption ? selectedOption.value : '');
  };

  if (isLoading || recipeNamesError || ingredientsError) return <div>{t('loading')}</div>;

  const recipeOptions = Array.isArray(recipeNames) ? recipeNames.map((recipe: any) => ({ value: recipe.name, label: recipe.name })) : [];
  const ingredientOptions = Array.isArray(ingredients) ? ingredients.map((ingredient: any) => ({ value: ingredient.name, label: ingredient.name })) : [];

  return (
    <Container>
      <h1>{t('allRecipes')}</h1>

      <Row className="filters mb-3">
        <Col>
          <Select
            value={recipeOptions.find(option => option.value === filterName) || null}
            onChange={handleNameChange}
            options={recipeOptions}
            isClearable
            placeholder={t('filterByRecipe')}
          />
        </Col>
        <Col>
          <Select
            value={ingredientOptions.find(option => option.value === filterIngredient) || null}
            onChange={handleIngredientChange}
            options={ingredientOptions}
            isClearable
            placeholder={t('filterByIngredient')}
          />
        </Col>
        <Col>
          <Button onClick={loadRecipes}>{t('applyFilters')}</Button>
        </Col>
      </Row>

      <Row>
        <Col>
          {recipes.length === 0 ? (
            <div>{t('noRecipesFound')}</div>
          ) : (
            <ListGroup>
              {recipes.map((recipe: any) => (
                <ListGroup.Item key={recipe.id}>
                  <strong>{recipe.name}</strong>
                  <Button variant="danger" className="ms-2" onClick={() => deleteRecipe(recipe.id)}>{t('delete')}</Button><br />
                  {t('totalCost')}: {parseFloat(recipe.totalCost).toFixed(2)} {t('currency')}
                  <ul>
                    {recipe.ingredients.map((ingredient: any) => (
                      <li key={`${ingredient.id}-${ingredient.name}`}>
                        {ingredient.name} - {ingredient.quantity} {ingredient.unit} ({parseFloat(ingredient.price).toFixed(2)} {t('currency')})
                      </li>
                    ))}
                  </ul>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
