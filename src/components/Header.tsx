import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useAuth } from '../utils/authContext';
import { Navbar, Nav, Dropdown, Container, Button } from 'react-bootstrap';
import { 
  FaHome, 
  FaClipboardList, 
  FaLeaf, 
  FaTag, 
  FaUsers, 
  FaBoxOpen, 
  FaShoppingCart, 
  FaUser, 
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaBars
} from 'react-icons/fa';

const ThemeToggle: React.FC = () => {
  const { t } = useTranslation('common');
  const [theme, setTheme] = useState<string>('light');
  
  useEffect(() => {
    // Проверка, что код выполняется на клиентской стороне
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };
  
  return (
    <Button 
      variant="link" 
      onClick={toggleTheme} 
      className="theme-toggle p-0 ms-2 bg-transparent"
      style={{ boxShadow: 'none' }}
      aria-label={theme === 'light' ? t('darkMode') : t('lightMode')}
    >
      {theme === 'light' ? <FaMoon className="text-dark" /> : <FaSun className="text-warning" />}
    </Button>
  );
};

interface HeaderProps {
  toggleMobileSidebar?: () => void;
  showNavLinks?: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleMobileSidebar, showNavLinks = false }) => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const { auth, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const handleSignOut = () => {
    logout();
    router.push('/auth/signin'); // Перенаправление на страницу логина
  };

  const changeLanguage = (lng: string) => {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: lng });
  };

  // Определяем активную страницу
  const isActive = (path: string) => router.pathname === path;

  return (
    <Navbar bg="transparent" expand="lg" className="py-1 sticky-top" expanded={expanded} onToggle={() => setExpanded(!expanded)}>
      <Container>
        {toggleMobileSidebar && (
          <Button 
            variant="link" 
            className="d-lg-none me-2 p-0" 
            onClick={toggleMobileSidebar}
            aria-label={t('toggleMenu')}
          >
            <FaBars size={24} className="text-primary" />
          </Button>
        )}
        <Link href="/" locale={lang} passHref legacyBehavior>
          <Navbar.Brand className="d-flex align-items-center">
            <div className="logo-container d-flex align-items-center justify-content-center me-2" 
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  backgroundColor: 'var(--primary-color)', 
                  borderRadius: '6px' 
                }}>
              <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>JV</span>
            </div>
            <span className="fw-bold text-primary" style={{ fontSize: '0.9rem' }}>JerkyVault</span>
          </Navbar.Brand>
        </Link>
        <div className="d-flex align-items-center ms-auto me-2">
          {!auth.isAuthenticated ? (
            <div className="d-none d-lg-flex me-2">
              <Link href="/auth/signin" locale={lang} passHref legacyBehavior>
                <Button variant="outline-primary" size="sm" className="me-2">
                  {t('signIn')}
                </Button>
              </Link>
              <Link href="/auth/signup" locale={lang} passHref legacyBehavior>
                <Button variant="primary" size="sm">
                  {t('signUp')}
                </Button>
              </Link>
            </div>
          ) : (
            <Dropdown align="end" className="me-2 d-none d-lg-block">
              <Dropdown.Toggle variant="link" id="dropdown-user" className="p-0 nav-link bg-transparent">
                <FaUser className="text-primary" />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Link href="/profile" locale={lang} passHref legacyBehavior>
                  <Dropdown.Item>
                    <FaUser className="me-2" /> {t('profile')}
                  </Dropdown.Item>
                </Link>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleSignOut}>
                  <FaSignOutAlt className="me-2" /> {t('signOut')}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
          <Dropdown align="end" className="me-2">
            <Dropdown.Toggle variant="link" id="dropdown-language" className="p-0 nav-link bg-transparent">
              <img src={`/flags/${lang}.png`} alt={lang} width={20} height={14} className="rounded" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => changeLanguage('en')} active={lang === 'en'}>
                <img src="/flags/en.png" alt="English" width={18} height={13} className="me-2 rounded" />
                English
              </Dropdown.Item>
              <Dropdown.Item onClick={() => changeLanguage('ru')} active={lang === 'ru'}>
                <img src="/flags/ru.png" alt="Русский" width={18} height={13} className="me-2 rounded" />
                Русский
              </Dropdown.Item>
              <Dropdown.Item onClick={() => changeLanguage('rs')} active={lang === 'rs'}>
                <img src="/flags/rs.png" alt="Srbski" width={18} height={13} className="me-2 rounded" />
                Srbski
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <ThemeToggle />
        </div>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          {showNavLinks && auth.isAuthenticated && (
            <Nav className="mx-auto">
              <Link href="/" locale={lang} passHref legacyBehavior>
                <Nav.Link className={`mx-1 d-flex align-items-center ${isActive('/') ? 'active' : ''}`}>
                  <FaHome className="me-2" /> {t('home')}
                </Nav.Link>
              </Link>
              
              <Link href="/recipes" locale={lang} passHref legacyBehavior>
                <Nav.Link className={`mx-1 d-flex align-items-center ${isActive('/recipes') ? 'active' : ''}`}>
                  <FaClipboardList className="me-2" /> {t('recipes')}
                </Nav.Link>
              </Link>
              
              <Link href="/ingredients" locale={lang} passHref legacyBehavior>
                <Nav.Link className={`mx-1 d-flex align-items-center ${isActive('/ingredients') ? 'active' : ''}`}>
                  <FaLeaf className="me-2" /> {t('ingredients')}
                </Nav.Link>
              </Link>
              
              <Link href="/prices" locale={lang} passHref legacyBehavior>
                <Nav.Link className={`mx-1 d-flex align-items-center ${isActive('/prices') ? 'active' : ''}`}>
                  <FaTag className="me-2" /> {t('prices')}
                </Nav.Link>
              </Link>
              
              <Link href="/clients" locale={lang} passHref legacyBehavior>
                <Nav.Link className={`mx-1 d-flex align-items-center ${isActive('/clients') ? 'active' : ''}`}>
                  <FaUsers className="me-2" /> {t('clients')}
                </Nav.Link>
              </Link>
              
              <Link href="/products" locale={lang} passHref legacyBehavior>
                <Nav.Link className={`mx-1 d-flex align-items-center ${isActive('/products') ? 'active' : ''}`}>
                  <FaBoxOpen className="me-2" /> {t('products')}
                </Nav.Link>
              </Link>
              
              <Link href="/orders" locale={lang} passHref legacyBehavior>
                <Nav.Link className={`mx-1 d-flex align-items-center ${isActive('/orders') ? 'active' : ''}`}>
                  <FaShoppingCart className="me-2" /> {t('orders')}
                </Nav.Link>
              </Link>
            </Nav>
          )}
          <Nav className="d-flex align-items-center d-lg-none">
            {!auth.isAuthenticated ? (
              <>
                <Link href="/auth/signin" locale={lang} passHref legacyBehavior>
                  <Nav.Link className="btn btn-outline-primary me-2">
                    {t('signIn')}
                  </Nav.Link>
                </Link>
                <Link href="/auth/signup" locale={lang} passHref legacyBehavior>
                  <Nav.Link className="btn btn-primary">
                    {t('signUp')}
                  </Nav.Link>
                </Link>
              </>
            ) : (
              <>
                <Dropdown align="end">
                  <Dropdown.Toggle variant="link" id="dropdown-user-mobile" className="nav-link d-flex align-items-center bg-transparent">
                    <FaUser className="me-2" /> {t('profile')}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Link href="/profile" locale={lang} passHref legacyBehavior>
                      <Dropdown.Item>
                        <FaUser className="me-2" /> {t('profile')}
                      </Dropdown.Item>
                    </Link>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleSignOut}>
                      <FaSignOutAlt className="me-2" /> {t('signOut')}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
