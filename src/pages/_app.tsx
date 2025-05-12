import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import { AppProps } from 'next/app';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import Breadcrumbs from '../components/Breadcrumbs';
import useTranslation from 'next-translate/useTranslation';
import { Container, Row, Col } from 'react-bootstrap';

function MyApp({ Component, pageProps }: AppProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  
  // Проверяем, является ли текущая страница страницей аутентификации
  const isAuthPage = router.pathname.startsWith('/auth/');
  
  // Определяем, является ли текущее устройство мобильным
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 992);
    };
    
    // Инициализация при монтировании
    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
    }
    
    // Очистка при размонтировании
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);
  
  // Если это страница аутентификации, не показываем сайдбар и используем другой макет
  if (isAuthPage) {
    return (
      <>
        <Header toggleMobileSidebar={() => setShowMobileSidebar(!showMobileSidebar)} />
        <Container className="py-5">
          <Component {...pageProps} />
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header toggleMobileSidebar={() => setShowMobileSidebar(!showMobileSidebar)} />
      <div className="d-flex">
        {!isMobileView && <Sidebar />}
        {isMobileView && (
          <Sidebar 
            isOpen={showMobileSidebar} 
            onClose={() => setShowMobileSidebar(false)} 
            isMobile={true} 
          />
        )}
        <div className="flex-grow-1 ms-0 ms-lg-250" style={{ marginLeft: isMobileView ? 0 : '250px' }}>
          <Container fluid className="py-4 px-4">
            <Breadcrumbs />
            <Component {...pageProps} />
          </Container>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default MyApp;
