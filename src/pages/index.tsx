import React, { useMemo } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, ProgressBar } from 'react-bootstrap';
import useSWR from 'swr';
import useTranslation from 'next-translate/useTranslation';
import { Doughnut } from 'react-chartjs-2';
import { 
  Chart, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title 
} from 'chart.js';
import { useRouter } from 'next/router';
import fetcher from '../utils/fetcher';
import { useAuth, withAuth } from '../utils/authContext';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import OrderModal from '../components/modal/Orders/OrderModal';
import StatusModal from '../components/modal/Orders/StatusModal';
import DeleteModal from '../components/modal/Orders/DeleteModal';
import { swrConfigs } from '../utils/swrConfig';
import { 
  FaBook, 
  FaLeaf, 
  FaBoxOpen, 
  FaShoppingCart, 
  FaChartPie, 
  FaCalendarAlt, 
  FaUser, 
  FaArrowUp,
  FaDollarSign,
  FaClock,
  FaEye,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUsers,
  FaChartLine,
  FaSync,
  FaPencilAlt,
  FaTrash
} from 'react-icons/fa';

Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

interface OrderStats {
  total: number;
  new: number;
  in_progress: number;
  ready: number;
  finished: number;
  canceled: number;
}

interface Order {
  id: number;
  client_id: number;
  status: string;
  comment?: string;
  created_at: string;
  items: Array<{
    product_id: number;
    quantity: number;
    price: number;
    cost_price: number;
  }>;
}

interface DashboardData {
  total_recipes: number;
  total_products: number;
  total_orders: number;
  pending_orders: number;
  recent_orders: Array<{
    id: number;
    client_name: string;
    total_amount: number;
    status: string;
    order_date: string;
  }>;
  order_type_distribution: Array<{ type: string; count: number }>;
}

interface ProfitData {
  total_revenue: number;
  total_costs: number;
  total_profit: number;
  order_count: number;
}

const Dashboard = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { auth } = useAuth();

  const { data: dashboardStats, error: dashboardError, mutate } = useSWR<DashboardData>(
    auth.isAuthenticated || typeof window === 'undefined' ? '/api/dashboard' : null,
    fetcher,
    {
      ...swrConfigs.dashboard,
      fallbackData: {
        total_recipes: 0,
        total_products: 0,
        total_orders: 0,
        pending_orders: 0,
        recent_orders: [],
        order_type_distribution: []
      }
    }
  );
  
  const { data: clients = [] } = useSWR(
    auth.isAuthenticated || typeof window === 'undefined' ? '/api/clients' : null,
    fetcher,
    swrConfigs.static
  );

  const { data: orders = [], mutate: mutateOrders } = useSWR<Order[]>(
    auth.isAuthenticated || typeof window === 'undefined' ? '/api/orders' : null,
    fetcher,
    swrConfigs.list
  );

  const { data: ingredients = [] } = useSWR(
    auth.isAuthenticated || typeof window === 'undefined' ? '/api/ingredients' : null,
    fetcher,
    swrConfigs.static
  );

  const { data: recipes = [] } = useSWR(
    auth.isAuthenticated || typeof window === 'undefined' ? '/api/recipes' : null,
    fetcher,
    swrConfigs.static
  );

  const { data: products = [] } = useSWR(
    auth.isAuthenticated || typeof window === 'undefined' ? '/api/products' : null,
    fetcher,
    swrConfigs.static
  );

    // State for order modal
  const [showOrderModal, setShowOrderModal] = React.useState(false);
  const [editingOrder, setEditingOrder] = React.useState<Order | null>(null);
  const [clientId, setClientId] = React.useState<number | null>(null);
  const [status, setStatus] = React.useState<string>("");
  const [comment, setComment] = React.useState<string>("");
  const [items, setItems] = React.useState<Array<{
    product_id: number;
    quantity: number;
    price: number;
    cost_price: number;
  }>>([]); 

  // State for status and delete modals
  const [showStatusModal, setShowStatusModal] = React.useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState<boolean>(false);
  const [statusOrderId, setStatusOrderId] = React.useState<number | null>(null);
  const [deleteOrderId, setDeleteOrderId] = React.useState<number | null>(null);

  const { data: profitData, error: profitError } = useSWR<ProfitData>(
    auth.isAuthenticated || typeof window === 'undefined' ? '/api/dashboard/profit' : null,
    fetcher,
    {
      ...swrConfigs.dashboard,
      fallbackData: {
        total_revenue: 0,
        total_costs: 0,
        total_profit: 0,
        order_count: 0
      }
    }
  );

  // Calculate real order statistics from actual orders data
  const orderStats = useMemo(() => {
    if (!orders.length) return { total: 0, new: 0, in_progress: 0, ready: 0, finished: 0, canceled: 0 };
    
    return orders.reduce((stats, order) => {
      stats.total++;
      switch (order.status) {
        case 'new':
          stats.new++;
          break;
        case 'in_progress':
          stats.in_progress++;
          break;
        case 'ready':
          stats.ready++;
          break;
        case 'finished':
          stats.finished++;
          break;
        case 'canceled':
          stats.canceled++;
          break;
      }
      return stats;
    }, { total: 0, new: 0, in_progress: 0, ready: 0, finished: 0, canceled: 0 });
  }, [orders]);

  // Get pending orders from real data
  const pendingOrders = useMemo(() => {
    if (!orders.length) return [];
    
    return orders
      .filter(order => order.status === 'new' || order.status === 'in_progress')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [orders]);

  // Calculate completion rate from real data
  const completionRate = orderStats.total > 0 
    ? (orderStats.finished / orderStats.total) * 100 
    : 0;

  const chartData = useMemo(() => {
    return {
      labels: [t('new'), t('in_progress'), t('ready'), t('finished'), t('canceled')],
      datasets: [
        {
          data: [orderStats.new, orderStats.in_progress, orderStats.ready, orderStats.finished, orderStats.canceled],
          backgroundColor: ['#3f51b5', '#ff9800', '#9c27b0', '#4caf50', '#f44336'],
          hoverBackgroundColor: ['#303f9f', '#f57c00', '#7b1fa2', '#388e3c', '#d32f2f'],
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  }, [orderStats, t]);

  const orderStatusData = useMemo(() => {
    if (!dashboardStats?.order_type_distribution?.length) return null;
    
    return {
      labels: dashboardStats.order_type_distribution?.map((item) => t(item.type.toLowerCase())) || [],
      datasets: [
        {
          data: dashboardStats.order_type_distribution?.map((item) => item.count) || [],
          backgroundColor: ['#3f51b5', '#ff4081', '#4caf50', '#ff9800', '#673ab7'],
          hoverBackgroundColor: ['#303f9f', '#f50057', '#388e3c', '#f57c00', '#512da8'],
          borderWidth: 0,
        },
      ],
    };
  }, [dashboardStats?.order_type_distribution, t]);

  const ingredientTypesData = useMemo(() => {
    if (!ingredients.length) return null;
    
    const typeCount: { [key: string]: number } = {};
    ingredients.forEach((ingredient: any) => {
      const type = ingredient.type || 'Unknown';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    const types = Object.keys(typeCount);
    const counts = Object.values(typeCount);
    
    return {
      labels: types,
      datasets: [
        {
          data: counts,
          backgroundColor: ['#3f51b5', '#ff4081', '#4caf50', '#ff9800', '#673ab7', '#e91e63', '#9c27b0', '#607d8b'],
          hoverBackgroundColor: ['#303f9f', '#f50057', '#388e3c', '#f57c00', '#512da8', '#c2185b', '#7b1fa2', '#455a64'],
          borderWidth: 0,
        },
      ],
    };
  }, [ingredients]);

  const profitChartData = useMemo(() => {
    if (!profitData || profitData.total_revenue === 0) return null;
    
    return {
      labels: [t('totalRevenue'), t('totalCosts'), t('totalProfit')],
      datasets: [
        {
          data: [profitData.total_revenue, profitData.total_costs, profitData.total_profit],
          backgroundColor: ['#4caf50', '#ff9800', profitData.total_profit >= 0 ? '#2196f3' : '#f44336'],
          hoverBackgroundColor: ['#388e3c', '#f57c00', profitData.total_profit >= 0 ? '#1976d2' : '#d32f2f'],
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  }, [profitData, t]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          color: '#333333',
          font: {
            size: 11,
            weight: 'bold' as const
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 8,
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8
      }
    }
  };

  // Handle order editing (copied from orders.tsx)
  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setClientId(order.client_id);
    setStatus(order.status);
    setComment(order.comment || "");
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
    setComment("");
    setItems([]);
    setShowOrderModal(false);
  };

  const handleSaveOrderChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
          router.push('/auth/signin');
          return;
      }
      const order = { client_id: clientId, status, comment, items };

      if (editingOrder) {
        await fetcher(`/api/orders/${editingOrder.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(order),
        });
        // Refresh orders data
        mutateOrders();
      }
      handleCloseOrderModal();
    } catch (error) {
      console.error('Failed to save order changes', error);
    }
  };

  // Handle product changes in order modal
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

  const handleItemChange = (index: number, field: keyof typeof items[0], value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { product_id: 0, quantity: 1, price: 0, cost_price: 0 },
    ]);
  };

  // Handle status change (copied from orders.tsx)
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
      mutateOrders(); // Refresh orders data
      setStatusOrderId(null);
      setShowStatusModal(false);
    } catch (error) {
      console.error('Failed to update order status', error);
    }
  };

  // Handle delete order (copied from orders.tsx)
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
      mutateOrders(); // Refresh orders data
      setDeleteOrderId(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete order', error);
    }
  };

  // Options for modals (copied from orders.tsx)
  const statusOptions = [
    { value: "new", label: t("new") },
    { value: "in_progress", label: t("in_progress") },
    { value: "ready", label: t("ready") },
    { value: "finished", label: t("finished") },
    { value: "canceled", label: t("canceled") },
  ];

  const clientOptions = clients.map((client) => ({
    value: client.id,
    label: `${client.name} ${client.surname}`,
  }));

  const productOptions = products.map((product) => ({
    value: product.id,
    label: product.name,
  }));

  if (!auth.isAuthenticated) {
    return (
      <Container className="text-center py-5">
        <h2>{t('pleaseSignIn')}</h2>
        <Button 
          variant="primary" 
          className="mt-3" 
          onClick={() => router.push('/auth/signin')}
        >
          {t('signIn')}
        </Button>
      </Container>
    );
  }

  if (dashboardError) {
    return (
      <ErrorState 
        message={t('failedToLoadDashboard')} 
        onRetry={() => mutate()} 
      />
    );
  }

  if (!dashboardStats) {
    return <LoadingState fullPage />;
  }

  return (
    <div className="p-0">
      <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
        <h1 className="mb-0">{t('dashboard')}</h1>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" size="sm" onClick={() => mutate()}>
            <FaClock className="me-1" />
            {t('refresh')}
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        {/* Main Statistics Cards */}
        <Row className="g-3 mb-4">
          <Col md={3} sm={6}>
            <div className="stat-card h-100 border-0 bg-white rounded p-3 shadow-sm">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="stat-icon mb-2 rounded-circle bg-primary-light p-2 d-inline-flex">
                    <FaShoppingCart className="text-primary" size={16} />
                  </div>
                  <div className="stat-value fw-bold mb-1" style={{ fontSize: '1.75rem', color: '#333' }}>
                    {orderStats.total || 0}
                  </div>
                  <div className="stat-label text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                    {t('totalOrders')}
                  </div>
                  <div className="stat-change text-success small">
                                              <FaArrowUp className="me-1" />
                    {orderStats.new || 0} {t('new')}
                  </div>
                </div>
              </div>
            </div>
          </Col>
          
          <Col md={3} sm={6}>
            <div className="stat-card h-100 border-0 bg-white rounded p-3 shadow-sm">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="stat-icon mb-2 rounded-circle bg-success-light p-2 d-inline-flex" style={{backgroundColor: 'rgba(76, 175, 80, 0.1)'}}>
                    <FaLeaf className="text-success" size={16} />
                  </div>
                  <div className="stat-value fw-bold mb-1" style={{ fontSize: '1.75rem', color: '#333' }}>
                    {ingredients.length || 0}
                  </div>
                  <div className="stat-label text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                    {t('totalIngredients')}
                  </div>
                  <div className="stat-change text-muted small">
                    {recipes.length || 0} {t('recipes')}
                  </div>
                </div>
              </div>
            </div>
          </Col>
          
          <Col md={3} sm={6}>
            <div className="stat-card h-100 border-0 bg-white rounded p-3 shadow-sm">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="stat-icon mb-2 rounded-circle bg-warning-light p-2 d-inline-flex" style={{backgroundColor: 'rgba(255, 152, 0, 0.1)'}}>
                    <FaUsers className="text-warning" size={16} />
                  </div>
                  <div className="stat-value fw-bold mb-1" style={{ fontSize: '1.75rem', color: '#333' }}>
                    {clients.length}
                  </div>
                  <div className="stat-label text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                    {t('totalClients')}
                  </div>
                  <div className="stat-change text-muted small">
                    {completionRate.toFixed(1)}% {t('completionRate')}
                  </div>
                </div>
              </div>
            </div>
          </Col>
          
          <Col md={3} sm={6}>
            <div className="stat-card h-100 border-0 bg-white rounded p-3 shadow-sm">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="stat-icon mb-2 rounded-circle bg-info-light p-2 d-inline-flex" style={{backgroundColor: 'rgba(33, 150, 243, 0.1)'}}>
                    <FaBoxOpen className="text-info" size={16} />
                  </div>
                  <div className="stat-value fw-bold mb-1" style={{ fontSize: '1.75rem', color: '#333' }}>
                    {dashboardStats?.total_products || 0}
                  </div>
                  <div className="stat-label text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                    {t('totalProducts')}
                  </div>
                  <div className="stat-change text-muted small">
                    {dashboardStats?.pending_orders || 0} {t('pendingOrders')}
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Profit Analytics Section */}
        {profitData && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0 text-primary">
                <FaChartLine className="me-2" />
                {t('profitAnalytics')}
              </h4>
            </div>
            
            <Row className="g-3 mb-4">
              <Col md={3} sm={6}>
                <div className="stat-card h-100 border-0 bg-white rounded p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="stat-icon mb-2 rounded-circle p-2 d-inline-flex" style={{backgroundColor: 'rgba(76, 175, 80, 0.1)'}}>
                        <FaArrowUp className="text-success" size={16} />
                      </div>
                      <div className="stat-value fw-bold mb-1" style={{ fontSize: '1.5rem', color: '#333' }}>
                        {profitData.total_revenue?.toFixed(0) || '0'} {t('currency')}
                      </div>
                      <div className="stat-label text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                        {t('totalRevenue')}
                      </div>
                      <div className="stat-change text-muted small">
                        {profitData.order_count || 0} {t('finishedOrders')}
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
              
              <Col md={3} sm={6}>
                <div className="stat-card h-100 border-0 bg-white rounded p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="stat-icon mb-2 rounded-circle p-2 d-inline-flex" style={{backgroundColor: 'rgba(255, 152, 0, 0.1)'}}>
                        <FaDollarSign className="text-warning" size={16} />
                      </div>
                      <div className="stat-value fw-bold mb-1" style={{ fontSize: '1.5rem', color: '#333' }}>
                        {profitData.total_costs?.toFixed(0) || '0'} {t('currency')}
                      </div>
                      <div className="stat-label text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                        {t('totalCosts')}
                      </div>
                      <div className="stat-change text-muted small">
                        {profitData.total_revenue > 0 ? ((profitData.total_costs / profitData.total_revenue) * 100).toFixed(1) : 0}% {t('of')} {t('totalRevenue').toLowerCase()}
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
              
              <Col md={3} sm={6}>
                <div className="stat-card h-100 border-0 bg-white rounded p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="stat-icon mb-2 rounded-circle p-2 d-inline-flex" style={{backgroundColor: 'rgba(76, 175, 80, 0.1)'}}>
                        <FaChartLine className="text-success" size={16} />
                      </div>
                      <div className="stat-value fw-bold mb-1" style={{ fontSize: '1.5rem', color: profitData.total_profit >= 0 ? '#4caf50' : '#f44336' }}>
                        {profitData.total_profit?.toFixed(0) || '0'} {t('currency')}
                      </div>
                      <div className="stat-label text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                        {t('totalProfit')}
                      </div>
                      <div className="stat-change text-muted small">
                        {profitData.total_revenue > 0 ? ((profitData.total_profit / profitData.total_revenue) * 100).toFixed(1) : 0}% {t('profitMargin')}
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
              
              <Col md={3} sm={6}>
                <div className="stat-card h-100 border-0 bg-white rounded p-3 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="stat-icon mb-2 rounded-circle p-2 d-inline-flex" style={{backgroundColor: 'rgba(33, 150, 243, 0.1)'}}>
                        <FaCheckCircle className="text-info" size={16} />
                      </div>
                      <div className="stat-value fw-bold mb-1" style={{ fontSize: '1.5rem', color: '#333' }}>
                        {profitData.order_count > 0 ? (profitData.total_profit / profitData.order_count).toFixed(0) : '0'} {t('currency')}
                      </div>
                      <div className="stat-label text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                        {t('profit')} / {t('order').toLowerCase()}
                      </div>
                      <div className="stat-change text-muted small">
                        {profitData.order_count > 0 ? (profitData.total_revenue / profitData.order_count).toFixed(0) : '0'} {t('currency')} {t('averageOrder')}
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </>
        )}

        {/* Performance Metrics */}
        <Row className="mb-4">
          <Col lg={3}>
            <Card className="border-0 h-100 shadow-sm">
              <Card.Body className="p-3">
                <Card.Title className="mb-3 fs-6 d-flex align-items-center">
                  <FaCheckCircle className="me-2 text-success" />
                  {t('orderCompletion')}
                </Card.Title>
                <div className="mb-2">
                  <div className="d-flex justify-content-between mb-1">
                    <small className="text-muted">{t('completed')}</small>
                    <small className="fw-bold">{completionRate.toFixed(1)}%</small>
                  </div>
                  <ProgressBar 
                    now={completionRate} 
                    variant="success" 
                    style={{ height: '8px' }}
                  />
                </div>
                <div className="small text-muted">
                  {orderStats.finished || 0} {t('of')} {orderStats.total || 0} {t('orders')}
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={3}>
            <Card className="border-0 h-100 shadow-sm">
              <Card.Body className="p-3">
                <Card.Title className="mb-3 fs-6 d-flex align-items-center">
                  <FaChartLine className="me-2 text-primary" />
                  {t('orderStatus')}
                </Card.Title>
                {chartData && (
                  <div style={{ height: '120px' }}>
                    <Doughnut data={chartData} options={chartOptions} />
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={3}>
            <Card className="border-0 h-100 shadow-sm">
              <Card.Body className="p-3">
                <Card.Title className="mb-3 fs-6 d-flex align-items-center">
                  <FaLeaf className="me-2 text-success" />
                  {t('ingredientTypes')}
                </Card.Title>
                {ingredientTypesData ? (
                  <div style={{ height: '120px' }}>
                    <Doughnut data={ingredientTypesData} options={chartOptions} />
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <small className="text-muted">{t('noIngredientsFound')}</small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3}>
            <Card className="border-0 h-100 shadow-sm">
              <Card.Body className="p-3">
                <Card.Title className="mb-3 fs-6 d-flex align-items-center">
                  <FaDollarSign className="me-2 text-warning" />
                  {t('revenueVsCosts')}
                </Card.Title>
                {profitChartData ? (
                  <div style={{ height: '120px' }}>
                    <Doughnut data={profitChartData} options={chartOptions} />
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <small className="text-muted">{t('noPendingOrders')}</small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Orders Table */}
        <Row>
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Card.Title className="mb-0 fs-5 d-flex align-items-center">
                    <FaCalendarAlt className="me-2 text-primary" />
                    {t('recentOrders')}
                  </Card.Title>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => router.push('/orders')}
                  >
                    <FaEye className="me-1" />
                    {t('viewAll')}
                  </Button>
                </div>
                
                {(dashboardStats?.recent_orders?.length || pendingOrders.length) > 0 ? (
                  <div className="table-responsive">
                    <Table hover size="sm" className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="border-0">{t('order')}</th>
                          <th className="border-0">{t('client')}</th>
                          <th className="border-0">{t('status')}</th>
                          <th className="border-0">{t('amount')}</th>
                          <th className="border-0">{t('date')}</th>
                          <th className="border-0 text-center">{t('actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dashboardStats?.recent_orders?.length ? dashboardStats.recent_orders : pendingOrders).map((order) => {
                          const isApiOrder = 'client_name' in order;
                          const statusVariant = order.status === 'new' ? 'primary' : 
                                                order.status === 'in_progress' ? 'warning' : 
                                                order.status === 'ready' ? 'info' : 
                                                order.status === 'completed' ? 'success' : 'danger';
                          
                          return (
                            <tr key={order.id}>
                              <td className="fw-bold">#{order.id}</td>
                              <td>
                                {isApiOrder 
                                  ? (order as any).client_name || t('unknownClient')
                                  : (() => {
                                      const client = clients.find(c => c.id === (order as any).client_id) || {};
                                      return client.name ? `${client.name} ${(client as any).surname || ''}`.trim() : t('unknownClient');
                                    })()
                                }
                              </td>
                              <td>
                                <Badge bg={statusVariant} className="px-2 py-1">
                                  {t(order.status)}
                                </Badge>
                              </td>
                              <td className="fw-bold text-success">
                                {isApiOrder 
                                  ? order.total_amount.toFixed(2)
                                  : ((order as any).items?.reduce((total: number, item: any) => total + (item.quantity * item.price), 0).toFixed(2) || '0.00')
                                } {t('currency')}
                              </td>
                              <td className="text-muted">
                                {new Date(isApiOrder ? (order as any).order_date : (order as any).created_at).toLocaleDateString()}
                              </td>
                              <td className="text-center">
                                <div className="d-flex gap-1 align-items-center justify-content-center">
                                  <button 
                                    onClick={() => handleChangeStatus(order.id)}
                                    className="action-icon-btn"
                                    title={t("changeStatus")}
                                  >
                                    <FaSync size={12} />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const fullOrder = orders.find(o => o.id === order.id);
                                      if (fullOrder) handleEditOrder(fullOrder);
                                    }}
                                    className="action-icon-btn"
                                    title={t("edit")}
                                  >
                                    <FaPencilAlt size={12} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteOrder(order.id)}
                                    className="action-icon-btn text-danger"
                                    title={t("delete")}
                                  >
                                    <FaTrash size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FaExclamationTriangle className="text-muted mb-2" size={24} />
                    <p className="text-muted mb-0">{t('noPendingOrders')}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Order Modal */}
      <OrderModal
        show={showOrderModal}
        onClose={handleCloseOrderModal}
        onSave={handleSaveOrderChanges}
        clientOptions={clientOptions}
        productOptions={productOptions}
        statusOptions={statusOptions}
        clientId={clientId}
        status={status}
        comment={comment}
        items={items}
        setClientId={setClientId}
        setStatus={setStatus}
        setComment={setComment}
        handleProductChange={handleProductChange}
        handleQuantityChange={handleQuantityChange}
        handleItemChange={handleItemChange}
        handleRemoveItem={handleRemoveItem}
        handleAddItem={handleAddItem}
      />

      {/* Status Modal */}
      <StatusModal
        show={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onSave={handleSaveStatusChange}
        statusOptions={statusOptions}
        status={status}
        setStatus={setStatus}
      />

      {/* Delete Modal */}
      <DeleteModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default withAuth(Dashboard);
