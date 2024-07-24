import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../../../server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'DELETE':
      await deleteIngredientFromRecipe(req, res);
      break;
    default:
      res.setHeader('Allow', ['DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function deleteIngredientFromRecipe(req: NextApiRequest, res: NextApiResponse) {
  const { id, ingredientId } = req.query;

  try {
    await db.query("DELETE FROM recipe_ingredients WHERE recipe_id = ? AND ingredient_id = ?", [id, ingredientId]);
    res.status(200).json({ message: 'Ingredient deleted from recipe successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete ingredient from recipe' });
  }
}
