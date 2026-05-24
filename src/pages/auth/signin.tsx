import { Form, Button } from 'react-bootstrap';
import useTranslation from 'next-translate/useTranslation';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import fetcher from '../../utils/fetcher';
import { useAuth } from '../../utils/authContext';

export default function SignIn() {
  const { t } = useTranslation('common');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // Отправляем запрос на Go-бэкенд для авторизации
      const data = await fetcher(`/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      // Если fetcher уже возвращает JSON, то нет необходимости вызывать response.json()
      if (!data || !data.token) {
        setError(t('invalidServerResponse'));
        return;
      }

      // Use the login function from AuthContext
      login(data.token, data.user || { username });

      // Redirect to the protected page or home page
      router.push('/');
    } catch (error) {
      setError(t('requestFailed'));
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <h1>{t('signIn')}</h1>
        <p>{t('pleaseSignIn')}</p>
      </div>
      <Form onSubmit={handleSubmit} className="auth-form">
        <Form.Group controlId="username">
          <Form.Label>{t('username')}</Form.Label>
          <Form.Control
            name="username"
            type="text"
            placeholder={t('enterYourUsername')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="password">
          <Form.Label>{t('password')}</Form.Label>
          <Form.Control
            name="password"
            type="password"
            placeholder={t('enterYourPassword')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        {error && <div className="text-danger mt-2">{error}</div>}
        <Button variant="primary" type="submit" className="mt-3">
          {t('signIn')}
        </Button>
      </Form>
    </div>
  );
}
