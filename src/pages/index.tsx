import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button } from 'react-bootstrap';
import useSWR from 'swr';
import useTranslation from 'next-translate/useTranslation';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { useRouter } from 'next/router';
import fetcher from '../utils/fetcher';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { 
  FaBook, 
  FaLeaf, 
  FaBoxOpen, 
  FaShoppingCart, 
  FaChartPie, 
  FaCalendarAlt, 
  FaUser, 
  FaTag 
} from 'react-icons/fa';

Chart.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/signin');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const { data: dashboardStats, error: dashboardError, mutate } = useSWR(
    isAuthenticated ? '/api/dashboard' : null,
    fetcher
  );

  if (!isAuthenticated) {
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

  const pieData = dashboardStats.typeDistribution ? {
    labels: dashboardStats.typeDistribution.map((item) => t(item.type.toLowerCase())),
    datasets: [
      {
        data: dashboardStats.typeDistribution.map((item) => item.count),
        backgroundColor: ['#3f51b5', '#ff4081', '#4caf50', '#ff9800'],
        hoverBackgroundColor: ['#303f9f', '#f50057', '#388e3c', '#f57c00'],
        borderWidth: 0,
      },
    ],
  } : null;

  const pieOptions = {
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{t('dashboard')}</h1>
      </div>

      <Row className="dashboard-stats g-4 mb-5">
        <Col md={3}>
          <Card className="stat-card h-100 border-0 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <div className="stat-icon mb-3 rounded-circle bg-primary-light p-3 align-self-start">
                <FaBook className="text-primary" size={24} />
              </div>
              <div className="stat-value display-4 fw-bold mb-2">
                {dashboardStats.totalRecipes}
              </div>
              <div className="stat-label text-muted">{t('totalRecipes')}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card h-100 border-0 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <div className="stat-icon mb-3 rounded-circle bg-primary-light p-3 align-self-start">
                <FaLeaf className="text-primary" size={24} />
              </div>
              <div className="stat-value display-4 fw-bold mb-2">
                {dashboardStats.totalIngredients}
              </div>
              <div className="stat-label text-muted">{t('totalIngredients')}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card h-100 border-0 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <div className="stat-icon mb-3 rounded-circle bg-primary-light p-3 align-self-start">
                <FaBoxOpen className="text-primary" size={24} />
              </div>
              <div className="stat-value display-4 fw-bold mb-2">
                {dashboardStats.totalProducts}
              </div>
              <div className="stat-label text-muted">{t('totalProducts')}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card h-100 border-0 shadow-sm">
            <Card.Body className="d-flex flex-column">
              <div className="stat-icon mb-3 rounded-circle bg-primary-light p-3 align-self-start">
                <FaShoppingCart className="text-primary" size={24} />
              </div>
              <div className="stat-value display-4 fw-bold mb-2">
                {dashboardStats.totalOrders}
              </div>
              <div className="stat-label text-muted">{t('totalOrders')}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-5">
        {pieData && (
          <Col lg={6} className="mb-4 mb-lg-0">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <Card.Title className="mb-4">
                  <FaChartPie className="me-2 text-primary" />
                  {t('ingredientTypeDistribution')}
                </Card.Title>
                <div className="chart-container">
                  <Pie 
                    data={pieData} 
                    options={pieOptions} 
                    height={300}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <Card.Title className="mb-4">
                <FaCalendarAlt className="me-2 text-primary" />
                {t('pendingOrders')}
              </Card.Title>
              {dashboardStats.pendingOrders && dashboardStats.pendingOrders.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead>
                      <tr>
                        <th>{t('order')}</th>
                        <th>{t('client')}</th>
                        <th>{t('status')}</th>
                        <th>{t('date')}</th>
                        <th>{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardStats.pendingOrders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{`${order.client_name} ${order.client_surname}`}</td>
                          <td>
                            <span className={`badge bg-${order.status.toLowerCase() === 'new' ? 'primary' : 'warning'}`}>
                              {t(order.status.toLowerCase())}
                            </span>
                          </td>
                          <td>{new Date(order.created_at).toLocaleDateString()}</td>
                          <td>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => router.push(`/orders?id=${order.id}`)}
                            >
                              {t('view')}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">{t('noPendingOrders')}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
