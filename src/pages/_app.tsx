import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import { AppProps } from 'next/app';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useTranslation from 'next-translate/useTranslation';

function MyApp({ Component, pageProps }: AppProps) {
  const { t } = useTranslation('common');

  return (
    <>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

export default MyApp;
