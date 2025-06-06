import React from 'react';
import { Modal, Form, Button, InputGroup, FormControl } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { FaTimes } from 'react-icons/fa';
import useTranslation from 'next-translate/useTranslation';

const Select = dynamic(() => import('react-select'), { ssr: false });

interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
  cost_price: number; // Новое поле для себестоимости
}

interface Client {
  id: number;
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
  clientOptions: { value: number, label: string }[];
  productOptions: { value: number, label: string }[];
  statusOptions: { value: string, label: string }[];
  clientId: number | null;
  status: string;
  items: OrderItem[];
  setClientId: (clientId: number | null) => void;
  setStatus: (status: string) => void;
  handleProductChange: (index: number, product_id: number) => void;
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
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="text-primary">{t('orderDetails')}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <Form>
          <Form.Group controlId="clientSelect">
            <Form.Label>{t('client')}</Form.Label>
            <Select
              options={clientOptions}
              value={clientId ? clientOptions.find(option => option.value === clientId) : null}
              onChange={option => setClientId(option?.value || null)}
              placeholder={t('chooseClient')}
              isClearable

              menuPortalTarget={typeof window !== 'undefined' ? document.body : undefined}
              styles={{
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999999,
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999999,
                }),
              }}
            />
          </Form.Group>

          {showStatusSelect && (
            <Form.Group controlId="statusSelect">
              <Form.Label>{t('status')}</Form.Label>
              <Select
                options={statusOptions}
                value={statusOptions.find(option => option.value === status)}
                onChange={option => setStatus(option?.value || '')}
                menuPortalTarget={typeof window !== 'undefined' ? document.body : undefined}
                styles={{
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999999,
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999999,
                  }),
                }}
              />
            </Form.Group>
          )}

          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">{t('products')}</h5>
              <Button variant="primary" className="rounded-pill" onClick={handleAddItem}>
                + {t('addProduct')}
              </Button>
            </div>
            
            <div className="order-products-table">
              <div className="order-products-header">
                <div className="product-column">{t('product')}</div>
                <div className="quantity-column">{t('quantity')}</div>
                <div className="price-column">{t('price')}</div>
                <div className="cost-column">{t('costPrice')}</div>
                <div className="action-column"></div>
              </div>
              
              {items.map((item, index) => (
                <div className="order-products-row" key={index}>
                  <div className="product-column">
                    <Select
                      options={productOptions}
                      value={item.product_id > 0 ? productOptions.find(option => option.value === item.product_id) : null}
                      onChange={option => handleProductChange(index, option?.value || 0)}
                      placeholder={t('selectProduct')}
                      isSearchable
                      isClearable
                      menuPortalTarget={typeof window !== 'undefined' ? document.body : undefined}
                      styles={{
                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 9999999,
                        }),
                        menu: (base) => ({
                          ...base,
                          zIndex: 9999999,
                        }),
                      }}
                    />
                  </div>
                  <div className="quantity-column">
                    <FormControl
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => handleQuantityChange(index, parseInt(e.target.value))}
                    />
                  </div>
                  <div className="price-column">
                    <FormControl
                      type="number"
                      min="0"
                      step="0.01"
                      readOnly
                      value={item.price}
                      onChange={e => handleItemChange(index, 'price', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="cost-column">
                    <FormControl
                      type="number"
                      min="0"
                      step="0.01"
                      readOnly
                      value={item.cost_price}
                      onChange={e => handleItemChange(index, 'cost_price', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="action-column">
                    <Button 
                      variant="outline-danger" 
                      className="delete-btn"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <FaTimes />
                    </Button>
                  </div>
                </div>
              ))}
              
              {items.length === 0 && (
                <div className="text-center py-4 text-muted">
                  <p>{t('noProductsAdded')}</p>
                </div>
              )}
            </div>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex flex-column align-items-stretch">
        {items.length > 0 && (
          <div className="w-100 mb-3">
            <div className="d-flex justify-content-between border-top pt-2">
              <span className="fw-bold">{t('totalPrice')}:</span>
              <span className="fw-bold">
                {items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)} {t('currency')}
              </span>
            </div>
            <div className="d-flex justify-content-between text-muted small">
              <span>{t('totalCost')}:</span>
              <span>
                {items.reduce((sum, item) => sum + (item.cost_price * item.quantity), 0).toFixed(2)} {t('currency')}
              </span>
            </div>
            <div className="d-flex justify-content-between text-success small">
              <span>{t('profit')}:</span>
              <span>
                {(
                  items.reduce((sum, item) => sum + (item.price * item.quantity), 0) - 
                  items.reduce((sum, item) => sum + (item.cost_price * item.quantity), 0)
                ).toFixed(2)} {t('currency')}
              </span>
            </div>
          </div>
        )}
        <div className="d-flex justify-content-end w-100">
          <Button variant="outline-secondary" className="me-2" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button 
            variant="primary" 
            onClick={onSave}
            disabled={items.length === 0 || !clientId}
          >
            {t('saveChanges')}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default OrderModal;
