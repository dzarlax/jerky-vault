import React from 'react';
import { Modal, Form, Button, InputGroup, FormControl } from 'react-bootstrap';
import Select from 'react-select';
import { FaTimes } from 'react-icons/fa';
import useTranslation from 'next-translate/useTranslation';

interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  cost_price: number; // Новое поле для себестоимости
}

interface Client {
  id: string;
  name: string;
  surname: string;
  telegram?: string;
  instagram?: string;
  phone?: string;
  address?: string;
  source: string;
}

interface OrderModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  clientOptions: { value: string, label: string }[];
  productOptions: { value: string, label: string }[];
  statusOptions: { value: string, label: string }[];
  clientId: string;
  status: string;
  items: OrderItem[];
  setClientId: (clientId: string) => void;
  setStatus: (status: string) => void;
  handleProductChange: (index: number, product_id: string) => void;
  handleQuantityChange: (index: number, quantity: number) => void;
  handleItemChange: (index: number, field: keyof OrderItem, value: any) => void;
  handleRemoveItem: (index: number) => void;
  handleAddItem: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({
  show,
  onClose,
  onSave,
  clientOptions,
  productOptions,
  statusOptions,
  clientId,
  status,
  items,
  setClientId,
  setStatus,
  handleProductChange,
  handleQuantityChange,
  handleItemChange,
  handleRemoveItem,
  handleAddItem
}) => {
  const { t } = useTranslation('common');

  const showStatusSelect = false; // Здесь можно поставить условие для отображения статуса

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{t('orderDetails')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="clientSelect">
            <Form.Label>{t('client')}</Form.Label>
            <Select
              options={clientOptions}
              value={clientOptions.find(option => option.value === clientId)}
              onChange={option => setClientId(option?.value || '')}
            />
          </Form.Group>

          {showStatusSelect && (
            <Form.Group controlId="statusSelect">
              <Form.Label>{t('status')}</Form.Label>
              <Select
                options={statusOptions}
                value={statusOptions.find(option => option.value === status)}
                onChange={option => setStatus(option?.value || '')}
              />
            </Form.Group>
          )}

          <Form.Group controlId="items">
            <Form.Label>{t('products')}</Form.Label>
            {items.map((item, index) => (
              <InputGroup className="mb-3" key={index}>
                <Select
                  options={productOptions}
                  value={productOptions.find(option => option.value === item.product_id)}
                  onChange={option => handleProductChange(index, option?.value || '')}
                  className="mr-3"  // Добавлено расстояние справа от продукта
                />
                <FormControl
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={e => handleQuantityChange(index, parseInt(e.target.value))}
                  className="mr-3"  // Добавлено расстояние справа от количества
                />
                <FormControl
                  type="number"
                  min="0"
                  step="0.01"
                  readOnly
                  value={item.price}
                  onChange={e => handleItemChange(index, 'price', parseFloat(e.target.value))}
                  className="mr-3"  // Добавлено расстояние справа от цены
                />
                <FormControl
                  type="number"
                  min="0"
                  step="0.01"
                  readOnly
                  placeholder={t('costPrice')}
                  value={item.cost_price}
                  onChange={e => handleItemChange(index, 'cost_price', parseFloat(e.target.value))}
                />
                <Button 
                  variant="link" 
                  onClick={() => handleRemoveItem(index)} 
                  style={{ padding: '0.25rem', marginLeft: '0.5rem' }}
                >
                  <FaTimes size={16} />
                </Button>
              </InputGroup>
            ))}
            <Button variant="secondary" onClick={handleAddItem}>{t('addProduct')}</Button>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onSave}>{t('saveChanges')}</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OrderModal;
