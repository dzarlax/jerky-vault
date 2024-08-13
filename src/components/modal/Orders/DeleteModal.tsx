import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import useTranslation from 'next-translate/useTranslation';

interface DeleteModalProps {
  show: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  show,
  onClose,
  onDelete
}) => {
  const { t } = useTranslation('common');

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{t('confirmDelete')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{t('deleteConfirmationMessage')}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>{t('cancel')}</Button>
        <Button variant="danger" onClick={onDelete}>{t('delete')}</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteModal;
