import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import fetcher from '../../utils/fetcher';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { getCsrfToken, useSession } from 'next-auth/react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Импорт стилей Bootstrap
import { Modal, Button, Form, InputGroup, FormControl } from 'react-bootstrap';

const Clients = ({ csrfToken, mapboxToken }) => {
  const { t, lang } = useTranslation('common');
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
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  const geocoderContainerRef = useRef(null);
  const geocoderRef = useRef(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && geocoderContainerRef.current) {
      if (geocoderRef.current) {
        geocoderRef.current.clear();
      }

      geocoderRef.current = new MapboxGeocoder({
        accessToken: mapboxToken,
        placeholder: t('address'),
      });

      geocoderRef.current.addTo(geocoderContainerRef.current);

      geocoderRef.current.on('result', (e) => {
        setAddress(e.result.place_name);
      });
    }
  }, [status, t, mapboxToken, showAddClientModal]);

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
    setShowAddClientModal(false);
  };

  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telegram?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.instagram?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.source?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!clients) return <div>{t('loading')}</div>;

  return (
    <div className="container">
      <h1>{t('clients')}</h1>
      <InputGroup className="mb-3">
        <FormControl
          placeholder={t('search')}
          aria-label={t('search')}
          aria-describedby="basic-addon2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="outline-secondary" onClick={() => setShowAddClientModal(true)}>
          {t('addClient')}
        </Button>
      </InputGroup>
      <ul className="list-group mt-4">
        {filteredClients.map((client) => (
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

      <Modal show={showAddClientModal} onHide={() => setShowAddClientModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('addClient')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={addClient}>
            <Form.Group controlId="formName">
              <Form.Label>{t('name')}</Form.Label>
              <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </Form.Group>
            <Form.Group controlId="formSurname">
              <Form.Label>{t('surname')}</Form.Label>
              <Form.Control type="text" value={surname} onChange={(e) => setSurname(e.target.value)} required />
            </Form.Group>
            <Form.Group controlId="formTelegram">
              <Form.Label>{t('telegram')}</Form.Label>
              <Form.Control type="text" value={telegram} onChange={(e) => setTelegram(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formInstagram">
              <Form.Label>{t('instagram')}</Form.Label>
              <Form.Control type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formPhone">
              <Form.Label>{t('phone')}</Form.Label>
              <Form.Control type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formAddress">
              <Form.Label>{t('address')}</Form.Label>
              <div ref={geocoderContainerRef} className="geocoder-container"></div>
              <Form.Control type="hidden" value={address} required />
            </Form.Group>
            <Form.Group controlId="formSource">
              <Form.Label>{t('source')}</Form.Label>
              <Form.Control type="text" value={source} onChange={(e) => setSource(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              {t('addClient')}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
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
