import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { check, validationResult } from 'express-validator';
import db from '../../../server/db';
import { calculateIngredientCost } from '../../../utils/calculateIngredientCost';
import { RowDataPacket, OkPacket } from 'mysql2'; // Импорт типов для работы с базой данных

const validateRequest = async (req: NextApiRequest, res: NextApiResponse, validations: any[]): Promise<boolean> => {
  await Promise.all(validations.map(validation => validation.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
};

const checkAuth = async (req: NextApiRequest, res: NextApiResponse): Promise<string | false> => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return session.user.id;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await checkAuth(req, res);
  if (!userId) return;

  switch (req.method) {
    case 'POST':
      await createRecipe(req, res, userId);
      break;
    case 'GET':
      await getRecipes(req, res, userId);
      break;
    case 'DELETE':
      await deleteRecipe(req, res, userId);
      break;
    default:
      res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function createRecipe(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const isValid = await validateRequest(req, res, [
    check('name').isString().withMessage('Name must be a string')
  ]);

  if (!isValid) return;

  const { name } = req.body;

  try {
    const [results] = await db.query<OkPacket>(
      "INSERT INTO recipes (name, user_id) VALUES (?, ?)",
      [name, userId]
    );
    res.status(201).json({ id: results.insertId });
  } catch (err: any) {
    console.error('Failed to create recipe:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getRecipes(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { name, ingredient } = req.query;

  let sql = "SELECT * FROM recipes WHERE user_id = ?";
  let params: (string | number)[] = [userId];

  if (name) {
    sql += " AND name = ?";
    params.push(name as string);
  }

  try {
    const [rows] = await db.query<RowDataPacket[]>(sql, params);

    if (rows.length === 0) {
      return res.json([]);
    }

    const recipeIds = rows.map(row => row.id);
    let filteredRecipeIds = recipeIds;

    if (ingredient) {
      const ingredientSql = `
        SELECT DISTINCT ri.recipe_id
        FROM recipe_ingredients ri
        JOIN ingredients i ON ri.ingredient_id = i.id
        WHERE i.name = ? AND ri.recipe_id IN (?)
      `;
      const [ingredientRows] = await db.query<RowDataPacket[]>(ingredientSql, [ingredient, recipeIds]);

      filteredRecipeIds = ingredientRows.map(row => row.recipe_id);

      if (filteredRecipeIds.length === 0) {
        return res.json([]);
      }
    }

    const detailedRecipes = await getRecipeDetails(filteredRecipeIds, userId);
    res.json(detailedRecipes);
  } catch (err: any) {
    console.error('Failed to fetch recipes:', err);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
}

async function getRecipeDetails(recipeIds: number[], userId: string) {
  const ingredientSql = `
    SELECT ri.recipe_id, ri.quantity, ri.unit, i.type, i.name, p.price, p.quantity AS price_quantity, p.unit AS price_unit, i.id
    FROM recipe_ingredients ri
    JOIN ingredients i ON ri.ingredient_id = i.id
    LEFT JOIN (
      SELECT ingredient_id, price, quantity, unit FROM prices 
      WHERE (ingredient_id, date, user_id) IN (
        SELECT ingredient_id, MAX(date), user_id 
        FROM prices WHERE user_id = ? GROUP BY ingredient_id
      )
    ) p ON ri.ingredient_id = p.ingredient_id
    WHERE ri.recipe_id IN (?)
  `;

  const [ingredients] = await db.query<RowDataPacket[]>(ingredientSql, [userId, recipeIds]);

  const recipesMap = new Map<number, { ingredients: any[]; totalCost: number }>();

  ingredients.forEach(ingredient => {
    if (!recipesMap.has(ingredient.recipe_id)) {
      recipesMap.set(ingredient.recipe_id, { ingredients: [], totalCost: 0 });
    }

    const recipe = recipesMap.get(ingredient.recipe_id);
    if (recipe) {
      const ingredientCost = calculateIngredientCost(
        ingredient.price,
        ingredient.price_quantity,
        ingredient.price_unit,
        ingredient.quantity,
        ingredient.unit
      );
      
      recipe.ingredients.push({
        ...ingredient,
        ingredientCost, // Добавляем стоимость ингредиента
      });

      recipe.totalCost += ingredientCost;
    }
  });

  return Array.from(recipesMap.entries()).map(([id, details]) => ({
    id,
    ...details
  }));
}


async function deleteRecipe(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const isValid = await validateRequest(req, res, [
    check('id').isInt().withMessage('ID must be an integer')
  ]);

  if (!isValid) return;

  const { id } = req.query;

  try {
    const [results] = await db.query<RowDataPacket[]>(
      "SELECT * FROM recipes WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    await db.beginTransaction();

    await db.query<OkPacket>("DELETE FROM recipe_ingredients WHERE recipe_id = ?", [id]);
    await db.query<OkPacket>("DELETE FROM recipes WHERE id = ? AND user_id = ?", [id, userId]);

    await db.commit();
    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (err: any) {
    await db.rollback();
    console.error('Failed to delete recipe:', err);
    res.status(500).json({ error: 'Failed to delete recipe', details: err.message });
  }
}
