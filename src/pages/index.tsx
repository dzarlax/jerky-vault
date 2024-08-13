import React from 'react';
import { Container, Row, Col, Card, Table } from 'react-bootstrap';
import useSWR from 'swr';
import { useSession, getSession } from 'next-auth/react';
import useTranslation from 'next-translate/useTranslation';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Dashboard = () => {
  const { data: session } = useSession();
  const { t } = useTranslation('common');

  const { data: dashboardStats, error: dashboardError } = useSWR('/api/stats/dashboard', fetcher);

  if (!session) return <div>{t('pleaseSignIn')}</div>;

  if (!dashboardStats) return <div>{t('loading')}</div>;

  if (dashboardError) return <div>{t('failedToLoad')}</div>;

  const pieData = dashboardStats.typeDistribution ? {
    labels: dashboardStats.typeDistribution.map((item) => item.type),
    datasets: [
      {
        data: dashboardStats.typeDistribution.map((item) => item.count),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  } : null;

  return (
    <Container fluid>
      <h1>{t('dashboard')}</h1>

      {/* Старая статистика */}
      <Row className="mb-4">
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>{t('totalRecipes')}</Card.Title>
              <Card.Text>{dashboardStats.totalRecipes}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>{t('totalIngredients')}</Card.Title>
              <Card.Text>{dashboardStats.totalIngredients}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Новая статистика */}
      <Row className="mb-4">
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>{t('totalProducts')}</Card.Title>
              <Card.Text>{dashboardStats.totalProducts}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>{t('totalOrders')}</Card.Title>
              <Card.Text>{dashboardStats.totalOrders}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h2>{t('pendingOrders')}</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>{t('order')}</th>
            <th>{t('client')}</th>
            <th>{t('status')}</th>
            <th>{t('date')}</th>
          </tr>
        </thead>
        <tbody>
          {dashboardStats.pendingOrders && dashboardStats.pendingOrders.length > 0 ? (
            dashboardStats.pendingOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{`${order.client_name} ${order.client_surname}`}</td>
                <td>{t(order.status.toLowerCase())}</td>
                <td>{new Date(order.date).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>{t('noPendingOrders')}</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export async function getServerSideProps(context: any) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}

export default Dashboard;
