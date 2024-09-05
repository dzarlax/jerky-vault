import React, { useState, useEffect } from "react";
import useSWR from "swr";
import fetcher from "../utils/fetcher";
import useTranslation from "next-translate/useTranslation";
import { Container, Table, Button, InputGroup } from "react-bootstrap";
import Select, { SingleValue } from 'react-select';
import OrderModal from "../components/modal/Orders/OrderModal";
import ClientModal from "../components/modal/Orders/ClientModal";
import StatusModal from "../components/modal/Orders/StatusModal";
import DeleteModal from "../components/modal/Orders/DeleteModal";
import { useRouter } from 'next/router';

interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
  cost_price: number; 
}

interface Order {
  id: number;
  client_id: number;
  status: string;
  created_at: string;
  items: OrderItem[];
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

const Orders = () => {
  const { t } = useTranslation("common");
  const { data: orders = [], mutate: mutateOrders } = useSWR<Order[]>("/api/orders", fetcher);
  const { data: clients = [], mutate: mutateClients } = useSWR<Client[]>("/api/clients", fetcher);
  const { data: products = [], mutate: mutateProducts } = useSWR<any[]>("/api/products", fetcher);
  const router = useRouter();
  const [clientId, setClientId] = useState<number | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
  const [showClientModal, setShowClientModal] = useState<boolean>(false);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState<boolean>(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [statusOrderId, setStatusOrderId] = useState<number | null>(null);
  const [deleteOrderId, setDeleteOrderId] = useState<number | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<SingleValue<{ value: string; label: string }> | null>(null);
  const [selectedClientFilter, setSelectedClientFilter] = useState<SingleValue<{ value: number; label: string }> | null>(null);

  const statusOptions = [
    { value: "new", label: t("new") },
    { value: "in_progress", label: t("in_progress") },
    { value: "delivery", label: t("delivery") },
    { value: "finished", label: t("finished") },
  ];

  useEffect(() => {
    filterOrders(selectedStatus, selectedClientFilter);
  }, [selectedStatus, selectedClientFilter, orders]);

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setClientId(order.client_id);
    setStatus(order.status);
    setItems(
      order.items
        ? order.items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            cost_price: item.cost_price,
          }))
        : []
    );
    setShowOrderModal(true);
  };

  const handleCloseOrderModal = () => {
    setEditingOrder(null);
    setClientId(null);
    setStatus("");
    setItems([]);
    setShowOrderModal(false);
    setShowCreateOrderModal(false);
  };

  const handleSaveOrderChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
          router.push('/auth/signin');
          return;
      }
      const order = { client_id: clientId, status, items };

      if (editingOrder) {
        await fetcher(`/api/orders/${editingOrder.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(order),
        });
        mutateOrders();
      } else {
        await fetcher("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(order),
        });
        mutateOrders();
      }

      handleCloseOrderModal();
    } catch (error) {
      console.error('Failed to save order changes', error);
    }
  };

  const handleCreateOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
          router.push('/auth/signin');
          return;
      }
      const order = { client_id: clientId, status: "new", items };

      await fetcher("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(order),
      });
      setClientId(null);
      setItems([]);
      mutateOrders();
      setShowCreateOrderModal(false);
    } catch (error) {
      console.error('Failed to create order', error);
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof OrderItem,
    value: any
  ) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { product_id: 0, quantity: 1, price: 0, cost_price: 0 },
    ]);
  };

  const handleProductChange = (index: number, product_id: number) => {
    const updatedItems = [...items];
    const product = products.find((p) => p.id === product_id);
    updatedItems[index] = {
      product_id,
      quantity: 1,
      price: product?.price ?? 0,
      cost_price: product?.cost ?? 0,
    };
    setItems(updatedItems);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], quantity };
    setItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
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

  const handleChangeStatus = (orderId: number) => {
    const order = orders.find((order) => order.id === orderId);
    if (order) {
      setStatus(order.status);
    }
    setStatusOrderId(orderId);
    setShowStatusModal(true);
  };

  const handleSaveStatusChange = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
          router.push('/auth/signin');
          return;
      }
      if (!statusOrderId || !status) return;

      await fetcher(`/api/orders/${statusOrderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      mutateOrders();
      setStatusOrderId(null);
      setShowStatusModal(false);
    } catch (error) {
      console.error('Failed to update order status', error);
    }
  };

  const handleDeleteOrder = (orderId: number) => {
    setDeleteOrderId(orderId);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
          router.push('/auth/signin');
          return;
      }
      if (!deleteOrderId) return;

      await fetcher(`/api/orders/${deleteOrderId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`,
        },
      });
      mutateOrders();
      setDeleteOrderId(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete order', error);
    }
  };

  const filterOrders = (status: SingleValue<{ value: string; label: string }> | null, client: SingleValue<{ value: number; label: string }> | null) => {
    let filtered = orders;

    if (status) {
      filtered = filtered.filter((order) => order.status === status.value);
    }

    if (client) {
      filtered = filtered.filter((order) => order.client_id === client.value);
    }

    setFilteredOrders(filtered);
  };

  const clientOptions = clients.map((client) => ({
    value: client.id,
    label: `${client.name} ${client.surname}`,
  }));
  const productOptions = products.map((product) => ({
    value: product.id,
    label: product.name,
  }));

  const calculateTotalPrice = (items: OrderItem[]) =>
    items.reduce((total, item) => total + item.quantity * item.price, 0);
  const calculateTotalCostPrice = (items: OrderItem[]) =>
    items.reduce((total, item) => total + item.quantity * item.cost_price, 0);

  const groupedItems = (items: OrderItem[]) => {
    const itemMap: { [key: number]: OrderItem } = {};
    items.forEach((item) => {
      if (!itemMap[item.product_id]) {
        itemMap[item.product_id] = { ...item, quantity: 0 };
      }
      itemMap[item.product_id].quantity += item.quantity;
    });
    return Object.values(itemMap);
  };

  const getTelegramLink = (username: string) => {
    return `https://t.me/${username.replace("@", "")}`;
  };

  const getInstagramLink = (username: string) => {
    return `https://instagram.com/${username.replace("@", "")}`;
  };

  const getPhoneLink = (phone: string) => {
    return `tel:${phone}`;
  };

  const getMapLink = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
  };

  return (
    <Container>
      <h1>{t("orders")}</h1>
      <InputGroup className="mb-3">
        <Select
          className="me-2"
          options={statusOptions}
          onChange={(selectedStatus) => setSelectedStatus(selectedStatus)}
          placeholder={t("filterByStatus")}
        />
        <Select
          className="me-2"
          options={clientOptions}
          onChange={(selectedClient) => setSelectedClientFilter(selectedClient)}
          placeholder={t("filterByClient")}
        />
        <Button variant="primary" onClick={() => setShowCreateOrderModal(true)}>
          {t("createOrder")}
        </Button>
      </InputGroup>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>{t("order")}</th>
            <th>{t("client")}</th>
            <th>{t("status")}</th>
            <th>{t("date")}</th>
            <th>{t("products")}</th>
            <th>{t("totalCost")}</th>
            <th>{t("totalCostPrice")}</th>
            <th>{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td
                onClick={() =>
                  handleClientClick(
                    clients.find((client) => client.id === order.client_id) ||
                      ({} as Client)
                  )
                }
                style={{ cursor: "pointer" }}
              >
                {clients.find((client) => client.id === order.client_id)?.name ||
                  t("unknownClient")}
              </td>
              <td>{t(order.status.toLowerCase())}</td>
              <td>{new Date(order.created_at).toLocaleDateString()}</td>
              <td>{groupedItems(order.items).map((item) => {
                  const product = products.find((p) => p.id === item.product_id);
                  return (
                    <div key={item.product_id}>
                      {product ? product.name : t("unknownProduct")} (
                      {item.quantity})
                    </div>
                  );
                })}
              </td>
              <td>{calculateTotalPrice(order.items).toFixed(2)}{" "}{t("currency")}</td>
              <td>
                {calculateTotalCostPrice(order.items).toFixed(2)}{" "}{t("currency")}
              </td>
              <td className="d-flex justify-content-between">
                <span
                  onClick={() => handleChangeStatus(order.id)}
                  style={{
                    cursor: "pointer",
                    color: "blue",
                    textAlign: "left",
                  }}
                >
                  {t("changeStatus")}
                </span>
                <span
                  onClick={() => handleEditOrder(order)}
                  style={{
                    cursor: "pointer",
                    color: "blue",
                    textAlign: "center",
                  }}
                >
                  {t("edit")}
                </span>
                <span
                  onClick={() => handleDeleteOrder(order.id)}
                  style={{
                    cursor: "pointer",
                    color: "red",
                    textAlign: "right",
                  }}
                >
                  {t("delete")}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <OrderModal
        show={showOrderModal || showCreateOrderModal}
        onClose={handleCloseOrderModal}
        onSave={editingOrder ? handleSaveOrderChanges : handleCreateOrder}
        clientOptions={clientOptions}
        productOptions={productOptions}
        statusOptions={statusOptions}
        clientId={clientId}
        status={status}
        items={items}
        setClientId={setClientId}
        setStatus={setStatus}
        handleProductChange={handleProductChange}
        handleQuantityChange={handleQuantityChange}
        handleItemChange={handleItemChange}
        handleRemoveItem={handleRemoveItem}
        handleAddItem={handleAddItem}
      />

      <ClientModal
        show={showClientModal}
        onClose={handleCloseClientModal}
        client={selectedClient}
        getTelegramLink={getTelegramLink}
        getInstagramLink={getInstagramLink}
        getPhoneLink={getPhoneLink}
        getMapLink={getMapLink}
      />

      <StatusModal
        show={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onSave={handleSaveStatusChange}
        statusOptions={statusOptions}
        status={status}
        setStatus={setStatus}
      />

      <DeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleConfirmDelete}
      />
    </Container>
  );
};

export default Orders;
