import { useEffect, useState } from 'react';
import useSWR from 'swr';
import fetcher from '../utils/fetcher';
import useTranslation from 'next-translate/useTranslation';
import { Form, Button, Table, Row, Col, InputGroup } from 'react-bootstrap';
import TableSkeleton from '../components/skeletons/TableSkeleton';
import EmptyState from '../components/EmptyState';
import { useRouter } from 'next/router';
import { FaPlus, FaDollarSign, FaFilter, FaTimes, FaUtensils, FaFlask, FaTint, FaTag } from 'react-icons/fa';
import AddPriceModal from '../components/modal/Prices/AddPriceModal';
import { useAuth } from '../utils/authContext';
import { useNotification } from '../hooks/useNotification';
import { Ingredient, Price } from '../types/api';
import SelectDropdown from '../components/SelectDropdown';

const Prices = () => {
  const { t, lang } = useTranslation('common');
  const { auth } = useAuth();
  const { success, error: showError } = useNotification();
  const { data: ingredients, error: ingredientsError } = useSWR(
    auth.isAuthenticated ? '/api/ingredients' : null,
    fetcher
  );
  const { data: prices, error: pricesError, mutate: mutatePrices } = useSWR(
    auth.isAuthenticated ? '/api/prices' : null,
    fetcher
  );

  const [filterIngredientId, setFilterIngredientId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const router = useRouter();

  // Ingredient type options with icons
  const ingredientTypeOptions = [
    { value: 'base', label: t('base'), icon: FaUtensils },
    { value: 'spice', label: t('spice'), icon: FaFlask },
    { value: 'sauce', label: t('sauce'), icon: FaTint },
  ];

  const getTypeIcon = (type: string) => {
    const typeOption = ingredientTypeOptions.find(option => option.value === type);
    if (typeOption) {
      const IconComponent = typeOption.icon;
      return <IconComponent className="me-1" />;
    }
    return <FaTag className="me-1" />;
  };

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

      const requestData = {
        ingredient_id: parseInt(priceData.ingredient_id, 10),
        price: parseFloat(priceData.price),
        quantity: parseInt(priceData.quantity, 10),
        unit: priceData.unit,
        date: currentDate
      };

      const response = await fetcher('/api/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response || response.error) {
        throw response || { error: 'Failed to add price' };
      }

      mutatePrices();
    } catch (error) {
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
      showError(t('failedToLoadPrices'));
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

  const ingredientOptions = ingredients ? ingredients.map((ingredient: Ingredient) => ({ value: ingredient.id, label: ingredient.name })) : [];

  const hasActiveFilters = filterIngredientId || filterDate;

  const hasError = ingredientsError || pricesError;

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title d-flex align-items-center gap-3">
            <FaDollarSign className="text-primary" />
            {t('prices')}
          </h1>
          {!isLoading && (
            <p className="page-subtitle">
              Total: {prices?.length || 0} prices
              {hasActiveFilters && (
                <span className="text-tertiary"> • filtered</span>
              )}
            </p>
          )}
        </div>
        <Button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-2" />
          {t('addPrice')}
        </Button>
      </div>

      {/* Filter Section */}
      <div className="filter-bar">
        <div className="filter-group">
          <SelectDropdown
            value={ingredientOptions.find(option => option.value === filterIngredientId) || null}
            onChange={(option) => setFilterIngredientId(option ? option.value : '')}
            options={ingredientOptions}
            isClearable
            placeholder={t('allIngredients')}
            label="Ingredient"
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">Date</label>
          <Form.Control
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="form-control"
          />
        </div>
        <Button
          variant="primary"
          onClick={loadPrices}
          className="ms-auto"
        >
          {t('applyFilters')}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={clearFilters}
          >
            <FaTimes className="me-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Prices Table */}
      <div className="table-responsive">
        {hasError ? (
          <div className="text-center py-5">
            <p className="text-error">
              {ingredientsError ? t('ingredientsError') : t('pricesError')}
            </p>
          </div>
        ) : isLoading ? (
          <TableSkeleton rows={10} columns={6} />
        ) : !prices || prices.length === 0 ? (
          <EmptyState
            type="prices"
            message={hasActiveFilters ? t('noPricesFound') : t('noPrices')}
            actionLabel={t('addPrice')}
            onAction={() => setShowAddModal(true)}
          />
        ) : (
          <Table className="table">
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
              {prices.map((price: Price) => (
              <tr key={price.id}>
                <td>
                  <span className={`badge badge-${
                    price.ingredient.type === 'base' ? 'primary' :
                    price.ingredient.type === 'spice' ? 'warning' :
                    price.ingredient.type === 'sauce' ? 'info' : 'secondary'
                  }`}>
                    {getTypeIcon(price.ingredient.type)}
                    {t(price.ingredient.type)}
                  </span>
                </td>
                <td>{price.ingredient.name}</td>
                <td className="fw-semibold">{price.price} {t("currency")}</td>
                <td>{price.quantity}</td>
                <td>{t(price.unit)}</td>
                <td className="text-secondary small">
                  {new Date(price.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        )}
      </div>

      <AddPriceModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddPrice}
        ingredients={ingredients || []}
      />
    </div>
  );
};

export default Prices;
