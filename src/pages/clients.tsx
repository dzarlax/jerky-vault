import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import fetcher from '../utils/fetcher';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { getCsrfToken, useSession } from 'next-auth/react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

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

  const addressInputRef = useRef(null);
  const geocoderContainerRef = useRef(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }

    if (status === 'authenticated' && geocoderContainerRef.current) {
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxToken,
        placeholder: t('address'),
      });

      geocoder.addTo(geocoderContainerRef.current);

      geocoder.on('result', (e) => {
        setAddress(e.result.place_name);
      });

      return () => geocoder.remove(); // Clean up on unmount
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
      <form onSubmit={addClient}>
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <input type="text" placeholder={t('name')} value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="text" placeholder={t('surname')} value={surname} onChange={(e) => setSurname(e.target.value)} required />
        <input type="text" placeholder={t('telegram')} value={telegram} onChange={(e) => setTelegram(e.target.value)} />
        <input type="text" placeholder={t('instagram')} value={instagram} onChange={(e) => setInstagram(e.target.value)} />
        <input type="text" placeholder={t('phone')} value={phone} onChange={(e) => setPhone(e.target.value)} />
        <div ref={geocoderContainerRef} className="geocoder-container"></div>
        <input type="hidden" value={address} required />
        <input type="text" placeholder={t('source')} value={source} onChange={(e) => setSource(e.target.value)} />
        <button type="submit">{t('addClient')}</button>
      </form>
      <ul>
        {clients.map((client) => (
          <li key={client.id}>
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
            <button onClick={() => router.push(`/clients/${client.id}`)}>{t('edit')}</button>
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
