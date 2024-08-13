import { useRef, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

const ClientModal = ({
  show,
  onHide,
  onDelete,
  onSave,
  client,
  name,
  surname,
  telegram,
  instagram,
  phone,
  address,
  source,
  setName,
  setSurname,
  setTelegram,
  setInstagram,
  setPhone,
  setAddress,
  setSource,
  mapboxToken,
  t,
}) => {
  const geocoderContainerRef = useRef(null);
  const geocoderRef = useRef(null);

  useEffect(() => {
    if (show && geocoderContainerRef.current) {
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
  }, [show, mapboxToken, t]);

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Button variant="danger" onClick={onDelete} style={{ position: 'relative',background: 'transparent', color:'darkred' }}>
          <FaTrash />
        </Button>
        <Modal.Title>{client ? t('editClient') : t('addClient')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSave}>
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
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" type="submit" className="ms-auto" onClick={onSave}>
          {client ? t('updateClient') : t('addClient')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ClientModal;
