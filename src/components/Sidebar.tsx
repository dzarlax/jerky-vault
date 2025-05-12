import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { Nav, Dropdown, Button } from 'react-bootstrap';
import { 
  FaHome, 
  FaClipboardList, 
  FaLeaf, 
  FaTag, 
  FaUsers, 
  FaBoxOpen, 
  FaShoppingCart, 
  FaUser,
  FaTimes,
  FaMoon,
  FaSun,
  FaSignOutAlt,
  FaGlobe
} from 'react-icons/fa';
import { useAuth } from '../utils/authContext';

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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen = true, 
  onClose = () => {}, 
  isMobile = false 
}) => {
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const { auth, logout } = useAuth();
  
  // Определяем активную страницу
  const isActive = (path: string) => router.pathname === path;
  
  const handleSignOut = () => {
    logout();
    router.push('/auth/signin');
  };
  
  const changeLanguage = (lng: string) => {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: lng });
  };
  
  const sidebarClass = isMobile 
    ? `mobile-nav ${isOpen ? 'open' : ''}` 
    : 'sidebar d-none d-lg-block';

  return (
    <div className={sidebarClass}>
      {isMobile && (
        <div className="mobile-nav-header">
          <div className="d-flex align-items-center">
            <div className="logo-container d-flex align-items-center justify-content-center me-2" 
                 style={{ 
                   width: '32px', 
                   height: '32px', 
                   backgroundColor: 'var(--primary-color)', 
                   borderRadius: '8px' 
                 }}>
              <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>JV</span>
            </div>
            <span className="fw-bold text-primary fs-4">JerkyVault</span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label={t('close')}>
            <FaTimes />
          </button>
        </div>
      )}
      
      {!isMobile && (
        <div className="sidebar-header">
          <div className="d-flex justify-content-center align-items-center mb-2">
            <div className="logo-container d-flex align-items-center justify-content-center me-2" 
                 style={{ 
                   width: '32px', 
                   height: '32px', 
                   backgroundColor: 'var(--primary-color)', 
                   borderRadius: '8px' 
                 }}>
              <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>JV</span>
            </div>
            <span className="fw-bold text-primary fs-4">JerkyVault</span>
          </div>
        </div>
      )}
      
      <Nav className="flex-column">
        <Link href="/" locale={lang} passHref legacyBehavior>
          <Nav.Link className={`sidebar-link ${isActive('/') ? 'active' : ''}`}>
            <FaHome className="me-3" /> {t('home')}
          </Nav.Link>
        </Link>
        
        <Link href="/recipes" locale={lang} passHref legacyBehavior>
          <Nav.Link className={`sidebar-link ${isActive('/recipes') ? 'active' : ''}`}>
            <FaClipboardList className="me-3" /> {t('recipes')}
          </Nav.Link>
        </Link>
        
        <Link href="/ingredients" locale={lang} passHref legacyBehavior>
          <Nav.Link className={`sidebar-link ${isActive('/ingredients') ? 'active' : ''}`}>
            <FaLeaf className="me-3" /> {t('ingredients')}
          </Nav.Link>
        </Link>
        
        <Link href="/prices" locale={lang} passHref legacyBehavior>
          <Nav.Link className={`sidebar-link ${isActive('/prices') ? 'active' : ''}`}>
            <FaTag className="me-3" /> {t('prices')}
          </Nav.Link>
        </Link>
        
        <Link href="/clients" locale={lang} passHref legacyBehavior>
          <Nav.Link className={`sidebar-link ${isActive('/clients') ? 'active' : ''}`}>
            <FaUsers className="me-3" /> {t('clients')}
          </Nav.Link>
        </Link>
        
        <Link href="/products" locale={lang} passHref legacyBehavior>
          <Nav.Link className={`sidebar-link ${isActive('/products') ? 'active' : ''}`}>
            <FaBoxOpen className="me-3" /> {t('products')}
          </Nav.Link>
        </Link>
        
        <Link href="/orders" locale={lang} passHref legacyBehavior>
          <Nav.Link className={`sidebar-link ${isActive('/orders') ? 'active' : ''}`}>
            <FaShoppingCart className="me-3" /> {t('orders')}
          </Nav.Link>
        </Link>
        
        <Link href="/profile" locale={lang} passHref legacyBehavior>
          <Nav.Link className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}>
            <FaUser className="me-3" /> {t('profile')}
          </Nav.Link>
        </Link>
      </Nav>
      
      <div className="mt-auto pt-4 border-top mt-4">
        <div className="d-flex justify-content-between align-items-center px-3 mb-3">
          <div className="d-flex align-items-center">
            <FaGlobe className="text-primary me-2" />
            <Dropdown>
              <Dropdown.Toggle variant="link" id="dropdown-language" className="p-0 text-decoration-none bg-transparent border-0 text-dark">
                <img src={`/flags/${lang}.png`} alt={lang} width={20} height={14} className="rounded me-1" />
                {lang.toUpperCase()}
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
          </div>
          <ThemeToggle />
        </div>
        
        <Button 
          variant="outline-danger" 
          size="sm" 
          className="w-100 d-flex align-items-center justify-content-center"
          onClick={handleSignOut}
        >
          <FaSignOutAlt className="me-2" /> {t('signOut')}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
