import { useState, useEffect } from 'react';
import useSWR from 'swr';
import fetcher from '../utils/fetcher';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { getCsrfToken, useSession } from 'next-auth/react';
import { Button, InputGroup, FormControl } from 'react-bootstrap';
import ClientModal from '../components/modal/Clients/ClientModal';

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
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const openClientModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setName(client.name);
      setSurname(client.surname);
      setTelegram(client.telegram);
      setInstagram(client.instagram);
      setPhone(client.phone);
      setAddress(client.address);
      setSource(client.source);
    } else {
      setEditingClient(null);
      setName('');
      setSurname('');
      setTelegram('');
      setInstagram('');
      setPhone('');
      setAddress('');
      setSource('');
    }
    setShowClientModal(true);
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    const clientData = { name, surname, telegram, instagram, phone, address, source };

    if (editingClient) {
      await fetch(`/api/clients/${editingClient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });
    } else {
      await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'csrf-token': csrfToken,
        },
        body: JSON.stringify(clientData),
      });
    }

    mutate();
    setShowClientModal(false);
  };

  const deleteClient = async () => {
    if (confirm(t('confirmDeleteClient'))) {
      await fetch(`/api/clients/${editingClient.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      mutate();
      setShowClientModal(false);
    }
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
        <Button variant="outline-secondary" onClick={() => openClientModal()}>
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
            <Button variant="secondary" onClick={() => openClientModal(client)}>
              {t('edit')}
            </Button>
          </li>
        ))}
      </ul>

      <ClientModal
        show={showClientModal}
        onHide={() => setShowClientModal(false)}
        onDelete={deleteClient}
        onSave={handleSaveClient}
        client={editingClient}
        name={name}
        surname={surname}
        telegram={telegram}
        instagram={instagram}
        phone={phone}
        address={address}
        source={source}
        setName={setName}
        setSurname={setSurname}
        setTelegram={setTelegram}
        setInstagram={setInstagram}
        setPhone={setPhone}
        setAddress={setAddress}
        setSource={setSource}
        mapboxToken={mapboxToken}
        t={t}
      />
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
