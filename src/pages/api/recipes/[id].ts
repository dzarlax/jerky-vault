import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { check, validationResult } from 'express-validator';
import db from '../../../server/db';
import { calculateIngredientCost } from '../../../utils/calculateIngredientCost';

const validateRequest = async (req: NextApiRequest, res: NextApiResponse, validations: any[]) => {
  await Promise.all(validations.map(validation => validation.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      await getRecipe(req, res, session.user.id);
      break;
    case 'DELETE':
      await deleteRecipe(req, res, session.user.id);
      break;
    default:
      res.setHeader('Allow', ['GET', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getRecipe(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const isValid = await validateRequest(req, res, [
    check('id').isInt().withMessage('ID must be an integer')
  ]);
  if (!isValid) return;

  const { id } = req.query;

  try {
    const [results] = await db.query("SELECT * FROM recipes WHERE id = ? AND user_id = ?", [id, userId]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const recipe = results[0];
    const [ingredients] = await db.query(`
      SELECT ri.quantity, ri.unit, i.type, i.name, p.price, p.quantity AS price_quantity, p.unit AS price_unit
      FROM recipe_ingredients ri
      JOIN ingredients i ON ri.ingredient_id = i.id
      LEFT JOIN (
        SELECT ingredient_id, price, quantity, unit FROM prices
        WHERE (ingredient_id, date) IN (
          SELECT ingredient_id, MAX(date)
          FROM prices
          GROUP BY ingredient_id
        )
      ) p ON ri.ingredient_id = p.ingredient_id
      WHERE ri.recipe_id = ?
    `, [id]);

    let totalCost = 0;
    ingredients.forEach((ingredient: any) => {
      const ingredientCost = calculateIngredientCost(
        ingredient.price,
        ingredient.price_quantity,
        ingredient.price_unit,
        ingredient.quantity,
        ingredient.unit
      );
      totalCost += ingredientCost;
    });

    res.json({ ...recipe, ingredients, totalCost });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
}

async function deleteRecipe(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const isValid = await validateRequest(req, res, [
    check('id').isInt().withMessage('ID must be an integer')
  ]);
  if (!isValid) return;

  const { id } = req.query;

  try {
    const [results] = await db.query("SELECT * FROM recipes WHERE id = ? AND user_id = ?", [id, userId]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    await db.beginTransaction();

    await db.query("DELETE FROM recipe_ingredients WHERE recipe_id = ?", [id]);
    await db.query("DELETE FROM recipes WHERE id = ?", [id]);

    await db.commit();
    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    await db.rollback();
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
}
