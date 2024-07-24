// Утилита для пересчета цены с учетом единиц измерения
export const calculateIngredientCost = (
    price: number,
    price_quantity: number,
    price_unit: string,
    recipe_quantity: number,
    recipe_unit: string
  ): number => {
    let unitPrice: number;
    if (price_unit === 'kg' && recipe_unit === 'g') {
      unitPrice = price / (price_quantity * 1000); // цена за грамм
    } else if (price_unit === 'g' && recipe_unit === 'g') {
      unitPrice = price / price_quantity; // цена за грамм
    } else if (price_unit === 'l' && recipe_unit === 'ml') {
      unitPrice = price / (price_quantity * 1000); // цена за миллилитр
    } else if (price_unit === 'ml' && recipe_unit === 'ml') {
      unitPrice = price / price_quantity; // цена за миллилитр
    } else {
      unitPrice = price / price_quantity; // цена за единицу
    }
  
    const cost = unitPrice * recipe_quantity;
    return cost;
  };
  