import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { Navbar, Nav, Dropdown, Container } from 'react-bootstrap';

const Header: React.FC = () => {
  const { t, lang } = useTranslation('common');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or a loading spinner
  }

  const loading = status === 'loading';

  const changeLanguage = (lng) => {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: lng });
  };

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand as={Link} href="/" locale={lang}>{t('home')}</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} href="/recipes" locale={lang}>{t('recipes')}</Nav.Link>
            <Nav.Link as={Link} href="/ingredients" locale={lang}>{t('ingredients')}</Nav.Link>
            <Nav.Link as={Link} href="/prices" locale={lang}>{t('prices')}</Nav.Link>
            <Nav.Link as={Link} href="/clients" locale={lang}>{t('clients')}</Nav.Link>
            <Nav.Link as={Link} href="/products" locale={lang}>{t('products')}</Nav.Link>
            <Nav.Link as={Link} href="/orders" locale={lang}>{t('orders')}</Nav.Link>
            {loading && (
              <Nav.Link>{t('loading')}</Nav.Link>
            )}
          </Nav>
          <Nav className="ms-auto">
            {!loading && !session && (
              <>
                <Nav.Link as={Link} href="/auth/signin" locale={lang}>{t('signIn')}</Nav.Link>
                <Nav.Link as={Link} href="/auth/signup" locale={lang}>{t('signUp')}</Nav.Link>
              </>
            )}
            {!loading && session && (
              <>
                <Nav.Link as={Link} href="/profile" locale={lang}>{t('profile')}</Nav.Link>
                <Nav.Link href="/api/auth/signout" onClick={(e) => {
                  e.preventDefault();
                  signOut();
                }}>{t('signOut')}</Nav.Link>
              </>
            )}
            <Dropdown align="end">
              <Dropdown.Toggle variant="link" id="dropdown-basic" className="p-0" style={{ background: 'none', border: 'none' }}>
                <img src={`/flags/${lang}.png`} alt={lang} width={24} height={16} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => changeLanguage('en')}>
                  <img src="/flags/en.png" alt="English" width={20} height={15} className="me-2" />
                  English
                </Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('ru')}>
                  <img src="/flags/ru.png" alt="Русский" width={20} height={15} className="me-2" />
                  Русский
                </Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('rs')}>
                  <img src="/flags/rs.png" alt="Srbski" width={20} height={15} className="me-2" />
                  Srbski
                </Dropdown.Item>
                {/* Добавьте другие языки по мере необходимости */}
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
