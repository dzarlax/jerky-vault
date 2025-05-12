import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
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
      className="theme-toggle p-0 ms-2"
      aria-label={theme === 'light' ? t('darkMode') : t('lightMode')}
    >
      {theme === 'light' ? <FaMoon className="text-dark" /> : <FaSun className="text-warning" />}
    </Button>
  );
};

interface HeaderProps {
  toggleMobileSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleMobileSidebar }) => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Проверка, что код выполняется на клиентской стороне
    if (typeof window !== 'undefined') {
      // Проверка наличия токена в localStorage
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token); // Установка состояния на основе наличия токена
    }
  }, [router]); // Добавление зависимости router для перехвата изменений маршрута

  const handleSignOut = () => {
    // Удаление токена из localStorage
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    router.push('/auth/signin'); // Перенаправление на страницу логина
  };

  const changeLanguage = (lng: string) => {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: lng });
  };

  // Определяем активную страницу
  const isActive = (path: string) => router.pathname === path;

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm py-2 sticky-top" expanded={expanded} onToggle={() => setExpanded(!expanded)}>
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
        <Navbar.Brand as={Link} href="/" locale={lang} className="d-flex align-items-center">
          <div className="logo-container d-flex align-items-center justify-content-center me-2" 
               style={{ 
                 width: '32px', 
                 height: '32px', 
                 backgroundColor: 'var(--primary-color)', 
                 borderRadius: '8px' 
               }}>
            <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>JV</span>
          </div>
          <span className="fw-bold text-primary">JerkyVault</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="mx-auto">
            <Nav.Link 
              as={Link} 
              href="/" 
              locale={lang} 
              className={`mx-1 d-flex align-items-center ${isActive('/') ? 'active' : ''}`}
            >
              <FaHome className="me-2" /> {t('home')}
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              href="/recipes" 
              locale={lang} 
              className={`mx-1 d-flex align-items-center ${isActive('/recipes') ? 'active' : ''}`}
            >
              <FaClipboardList className="me-2" /> {t('recipes')}
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              href="/ingredients" 
              locale={lang} 
              className={`mx-1 d-flex align-items-center ${isActive('/ingredients') ? 'active' : ''}`}
            >
              <FaLeaf className="me-2" /> {t('ingredients')}
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              href="/prices" 
              locale={lang} 
              className={`mx-1 d-flex align-items-center ${isActive('/prices') ? 'active' : ''}`}
            >
              <FaTag className="me-2" /> {t('prices')}
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              href="/clients" 
              locale={lang} 
              className={`mx-1 d-flex align-items-center ${isActive('/clients') ? 'active' : ''}`}
            >
              <FaUsers className="me-2" /> {t('clients')}
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              href="/products" 
              locale={lang} 
              className={`mx-1 d-flex align-items-center ${isActive('/products') ? 'active' : ''}`}
            >
              <FaBoxOpen className="me-2" /> {t('products')}
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              href="/orders" 
              locale={lang} 
              className={`mx-1 d-flex align-items-center ${isActive('/orders') ? 'active' : ''}`}
            >
              <FaShoppingCart className="me-2" /> {t('orders')}
            </Nav.Link>
          </Nav>
          <Nav className="d-flex align-items-center">
            {!isAuthenticated ? (
              <>
                <Nav.Link 
                  as={Link} 
                  href="/auth/signin" 
                  locale={lang} 
                  className="btn btn-outline-primary me-2"
                >
                  {t('signIn')}
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  href="/auth/signup" 
                  locale={lang} 
                  className="btn btn-primary"
                >
                  {t('signUp')}
                </Nav.Link>
              </>
            ) : (
              <>
                <Dropdown align="end">
                  <Dropdown.Toggle variant="link" id="dropdown-user" className="nav-link d-flex align-items-center">
                    <FaUser className="me-2" /> {t('profile')}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} href="/profile" locale={lang}>
                      <FaUser className="me-2" /> {t('profile')}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleSignOut}>
                      <FaSignOutAlt className="me-2" /> {t('signOut')}
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            )}
            <Dropdown align="end" className="ms-3">
              <Dropdown.Toggle variant="link" id="dropdown-language" className="p-0 nav-link">
                <img src={`/flags/${lang}.png`} alt={lang} width={24} height={16} className="rounded" />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => changeLanguage('en')} active={lang === 'en'}>
                  <img src="/flags/en.png" alt="English" width={20} height={15} className="me-2 rounded" />
                  English
                </Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('ru')} active={lang === 'ru'}>
                  <img src="/flags/ru.png" alt="Русский" width={20} height={15} className="me-2 rounded" />
                  Русский
                </Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage('rs')} active={lang === 'rs'}>
                  <img src="/flags/rs.png" alt="Srbski" width={20} height={15} className="me-2 rounded" />
                  Srbski
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <ThemeToggle />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
