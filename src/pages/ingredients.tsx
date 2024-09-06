import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { Container, Form, Button, ListGroup, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import useTranslation from 'next-translate/useTranslation';
import fetcher from '../utils/fetcher'; // Импорт фетчера из папки utils
import { useRouter } from 'next/router';


interface Ingredient {
  id: number;
  name: string;
  type: string; // Добавляем тип
}

const Ingredients: React.FC = () => {
  const { data: ingredients, error, mutate } = useSWR<Ingredient[]>('/api/ingredients', fetcher);
  const { t } = useTranslation('common');
  const [ingredientType, setIngredientType] = useState('');
  const [ingredientName, setIngredientName] = useState('');
  const [filter, setFilter] = useState('');
  const router = useRouter();
    // Проверка токена и перенаправление на логин, если токена нет
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/signin');
    }
  }, [router]);
  const ingredientTypeOptions = [
    { value: 'base', label: t('base') },
    { value: 'spice', label: t('spice') },
    { value: 'sauce', label: t('sauce') },
    // Add more types as needed
  ];

  const addIngredient = async (e: React.FormEvent) => {
    e.preventDefault();

    // Проверка на уникальность имени
    if (ingredients?.find((ingredient) => ingredient.name.toLowerCase() === ingredientName.toLowerCase())) {
      alert(t('ingredientExists'));
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/signin');
        return;
      }
    await fetcher('/api/ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ type: ingredientType, name: ingredientName }),
    });

    setIngredientType('');
    setIngredientName('');
    mutate(); // Обновление списка ингредиентов
  } catch (error) {
    console.error('Failed to load recipes', error);
  }
  };

  if (error) return <div>{t('failedToLoad')}</div>;
  if (!ingredients) return <div>{t('loading')}</div>;

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Container>
      <h1>{t('ingredients')}</h1>

      <Form className="mb-4" onSubmit={addIngredient}>
        <Row>
          <Col>
            <Form.Group controlId="ingredientType">
              <Select
                value={ingredientTypeOptions.find(option => option.value === ingredientType) || null}
                onChange={(option) => setIngredientType(option ? option.value : '')}
                options={ingredientTypeOptions}
                isClearable
                placeholder={t('chooseType')}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="ingredientName">
              <Form.Control
                type="text"
                placeholder={t('ingredientName')}
                value={ingredientName}
                onChange={(e) => setIngredientName(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col xs="auto">
            <Button variant="primary" type="submit">{t('addIngredient')}</Button>
          </Col>
        </Row>
      </Form>

      <Form.Group controlId="filter">
        <Form.Control
          type="text"
          placeholder={t('filterIngredients')}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </Form.Group>

      <ListGroup className="mt-4">
        {filteredIngredients.map((ingredient) => (
          <ListGroup.Item key={ingredient.id}>
            {ingredient.name} ({t(ingredient.type)})
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};

export default Ingredients;
