import { useTranslation as useNextTranslation } from 'react-i18next';

const useTranslation = () => {
  const { t, i18n } = useNextTranslation();

  return { t, i18n };
};

export default useTranslation;
