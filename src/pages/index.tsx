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
  FaChartLine
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
  created_at: string;
  items: Array<{
    product_id: number;
    quantity: number;
    price: number;
    cost_price: number;
  }>;
}

interface DashboardData {
  totalRecipes: number;
  totalIngredients: number;
  totalProducts: number;
  totalOrders: number;
  totalClients: number;
  typeDistribution: Array<{ type: string; count: number }>;
  orderStats: OrderStats;
  recentRevenue: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  topProducts: Array<{ name: string; orders: number; revenue: number }>;
  recentOrders: Array<{
    id: number;
    client_id: number;
    status: string;
    total_amount: number;
    created_at: string;
  }>;
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
        totalRecipes: 0,
        totalIngredients: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalClients: 0,
        typeDistribution: [],
        orderStats: { total: 0, new: 0, in_progress: 0, ready: 0, finished: 0, canceled: 0 },
        recentRevenue: 0,
        monthlyRevenue: 0,
        averageOrderValue: 0,
        topProducts: [],
        recentOrders: []
      }
    }
  );
  
  const { data: clients = [] } = useSWR(
    auth.isAuthenticated || typeof window === 'undefined' ? '/api/clients' : null,
    fetcher,
    swrConfigs.static
  );

  const { data: orders = [] } = useSWR<Order[]>(
    auth.isAuthenticated || typeof window === 'undefined' ? '/api/orders' : null,
    fetcher,
    swrConfigs.list
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

  const typeDistributionData = useMemo(() => {
    if (!dashboardStats?.typeDistribution?.length) return null;
    
    return {
      labels: dashboardStats.typeDistribution?.map((item) => t(item.type.toLowerCase())) || [],
      datasets: [
        {
          data: dashboardStats.typeDistribution?.map((item) => item.count) || [],
          backgroundColor: ['#3f51b5', '#ff4081', '#4caf50', '#ff9800', '#673ab7', '#e91e63'],
          hoverBackgroundColor: ['#303f9f', '#f50057', '#388e3c', '#f57c00', '#512da8', '#c2185b'],
          borderWidth: 0,
        },
      ],
    };
  }, [dashboardStats?.typeDistribution, t]);

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
                    <FaDollarSign className="text-success" size={16} />
                  </div>
                  <div className="stat-value fw-bold mb-1" style={{ fontSize: '1.75rem', color: '#333' }}>
                    {dashboardStats.monthlyRevenue?.toFixed(0) || '0'} {t('currency')}
                  </div>
                  <div className="stat-label text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                    {t('monthlyRevenue')}
                  </div>
                  <div className="stat-change text-muted small">
                    {dashboardStats.averageOrderValue?.toFixed(0) || '0'} {t('currency')} {t('averageOrder')}
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
                    {dashboardStats?.totalClients || clients.length}
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
                    {dashboardStats?.totalProducts || 0}
                  </div>
                  <div className="stat-label text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                    {t('totalProducts')}
                  </div>
                  <div className="stat-change text-muted small">
                    {dashboardStats?.totalRecipes || 0} {t('recipes')}
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Performance Metrics */}
        <Row className="mb-4">
          <Col lg={4}>
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
          
          <Col lg={4}>
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
          
          <Col lg={4}>
            <Card className="border-0 h-100 shadow-sm">
              <Card.Body className="p-3">
                <Card.Title className="mb-3 fs-6 d-flex align-items-center">
                  <FaLeaf className="me-2 text-success" />
                  {t('ingredientTypes')}
                </Card.Title>
                {typeDistributionData && (
                  <div style={{ height: '120px' }}>
                    <Doughnut data={typeDistributionData} options={chartOptions} />
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
                
                {pendingOrders.length > 0 ? (
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
                        {pendingOrders.map((order) => {
                          const client = clients.find(c => c.id === order.client_id) || {};
                          const statusVariant = order.status === 'new' ? 'primary' : 
                                                order.status === 'in_progress' ? 'warning' : 
                                                order.status === 'completed' ? 'success' : 'danger';
                          
                          return (
                            <tr key={order.id}>
                              <td className="fw-bold">#{order.id}</td>
                              <td>
                                {client.name ? `${client.name} ${client.surname || ''}`.trim() : t('unknownClient')}
                              </td>
                              <td>
                                <Badge bg={statusVariant} className="px-2 py-1">
                                  {t(order.status)}
                                </Badge>
                              </td>
                              <td className="fw-bold text-success">
                                {order.items?.reduce((total, item) => total + (item.quantity * item.price), 0).toFixed(2) || '0.00'} {t('currency')}
                              </td>
                              <td className="text-muted">
                                {new Date(order.created_at).toLocaleDateString()}
                              </td>
                              <td className="text-center">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => router.push(`/orders?id=${order.id}`)}
                                  className="py-1 px-2"
                                >
                                  <FaEye size={12} />
                                </Button>
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
    </div>
  );
};

export default withAuth(Dashboard);
