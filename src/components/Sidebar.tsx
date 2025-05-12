import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { Nav } from 'react-bootstrap';
import { 
  FaHome, 
  FaClipboardList, 
  FaLeaf, 
  FaTag, 
  FaUsers, 
  FaBoxOpen, 
  FaShoppingCart, 
  FaUser,
  FaTimes
} from 'react-icons/fa';

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
  
  // Определяем активную страницу
  const isActive = (path: string) => router.pathname === path;
  
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
        <Nav.Link 
          as={Link} 
          href="/" 
          locale={lang}
          className={`sidebar-link ${isActive('/') ? 'active' : ''}`}
        >
          <FaHome className="me-3" /> {t('home')}
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          href="/recipes" 
          locale={lang}
          className={`sidebar-link ${isActive('/recipes') ? 'active' : ''}`}
        >
          <FaClipboardList className="me-3" /> {t('recipes')}
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          href="/ingredients" 
          locale={lang}
          className={`sidebar-link ${isActive('/ingredients') ? 'active' : ''}`}
        >
          <FaLeaf className="me-3" /> {t('ingredients')}
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          href="/prices" 
          locale={lang}
          className={`sidebar-link ${isActive('/prices') ? 'active' : ''}`}
        >
          <FaTag className="me-3" /> {t('prices')}
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          href="/clients" 
          locale={lang}
          className={`sidebar-link ${isActive('/clients') ? 'active' : ''}`}
        >
          <FaUsers className="me-3" /> {t('clients')}
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          href="/products" 
          locale={lang}
          className={`sidebar-link ${isActive('/products') ? 'active' : ''}`}
        >
          <FaBoxOpen className="me-3" /> {t('products')}
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          href="/orders" 
          locale={lang}
          className={`sidebar-link ${isActive('/orders') ? 'active' : ''}`}
        >
          <FaShoppingCart className="me-3" /> {t('orders')}
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          href="/profile" 
          locale={lang}
          className={`sidebar-link ${isActive('/profile') ? 'active' : ''}`}
        >
          <FaUser className="me-3" /> {t('profile')}
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;
