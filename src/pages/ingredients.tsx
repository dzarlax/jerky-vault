import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { Container, Form, Button, ListGroup, Row, Col, Alert, Badge, InputGroup } from 'react-bootstrap';
import Select from 'react-select';
import useTranslation from 'next-translate/useTranslation';
import fetcher from '../utils/fetcher'; // Импорт фетчера из папки utils
import { useRouter } from 'next/router';
import { useAuth, withAuth } from '../utils/authContext';
import { FaPlus, FaFilter, FaTimes, FaTag, FaSearch, FaList, FaFlask, FaUtensils, FaTint } from 'react-icons/fa';
import AddIngredientModal from '../components/modal/Ingredients/AddIngredientModal';

interface Ingredient {
  id: number;
  name: string;
  type: string; // Добавляем тип
}

const Ingredients: React.FC = () => {
  const { auth } = useAuth();
  const { data: ingredients, error, mutate } = useSWR<Ingredient[]>('/api/ingredients', fetcher);
  const { t } = useTranslation('common');
  const [filter, setFilter] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const router = useRouter();

  // Проверка аутентификации и перенаправление на логин, если пользователь не аутентифицирован
  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [auth.isAuthenticated, router]);

  const ingredientTypeOptions = [
    { value: 'base', label: t('base'), icon: FaUtensils },
    { value: 'spice', label: t('spice'), icon: FaFlask },
    { value: 'sauce', label: t('sauce'), icon: FaTint },
    // Add more types as needed
  ];

  const getTypeIcon = (type: string) => {
    const typeOption = ingredientTypeOptions.find(option => option.value === type);
    if (typeOption) {
      const IconComponent = typeOption.icon;
      return <IconComponent className="me-1" />;
    }
    return <FaTag className="me-1" />;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'base': return 'primary';
      case 'spice': return 'warning';
      case 'sauce': return 'info';
      default: return 'secondary';
    }
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
      // Пробрасываем ошибку дальше для обработки в модальном окне
      throw error;
    }
  };

  const clearFilters = () => {
    setFilter('');
    setFilterType('');
  };

  if (error) return <div>{t('failedToLoad')}</div>;
  if (!ingredients) return <div>{t('loading')}</div>;

  const filteredIngredients = ingredients.filter((ingredient) => {
    const nameMatch = ingredient.name.toLowerCase().includes(filter.toLowerCase());
    const typeMatch = !filterType || ingredient.type === filterType;
    return nameMatch && typeMatch;
  });

  const hasActiveFilters = filter || filterType;
  const getStats = () => {
    const stats = ingredients.reduce((acc, ingredient) => {
      acc[ingredient.type] = (acc[ingredient.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  const stats = getStats();

  return (
    <div className="p-0">
      <div className="ingredients-header d-flex flex-column flex-md-row justify-content-between align-items-md-center p-3 p-md-4 border-bottom bg-light">
        <div className="header-content">
          <h1 className="mb-2 text-primary">
            <FaList className="me-2" />
            {t('ingredients')}
          </h1>
          <div className="stats-summary d-flex flex-wrap gap-2">
            <span className="badge bg-primary">
              {t('total')}: {ingredients?.length || 0}
            </span>
            {Object.entries(stats).map(([type, count]) => (
              <span key={type} className={`badge bg-${getTypeColor(type)}`}>
                {getTypeIcon(type)}
                {t(type)}: {count}
              </span>
            ))}
            {hasActiveFilters && (
              <span className="badge bg-warning">
                {t('filtered')}: {filteredIngredients.length}
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
            {t('addIngredient')}
          </Button>
        </div>
      </div>
      <div className="ingredients-content p-3 p-md-4">

        <div className="filter-section mb-4 p-4 rounded shadow-sm bg-light border">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h5 className="mb-0 text-primary">
              <FaFilter className="me-2" />
              {t('filterIngredients')}
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
              <Form.Label className="fw-semibold">{t('searchByName')}</Form.Label>
              <Form.Group controlId="filter">
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder={t('filterIngredients')}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Label className="fw-semibold">{t('filterByType')}</Form.Label>
              <Form.Group controlId="filterType">
                <Select
                  value={ingredientTypeOptions.find(option => option.value === filterType) || null}
                  onChange={(option) => setFilterType(option ? option.value : '')}
                  options={ingredientTypeOptions}
                  isClearable
                  placeholder={t('allTypes')}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </Form.Group>
            </Col>
          </Row>
        </div>

        {filteredIngredients.length === 0 ? (
          <div className="empty-state text-center py-5">
            <FaList size={64} className="text-muted mb-3" />
            <h4 className="text-muted">{t('noIngredientsFound')}</h4>
            <p className="text-muted">{t('noIngredientsFoundDescription')}</p>
            {!hasActiveFilters && (
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                <FaPlus className="me-2" />
                {t('addFirstIngredient')}
              </Button>
            )}
          </div>
        ) : (
          <div className="ingredients-grid">
            <ListGroup>
              {filteredIngredients.map((ingredient) => (
                <ListGroup.Item 
                  key={ingredient.id} 
                  className="d-flex justify-content-between align-items-center ingredient-item"
                >
                  <div className="ingredient-info">
                    <span className="ingredient-name fw-medium">{ingredient.name}</span>
                  </div>
                  <Badge bg={getTypeColor(ingredient.type)} className="ingredient-type-badge">
                    {getTypeIcon(ingredient.type)}
                    {t(ingredient.type)}
                  </Badge>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}

        <AddIngredientModal
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddIngredient}
          existingIngredients={ingredients || []}
        />
      </div>
    </div>
  );
};

export default withAuth(Ingredients);
