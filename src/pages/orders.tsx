import React, { useState, useEffect } from "react";
import useSWR from "swr";
import fetcher from "../utils/fetcher";
import useTranslation from "next-translate/useTranslation";
import { Container, Table, Button, InputGroup } from "react-bootstrap";
import Select from "react-select";
import OrderModal from "../components/modal/Orders/OrderModal";
import ClientModal from "../components/modal/Orders/ClientModal";
import StatusModal from "../components/modal/Orders/StatusModal";
import DeleteModal from "../components/modal/Orders/DeleteModal";

interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  cost_price: number; // Новое поле для себестоимости
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

const Orders = () => {
  const { t } = useTranslation("common");
  const { data: orders = [], mutate: mutateOrders } = useSWR(
    "/api/orders",
    fetcher
  );
  const { data: clients = [], mutate: mutateClients } = useSWR(
    "/api/clients",
    fetcher
  );
  const { data: products = [], mutate: mutateProducts } = useSWR(
    "/api/products",
    fetcher
  );

  const [clientId, setClientId] = useState<string>("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
  const [showClientModal, setShowClientModal] = useState<boolean>(false);
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showCreateOrderModal, setShowCreateOrderModal] =
    useState<boolean>(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [statusOrderId, setStatusOrderId] = useState<string | null>(null);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedClientFilter, setSelectedClientFilter] = useState(null);

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
    setClientId("");
    setStatus("");
    setItems([]);
    setShowOrderModal(false);
    setShowCreateOrderModal(false);
  };

  const handleSaveOrderChanges = async () => {
    const order = { clientId, status, items };

    if (editingOrder) {
      await fetch(`/api/orders/${editingOrder.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });
      mutateOrders();
    } else {
      await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });
      mutateOrders();
    }

    handleCloseOrderModal();
  };

  const handleCreateOrder = async () => {
    const order = { clientId, status: "new", items };

    await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });
    setClientId("");
    setItems([]);
    mutateOrders();
    setShowCreateOrderModal(false);
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
      { product_id: "", quantity: 1, price: 0, cost_price: 0 },
    ]);
  };

  const handleProductChange = (index: number, product_id: string) => {
    const updatedItems = [...items];
    const product = products.find((p) => p.id == product_id);
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
    const order = orders.find((order) => order.id === orderId);
    if (order) {
      setStatus(order.status); // Устанавливаем текущий статус заказа
    }
    setStatusOrderId(orderId);
    setShowStatusModal(true);
  };

  const handleSaveStatusChange = async () => {
    if (!statusOrderId || !status) return;

    await fetch(`/api/orders/${statusOrderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
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
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    mutateOrders();
    setDeleteOrderId(null);
    setShowDeleteModal(false);
  };

  const filterOrders = (status: any, client: any) => {
    let filtered = orders;

    if (status) {
      filtered = filtered.filter((order) => order.status === status.value);
    }

    if (client) {
      filtered = filtered.filter((order) => order.client_id === client.value);
    }

    if (JSON.stringify(filteredOrders) !== JSON.stringify(filtered)) {
      setFilteredOrders(filtered);
    }
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
    const itemMap: { [key: string]: OrderItem } = {};
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
            {/* Новая колонка для себестоимости */}
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
                    clients.find((client) => client.id == order.client_id) ||
                      ({} as Client)
                  )
                }
                style={{ cursor: "pointer" }}
              >
                {clients.find((client) => client.id == order.client_id)?.name ||
                  t("unknownClient")}
              </td>
              <td>{t(order.status.toLowerCase())}</td>
              <td>{new Date(order.date).toLocaleDateString()}</td>
              <td>{groupedItems(order.items).map((item) => {
                  const product = products.find((p) => p.id == item.product_id);
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
