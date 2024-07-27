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

  const updateClient = async (e: React.FormEvent) => {
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
      <form onSubmit={updateClient}>
        <input type="text" placeholder={t('name')} value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="text" placeholder={t('surname')} value={surname} onChange={(e) => setSurname(e.target.value)} required />
        <input type="text" placeholder={t('telegram')} value={telegram} onChange={(e) => setTelegram(e.target.value)} />
        <input type="text" placeholder={t('instagram')} value={instagram} onChange={(e) => setInstagram(e.target.value)} />
        <input type="text" placeholder={t('phone')} value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input type="text" placeholder={t('address')} value={address} onChange={(e) => setAddress(e.target.value)} />
        <input type="text" placeholder={t('source')} value={source} onChange={(e) => setSource(e.target.value)} />
        <button type="submit">{t('updateClient')}</button>
      </form>
      <button onClick={deleteClient} style={{ marginTop: '10px', backgroundColor: 'red', color: 'white' }}>
        {t('deleteClient')}
      </button>
    </div>
  );
};

export default Client;
