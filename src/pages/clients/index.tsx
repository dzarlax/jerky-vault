import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import fetcher from '../../utils/fetcher';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { getCsrfToken, useSession } from 'next-auth/react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Импорт стилей Bootstrap

const Clients = ({ csrfToken, mapboxToken }) => {
  const { t } = useTranslation('common');
  const { data: clients, mutate } = useSWR('/api/clients', fetcher);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [telegram, setTelegram] = useState('');
  const [instagram, setInstagram] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [source, setSource] = useState('');

  const geocoderContainerRef = useRef(null);
  const geocoderRef = useRef(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }

    if (status === 'authenticated' && geocoderContainerRef.current) {
      geocoderRef.current = new MapboxGeocoder({
        accessToken: mapboxToken,
        placeholder: t('address'),
      });

      geocoderRef.current.addTo(geocoderContainerRef.current);

      geocoderRef.current.on('result', (e) => {
        setAddress(e.result.place_name);
      });

      return () => {
        if (geocoderRef.current) {
          geocoderRef.current.clear();
          geocoderContainerRef.current.innerHTML = '';
        }
      };
    }
  }, [status, router, t, mapboxToken]);

  const addClient = async (e) => {
    e.preventDefault();
    await fetch('/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'csrf-token': csrfToken,
      },
      body: JSON.stringify({ name, surname, telegram, instagram, phone, address, source }),
    });
    setName('');
    setSurname('');
    setTelegram('');
    setInstagram('');
    setPhone('');
    setAddress('');
    setSource('');
    mutate();
  };

  if (!clients) return <div>{t('loading')}</div>;

  return (
    <div className="container">
      <h1>{t('clients')}</h1>
      <form onSubmit={addClient} className="row g-3">
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <div className="col-md-6">
          <label className="form-label">{t('name')}</label>
          <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('surname')}</label>
          <input type="text" className="form-control" value={surname} onChange={(e) => setSurname(e.target.value)} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('telegram')}</label>
          <input type="text" className="form-control" value={telegram} onChange={(e) => setTelegram(e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('instagram')}</label>
          <input type="text" className="form-control" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('phone')}</label>
          <input type="text" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('address')}</label>
          <div ref={geocoderContainerRef} className="geocoder-container"></div>
          <input type="hidden" value={address} required />
        </div>
        <div className="col-md-6">
          <label className="form-label">{t('source')}</label>
          <input type="text" className="form-control" value={source} onChange={(e) => setSource(e.target.value)} />
        </div>
        <div className="col-12 d-flex justify-content-end">
          <button type="submit" className="btn btn-primary">{t('addClient')}</button>
        </div>
      </form>
      <ul className="list-group mt-4">
        {clients.map((client) => (
          <li key={client.id} className="list-group-item">
            <strong>{client.name} {client.surname}</strong>
            <p>
              {t('telegram')}: 
              {client.telegram ? (
                <a href={`https://t.me/${client.telegram}`} target="_blank" rel="noopener noreferrer">
                  {client.telegram}
                </a>
              ) : (
                'N/A'
              )}
            </p>
            <p>
              {t('instagram')}: 
              {client.instagram ? (
                <a href={`https://instagram.com/${client.instagram}`} target="_blank" rel="noopener noreferrer">
                  {client.instagram}
                </a>
              ) : (
                'N/A'
              )}
            </p>
            <p>
              {t('phone')}: 
              {client.phone ? (
                <a href={`tel:${client.phone}`}>
                  {client.phone}
                </a>
              ) : (
                'N/A'
              )}
            </p>
            <p>
              {t('address')}: 
              {client.address ? (
                <a href={`https://maps.google.com/?q=${client.address}`} target="_blank" rel="noopener noreferrer">
                  {client.address}
                </a>
              ) : (
                'N/A'
              )}
            </p>
            <p>{t('source')}: {client.source}</p>
            <button className="btn btn-secondary" onClick={() => router.push(`/clients/${client.id}`)}>{t('edit')}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export async function getServerSideProps(context) {
  const csrfToken = await getCsrfToken(context);
  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
  return {
    props: { csrfToken, mapboxToken },
  };
}

export default Clients;
