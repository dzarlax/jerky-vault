import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button } from 'react-bootstrap';
import useSWR from 'swr';
import useTranslation from 'next-translate/useTranslation';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
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
  FaTag 
} from 'react-icons/fa';

Chart.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { auth } = useAuth();

  const { data: dashboardStats, error: dashboardError, mutate } = useSWR(
    auth.isAuthenticated || typeof window === 'undefined' ? '/api/dashboard' : null,
    fetcher,
    {
      ...swrConfigs.dashboard,
      // Provide fallback data for SSR
      fallbackData: {
        totalRecipes: 0,
        totalIngredients: 0,
        totalProducts: 0,
        totalOrders: 0,
        typeDistribution: []
      }
    }
  );
  
  // Fetch orders using the same endpoint as the orders page
  const { data: orders = [], error: ordersError } = useSWR(
    auth.isAuthenticated || typeof window === 'undefined' ? '/api/orders' : null,
    fetcher,
    swrConfigs.list
  );
  
  // Fetch clients for displaying client names
  const { data: clients = [] } = useSWR(
    auth.isAuthenticated || typeof window === 'undefined' ? '/api/clients' : null,
    fetcher,
    swrConfigs.static
  );
  
  // Filter orders to show only pending ones (new or in_progress)
  const pendingOrders = orders.filter(order => 
    order.status === 'new' || order.status === 'in_progress'
  ).slice(0, 5); // Show only the first 5 pending orders

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

  if (dashboardError || ordersError) {
    return (
      <ErrorState 
        message={t('failedToLoadDashboard')} 
        onRetry={() => mutate()} 
      />
    );
  }

  if (!dashboardStats || !orders) {
    return <LoadingState fullPage />;
  }

  const pieData = dashboardStats.typeDistribution ? {
    labels: dashboardStats.typeDistribution.map((item) => t(item.type.toLowerCase())),
    datasets: [
      {
        data: dashboardStats.typeDistribution.map((item) => item.count),
        backgroundColor: ['#3f51b5', '#ff4081', '#4caf50', '#ff9800', '#673ab7'],
        hoverBackgroundColor: ['#303f9f', '#f50057', '#388e3c', '#f57c00', '#512da8'],
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
          color: '#333333',
          font: {
            size: 12,
            weight: 'bold' as const
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 10,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        displayColors: true,
        boxWidth: 10,
        boxHeight: 10
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="p-0">
      <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
        <h1 className="mb-0">{t('dashboard')}</h1>
      </div>
      <div className="p-4">

      <Row className="g-3 mb-4">
        <Col md={3}>
          <div className="stat-card h-100 border-0 bg-white rounded p-3">
            <div className="d-flex flex-column">
              <div className="stat-icon mb-2 rounded-circle bg-primary-light p-2 align-self-start">
                <FaBook className="text-primary" size={18} />
              </div>
              <div className="stat-value fw-bold mb-1" style={{ fontSize: '1.5rem', color: '#333' }}>
                {dashboardStats.totalRecipes}
              </div>
              <div className="stat-label text-muted" style={{ fontSize: '0.85rem' }}>{t('totalRecipes')}</div>
            </div>
          </div>
        </Col>
        <Col md={3}>
          <div className="stat-card h-100 border-0 bg-white rounded p-3">
            <div className="d-flex flex-column">
              <div className="stat-icon mb-2 rounded-circle bg-primary-light p-2 align-self-start">
                <FaLeaf className="text-primary" size={18} />
              </div>
              <div className="stat-value fw-bold mb-1" style={{ fontSize: '1.5rem', color: '#333' }}>
                {dashboardStats.totalIngredients}
              </div>
              <div className="stat-label text-muted" style={{ fontSize: '0.85rem' }}>{t('totalIngredients')}</div>
            </div>
          </div>
        </Col>
        <Col md={3}>
          <div className="stat-card h-100 border-0 bg-white rounded p-3">
            <div className="d-flex flex-column">
              <div className="stat-icon mb-2 rounded-circle bg-primary-light p-2 align-self-start">
                <FaBoxOpen className="text-primary" size={18} />
              </div>
              <div className="stat-value fw-bold mb-1" style={{ fontSize: '1.5rem', color: '#333' }}>
                {dashboardStats.totalProducts}
              </div>
              <div className="stat-label text-muted" style={{ fontSize: '0.85rem' }}>{t('totalProducts')}</div>
            </div>
          </div>
        </Col>
        <Col md={3}>
          <div className="stat-card h-100 border-0 bg-white rounded p-3">
            <div className="d-flex flex-column">
              <div className="stat-icon mb-2 rounded-circle bg-primary-light p-2 align-self-start">
                <FaShoppingCart className="text-primary" size={18} />
              </div>
              <div className="stat-value fw-bold mb-1" style={{ fontSize: '1.5rem', color: '#333' }}>
                {dashboardStats.totalOrders}
              </div>
              <div className="stat-label text-muted" style={{ fontSize: '0.85rem' }}>{t('totalOrders')}</div>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        {pieData && (
          <Col lg={6} className="mb-3 mb-lg-0">
            <Card className="border-0 h-100">
              <Card.Body className="p-3">
                <Card.Title className="mb-3 fs-5">
                  <FaChartPie className="me-2 text-primary" />
                  {t('ingredientTypeDistribution')}
                </Card.Title>
                <div className="chart-container" style={{ height: '250px' }}>
                  <Pie 
                    data={pieData} 
                    options={pieOptions} 
                    height={250}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
        <Col lg={6}>
          <Card className="border-0 h-100">
            <Card.Body className="p-3">
              <Card.Title className="mb-3 fs-5">
                <FaCalendarAlt className="me-2 text-primary" />
                {t('pendingOrders')}
              </Card.Title>
              {pendingOrders.length > 0 ? (
                <div className="table-responsive">
                  <Table hover size="sm" className="mb-0">
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
                      {pendingOrders.map((order) => {
                        const client = clients.find(c => c.id === order.client_id) || {};
                        return (
                          <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{client.name ? `${client.name} ${client.surname || ''}` : t('unknownClient')}</td>
                            <td>
                              <span className={`badge bg-${order.status.toLowerCase() === 'new' ? 'primary' : 'warning'}`}>
                                {t(order.status.toLowerCase())}
                              </span>
                            </td>
                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                            <td>
                              <div className="d-flex gap-1 align-items-center">
                                <button 
                                  onClick={() => router.push(`/orders?id=${order.id}`)}
                                  className="action-icon-btn"
                                  title={t('view')}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                                  </svg>
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
                <div className="text-center py-3">
                  <p className="text-muted small">{t('noPendingOrders')}</p>
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
