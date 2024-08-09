import React, { useState } from 'react';
import useSWR from 'swr';
import { Container, Form, Button, ListGroup, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import useTranslation from 'next-translate/useTranslation';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Ingredients: React.FC = () => {
  const { data: ingredients, error, mutate } = useSWR('/api/ingredients', fetcher);
  const { t } = useTranslation('common');
  const [ingredientType, setIngredientType] = useState('');
  const [ingredientName, setIngredientName] = useState('');
  const [filter, setFilter] = useState('');
  
  const ingredientTypeOptions = [
    { value: 'base', label: t('base') },
    { value: 'spice', label: t('spice') },
    { value: 'sauce', label: t('sauce') },
    // Add more types as needed
  ];

  const addIngredient = async (e: React.FormEvent) => {
    e.preventDefault();

    // Проверка на уникальность имени
    if (ingredients.find((ingredient: any) => ingredient.name.toLowerCase() === ingredientName.toLowerCase())) {
      alert(t('ingredientExists'));
      return;
    }

    await fetch('/api/ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: ingredientType, name: ingredientName }),
    });

    setIngredientType('');
    setIngredientName('');
    mutate(); // Обновление списка ингредиентов
  };

  if (error) return <div>{t('failedToLoad')}</div>;
  if (!ingredients) return <div>{t('loading')}</div>;

  const filteredIngredients = ingredients.filter((ingredient: any) =>
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
        {filteredIngredients.map((ingredient: { id: number; name: string }) => (
          <ListGroup.Item key={ingredient.id}>
            {ingredient.name} ({t(ingredient.type)})
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};

export default Ingredients;
