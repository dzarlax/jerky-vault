import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import useTranslation from 'next-translate/useTranslation';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';

const Header: React.FC = () => {
  const { t } = useTranslation('common');
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand href="/">{t('home')}</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link href="/addRecipe">{t('addRecipe')}</Nav.Link>
          <Nav.Link href="/ingredients">{t('ingredients')}</Nav.Link>
          <Nav.Link href="/prices">{t('addPrices')}</Nav.Link>
          <Nav.Link href="/clients">{t('clients')}</Nav.Link>
          {loading ? (
            <Nav.Link>{t('loading')}</Nav.Link>
          ) : (
            <>
              {!session && (
                <>
                  <Nav.Link href="/auth/signin">{t('signIn')}</Nav.Link>
                  <Nav.Link href="/auth/signup">{t('signUp')}</Nav.Link>
                </>
              )}
              {session && (
                <>
                  <Nav.Link href="/profile">{t('profile')}</Nav.Link>
                  <Nav.Link href="/api/auth/signout" onClick={(e) => {
                    e.preventDefault();
                    signOut();
                  }}>{t('signOut')}</Nav.Link>
                </>
              )}
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
