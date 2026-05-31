import { WorkspaceIngredient } from '../types/api';
import { getUnitsForIngredientType } from './ingredientTypes';

export type UnitOption = {
  value: string;
  label: string;
};

export type ResolvedIngredientUnits = {
  units: string[];
  defaultUnit: string;
  source: 'backend' | 'fallback';
};

const normalizeUnitList = (units?: string[]) => {
  if (!Array.isArray(units)) {
    return [];
  }

  const seen = new Set<string>();
  return units.reduce<string[]>((result, unit) => {
    const normalizedUnit = typeof unit === 'string' ? unit.trim() : '';
    if (!normalizedUnit || seen.has(normalizedUnit)) {
      return result;
    }

    seen.add(normalizedUnit);
    return [...result, normalizedUnit];
  }, []);
};

export const resolveWorkspaceIngredientUnits = (
  workspaceIngredient?: WorkspaceIngredient
): ResolvedIngredientUnits => {
  const backendUnits = normalizeUnitList(workspaceIngredient?.allowed_units);
  if (backendUnits.length > 0) {
    const defaultUnit = workspaceIngredient?.default_unit?.trim();
    return {
      units: backendUnits,
      defaultUnit: defaultUnit && backendUnits.includes(defaultUnit) ? defaultUnit : backendUnits[0],
      source: 'backend',
    };
  }

  const fallbackUnits = normalizeUnitList(
    getUnitsForIngredientType(workspaceIngredient?.ingredient?.type)
  );

  return {
    units: fallbackUnits,
    defaultUnit: fallbackUnits[0] || '',
    source: 'fallback',
  };
};

export const toUnitOptions = (
  units: string[],
  t: (key: string) => string
): UnitOption[] => units.map((unit) => ({
  value: unit,
  label: t(unit),
}));

export const getWorkspaceIngredientLabel = (workspaceIngredient: WorkspaceIngredient) => {
  const alias = workspaceIngredient.alias?.trim();
  return alias || workspaceIngredient.ingredient.name;
};
