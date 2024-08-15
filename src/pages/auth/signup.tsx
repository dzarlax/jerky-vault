import { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import useTranslation from 'next-translate/useTranslation';

export default function SignUp() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { t } = useTranslation('common');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert(t('passwordsDoNotMatch'));
      return;
    }

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      alert(t('userRegisteredSuccessfully'));
    } else {
      alert(t('failedToRegisterUser'));
    }
  };

  return (
    <Container>
      <h1 className="my-4">{t('signUp')}</h1>
      <Form onSubmit={handleSubmit}>
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
    </Container>
  );
}
