import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import fetcher from '../../utils/fetcher';
import { useSession } from 'next-auth/react';
import useTranslation from 'next-translate/useTranslation';

const Client = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const { t } = useTranslation('common');
  const { data: client, mutate } = useSWR(id ? `/api/clients/${id}` : null, fetcher);

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [telegram, setTelegram] = useState('');
  const [instagram, setInstagram] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [source, setSource] = useState('');

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, router]);

  useEffect(() => {
    if (client) {
      setName(client.name);
      setSurname(client.surname);
      setTelegram(client.telegram);
      setInstagram(client.instagram);
      setPhone(client.phone);
      setAddress(client.address);
      setSource(client.source);
    }
  }, [client]);

  const updateClient = async (e) => {
    e.preventDefault();
    await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, surname, telegram, instagram, phone, address, source }),
    });
    mutate();
    router.push('/clients');
  };

  const deleteClient = async () => {
    if (confirm(t('confirmDeleteClient'))) {
      await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      router.push('/clients');
    }
  };

  if (!client) return <div>{t('loading')}</div>;

  return (
    <div className="container">
      <h1>{t('editClient')}</h1>
      <form onSubmit={updateClient} className="client-form">
        <div className="form-group">
          <label>{t('name')}</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>{t('surname')}</label>
          <input type="text" value={surname} onChange={(e) => setSurname(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>{t('telegram')}</label>
          <input type="text" value={telegram} onChange={(e) => setTelegram(e.target.value)} />
        </div>
        <div className="form-group">
          <label>{t('instagram')}</label>
          <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
        </div>
        <div className="form-group">
          <label>{t('phone')}</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="form-group">
          <label>{t('address')}</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="address-input" />
        </div>
        <div className="form-group">
          <label>{t('source')}</label>
          <input type="text" value={source} onChange={(e) => setSource(e.target.value)} />
        </div>
        <button type="submit" className="submit-button">{t('updateClient')}</button>
      </form>
      <button onClick={deleteClient} className="delete-button">
        {t('deleteClient')}
      </button>
    </div>
  );
};

export default Client;
