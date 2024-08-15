import { getProviders, getCsrfToken } from 'next-auth/react';
import { Form, Button, Container } from 'react-bootstrap';
import useTranslation from 'next-translate/useTranslation';

export default function SignIn({ providers, csrfToken }) {
  const { t } = useTranslation('common');

  return (
    <Container>
      <h1 className="my-4">{t('signIn')}</h1>
      <Form method="post" action="/api/auth/callback/credentials">
        <Form.Control type="hidden" name="csrfToken" defaultValue={csrfToken} />
        <Form.Group controlId="username">
          <Form.Label>{t('username')}</Form.Label>
          <Form.Control name="username" type="text" placeholder={t('enterYourUsername')} />
        </Form.Group>
        <Form.Group controlId="password">
          <Form.Label>{t('password')}</Form.Label>
          <Form.Control name="password" type="password" placeholder={t('enterYourPassword')} />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3">
          {t('signIn')}
        </Button>
      </Form>
    </Container>
  );
}

export async function getServerSideProps(context) {
  const providers = await getProviders();
  const csrfToken = await getCsrfToken(context);
  return {
    props: { providers, csrfToken },
  };
}
