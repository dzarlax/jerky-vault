import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import Select from "react-select";
import { FaTrash, FaSave, FaTimes, FaPlus } from "react-icons/fa";
import useTranslation from "next-translate/useTranslation";
import PackageModal from "./PackageModal";

interface ProductModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  product?: { id: number; name: string } | null;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  price: string;
  setPrice: (price: string) => void;
  cost: string;
  setCost: (cost: string) => void;
  image: string;
  setImage: (image: string) => void;
  selectedRecipes: { value: number; label: string }[];
  setSelectedRecipes: (recipes: { value: number; label: string }[]) => void;
  recipeOptions: { value: number; label: string }[];
  packageId: number | null;
  setPackageId: (id: number | null) => void;
  packageOptions: { value: number; label: string }[];
}

const ProductModal: React.FC<ProductModalProps> = ({
  show,
  onClose,
  onSave,
  onDelete,
  product,
  name,
  setName,
  description,
  setDescription,
  price,
  setPrice,
  cost,
  setCost,
  image,
  setImage,
  selectedRecipes,
  setSelectedRecipes,
  recipeOptions,
  packageId,
  setPackageId,
  packageOptions,
}) => {
  const { t } = useTranslation("common");
  const [showPackageModal, setShowPackageModal] = useState(false);
  
  const handlePackageCreated = (newPackage: { id: number; name: string }) => {
    // Update the packageId with the newly created package
    setPackageId(newPackage.id);
    
    // Refresh the packages list in the parent component
    // This will be handled by the parent component through SWR's mutate
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg" className="product-modal">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="w-100">
          <div className="d-flex align-items-center justify-content-between">
            <h4 className="mb-0 text-primary">{product ? t("editProduct") : t("addProduct")}</h4>
            {product && (
              <Button
                variant="outline-danger"
                onClick={onDelete}
                className="btn-icon"
                title={t("delete")}
                aria-label={t("delete") + " " + product.name}
              >
                <FaTrash />
              </Button>
            )}
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0 px-3 px-md-4">
        <Form>
          <div className="form-section mb-3 p-3 rounded bg-light">
            <h5 className="section-title text-primary mb-3">{t("basicInfo")}</h5>
            <Row className="g-2">
              <Col md={6}>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label>{t("name")}</Form.Label>
                  <Form.Control
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder={t("productName")}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="image" className="mb-3">
                  <Form.Label>{t("imageUrl")}</Form.Label>
                  <Form.Control
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group controlId="description" className="mb-3">
              <Form.Label>{t("description")}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder={t("description")}
              />
            </Form.Group>
          </div>

          <div className="form-section mb-3 p-3 rounded bg-light">
            <h5 className="section-title text-primary mb-3">{t("prices")}</h5>
            <Row className="g-2">
              <Col md={6}>
                <Form.Group controlId="price" className="mb-3">
                  <Form.Label>{t("price")}</Form.Label>
                  <Form.Control
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="cost" className="mb-3">
                  <Form.Label>{t("cost")}</Form.Label>
                  <Form.Control
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          <div className="form-section p-3 rounded bg-light">
            <h5 className="section-title text-primary mb-3">{t("details")}</h5>
            <Row className="g-2">
              <Col md={6}>
                <Form.Group controlId="packageId" className="mb-3">
                  <Form.Label>{t("package")}</Form.Label>
                  <div className="d-flex">
                    <div className="flex-grow-1 me-2">
                      <Select
                        options={packageOptions}
                        value={packageOptions.find(
                          (option) => option.value === packageId
                        )}
                        onChange={(selectedOption) =>
                          setPackageId(selectedOption?.value || null)
                        }
                        placeholder={t("choosePackage")}
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </div>
                    <Button 
                      variant="outline-primary" 
                      className="add-package-btn"
                      onClick={() => setShowPackageModal(true)}
                      title={t("addPackage")}
                    >
                      <FaPlus />
                    </Button>
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="recipeIds" className="mb-3">
                  <Form.Label>{t("recipes")}</Form.Label>
                  <Select
                    isMulti
                    options={recipeOptions}
                    value={selectedRecipes}
                    onChange={(selectedOptions) => {
                      setSelectedRecipes(selectedOptions as { value: number; label: string }[]);
                    }}
                    placeholder={t("chooseRecipe")}
                    className="react-select-container"
                    classNamePrefix="react-select"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-3 px-3 px-md-4 d-flex flex-column flex-sm-row">
        <Button variant="outline-secondary" onClick={onClose} className="w-100 mb-2 mb-sm-0 me-sm-2">
          <FaTimes className="me-2" /> {t("cancel")}
        </Button>
        <Button variant="primary" onClick={onSave} className="w-100">
          <FaSave className="me-2" /> {t("save")}
        </Button>
      </Modal.Footer>
      
      <PackageModal 
        show={showPackageModal}
        onClose={() => setShowPackageModal(false)}
        onPackageCreated={handlePackageCreated}
      />
    </Modal>
  );
};

export default ProductModal;
