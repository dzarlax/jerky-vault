import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { Breadcrumb } from 'react-bootstrap';
import { FaHome } from 'react-icons/fa';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items = [] }) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  
  // Автоматически создаем хлебные крошки на основе текущего пути
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const asPathWithoutQuery = router.asPath.split('?')[0];
    const asPathNestedRoutes = asPathWithoutQuery.split('/').filter(v => v.length > 0);
    
    const crumblist = asPathNestedRoutes.map((subpath, idx) => {
      const href = '/' + asPathNestedRoutes.slice(0, idx + 1).join('/');
      return { 
        href, 
        label: t(subpath) || subpath.charAt(0).toUpperCase() + subpath.slice(1) 
      };
    });
    
    return [{ href: '/', label: t('home') }, ...crumblist];
  };
  
  const breadcrumbs = items.length > 0 ? items : generateBreadcrumbs();

  return (
    <Breadcrumb className="py-1 mb-2 small">
      {breadcrumbs.map((breadcrumb, i) => (
        <Breadcrumb.Item
          key={breadcrumb.href}
          active={i === breadcrumbs.length - 1}
        >
          {i === breadcrumbs.length - 1 ? (
            <>
              {i === 0 ? <FaHome className="me-1" /> : null}
              {breadcrumb.label}
            </>
          ) : (
            <Link href={breadcrumb.href} passHref legacyBehavior>
              <a>
                {i === 0 ? <FaHome className="me-1" /> : null}
                {breadcrumb.label}
              </a>
            </Link>
          )}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};

export default Breadcrumbs;
