import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import useTranslation from 'next-translate/useTranslation';

interface AuthErrorNotificationProps {
  show: boolean;
  onClose: () => void;
  message?: string;
}

const AuthErrorNotification: React.FC<AuthErrorNotificationProps> = ({ 
  show, 
  onClose, 
  message 
}) => {
  const { t } = useTranslation('common');
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
      <Toast 
        show={isVisible} 
        onClose={handleClose} 
        delay={5000} 
        autohide
        bg="warning"
      >
        <Toast.Header>
          <strong className="me-auto">{t('authenticationWarning')}</strong>
        </Toast.Header>
        <Toast.Body className="text-dark">
          {message || t('sessionExpiredPleaseSignInAgain')}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default AuthErrorNotification; 