import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import fetcher from '../utils/fetcher';
import useTranslation from 'next-translate/useTranslation';
import { Container, Table, Button, Form, Modal, InputGroup, FormControl } from 'react-bootstrap';
import Select from 'react-select';

const Orders = () => {
  const { t, lang } = useTranslation('common');
  const { data: orders = [], mutate: mutateOrders } = useSWR('/api/orders', fetcher);
  const { data: clients = [], mutate: mutateClients } = useSWR('/api/clients', fetcher);
  const { data: products = [], mutate: mutateProducts } = useSWR('/api/products', fetcher);
  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [statusOrderId, setStatusOrderId] = useState(null);
  const [deleteOrderId, setDeleteOrderId] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [status, setStatus] = useState('');

  const statusOptions = [
    { value: 'New', label: t('new') },
    { value: 'In Progress', label: t('inProgress') },
    { value: 'Delivery', label: t('delivery') },
    { value: 'Finished', label: t('finished') },
  ];

  useEffect(() => {
    console.log("Orders:", orders);
    console.log("Clients:", clients);
    console.log("Products:", products);
  }, [orders, clients, products]);

  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setClientId(order.client_id);
    setStatus(order.status);
    setItems(order.items ? order.items.map(item => ({ productId: item.product_id, quantity: item.quantity, price: item.price })) : []);
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

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, price: 0 }]);
  };

  const handleProductChange = (index, productId) => {
    const updatedItems = [...items];
    const product = products.find(p => p.id === productId);
    updatedItems[index] = { productId, quantity: 1, price: product.price };
    setItems(updatedItems);
  };

  const handleQuantityChange = (index, quantity) => {
    const updatedItems = [...items];
    updatedItems[index].quantity = quantity;
    setItems(updatedItems);
  };

  const handleClientClick = (client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const handleCloseClientModal = () => {
    setSelectedClient(null);
    setShowClientModal(false);
  };

  const handleChangeStatus = (orderId) => {
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
      body: JSON.stringify({ status }),
    });
    mutateOrders();
    setStatusOrderId(null);
    setShowStatusModal(false);
  };

  const handleDeleteOrder = (orderId) => {
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

  const filterOrders = (status, client) => {
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

  const calculateTotalPrice = (items) => items.reduce((total, item) => total + item.quantity * item.price, 0);

  const groupedItems = (items) => {
    const itemMap = {};
    items.forEach(item => {
      if (!itemMap[item.product_id]) {
        itemMap[item.product_id] = { ...item, quantity: 0 };
      }
      itemMap[item.product_id].quantity += item.quantity;
    });
    return Object.values(itemMap);
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
              <td onClick={() => handleClientClick(clients.find(client => client.id === order.client_id))} style={{ cursor: 'pointer' }}>
                {clients.find(client => client.id === order.client_id)?.name || t('unknownClient')}
              </td>
              <td>{statusOptions.find(option => option.value === order.status)?.label || order.status}</td>
              <td>{new Date(order.date).toLocaleString()}</td>
              <td>
                {groupedItems(order.items).map(item => (
                  <div key={item.product_id}>
                    {products.find(product => product.id === item.product_id)?.name || t('unknownProduct')} - {item.quantity}
                  </div>
                ))}
              </td>
              <td>{calculateTotalPrice(order.items).toFixed(2)}</td>
              <td>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span
                    style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                    onClick={() => handleChangeStatus(order.id)}
                  >
                    {t('changeStatus')}
                  </span>
                  <span
                    style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                    onClick={() => handleEditOrder(order)}
                  >
                    {t('edit')}
                  </span>
                  <span
                    style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                    onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }}
                  >
                    {t('delete')}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showCreateOrderModal} onHide={() => setShowCreateOrderModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('createOrder')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="row g-3">
            <Form.Group controlId="clientId" className="col-md-6">
              <Form.Label>{t('client')}</Form.Label>
              <Select
                value={clientOptions.find(option => option.value === clientId)}
                onChange={(selectedOption) => setClientId(selectedOption ? selectedOption.value : '')}
                options={clientOptions}
                placeholder={t('chooseClient')}
              />
            </Form.Group>
            <Form.Group controlId="items" className="col-md-12">
              <Form.Label>{t('products')}</Form.Label>
              {items.map((item, index) => (
                <div key={index} className="mb-2 p-2 border rounded">
                  <Select
                    value={productOptions.find(option => option.value === item.productId)}
                    onChange={(selectedOption) => handleProductChange(index, selectedOption.value)}
                    options={productOptions}
                    placeholder={t('chooseProduct')}
                    className="mb-1"
                  />
                  <Form.Label>{t('quantity')}</Form.Label>
                  <InputGroup className="mb-1">
                    <InputGroup.Text onClick={() => handleQuantityChange(index, Math.max(1, items[index].quantity - 1))}>-</InputGroup.Text>
                    <Form.Control
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10))}
                      placeholder={t('quantity')}
                      className="text-center"
                    />
                    <InputGroup.Text onClick={() => handleQuantityChange(index, items[index].quantity + 1)}>+</InputGroup.Text>
                  </InputGroup>
                  <Form.Label>{t('price')}</Form.Label>
                  <Form.Control
                    type="number"
                    value={item.price}
                    readOnly
                    placeholder={t('price')}
                    className="mb-1"
                  />
                </div>
              ))}
              <Button variant="secondary" onClick={handleAddItem}>{t('addProduct')}</Button>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateOrderModal(false)}>{t('close')}</Button>
          <Button variant="primary" onClick={handleCreateOrder}>{t('saveChanges')}</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showOrderModal} onHide={handleCloseOrderModal}>
        <Modal.Header closeButton>
          <Modal.Title>{t('editOrder')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="row g-3">
            <Form.Group controlId="clientId" className="col-md-6">
              <Form.Label>{t('client')}</Form.Label>
              <Select
                value={clientOptions.find(option => option.value === clientId)}
                onChange={(selectedOption) => setClientId(selectedOption ? selectedOption.value : '')}
                options={clientOptions}
                placeholder={t('chooseClient')}
              />
            </Form.Group>
            <Form.Group controlId="status" className="col-md-6">
              <Form.Label>{t('status')}</Form.Label>
              <Select
                value={statusOptions.find(option => option.value === status)}
                onChange={(selectedOption) => setStatus(selectedOption ? selectedOption.value : '')}
                options={statusOptions}
                placeholder={t('chooseStatus')}
              />
            </Form.Group>
            <Form.Group controlId="items" className="col-md-12">
              <Form.Label>{t('products')}</Form.Label>
              {items.map((item, index) => (
                <div key={index} className="mb-2 p-2 border rounded">
                  <Select
                    value={productOptions.find(option => option.value === item.productId)}
                    onChange={(selectedOption) => handleProductChange(index, selectedOption.value)}
                    options={productOptions}
                    placeholder={t('chooseProduct')}
                    className="mb-1"
                  />
                  <Form.Label>{t('quantity')}</Form.Label>
                  <InputGroup className="mb-1">
                    <InputGroup.Text onClick={() => handleQuantityChange(index, Math.max(1, items[index].quantity - 1))}>-</InputGroup.Text>
                    <Form.Control
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10))}
                      placeholder={t('quantity')}
                      className="text-center"
                    />
                    <InputGroup.Text onClick={() => handleQuantityChange(index, items[index].quantity + 1)}>+</InputGroup.Text>
                  </InputGroup>
                  <Form.Label>{t('price')}</Form.Label>
                  <Form.Control
                    type="number"
                    value={item.price}
                    readOnly
                    placeholder={t('price')}
                    className="mb-1"
                  />
                </div>
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

      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('changeStatus')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="status">
              <Form.Label>{t('status')}</Form.Label>
              <Select
                value={statusOptions.find(option => option.value === status)}
                onChange={(selectedOption) => setStatus(selectedOption ? selectedOption.value : '')}
                options={statusOptions}
                placeholder={t('chooseStatus')}
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
        <Modal.Body>
          <p>{t('deleteConfirmationMessage')}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>{t('cancel')}</Button>
          <Button variant="danger" onClick={handleConfirmDelete}>{t('delete')}</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showClientModal} onHide={handleCloseClientModal}>
        <Modal.Header closeButton>
          <Modal.Title>{t('clientDetails')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedClient && (
            <div>
              <p><strong>{t('name')}: </strong>{selectedClient.name}</p>
              <p><strong>{t('surname')}: </strong>{selectedClient.surname}</p>
              <p><strong>{t('telegram')}: </strong>
                {selectedClient.telegram ? (
                  <a href={`https://t.me/${selectedClient.telegram}`} target="_blank" rel="noopener noreferrer">
                    {selectedClient.telegram}
                  </a>
                ) : (
                  'N/A'
                )}
              </p>
              <p><strong>{t('instagram')}: </strong>
                {selectedClient.instagram ? (
                  <a href={`https://instagram.com/${selectedClient.instagram}`} target="_blank" rel="noopener noreferrer">
                    {selectedClient.instagram}
                  </a>
                ) : (
                  'N/A'
                )}
              </p>
              <p><strong>{t('phone')}: </strong>
                {selectedClient.phone ? (
                  <a href={`tel:${selectedClient.phone}`}>
                    {selectedClient.phone}
                  </a>
                ) : (
                  'N/A'
                )}
              </p>
              <p><strong>{t('address')}: </strong>
                {selectedClient.address ? (
                  <a href={`https://maps.google.com/?q=${selectedClient.address}`} target="_blank" rel="noopener noreferrer">
                    {selectedClient.address}
                  </a>
                ) : (
                  'N/A'
                )}
              </p>
              <p><strong>{t('source')}: </strong>{selectedClient.source}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseClientModal}>{t('close')}</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Orders;
