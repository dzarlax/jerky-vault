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
      // Don't revalidate on focus to avoid unnecessary API calls
      revalidateOnFocus: false,
      // Handle errors gracefully
      onError: (err) => {
        console.error('Dashboard data fetch error:', err);
      },
      // Provide fallback data for SSR
      fallbackData: {
        totalRecipes: 0,
        totalIngredients: 0,
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: [],
        typeDistribution: []
      }
    }
  );

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
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h1 className="fs-4 mb-0">{t('dashboard')}</h1>
      </div>

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
              {dashboardStats.pendingOrders && dashboardStats.pendingOrders.length > 0 ? (
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
                <div className="text-center py-3">
                  <p className="text-muted small">{t('noPendingOrders')}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default withAuth(Dashboard);
