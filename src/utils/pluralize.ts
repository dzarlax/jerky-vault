type Translator = (key: string) => string;

const getPluralForm = (count: number) => {
  const absoluteCount = Math.abs(count);
  const mod10 = absoluteCount % 10;
  const mod100 = absoluteCount % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return 'one';
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return 'few';
  }

  return 'many';
};

const fallbackLabels = {
  en: {
    recipe: { one: 'recipe', few: 'recipes', many: 'recipes' },
    ingredient: { one: 'ingredient', few: 'ingredients', many: 'ingredients' },
    missingCost: { one: 'missing cost', few: 'missing costs', many: 'missing costs' },
  },
  ru: {
    recipe: { one: 'рецепт', few: 'рецепта', many: 'рецептов' },
    ingredient: { one: 'ингредиент', few: 'ингредиента', many: 'ингредиентов' },
    missingCost: { one: 'без стоимости', few: 'без стоимости', many: 'без стоимости' },
  },
  rs: {
    recipe: { one: 'рецепт', few: 'рецепта', many: 'рецепата' },
    ingredient: { one: 'састојак', few: 'састојка', many: 'састојака' },
    missingCost: { one: 'без цене', few: 'без цене', many: 'без цене' },
  },
};

const inferLocale = (t: Translator) => {
  const recipesLabel = t('recipes');

  if (recipesLabel === 'Рецепты') return 'ru';
  if (recipesLabel === 'Рецепти') return 'rs';
  return 'en';
};

export const formatCount = (t: Translator, count: number, key: string) => {
  const form = getPluralForm(count);
  const translationKey = `${key}_${form}`;
  const translatedLabel = t(translationKey);

  if (translatedLabel !== translationKey) {
    return `${count} ${translatedLabel}`;
  }

  const locale = inferLocale(t);
  const fallbackLabel = fallbackLabels[locale][key as keyof typeof fallbackLabels.en]?.[form];

  return `${count} ${fallbackLabel || key}`;
};
