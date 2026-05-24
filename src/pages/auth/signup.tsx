import { FormEvent, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import useTranslation from 'next-translate/useTranslation';
import fetcher from '../../utils/fetcher';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { t } = useTranslation('common');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert(t('passwordsDoNotMatch'));
      return;
    }
    if (password.length < 8) {
      alert(t('passwordMinLength'));
      return;
    }

    try {
      await fetcher('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' },
      });
      alert(t('userRegisteredSuccessfully'));
    } catch {
      alert(t('failedToRegisterUser'));
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <h1>{t('signUp')}</h1>
        <p>{t('basicInfo')}</p>
      </div>
      <Form onSubmit={handleSubmit} className="auth-form">
        <Form.Group controlId="username">
          <Form.Label>{t('username')}</Form.Label>
          <Form.Control
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder={t('enterYourUsername')}
          />
        </Form.Group>
        <Form.Group controlId="password">
          <Form.Label>{t('password')}</Form.Label>
          <Form.Control
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder={t('enterYourPassword')}
          />
        </Form.Group>
        <Form.Group controlId="confirmPassword">
          <Form.Label>{t('confirmPassword')}</Form.Label>
          <Form.Control
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            placeholder={t('confirmYourPassword')}
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          {t('signUp')}
        </Button>
      </Form>
    </div>
  );
}
