import React from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import useTranslation from 'next-translate/useTranslation';

interface LoadingStateProps {
  message?: string;
  fullPage?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message, 
  fullPage = false 
}) => {
  const { t } = useTranslation('common');
  const defaultMessage = t('loading');

  if (fullPage) {
    return (
      <Container fluid className="vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary" className="mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">{defaultMessage}</span>
          </Spinner>
          <h5 className="mt-3">{message || defaultMessage}</h5>
        </div>
      </Container>
    );
  }

  return (
    <Row className="py-5">
      <Col className="text-center">
        <Spinner animation="border" role="status" variant="primary" className="mb-3">
          <span className="visually-hidden">{defaultMessage}</span>
        </Spinner>
        <p className="mt-2">{message || defaultMessage}</p>
      </Col>
    </Row>
  );
};

export default LoadingState;
