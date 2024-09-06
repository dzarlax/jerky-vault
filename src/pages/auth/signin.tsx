import { Form, Button, Container } from 'react-bootstrap';
import useTranslation from 'next-translate/useTranslation';
import { useState } from 'react';
import { useRouter } from 'next/router';
import fetcher from '~/utils/fetcher';

export default function SignIn() {
  const { t } = useTranslation('common');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Отправляем запрос на Go-бэкенд для авторизации
      const response = await fetcher(`/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Failed to login');
      }

      const data = await response.json();

      // Сохраняем токен в localStorage или куки
      localStorage.setItem('token', data.token); // Используй нужное поле для токена из ответа

      // Перенаправляем на защищенную страницу или домашнюю страницу
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      // Обработай ошибки логина, например, отображая сообщение пользователю
    }
  };

  return (
    <Container>
      <h1 className="my-4">{t('signIn')}</h1>
      <Form onSubmit={handleSubmit}>
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
        <Button variant="primary" type="submit" className="mt-3">
          {t('signIn')}
        </Button>
      </Form>
    </Container>
  );
}
