import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import useTranslation from 'next-translate/useTranslation';
import { FaExclamationTriangle, FaSync } from 'react-icons/fa';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  fullPage?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  message, 
  onRetry, 
  fullPage = false 
}) => {
  const { t } = useTranslation('common');
  const defaultMessage = t('unknownError');

  const content = (
    <div className="error-state text-center py-5">
      <div className="error-icon mb-3">
        <FaExclamationTriangle size={48} className="text-danger" />
      </div>
      <h4 className="error-title mb-3">{t('errorOccurred')}</h4>
      <p className="error-message text-muted mb-4">{message || defaultMessage}</p>
      {onRetry && (
        <Button variant="outline-primary" onClick={onRetry}>
          <FaSync className="me-2" /> {t('tryAgain')}
        </Button>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <Container fluid className="vh-100 d-flex align-items-center justify-content-center">
        <div className="error-container p-4 rounded shadow-sm bg-white" style={{ maxWidth: '500px' }}>
          {content}
        </div>
      </Container>
    );
  }

  return (
    <Row>
      <Col>
        {content}
      </Col>
    </Row>
  );
};

export default ErrorState;
