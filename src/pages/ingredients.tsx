import React, { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Form, Button, Table, InputGroup } from 'react-bootstrap';
import useTranslation from 'next-translate/useTranslation';
import fetcher from '../utils/fetcher';
import EmptyState from '../components/EmptyState';
import { useRouter } from 'next/router';
import { useAuth, withAuth } from '../utils/authContext';
import { FaPlus, FaTimes, FaTag, FaSearch, FaList, FaFlask, FaUtensils, FaTint, FaHistory } from 'react-icons/fa';
import AddIngredientModal from '../components/modal/Ingredients/AddIngredientModal';
import { WorkspaceIngredient } from '../types/api';
import { useWorkspace } from '../utils/workspaceContext';
import { workspaceFetcher, workspaceKey } from '../utils/workspaceSWR';

type PriceStateFilter = 'all' | 'missing' | 'priced';

const Ingredients: React.FC = () => {
  const { auth } = useAuth();
  const { selectedWorkspaceId, isWorkspaceReady } = useWorkspace();
  const { data: workspaceIngredients, mutate } = useSWR<WorkspaceIngredient[]>(
    workspaceKey('/api/workspace-ingredients', selectedWorkspaceId, auth.isAuthenticated && isWorkspaceReady),
    workspaceFetcher
  );
  const { t } = useTranslation('common');
  const [filter, setFilter] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriceState, setFilterPriceState] = useState<PriceStateFilter>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const router = useRouter();

  const ingredientTypeOptions = [
    { value: 'all', label: t('allTypes'), icon: FaList },
    { value: 'base', label: t('base'), icon: FaUtensils },
    { value: 'spice', label: t('spice'), icon: FaFlask },
    { value: 'sauce', label: t('sauce'), icon: FaTint },
  ];

  const priceStateOptions: { value: PriceStateFilter; label: string }[] = [
    { value: 'all', label: t('allPriceStates') },
    { value: 'missing', label: t('missingPrice') },
    { value: 'priced', label: t('hasPrice') },
  ];

  const getTypeIcon = (type: string) => {
    const typeOption = ingredientTypeOptions.find(option => option.value === type);
    if (typeOption) {
      const IconComponent = typeOption.icon;
      return <IconComponent className="me-1" />;
    }
    return <FaTag className="me-1" />;
  };

  const ingredients = workspaceIngredients?.map((workspaceIngredient) => workspaceIngredient.ingredient) || [];

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
        body: JSON.stringify(ingredientData),
      });

      if (!response || response.error) {
        throw response || { error: 'Failed to add ingredient' };
      }

      mutate();
    } catch (error: any) {
      if (error?.workspace_linked) {
        mutate();
        return;
      }
      throw error;
    }
  };

  const handleAddExistingIngredient = async (ingredientId: number) => {
    await fetcher('/api/workspace-ingredients', {
      method: 'POST',
      body: JSON.stringify({ ingredient_id: ingredientId }),
    });
    mutate();
  };

  const handleSearchGlobalIngredients = useCallback(async (query: string) => {
    return fetcher(`/api/ingredients/search?query=${encodeURIComponent(query)}`);
  }, []);

  const handleDeactivateIngredient = async (workspaceIngredient: WorkspaceIngredient) => {
    if (!window.confirm(t('confirmRemoveIngredientFromList', { name: workspaceIngredient.ingredient.name }))) {
      return;
    }

    await fetcher(`/api/workspace-ingredients/${workspaceIngredient.id}`, {
      method: 'DELETE',
    });
    mutate();
  };

  const clearFilters = () => {
    setFilter('');
    setFilterType('all');
    setFilterPriceState('all');
  };

  const openPrices = (ingredientId: number) => {
    router.push(
      {
        pathname: '/prices',
        query: { ingredient_id: String(ingredientId) },
      },
      undefined,
      { locale: router.locale }
    );
  };

  const isLoading = !isWorkspaceReady || !workspaceIngredients;

  const filteredIngredients = useMemo(() => {
    return workspaceIngredients?.filter((workspaceIngredient) => {
      const nameMatch = workspaceIngredient.ingredient.name.toLowerCase().includes(filter.toLowerCase());
      const typeMatch = filterType === 'all' || workspaceIngredient.ingredient.type === filterType;
      const priceStateMatch =
        filterPriceState === 'all' ||
        (filterPriceState === 'missing' && !workspaceIngredient.latest_price) ||
        (filterPriceState === 'priced' && !!workspaceIngredient.latest_price);

      return nameMatch && typeMatch && priceStateMatch;
    }) || [];
  }, [filter, filterPriceState, filterType, workspaceIngredients]);

  const hasActiveFilters = !!filter || filterType !== 'all' || filterPriceState !== 'all';

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
          <label className="filter-label">{t('type')}</label>
          <div className="filter-chip-row" role="group" aria-label={t('type')}>
            {ingredientTypeOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={`filter-chip ${filterType === option.value ? 'is-active' : ''}`}
                  onClick={() => setFilterType(option.value)}
                >
                  <IconComponent className="me-1" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="filter-group">
          <label className="filter-label">{t('priceState')}</label>
          <div className="filter-chip-row" role="group" aria-label={t('priceState')}>
            {priceStateOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`filter-chip ${filterPriceState === option.value ? 'is-active' : ''}`}
                onClick={() => setFilterPriceState(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
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
                <th>{t('latestPrice')}</th>
                <th>{t('priceState')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredIngredients.map((workspaceIngredient) => (
                <tr key={workspaceIngredient.id}>
                  <td className="fw-medium">{workspaceIngredient.ingredient.name}</td>
                  <td>
                    <span className={`badge ${
                      workspaceIngredient.ingredient.type === 'base' ? 'badge-primary' :
                      workspaceIngredient.ingredient.type === 'spice' ? 'badge-warning' :
                      workspaceIngredient.ingredient.type === 'sauce' ? 'badge-info' : 'badge-secondary'
                    }`}>
                      {getTypeIcon(workspaceIngredient.ingredient.type)}
                      {t(workspaceIngredient.ingredient.type)}
                    </span>
                  </td>
                  <td>
                    {workspaceIngredient.latest_price ? (
                      <div className="text-secondary small">
                        <div>
                          {workspaceIngredient.latest_price.price} {t('currency')} / {workspaceIngredient.latest_price.quantity} {t(workspaceIngredient.latest_price.unit)}
                        </div>
                        <div className="text-tertiary">
                          {t('latestPriceDate', {
                            date: new Date(workspaceIngredient.latest_price.date).toLocaleDateString(router.locale),
                          })}
                        </div>
                      </div>
                    ) : (
                      <span className="text-tertiary small">{t('noLatestPrice')}</span>
                    )}
                  </td>
                  <td>
                    <span className={`price-state-badge ${workspaceIngredient.latest_price ? 'is-priced' : 'is-missing'}`}>
                      {workspaceIngredient.latest_price ? t('hasPrice') : t('missingPrice')}
                    </span>
                  </td>
                  <td>
                    <div className="ingredient-actions">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => openPrices(workspaceIngredient.ingredient.id)}
                      >
                        <FaHistory className="me-2" />
                        {t('openPrices')}
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleDeactivateIngredient(workspaceIngredient)}
                      >
                        {t('removeFromIngredientList')}
                      </Button>
                    </div>
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
        onAddExisting={handleAddExistingIngredient}
        onSearchGlobalIngredients={handleSearchGlobalIngredients}
        existingIngredients={ingredients || []}
      />
    </div>
  );
};

export default withAuth(Ingredients);
