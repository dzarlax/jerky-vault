// src/pages/api/recipes/recipe_ingredients.ts
import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      await addIngredientToRecipe(req, res);
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function addIngredientToRecipe(req: NextApiRequest, res: NextApiResponse) {
  const { recipe_id, ingredient_id, quantity, unit } = req.body;

  try {
    await db.query("INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)", [recipe_id, ingredient_id, quantity, unit]);
    res.status(201).json({ message: 'Ingredient added to recipe' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
