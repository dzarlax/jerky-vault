import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import db from '../../../server/db';
import { calculateIngredientCost } from '../../../utils/calculateIngredientCost';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      await getRecipes(req, res, session.user.id);
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getRecipes(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { name, ingredient } = req.query;

  let sql = "SELECT * FROM recipes WHERE user_id = ?";
  let params: (string | string[])[] = [userId];

  if (name) {
    sql += " AND name = ?";
    params.push(name as string);
  }

  try {
    const [rows] = await db.query(sql, params);

    if (rows.length === 0) {
      return res.json([]);
    }

    const recipeIds = rows.map((row: any) => row.id);
    let filteredRecipeIds = recipeIds;

    if (ingredient) {
      const ingredientSql = `
        SELECT DISTINCT ri.recipe_id
        FROM recipe_ingredients ri
        JOIN ingredients i ON ri.ingredient_id = i.id
        WHERE i.name = ? AND ri.recipe_id IN (?)
      `;
      const [ingredientRows] = await db.query(ingredientSql, [ingredient, recipeIds]);

      filteredRecipeIds = ingredientRows.map((row: any) => row.recipe_id);

      if (filteredRecipeIds.length === 0) {
        return res.json([]);
      }
    }

    const detailedRecipes = await getRecipeDetails(filteredRecipeIds, rows);
    res.json(detailedRecipes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
}

async function getRecipeDetails(recipeIds: number[], recipes: any[]) {
  const ingredientSql = `
    SELECT ri.recipe_id, ri.quantity, ri.unit, i.type, i.name, p.price, p.quantity AS price_quantity, p.unit AS price_unit, i.id
    FROM recipe_ingredients ri
    JOIN ingredients i ON ri.ingredient_id = i.id
    LEFT JOIN (
      SELECT ingredient_id, price, quantity, unit FROM prices 
      WHERE (ingredient_id, date) IN (
        SELECT ingredient_id, MAX(date) 
        FROM prices GROUP BY ingredient_id
      )
    ) p ON ri.ingredient_id = p.ingredient_id
    WHERE ri.recipe_id IN (?)
  `;

  const [ingredients] = await db.query(ingredientSql, [recipeIds]);

  const recipesMap = new Map(recipes.map((recipe: any) => [recipe.id, { ...recipe, ingredients: [], totalCost: 0 }]));

  ingredients.forEach((ingredient: any) => {
    const recipe = recipesMap.get(ingredient.recipe_id);
    if (recipe) {
      recipe.ingredients.push(ingredient);

      const ingredientCost = calculateIngredientCost(
        ingredient.price,
        ingredient.price_quantity,
        ingredient.price_unit,
        ingredient.quantity,
        ingredient.unit
      );

      recipe.totalCost += ingredientCost;
    }
  });

  return Array.from(recipesMap.values());
}
