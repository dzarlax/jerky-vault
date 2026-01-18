import React, { useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { useNotification, NotificationType } from '../hooks/useNotification';

const iconMap: Record<NotificationType, React.ReactNode> = {
  success: <FaCheckCircle className="me-2" />,
  error: <FaExclamationCircle className="me-2" />,
  warning: <FaExclamationTriangle className="me-2" />,
  info: <FaInfoCircle className="me-2" />,
};

const bgMap: Record<NotificationType, string> = {
  success: 'success',
  error: 'danger',
  warning: 'warning',
  info: 'info',
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <NotificationToast />
    </>
  );
};

export const NotificationToast: React.FC = () => {
  const { notification, hideNotification } = useNotification();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        hideNotification();
      }, notification.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, hideNotification]);

  if (!notification) return null;

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
      <Toast
        show={!!notification}
        onClose={hideNotification}
        bg={bgMap[notification.type]}
        className="text-white"
      >
        <Toast.Header closeButton>
          {iconMap[notification.type]}
          <strong className="me-auto ms-2">
            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
          </strong>
        </Toast.Header>
        <Toast.Body>{notification.message}</Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default React.memo(NotificationToast);
