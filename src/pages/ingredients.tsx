import React, { useState } from 'react';
import useSWR from 'swr';
import { Form, Button, Table, InputGroup } from 'react-bootstrap';
import useTranslation from 'next-translate/useTranslation';
import fetcher from '../utils/fetcher';
import EmptyState from '../components/EmptyState';
import { useRouter } from 'next/router';
import { useAuth, withAuth } from '../utils/authContext';
import { FaPlus, FaTimes, FaTag, FaSearch, FaList, FaFlask, FaUtensils, FaTint } from 'react-icons/fa';
import AddIngredientModal from '../components/modal/Ingredients/AddIngredientModal';
import { Ingredient } from '../types/api';
import SelectDropdown from '../components/SelectDropdown';

const Ingredients: React.FC = () => {
  const { auth } = useAuth();
  const { data: ingredients, error, mutate } = useSWR<Ingredient[]>(
    auth.isAuthenticated ? '/api/ingredients' : null,
    fetcher
  );
  const { t } = useTranslation('common');
  const [filter, setFilter] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const router = useRouter();

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

  const handleAddIngredient = async (ingredientData: {
    type: string;
    name: string;
  }) => {
    if (!auth.isAuthenticated || !auth.token) {
      router.push('/auth/signin');
      return;
    }

    try {
      const response = await fetcher('/api/ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
        body: JSON.stringify(ingredientData),
      });

      if (!response || response.error) {
        throw response || { error: 'Failed to add ingredient' };
      }

      mutate();
    } catch (error) {
      throw error;
    }
  };

  const clearFilters = () => {
    setFilter('');
    setFilterType('');
  };

  const isLoading = !ingredients;

  const filteredIngredients = ingredients?.filter((ingredient) => {
    const nameMatch = ingredient.name.toLowerCase().includes(filter.toLowerCase());
    const typeMatch = !filterType || ingredient.type === filterType;
    return nameMatch && typeMatch;
  });

  const hasActiveFilters = filter || filterType;
  const getStats = () => {
    if (!ingredients || ingredients.length === 0) return {};
    const stats = ingredients.reduce((acc, ingredient) => {
      acc[ingredient.type] = (acc[ingredient.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  const stats = getStats();

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title d-flex align-items-center gap-3">
            <FaList className="text-primary" />
            {t('ingredients')}
          </h1>
          {!isLoading && (
            <p className="page-subtitle">
              {t('total')}: {ingredients?.length || 0} {t('ingredients').toLowerCase()}
              {hasActiveFilters && (
                <span className="text-tertiary"> / {filteredIngredients.length} {t('filtered').toLowerCase()}</span>
              )}
            </p>
          )}
        </div>
        <Button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-2" />
          {t('addIngredient')}
        </Button>
      </div>

      {/* Filter Section */}
      <div className="filter-bar">
        <div className="filter-group">
          <label className="filter-label">{t('search')}</label>
          <InputGroup>
            <InputGroup.Text className="bg-transparent">
              <FaSearch className="text-secondary" />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder={t('filterIngredients')}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="form-control"
            />
          </InputGroup>
        </div>
        <div className="filter-group">
          <SelectDropdown
            value={ingredientTypeOptions.find(option => option.value === filterType) || null}
            onChange={(option) => setFilterType(option ? option.value : '')}
            options={ingredientTypeOptions}
            isClearable
            placeholder={t('allTypes')}
            label={t('type')}
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
            {t('clear')}
          </Button>
        )}
      </div>

      {/* Ingredients List */}
      {isLoading ? (
        <div className="text-center py-5">
          <p className="text-secondary">{t('loading')}</p>
        </div>
      ) : filteredIngredients.length === 0 ? (
        <EmptyState
          type="ingredients"
          message={hasActiveFilters ? t('noIngredientsFound') : t('noIngredients')}
          actionLabel={t('addIngredient')}
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="table-responsive">
          <Table className="table">
            <thead>
              <tr>
                <th>{t('name')}</th>
                <th>{t('type')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredIngredients.map((ingredient) => (
                <tr key={ingredient.id}>
                  <td className="fw-medium">{ingredient.name}</td>
                  <td>
                    <span className={`badge ${
                      ingredient.type === 'base' ? 'badge-primary' :
                      ingredient.type === 'spice' ? 'badge-warning' :
                      ingredient.type === 'sauce' ? 'badge-info' : 'badge-secondary'
                    }`}>
                      {getTypeIcon(ingredient.type)}
                      {t(ingredient.type)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <AddIngredientModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddIngredient}
        existingIngredients={ingredients || []}
      />
    </div>
  );
};

export default withAuth(Ingredients);
