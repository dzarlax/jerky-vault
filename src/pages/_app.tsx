import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import { AppProps } from 'next/app';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { SessionProvider } from 'next-auth/react';
import useTranslation from 'next-translate/useTranslation';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const { t } = useTranslation('common'); // Пример использования перевода из 'common' namespace

  return (
    <SessionProvider session={session}>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </SessionProvider>
  );
}

export default MyApp;
