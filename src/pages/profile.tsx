import { useState, useEffect } from 'react';
import fetcher from '../utils/fetcher';
import useTranslation from 'next-translate/useTranslation';
import { Form, Button, Alert, InputGroup } from 'react-bootstrap';
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

    if (newPassword.length < 8) {
      setError(t('passwordMinLength'));
      return;
    }

    setIsLoading(true);
    try {
      await fetcher('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      setSuccess(t('passwordChangedSuccessfully'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err?.message || t('requestFailed'));
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
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title d-flex align-items-center gap-3">
            <FaUser className="text-primary" />
            {t('profile')}
          </h1>
          <p className="page-subtitle">{t('profileDescription')}</p>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-grid">
        {/* Account Info Card */}
        <div className="profile-card">
          <div className="profile-card-header bg-primary">
            <h5 className="profile-card-title">
              <FaIdCard className="me-2" />
              {t('accountInfo')}
            </h5>
          </div>
          <div className="profile-card-body">
            <div className="profile-info-item">
              <div className="info-label">
                <FaUser className="me-2" />
                {t('displayName')}
              </div>
              <div className="info-value">{getUserDisplayName()}</div>
            </div>

            {auth.user?.email && (
              <div className="profile-info-item">
                <div className="info-label">
                  <FaEnvelope className="me-2" />
                  {t('email')}
                </div>
                <div className="info-value">{auth.user.email}</div>
              </div>
            )}

            <div className="profile-info-item">
              <div className="info-label">
                <FaShieldAlt className="me-2" />
                {t('accountStatus')}
              </div>
              <div className="info-value">
                <span className="badge badge-success">{t('active')}</span>
              </div>
            </div>

            {auth.user?.created_at && (
              <div className="profile-info-item">
                <div className="info-label">
                  <FaCalendarAlt className="me-2" />
                  {t('memberSince')}
                </div>
                <div className="info-value">{formatDate(auth.user.created_at)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Card */}
        <div className="profile-card profile-card-large">
          <div className="profile-card-header bg-warning">
            <h5 className="profile-card-title text-primary">
              <FaLock className="me-2" />
              {t('changePassword')}
            </h5>
          </div>
          <div className="profile-card-body">
            <Form onSubmit={handleSubmit}>
              <div className="profile-form">
                <Form.Group controlId="currentPassword">
                  <Form.Label>
                    <FaLock className="me-2 text-primary" />
                    {t('currentPassword')} <span className="text-error">*</span>
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

                <div className="form-row">
                  <Form.Group controlId="newPassword">
                    <Form.Label>
                      <FaLock className="me-2 text-primary" />
                      {t('newPassword')} <span className="text-error">*</span>
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
                    <Form.Text className="text-tertiary">
                      {t('passwordMinLength')}
                    </Form.Text>
                  </Form.Group>

                  <Form.Group controlId="confirmPassword">
                    <Form.Label>
                      <FaLock className="me-2 text-primary" />
                      {t('confirmPassword')} <span className="text-error">*</span>
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
                </div>

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

                <Button
                  variant="primary"
                  type="submit"
                  disabled={isLoading}
                  className="submit-button"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Profile);
