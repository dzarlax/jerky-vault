import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import Select from 'react-select';
import useTranslation from 'next-translate/useTranslation';
import { FaPlus, FaTag, FaUtensils, FaFlask, FaTint } from 'react-icons/fa';

interface AddIngredientModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (ingredientData: {
    type: string;
    name: string;
  }) => Promise<void>;
  existingIngredients: any[];
}

const AddIngredientModal: React.FC<AddIngredientModalProps> = ({ 
  show, 
  onClose, 
  onSave, 
  existingIngredients = [] 
}) => {
  const { t } = useTranslation('common');
  const [ingredientType, setIngredientType] = useState('');
  const [ingredientName, setIngredientName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorField, setErrorField] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const ingredientNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!show) {
      // Сброс формы при закрытии модального окна
      setIngredientType('');
      setIngredientName('');
      setErrorMessage('');
      setShowError(false);
      setErrorField('');
    }
  }, [show]);

  const ingredientTypeOptions = [
    { value: 'base', label: t('base'), icon: FaUtensils },
    { value: 'spice', label: t('spice'), icon: FaFlask },
    { value: 'sauce', label: t('sauce'), icon: FaTint },
  ];

  const validateForm = () => {
    const trimmedName = ingredientName.trim();
    
    if (!trimmedName) {
      setErrorMessage(t('ingredientNameRequired'));
      setShowError(true);
      ingredientNameRef.current?.focus();
      return false;
    }

    if (!ingredientType) {
      setErrorMessage(t('ingredientTypeRequired'));
      setShowError(true);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        type: ingredientType,
        name: ingredientName.trim()
      });
      
      // Сброс формы после успешного сохранения
      setIngredientType('');
      setIngredientName('');
      setErrorMessage('');
      setShowError(false);
      onClose();
    } catch (error: any) {
      console.error('Failed to add ingredient', error);
      
      // Обработка структурированной ошибки от сервера
      if (error?.error === 'Ingredient with this name already exists') {
        setErrorMessage(t('ingredientExistsServer', { 
          name: error.value,
          id: error.existing_id 
        }));
        setErrorField('name');
        ingredientNameRef.current?.focus();
      } else if (error?.field === 'name') {
        setErrorMessage(error.error || t('invalidIngredientName'));
        setErrorField('name');
        ingredientNameRef.current?.focus();
      } else {
        setErrorMessage(error?.error || t('failedToAddIngredient'));
        setErrorField('');
      }
      
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const typeOption = ingredientTypeOptions.find(option => option.value === type);
    if (typeOption) {
      const IconComponent = typeOption.icon;
      return <IconComponent className="me-1" />;
    }
    return <FaTag className="me-1" />;
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" className="add-ingredient-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaPlus className="me-2 text-primary" />
          {t('addIngredient')}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {showError && (
            <Alert variant="danger" onClose={() => setShowError(false)} dismissible>
              <strong>{t('error')}:</strong> {errorMessage}
            </Alert>
          )}

          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="ingredientType">
                <Form.Label className="fw-semibold">
                  <FaTag className="me-1 text-primary" />
                  {t('ingredientType')} <span className="text-danger">*</span>
                </Form.Label>
                <Select
                  value={ingredientTypeOptions.find(option => option.value === ingredientType) || null}
                  onChange={(option) => {
                    setIngredientType(option ? option.value : '');
                    if (showError) {
                      setShowError(false);
                      setErrorField('');
                    }
                  }}
                  options={ingredientTypeOptions}
                  isClearable
                  placeholder={t('chooseType')}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="ingredientName">
                <Form.Label className="fw-semibold">
                  <FaUtensils className="me-1 text-primary" />
                  {t('ingredientName')} <span className="text-danger">*</span>
                </Form.Label>
                                  <Form.Control
                    ref={ingredientNameRef}
                    type="text"
                    placeholder={t('enterIngredientName')}
                    value={ingredientName}
                    onChange={(e) => {
                      setIngredientName(e.target.value);
                      if (showError) {
                        setShowError(false);
                        setErrorField('');
                      }
                    }}
                    isInvalid={showError && errorField === 'name'}
                    required
                  />
                <Form.Control.Feedback type="invalid">
                  {errorMessage}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <div className="mt-3 p-3 bg-light rounded">
            <h6 className="text-muted mb-2">{t('ingredientTypes')}:</h6>
            <div className="d-flex flex-wrap gap-2">
              {ingredientTypeOptions.map(option => (
                <div key={option.value} className="d-flex align-items-center">
                  {getTypeIcon(option.value)}
                  <small className="text-muted">{option.label}</small>
                </div>
              ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {t('loading')}...
              </>
            ) : (
              <>
                <FaPlus className="me-2" />
                {t('addIngredient')}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddIngredientModal; 