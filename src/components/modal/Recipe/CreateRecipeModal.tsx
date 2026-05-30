import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaExclamationTriangle, FaLayerGroup, FaPlus, FaTrash } from 'react-icons/fa';
import { Ingredient } from '../../../types/api';
import SelectDropdown from '../../../components/SelectDropdown';
import { formatCount } from '../../../utils/pluralize';
import { getUnitsForIngredientType } from '../../../utils/ingredientTypes';

type UnitOption = {
  value: string;
  label: string;
};

type DraftIngredient = {
  id: number;
  name: string;
  type?: string;
  quantity: string;
  unit: UnitOption;
};

type CreateRecipeModalProps = {
  show: boolean;
  onHide: () => void;
  ingredients?: Ingredient[];
  t: (key: string) => string;
  onCreateRecipe: (name: string, ingredients: DraftIngredient[]) => Promise<void>;
};

const getUnitsForIngredient = (ingredient?: Ingredient) => {
  if (!ingredient) return [];

  return getUnitsForIngredientType(ingredient.type);
};

const CreateRecipeModal: React.FC<CreateRecipeModalProps> = ({
  show,
  onHide,
  ingredients = [],
  t,
  onCreateRecipe,
}) => {
  const [recipeName, setRecipeName] = useState('');
  const [draftIngredients, setDraftIngredients] = useState<DraftIngredient[]>([]);
  const [ingredientId, setIngredientId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<UnitOption | null>(null);
  const [formError, setFormError] = useState('');
  const [ingredientError, setIngredientError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const selectedIngredient = useMemo(
    () => ingredients.find((ingredient) => ingredient.id === parseInt(ingredientId, 10)),
    [ingredients, ingredientId]
  );

  const unitOptions = useMemo(
    () => getUnitsForIngredient(selectedIngredient).map((unitValue) => ({
      value: unitValue,
      label: t(unitValue),
    })),
    [selectedIngredient, t]
  );

  const ingredientOptions = useMemo(
    () => ingredients.map((ingredient) => ({
      value: String(ingredient.id),
      label: ingredient.type ? `${ingredient.name} · ${t(ingredient.type)}` : ingredient.name,
    })),
    [ingredients, t]
  );

  const selectedIngredientOption = ingredientId
    ? ingredientOptions.find((option) => option.value === ingredientId) || null
    : null;

  const canAddIngredient = Boolean(ingredientId && quantity.trim() && unit);
  const canSave = Boolean(recipeName.trim() && draftIngredients.length > 0 && !isSaving);

  useEffect(() => {
    if (!show) {
      setRecipeName('');
      setDraftIngredients([]);
      setIngredientId('');
      setQuantity('');
      setUnit(null);
      setFormError('');
      setIngredientError('');
      setIsSaving(false);
    }
  }, [show]);

  useEffect(() => {
    setUnit(unitOptions[0] || null);
    setIngredientError('');
  }, [unitOptions]);

  const resetIngredientEntry = () => {
    setIngredientId('');
    setQuantity('');
    setUnit(null);
  };

  const validateQuantity = () => {
    const normalizedQuantity = quantity.trim().replace(',', '.');
    const numericQuantity = Number(normalizedQuantity);
    return Number.isFinite(numericQuantity) && numericQuantity > 0;
  };

  const addIngredient = () => {
    setIngredientError('');
    setFormError('');

    if (!selectedIngredient) {
      setIngredientError(t('ingredientRequired'));
      return;
    }

    if (!quantity.trim() || !validateQuantity()) {
      setIngredientError(t('validQuantityRequired'));
      return;
    }

    if (!unit) {
      setIngredientError(t('unitRequired'));
      return;
    }

    if (draftIngredients.some((ingredient) => ingredient.id === selectedIngredient.id)) {
      setIngredientError(t('ingredientAlreadyExists'));
      return;
    }

    setDraftIngredients((currentIngredients) => [
      ...currentIngredients,
      {
        id: selectedIngredient.id,
        name: selectedIngredient.name,
        type: selectedIngredient.type,
        quantity: quantity.trim(),
        unit,
      },
    ]);
    resetIngredientEntry();
  };

  const removeIngredient = (ingredientId: number) => {
    setDraftIngredients((currentIngredients) =>
      currentIngredients.filter((ingredient) => ingredient.id !== ingredientId)
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    setIngredientError('');

    if (!recipeName.trim()) {
      setFormError(t('recipeNameRequired'));
      return;
    }

    if (draftIngredients.length === 0) {
      setFormError(t('atLeastOneIngredientRequired'));
      return;
    }

    setIsSaving(true);
    try {
      await onCreateRecipe(recipeName.trim(), draftIngredients);
    } catch (error) {
      setFormError(error instanceof Error && error.message === 'Failed to add ingredient'
        ? t('failedToAddIngredient')
        : t('failedToCreateRecipe'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" className="recipe-builder-modal" centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <div>
            <Modal.Title>{t('addRecipe')}</Modal.Title>
            <div className="recipe-builder-subtitle">{t('recipeBuilderSubtitle')}</div>
          </div>
        </Modal.Header>

        <Modal.Body>
          <div className="recipe-builder-layout">
            <div className="recipe-builder-main">
              <section className="recipe-builder-section">
                <Form.Group>
                  <Form.Label>{t('recipeName')}</Form.Label>
                  <Form.Control
                    type="text"
                    value={recipeName}
                    onChange={(event) => {
                      setRecipeName(event.target.value);
                      setFormError('');
                    }}
                    placeholder={t('recipeName')}
                    isInvalid={Boolean(formError && !recipeName.trim())}
                  />
                </Form.Group>
              </section>

              <section className="recipe-builder-section">
                <div className="recipe-builder-section-header">
                  <div>
                    <h3>{t('addIngredient')}</h3>
                    <p>{t('recipeBuilderIngredientHelp')}</p>
                  </div>
                </div>

                <div className="recipe-builder-entry-grid">
                  <SelectDropdown
                    value={selectedIngredientOption}
                    onChange={(selectedOption: any) => setIngredientId(selectedOption ? selectedOption.value : '')}
                    options={ingredientOptions}
                    isClearable
                    placeholder={t('chooseIngredient')}
                    label={t('ingredient')}
                    error={ingredientError === t('ingredientRequired') ? ingredientError : undefined}
                  />
                  <Form.Group>
                    <Form.Label>{t('quantity')}</Form.Label>
                    <Form.Control
                      type="text"
                      inputMode="decimal"
                      value={quantity}
                      onChange={(event) => {
                        setQuantity(event.target.value);
                        setIngredientError('');
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addIngredient();
                        }
                      }}
                      isInvalid={ingredientError === t('validQuantityRequired')}
                    />
                  </Form.Group>
                  <SelectDropdown
                    value={unit}
                    onChange={(selectedOption) => {
                      setUnit(selectedOption || null);
                      setIngredientError('');
                    }}
                    options={unitOptions}
                    isClearable
                    placeholder={t('chooseUnit')}
                    label={t('unit')}
                    error={ingredientError === t('unitRequired') ? ingredientError : undefined}
                  />
                  <Button
                    type="button"
                    variant="primary"
                    onClick={addIngredient}
                    disabled={!canAddIngredient}
                    className="recipe-builder-add-button"
                  >
                    <FaPlus className="me-2" />
                    {t('add')}
                  </Button>
                </div>

                {ingredientError && ![t('ingredientRequired'), t('validQuantityRequired'), t('unitRequired')].includes(ingredientError) && (
                  <div className="recipe-builder-inline-error">
                    <FaExclamationTriangle />
                    {ingredientError}
                  </div>
                )}
              </section>
            </div>

            <aside className="recipe-builder-summary">
              <div className="recipe-builder-summary-header">
                <div>
                  <h3>{t('recipeComposition')}</h3>
                  <p>
                    {draftIngredients.length} {t('of')} {formatCount(t, ingredients.length, 'ingredient')}
                  </p>
                </div>
                <div className="recipe-builder-count">
                  <FaLayerGroup />
                  {draftIngredients.length}
                </div>
              </div>

              {draftIngredients.length > 0 ? (
                <div className="recipe-builder-list">
                  {draftIngredients.map((ingredient) => (
                    <div key={ingredient.id} className="recipe-builder-list-item">
                      <div>
                        <strong>{ingredient.name}</strong>
                        {ingredient.type && <span>{t(ingredient.type)}</span>}
                      </div>
                      <div className="recipe-builder-list-quantity">
                        {ingredient.quantity} {t(ingredient.unit.value)}
                      </div>
                      <Button
                        type="button"
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeIngredient(ingredient.id)}
                        aria-label={t('removeIngredientFromRecipe')}
                        className="recipe-builder-remove-button"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="recipe-builder-empty">
                  <FaLayerGroup />
                  <strong>{t('noIngredientsAddedYet')}</strong>
                  <span>{t('recipeBuilderEmptyHelp')}</span>
                </div>
              )}
            </aside>
          </div>

          {formError && (
            <div className="recipe-builder-form-error">
              <FaExclamationTriangle />
              {formError}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <div className="recipe-builder-footer-status">
            {draftIngredients.length > 0
              ? formatCount(t, draftIngredients.length, 'ingredient')
              : t('recipeBuilderNotReady')}
          </div>
          <div className="recipe-builder-footer-actions">
            <Button variant="outline-secondary" onClick={onHide} disabled={isSaving}>
              {t('cancel')}
            </Button>
            <Button variant="primary" type="submit" disabled={!canSave}>
              {isSaving ? t('loading') : t('save')}
            </Button>
          </div>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateRecipeModal;
