import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import Select from "react-select";
import { FaTrash, FaSave, FaTimes } from "react-icons/fa";
import useTranslation from "next-translate/useTranslation";

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

  return (
    <Modal show={show} onHide={onClose} centered size="lg" className="product-modal">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="w-100">
          <div className="d-flex align-items-center justify-content-between">
            <h4 className="mb-0">{product ? t("editProduct") : t("addProduct")}</h4>
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
      <Modal.Body className="pt-0">
        <Form>
          <div className="form-section mb-4">
            <h5 className="section-title">{t("basicInfo")}</h5>
            <Row>
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

          <div className="form-section mb-4">
            <h5 className="section-title">{t("prices")}</h5>
            <Row>
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

          <div className="form-section">
            <h5 className="section-title">{t("details")}</h5>
            <Row>
              <Col md={6}>
                <Form.Group controlId="packageId" className="mb-3">
                  <Form.Label>{t("package")}</Form.Label>
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
      <Modal.Footer className="border-0 pt-0">
        <Button variant="outline-secondary" onClick={onClose}>
          <FaTimes className="me-2" /> {t("cancel")}
        </Button>
        <Button variant="primary" onClick={onSave}>
          <FaSave className="me-2" /> {t("save")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductModal;
