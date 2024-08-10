import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import fetcher from '../utils/fetcher';
import useTranslation from 'next-translate/useTranslation';
import { Container, Table, Button, Form, Modal, InputGroup, FormControl } from 'react-bootstrap';
import Select from 'react-select';
import { FaTimes } from 'react-icons/fa';

interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  client_id: string;
  status: string;
  date: string;
  items: OrderItem[];
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

interface Product {
  id: string;
  name: string;
  price: number;
}

const Orders = () => {
  const { t } = useTranslation('common');
  const { data: orders = [], mutate: mutateOrders } = useSWR('/api/orders', fetcher);
  const { data: clients = [], mutate: mutateClients } = useSWR('/api/clients', fetcher);
  const { data: products = [], mutate: mutateProducts } = useSWR('/api/products', fetcher);
  const [clientId, setClientId] = useState<string>('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
  const [showClientModal, setShowClientModal] = useState<boolean>(false);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState<boolean>(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [statusOrderId, setStatusOrderId] = useState<string | null>(null);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<string>('');

  const statusOptions = [
    { value: 'New', label: t('new') },
    { value: 'In Progress', label: t('inProgress') },
    { value: 'Delivery', label: t('delivery') },
    { value: 'Finished', label: t('finished') },
  ];

  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setClientId(order.client_id);
    setStatus(order.status);
    setItems(order.items ? order.items.map(item => ({ product_id: item.product_id, quantity: item.quantity, price: item.price })) : []);
    setShowOrderModal(true);
  };

  const handleCloseOrderModal = () => {
    setEditingOrder(null);
    setClientId('');
    setStatus('');
    setItems([]);
    setShowOrderModal(false);
  };

  const handleSaveOrderChanges = async () => {
    const order = { clientId, status, items };

    if (editingOrder) {
      await fetch(`/api/orders/${editingOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });
      mutateOrders();
    } else {
      await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });
      mutateOrders();
    }

    handleCloseOrderModal();
  };

  const handleCreateOrder = async () => {
    const order = { clientId, status: 'New', items };

    await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });
    setClientId('');
    setItems([]);
    mutateOrders();
    setShowCreateOrderModal(false);
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    setItems([...items, { product_id: '', quantity: 1, price: 0 }]);
  };

  const handleProductChange = (index: number, product_id: string) => {
    const updatedItems = [...items];
    const product = products.find(p => p.id == product_id);
    updatedItems[index] = { product_id, quantity: 1, price: product?.price ?? 0 };
    setItems(updatedItems);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], quantity };
    setItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1); // Удаляем элемент по индексу
    setItems(updatedItems);
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const handleCloseClientModal = () => {
    setSelectedClient(null);
    setShowClientModal(false);
  };

  const handleChangeStatus = (orderId: string) => {
    setStatusOrderId(orderId);
    setShowStatusModal(true);
  };

  const handleSaveStatusChange = async () => {
    if (!statusOrderId || !status) return;

    await fetch(`/api/orders/${statusOrderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }), // Отправляем только статус
    });
    mutateOrders();
    setStatusOrderId(null);
    setShowStatusModal(false);
  };

  const handleDeleteOrder = (orderId: string) => {
    setDeleteOrderId(orderId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteOrderId) return;

    await fetch(`/api/orders/${deleteOrderId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    mutateOrders();
    setDeleteOrderId(null);
    setShowDeleteModal(false);
  };

  const filterOrders = (status: any, client: any) => {
    let filtered = orders;

    if (status) {
      filtered = filtered.filter(order => order.status === status.value);
    }

    if (client) {
      filtered = filtered.filter(order => order.client_id === client.value);
    }

    setFilteredOrders(filtered);
  };

  const clientOptions = clients.map(client => ({ value: client.id, label: `${client.name} ${client.surname}` }));
  const productOptions = products.map(product => ({ value: product.id, label: product.name }));

  const calculateTotalPrice = (items: OrderItem[]) => items.reduce((total, item) => total + item.quantity * item.price, 0);

  const groupedItems = (items: OrderItem[]) => {
    const itemMap: { [key: string]: OrderItem } = {};
    items.forEach(item => {
      if (!itemMap[item.product_id]) {
        itemMap[item.product_id] = { ...item, quantity: 0 };
      }
      itemMap[item.product_id].quantity += item.quantity;
    });
    return Object.values(itemMap);
  };

  const getTelegramLink = (username: string) => {
    return `https://t.me/${username.replace('@', '')}`;
  };

  const getInstagramLink = (username: string) => {
    return `https://instagram.com/${username.replace('@', '')}`;
  };

  const getPhoneLink = (phone: string) => {
    return `tel:${phone}`;
  };

  const getMapLink = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  return (
    <Container>
      <h1>{t('orders')}</h1>

      <InputGroup className="mb-3">
        <Select
          className="me-2"
          options={statusOptions}
          onChange={(selectedStatus) => filterOrders(selectedStatus, null)}
          placeholder={t('filterByStatus')}
        />
        <Select
          className="me-2"
          options={clientOptions}
          onChange={(selectedClient) => filterOrders(null, selectedClient)}
          placeholder={t('filterByClient')}
        />
        <Button variant="primary" onClick={() => setShowCreateOrderModal(true)}>{t('createOrder')}</Button>
      </InputGroup>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>{t('order')}</th>
            <th>{t('client')}</th>
            <th>{t('status')}</th>
            <th>{t('date')}</th>
            <th>{t('products')}</th>
            <th>{t('totalCost')}</th>
            <th>{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td
                onClick={() => handleClientClick(clients.find(client => client.id == order.client_id) || {} as Client)}
                style={{ cursor: 'pointer' }}
              >
                {clients.find(client => client.id == order.client_id)?.name || t('unknownClient')}
              </td>
              <td>{t(order.status.toLowerCase())}</td>
              <td>{new Date(order.date).toLocaleDateString()}</td>
              <td>
                {groupedItems(order.items).map(item => {
                  const product = products.find(p => p.id == item.product_id);
                  return (
                    <div key={item.product_id}>
                      {product ? product.name : t('unknownProduct')} ({item.quantity})
                    </div>
                  );
                })}
              </td>
              <td>{calculateTotalPrice(order.items).toFixed(2)} {t('currency')}</td>
              <td className="d-flex justify-content-between">
                <span
                  onClick={() => handleChangeStatus(order.id)}
                  style={{ cursor: 'pointer', color: 'blue', textAlign: 'left' }}
                >
                  {t('changeStatus')}
                </span>
                <span
                  onClick={() => handleEditOrder(order)}
                  style={{ cursor: 'pointer', color: 'blue', textAlign: 'center' }}
                >
                  {t('edit')}
                </span>
                <span
                  onClick={() => handleDeleteOrder(order.id)}
                  style={{ cursor: 'pointer', color: 'red', textAlign: 'right' }}
                >
                  {t('delete')}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showOrderModal} onHide={handleCloseOrderModal}>
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
            <Form.Group controlId="statusSelect">
              <Form.Label>{t('status')}</Form.Label>
              <Select
                options={statusOptions}
                value={statusOptions.find(option => option.value === status)}
                onChange={option => setStatus(option?.value || '')}
              />
            </Form.Group>
            <Form.Group controlId="items">
              <Form.Label>{t('products')}</Form.Label>
              {items.map((item, index) => (
                <InputGroup className="mb-3" key={index}>
                  <Select
                    options={productOptions}
                    value={productOptions.find(option => option.value === item.product_id)}
                    onChange={option => handleProductChange(index, option?.value || '')}
                  />
                  <FormControl
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => handleQuantityChange(index, parseInt(e.target.value))}
                  />
                  <FormControl
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={e => handleItemChange(index, 'price', parseFloat(e.target.value))}
                  />
                  <Button variant="danger" onClick={() => handleRemoveItem(index)}><FaTimes /></Button>
                </InputGroup>
              ))}
              <Button variant="secondary" onClick={handleAddItem}>{t('addProduct')}</Button>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseOrderModal}>{t('close')}</Button>
          <Button variant="primary" onClick={handleSaveOrderChanges}>{t('saveChanges')}</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCreateOrderModal} onHide={() => setShowCreateOrderModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('createOrder')}</Modal.Title>
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
            <Form.Group controlId="items">
              <Form.Label>{t('products')}</Form.Label>
              {items.map((item, index) => (
                <InputGroup className="mb-3" key={index}>
                  <Select
                    options={productOptions}
                    value={productOptions.find(option => option.value === item.product_id)}
                    onChange={option => handleProductChange(index, option?.value || '')}
                  />
                  <FormControl
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => handleQuantityChange(index, parseInt(e.target.value))}
                  />
                  <FormControl
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={e => handleItemChange(index, 'price', parseFloat(e.target.value))}
                  />
                  <Button variant="danger" onClick={() => handleRemoveItem(index)}><FaTimes /></Button>
                </InputGroup>
              ))}
              <Button variant="secondary" onClick={handleAddItem}>{t('addProduct')}</Button>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateOrderModal(false)}>{t('close')}</Button>
          <Button variant="primary" onClick={handleCreateOrder}>{t('create')}</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showClientModal} onHide={handleCloseClientModal}>
        <Modal.Header closeButton>
          <Modal.Title>{t('clientDetails')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedClient && (
            <div>
              <h4>{selectedClient.name} {selectedClient.surname}</h4>
              {selectedClient.telegram && (
                <p><strong>{t('telegram')}:</strong> <a href={getTelegramLink(selectedClient.telegram)} target="_blank" rel="noopener noreferrer">{selectedClient.telegram}</a></p>
              )}
              {selectedClient.instagram && (
                <p><strong>{t('instagram')}:</strong> <a href={getInstagramLink(selectedClient.instagram)} target="_blank" rel="noopener noreferrer">{selectedClient.instagram}</a></p>
              )}
              {selectedClient.phone && (
                <p><strong>{t('phone')}:</strong> <a href={getPhoneLink(selectedClient.phone)}>{selectedClient.phone}</a></p>
              )}
              {selectedClient.address && (
                <p><strong>{t('address')}:</strong> <a href={getMapLink(selectedClient.address)} target="_blank" rel="noopener noreferrer">{selectedClient.address}</a></p>
              )}
              <p><strong>{t('source')}:</strong> {selectedClient.source}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseClientModal}>{t('close')}</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('changeStatus')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="statusSelect">
              <Form.Label>{t('status')}</Form.Label>
              <Select
                options={statusOptions}
                value={statusOptions.find(option => option.value === status)}
                onChange={option => setStatus(option?.value || '')}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>{t('close')}</Button>
          <Button variant="primary" onClick={handleSaveStatusChange}>{t('saveChanges')}</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('confirmDelete')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t('deleteConfirmationMessage')}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>{t('cancel')}</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>{t('delete')}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Orders;
