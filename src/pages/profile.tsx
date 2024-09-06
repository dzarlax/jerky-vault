import { useState } from 'react';
import fetcher from '../utils/fetcher';
import useTranslation from 'next-translate/useTranslation';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const Profile = () => {
  const { t } = useTranslation('common');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    try {
      // Запрос на изменение пароля
      const response = await fetcher('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Добавление авторизации
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        setSuccess(t('passwordChangedSuccessfully'));
        setError(null); // Очистка ошибок
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const result = await response.json();
        setError(result.error || t('unknownError'));
      }
    } catch (err) {
      setError(t('requestFailed'));
    }
  };

  return (
    <Container>
      <h1>{t('profile')}</h1>
      <Form onSubmit={handleSubmit} className="mt-3">
        <Form.Group controlId="currentPassword">
          <Form.Label>{t('currentPassword')}</Form.Label>
          <Form.Control
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="newPassword" className="mt-3">
          <Form.Label>{t('newPassword')}</Form.Label>
          <Form.Control
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="confirmPassword" className="mt-3">
          <Form.Label>{t('confirmPassword')}</Form.Label>
          <Form.Control
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Form.Group>
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        {success && <Alert variant="success" className="mt-3">{success}</Alert>}
        <Button variant="primary" type="submit" className="mt-3 w-100">
          {t('changePassword')}
        </Button>
      </Form>
    </Container>
  );
};

export default Profile;
