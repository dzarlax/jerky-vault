import { useState, useEffect } from 'react';
import fetcher from '../utils/fetcher';
import useTranslation from 'next-translate/useTranslation';
import { Container, Form, Button, Alert, Row, Col, Card, InputGroup } from 'react-bootstrap';
import { useAuth, withAuth } from '../utils/authContext';
import { useRouter } from 'next/router';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaCalendarAlt, FaIdCard, FaEnvelope } from 'react-icons/fa';

const Profile = () => {
  const { t } = useTranslation('common');
  const { auth } = useAuth();
  const router = useRouter();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Состояния для показа/скрытия паролей
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [auth.isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Проверка на совпадение нового пароля и подтверждения пароля
    if (newPassword !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    // Проверка длины нового пароля
    if (newPassword.length < 3) {
      setError(t('passwordTooShort'));
      return;
    }

    setIsLoading(true);
    try {
      // Запрос на изменение пароля
      const response = await fetcher('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response?.success) {
        setSuccess(t('passwordChangedSuccessfully'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(response?.error || t('unknownError'));
      }
    } catch (err: any) {
      setError(err?.error || t('requestFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const getUserDisplayName = () => {
    if (auth.user?.name) return auth.user.name;
    if (auth.user?.email) return auth.user.email;
    if (auth.user?.username) return auth.user.username;
    return t('user');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return t('unknown');
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="p-0">
      <div className="profile-header d-flex flex-column flex-md-row justify-content-between align-items-md-center p-3 p-md-4 border-bottom bg-light">
        <div className="header-content">
          <h1 className="mb-2 text-primary">
            <FaUser className="me-2" />
            {t('profile')}
          </h1>
          <p className="text-muted mb-0">{t('profileDescription')}</p>
        </div>
      </div>
      
      <div className="profile-content p-3 p-md-4">
        <Row className="g-4">
          <Col lg={4}>
            <Card className="profile-info-card shadow-sm border-0">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <FaIdCard className="me-2" />
                  {t('accountInfo')}
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="profile-info-item mb-3">
                  <div className="info-label">
                    <FaUser className="me-2 text-primary" />
                    {t('displayName')}
                  </div>
                  <div className="info-value fw-medium">{getUserDisplayName()}</div>
                </div>
                
                {auth.user?.email && (
                  <div className="profile-info-item mb-3">
                    <div className="info-label">
                      <FaEnvelope className="me-2 text-primary" />
                      {t('email')}
                    </div>
                    <div className="info-value">{auth.user.email}</div>
                  </div>
                )}
                
                <div className="profile-info-item mb-3">
                  <div className="info-label">
                    <FaShieldAlt className="me-2 text-primary" />
                    {t('accountStatus')}
                  </div>
                  <div className="info-value">
                    <span className="badge bg-success">{t('active')}</span>
                  </div>
                </div>
                
                {auth.user?.created_at && (
                  <div className="profile-info-item">
                    <div className="info-label">
                      <FaCalendarAlt className="me-2 text-primary" />
                      {t('memberSince')}
                    </div>
                    <div className="info-value">{formatDate(auth.user.created_at)}</div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={8}>
            <Card className="change-password-card shadow-sm border-0">
              <Card.Header className="bg-warning text-dark">
                <h5 className="mb-0">
                  <FaLock className="me-2" />
                  {t('changePassword')}
                </h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  <Row className="g-3">
                    <Col md={12}>
                      <Form.Group controlId="currentPassword">
                        <Form.Label className="fw-semibold">
                          <FaLock className="me-1 text-primary" />
                          {t('currentPassword')} <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder={t('enterCurrentPassword')}
                            required
                          />
                          <Button
                            variant="outline-secondary"
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group controlId="newPassword">
                        <Form.Label className="fw-semibold">
                          <FaLock className="me-1 text-primary" />
                          {t('newPassword')} <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder={t('enterNewPassword')}
                            minLength={3}
                            required
                          />
                          <Button
                            variant="outline-secondary"
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                        </InputGroup>
                        <Form.Text className="text-muted">
                          {t('passwordMinLength')}
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group controlId="confirmPassword">
                        <Form.Label className="fw-semibold">
                          <FaLock className="me-1 text-primary" />
                          {t('confirmPassword')} <span className="text-danger">*</span>
                        </Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={t('confirmNewPassword')}
                            required
                          />
                          <Button
                            variant="outline-secondary"
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  {error && (
                    <Alert variant="danger" className="mt-3">
                      <strong>{t('error')}:</strong> {error}
                    </Alert>
                  )}
                  
                  {success && (
                    <Alert variant="success" className="mt-3">
                      <strong>{t('success')}!</strong> {success}
                    </Alert>
                  )}
                  
                  <div className="mt-4 d-grid">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          {t('loading')}...
                        </>
                      ) : (
                        <>
                          <FaLock className="me-2" />
                          {t('changePassword')}
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default withAuth(Profile);
