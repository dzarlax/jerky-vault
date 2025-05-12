import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import useTranslation from 'next-translate/useTranslation';
import { FaGithub, FaHeart } from 'react-icons/fa';

const Footer: React.FC = () => {
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-3 mt-auto">
      <Container>
        <Row className="align-items-center justify-content-between">
          <Col md={6} className="text-center text-md-start">
            <p className="mb-0">
              &copy; {currentYear} JerkyVault
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <p className="mb-0 d-flex align-items-center justify-content-center justify-content-md-end">
              <span className="me-2">{t('madeWith')}</span>
              <FaHeart className="text-danger mx-1" />
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
