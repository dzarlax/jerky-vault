import { IconType } from 'react-icons';
import { FaBolt, FaBoxOpen, FaFlask, FaList, FaTag, FaTint, FaUtensils } from 'react-icons/fa';

export type IngredientTypeValue = 'base' | 'spice' | 'sauce' | 'packing' | 'electricity';

type IngredientTypeMeta = {
  value: IngredientTypeValue;
  labelKey: string;
  icon: IconType;
  badgeClass: string;
  units: string[];
};

export type IngredientTypeOption = {
  value: string;
  label: string;
  icon: IconType;
};

const INGREDIENT_TYPES: IngredientTypeMeta[] = [
  { value: 'base', labelKey: 'base', icon: FaUtensils, badgeClass: 'is-base', units: ['kg', 'g'] },
  { value: 'spice', labelKey: 'spice', icon: FaFlask, badgeClass: 'is-spice', units: ['g'] },
  { value: 'sauce', labelKey: 'sauce', icon: FaTint, badgeClass: 'is-sauce', units: ['ml'] },
  { value: 'packing', labelKey: 'packing', icon: FaBoxOpen, badgeClass: 'is-packing', units: ['pieces'] },
  { value: 'electricity', labelKey: 'electricity', icon: FaBolt, badgeClass: 'is-electricity', units: ['hh'] },
];

const FALLBACK_TYPE = {
  labelKey: 'ingredientType',
  icon: FaTag,
  badgeClass: 'is-other',
  units: [],
};

export const getIngredientTypes = () => INGREDIENT_TYPES;

export const getIngredientTypeMeta = (type?: string) => (
  INGREDIENT_TYPES.find((option) => option.value === type) || FALLBACK_TYPE
);

export const getIngredientTypeOptions = (
  t: (key: string) => string,
  options: { includeAll?: boolean } = {}
): IngredientTypeOption[] => {
  const typeOptions = INGREDIENT_TYPES.map((type) => ({
    value: type.value,
    label: t(type.labelKey),
    icon: type.icon,
  }));

  if (!options.includeAll) {
    return typeOptions;
  }

  return [
    { value: 'all', label: t('allTypes'), icon: FaList },
    ...typeOptions,
  ];
};

export const getIngredientTypeBadgeClass = (type?: string) => getIngredientTypeMeta(type).badgeClass;

export const getUnitsForIngredientType = (type?: string) => getIngredientTypeMeta(type).units;
