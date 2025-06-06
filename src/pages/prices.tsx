import { useEffect, useState } from 'react';
import useSWR from 'swr';
import fetcher from '../utils/fetcher';
import useTranslation from 'next-translate/useTranslation';
import { Form, Button, Table, Container, Row, Col, Alert, InputGroup } from 'react-bootstrap';
import Select from 'react-select';
import { useRouter } from 'next/router';
import { FaPlus, FaDollarSign, FaWeight, FaRulerCombined, FaFilter, FaTimes, FaTag } from 'react-icons/fa';
import AddPriceModal from '../components/modal/Prices/AddPriceModal';

const Prices = () => {
  const { t, lang } = useTranslation('common');
  const { data: ingredients, error: ingredientsError } = useSWR('/api/ingredients', fetcher);
  const { data: prices, error: pricesError, mutate: mutatePrices } = useSWR('/api/prices', fetcher);

  const [filterIngredientId, setFilterIngredientId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (ingredients && prices) {
      setIsLoading(false);
    }
  }, [ingredients, prices]);

  useEffect(() => {
    if (router.locale !== lang) {
      router.push(router.pathname, router.asPath, { locale: lang });
    }
  }, [lang, router]);

  const handleAddPrice = async (priceData: {
    ingredient_id: string;
    price: string;
    quantity: string;
    unit: string;
  }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/signin');
      return;
    }
    
    try {
      const currentDate = new Date().toISOString();
      const response = await fetcher('/api/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ingredient_id: priceData.ingredient_id,
          price: parseFloat(priceData.price),
          quantity: parseFloat(priceData.quantity),
          unit: priceData.unit,
          date: currentDate
        }),
      });

      if (!response || response.error) {
        throw response || { error: 'Failed to add price' };
      }

      mutatePrices();
    } catch (error) {
      // Пробрасываем ошибку дальше для обработки в модальном окне
      throw error;
    }
  };

  const clearFilters = () => {
    setFilterIngredientId('');
    setFilterDate('');
    loadPrices();
  };

  const loadPrices = async () => {
    const queryParams = new URLSearchParams();
    if (filterIngredientId) queryParams.append('ingredient_id', filterIngredientId);
    if (filterDate) queryParams.append('date', filterDate);
    if (sortColumn) queryParams.append('sort_column', sortColumn);
    if (sortDirection) queryParams.append('sort_direction', sortDirection);
  
    try {
      const data = await fetcher('/api/prices?' + queryParams.toString());
      mutatePrices(data, false);
    } catch (error) {
      console.error('Failed to load prices', error);
    }
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

  const hasActiveFilters = filterIngredientId || filterDate;

  if (isLoading) return <div>{t('loading')}</div>;
  if (ingredientsError) return <div>{t('ingredientsError')}</div>;
  if (pricesError) return <div>{t('pricesError')}</div>;

  return (
    <div className="p-0">
      <div className="prices-header d-flex flex-column flex-md-row justify-content-between align-items-md-center p-3 p-md-4 border-bottom bg-light">
        <div className="header-content">
          <h1 className="mb-2 text-primary">
            <FaDollarSign className="me-2" />
            {t('prices')}
          </h1>
          <div className="stats-summary d-flex flex-wrap gap-2">
            <span className="badge bg-primary">
              {t('totalPrices')}: {prices?.length || 0}
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
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus className="me-2" /> 
            {t('addPrice')}
          </Button>
        </div>
      </div>
      <div className="prices-content p-3 p-md-4">

      <div className="filter-section mb-4 p-4 rounded shadow-sm bg-light border">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="mb-0 text-primary">
            <FaFilter className="me-2" />
            {t('filterPrices')}
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
            <Form.Label className="fw-semibold">{t('filterByIngredient')}</Form.Label>
            <Form.Group controlId="filterIngredientSelect">
              <Select
                value={ingredientOptions.find(option => option.value === filterIngredientId) || null}
                onChange={(option) => setFilterIngredientId(option ? option.value : '')}
                options={ingredientOptions}
                isClearable
                placeholder={t('allIngredients')}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Label className="fw-semibold">{t('filterByDate')}</Form.Label>
            <Form.Group controlId="filterDateInput">
              <Form.Control
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="d-flex justify-content-end mt-3">
          <Button variant="primary" onClick={loadPrices}>
            {t('applyFilters')}
          </Button>
        </div>
      </div>

      <div className="table-responsive">
        <Table striped bordered hover className="mt-2">
          <thead>
            <tr>
              <th onClick={() => sortPrices('ingredient.type')} className="cursor-pointer">{t('ingredientType')}</th>
              <th onClick={() => sortPrices('ingredient.name')} className="cursor-pointer">{t('ingredientName')}</th>
              <th onClick={() => sortPrices('price')} className="cursor-pointer">{t('price')}</th>
              <th onClick={() => sortPrices('quantity')} className="cursor-pointer">{t('quantity')}</th>
              <th onClick={() => sortPrices('unit')} className="cursor-pointer">{t('unit')}</th>
              <th onClick={() => sortPrices('date')} className="cursor-pointer">{t('date')}</th>
            </tr>
          </thead>
          <tbody>
            {prices && prices.map((price: any) => (
              <tr key={price.id}>
                <td>{price.ingredient.type}</td>
                <td>{price.ingredient.name}</td>
                <td>{price.price} {t("currency")}</td>
                <td>{price.quantity}</td>
                <td>{t(price.unit)}</td>
                <td>{new Date(price.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <AddPriceModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddPrice}
        ingredients={ingredients || []}
      />
      </div>
    </div>
  );
};

export default Prices;
