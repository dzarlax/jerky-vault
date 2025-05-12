import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import { AppProps } from 'next/app';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import useTranslation from 'next-translate/useTranslation';
import { Container, Row, Col } from 'react-bootstrap';
import { AuthProvider } from '../utils/authContext';

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
  
  // Wrap the content with AuthProvider
  const content = isAuthPage ? (
    <>
      <Header toggleMobileSidebar={() => setShowMobileSidebar(!showMobileSidebar)} showNavLinks={true} />
      <Container className="py-5">
        <Component {...pageProps} />
      </Container>
      <Footer />
    </>
  ) : (
    <>
      <Header toggleMobileSidebar={() => setShowMobileSidebar(!showMobileSidebar)} showNavLinks={false} />
      <div className="d-flex">
        {!isMobileView && <Sidebar />}
        {isMobileView && (
          <Sidebar 
            isOpen={showMobileSidebar} 
            onClose={() => setShowMobileSidebar(false)} 
            isMobile={true} 
          />
        )}
        <div className="flex-grow-1" style={{ marginLeft: isMobileView ? 0 : '220px' }}>
          <Container fluid className="py-2 px-4">
            <Component {...pageProps} />
          </Container>
        </div>
      </div>
      <Footer />
    </>
  );

  // Initialize auth context for SSR
  const initialAuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
  };

  // Wrap everything with AuthProvider
  return (
    <AuthProvider initialState={initialAuthState}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      {content}
    </AuthProvider>
  );
}

export default MyApp;
