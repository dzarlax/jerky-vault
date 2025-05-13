import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaSave, FaTimes } from "react-icons/fa";
import useTranslation from "next-translate/useTranslation";
import fetcher from "../../../utils/fetcher";
import { useAuth } from "../../../utils/authContext";
import useSWR from "swr";

interface PackageModalProps {
  show: boolean;
  onClose: () => void;
  onPackageCreated: (newPackage: { id: number; name: string }) => void;
}

const PackageModal: React.FC<PackageModalProps> = ({
  show,
  onClose,
  onPackageCreated,
}) => {
  const { t } = useTranslation("common");
  const { auth } = useAuth();
  const [packageName, setPackageName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: mutatePackages } = useSWR('/api/packages', fetcher);

  const handleSubmit = async () => {
    if (!packageName.trim()) {
      alert(t("fillRequiredFields"));
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetcher("/api/packages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ name: packageName }),
      });

      setIsSubmitting(false);
      
      if (response && response.id) {
        // Notify parent component about the new package
        onPackageCreated({ id: response.id, name: packageName });
        
        // Refresh the packages list
        mutatePackages();
        
        handleClose();
      }
    } catch (error) {
      console.error("Failed to create package", error);
      alert(t("failedToSaveChanges"));
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPackageName("");
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="text-primary">{t("newPackage")}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0 px-3 px-md-4">
        <Form>
          <div className="form-section p-3 rounded bg-light">
            <Form.Group controlId="packageName" className="mb-3">
              <Form.Label>{t("packageName")}</Form.Label>
              <Form.Control
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                required
                placeholder={t("packageName")}
                autoFocus
              />
            </Form.Group>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-3 px-3 px-md-4 d-flex flex-column flex-sm-row">
        <Button 
          variant="outline-secondary" 
          onClick={handleClose} 
          disabled={isSubmitting}
          className="w-100 mb-2 mb-sm-0 me-sm-2"
        >
          <FaTimes className="me-2" /> {t("cancel")}
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-100"
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {t("saving")}
            </>
          ) : (
            <>
              <FaSave className="me-2" /> {t("save")}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PackageModal;
