import { useEffect, useState } from 'react';
import useSWR from 'swr';
import fetcher from '../utils/fetcher';
import useTranslation from 'next-translate/useTranslation';
import { Form, Button, Table, Container, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { useRouter } from 'next/router';

const Prices = () => {
  const { t, lang } = useTranslation('common');
  const { data: ingredients, error: ingredientsError } = useSWR('/api/ingredients', fetcher);
  const { data: prices, error: pricesError, mutate: mutatePrices } = useSWR('/api/prices', fetcher);

  const [ingredientId, setIngredientId] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [units, setUnits] = useState<string[]>([]);
  const [filterIngredientId, setFilterIngredientId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    console.log("Router Locale: ", router.locale);
    console.log("Current Language in useEffect: ", lang);
    if (ingredients && prices) {
      setIsLoading(false);
    }
  }, [ingredients, prices, lang]);

  useEffect(() => {
    if (router.locale !== lang) {
      router.push(router.pathname, router.asPath, { locale: lang });
    }
    updateUnits();
  }, [ingredientId, lang, router]);

  const addPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentDate = new Date().toISOString();
    await fetch('/api/prices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredient_id: ingredientId, price, quantity, unit, date: currentDate }),
    });
    setIngredientId('');
    setPrice('');
    setQuantity('');
    setUnit('');
    mutatePrices();
  };

  const updateUnits = () => {
    const selectedIngredient = ingredients?.find((ingredient: any) => ingredient.id === parseInt(ingredientId));
    if (!selectedIngredient) return;

    let units: string[] = [];
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
    setUnits(units);
    setUnit(units[0] || '');
  };

  const loadPrices = async () => {
    const queryParams = new URLSearchParams();
    if (filterIngredientId) queryParams.append('ingredient_id', filterIngredientId);
    if (filterDate) queryParams.append('date', filterDate);
    if (sortColumn) queryParams.append('sort_column', sortColumn);
    if (sortDirection) queryParams.append('sort_direction', sortDirection);

    const response = await fetch('/api/prices?' + queryParams.toString());
    const data = await response.json();
    mutatePrices(data, false);
  };

  const sortPrices = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    loadPrices();
  };

  const ingredientOptions = ingredients ? ingredients.map((ingredient: any) => ({ value: ingredient.id, label: ingredient.name })) : [];
  const unitOptions = units.map((unit: string) => ({ value: unit, label: t(unit) }));

  if (isLoading || ingredientsError || pricesError) return <div>{t('loading')}</div>;

  return (
    <Container>
      <h1>{t('addPricesHeader')}</h1>
      <Form onSubmit={addPrice}>
        <Row className="align-items-end">
          <Col>
            <Form.Group controlId="ingredientSelect">
              <Select
                value={ingredientOptions.find(option => option.value === ingredientId) || null}
                onChange={(option) => setIngredientId(option ? option.value : '')}
                options={ingredientOptions}
                isClearable
                placeholder={t('chooseIngredient')}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="priceInput">
              <Form.Control
                type="number"
                step="0.01"
                placeholder={t('price')}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="quantityInput">
              <Form.Control
                type="number"
                step="0.01"
                placeholder={t('quantity')}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="unitSelect">
              <Select
                value={unitOptions.find(option => option.value === unit) || null}
                onChange={(option) => setUnit(option ? option.value : '')}
                options={unitOptions}
                isClearable
                placeholder={t('unit')}
              />
            </Form.Group>
          </Col>
          <Col xs="auto">
            <Button variant="primary" type="submit">{t('addPrice')}</Button>
          </Col>
        </Row>
      </Form>

      <div className="filter-section mt-4">
        <Row>
          <Col md={4}>
            <Form.Group controlId="filterIngredientSelect">
              <Select
                value={ingredientOptions.find(option => option.value === filterIngredientId) || null}
                onChange={(option) => setFilterIngredientId(option ? option.value : '')}
                options={ingredientOptions}
                isClearable
                placeholder={t('allIngredients')}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="filterDateInput">
              <Form.Control
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4} className="d-flex align-items-end">
            <Button variant="primary" onClick={loadPrices}>{t('applyFilters')}</Button>
          </Col>
        </Row>
      </div>

      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th onClick={() => sortPrices('ingredient_type')}>{t('ingredientType')}</th>
            <th onClick={() => sortPrices('ingredient_name')}>{t('ingredientName')}</th>
            <th onClick={() => sortPrices('price')}>{t('price')}</th>
            <th onClick={() => sortPrices('quantity')}>{t('quantity')}</th>
            <th onClick={() => sortPrices('unit')}>{t('unit')}</th>
            <th onClick={() => sortPrices('date')}>{t('date')}</th>
          </tr>
        </thead>
        <tbody>
          {prices && prices.map((price: any) => (
            <tr key={price.id}>
              <td>{t(price.ingredient_type)}</td>
              <td>{price.ingredient_name}</td>
              <td>{price.price}</td>
              <td>{price.quantity}</td>
              <td>{price.unit}</td>
              <td>{new Date(price.date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Prices;
