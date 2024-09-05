import React from "react";
import { Modal, Button, Form, Col } from "react-bootstrap";
import Select from "react-select";
import { FaTrash } from "react-icons/fa";
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
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <div className="d-flex align-items-center">
          {product && (
            <Button
              variant="danger"
              onClick={onDelete}
              style={{
                position: "relative",
                background: "transparent",
                color: "darkred",
              }}
            >
              <FaTrash />
            </Button>
          )}
          <Modal.Title>
            {product ? t("editProduct") : t("addProduct")}
          </Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="name">
            <Form.Label>{t("name")}</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="description">
            <Form.Label>{t("description")}</Form.Label>
            <Form.Control
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group as={Col} md="6" controlId="price">
            <Form.Label>{t("price")}</Form.Label>
            <Form.Control
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group as={Col} md="6" controlId="cost">
            <Form.Label>{t("cost")}</Form.Label>
            <Form.Control
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group as={Col} md="6" controlId="image">
            <Form.Label>{t("imageUrl")}</Form.Label>
            <Form.Control
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </Form.Group>
<Form.Group as={Col} md="6" controlId="recipeIds">
  <Form.Label>{t("recipes")}</Form.Label>
  <Select
    isMulti
    options={recipeOptions}
    value={selectedRecipes}
    onChange={(selectedOptions) => {
      // Убедитесь, что передается массив выбранных опций
      setSelectedRecipes(selectedOptions as { value: number; label: string }[]);
    }}
  />
</Form.Group>

          <Form.Group as={Col} md="6" controlId="packageId">
            <Form.Label>{t("package")}</Form.Label>
            <Select
              options={packageOptions}
              value={packageOptions.find(
                (option) => option.value === packageId
              )}
              onChange={(selectedOption) =>
                setPackageId(selectedOption?.value || null)
              }
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          {t("close")}
        </Button>
        <Button variant="primary" onClick={onSave}>
          {t("saveChanges")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductModal;
