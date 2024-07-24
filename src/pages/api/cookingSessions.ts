import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../server/db';
import { calculateIngredientCost } from '../../utils/calculateIngredientCost';

const checkAuth = (req: NextApiRequest, res: NextApiResponse, next: Function) => {
  if (req.cookies.userId) {
    next();
  } else {
    res.redirect('/login');
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      await createCookingSession(req, res);
      break;
    case 'GET':
      await getCookingSessions(req, res);
      break;
    default:
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function createCookingSession(req: NextApiRequest, res: NextApiResponse) {
  const { recipe_id, yield: yieldAmount, ingredients } = req.body;
  const userId = req.cookies.userId;

  const formattedDate = new Date();

  try {
    const [results] = await db.query("INSERT INTO cooking_sessions (recipe_id, date, yield, user_id) VALUES (?, ?, ?, ?)", [recipe_id, formattedDate, yieldAmount, userId]);
    const sessionId = results.insertId;

    const insertIngredientsPromises = ingredients.map(async (ingredient: any) => {
      const [results] = await db.query("SELECT price, quantity, unit FROM prices WHERE ingredient_id = ? AND user_id = ? ORDER BY date DESC LIMIT 1", [ingredient.ingredient_id, userId]);
      if (results.length === 0) throw new Error(`No price found for ingredient_id ${ingredient.ingredient_id}`);
      
      const row = results[0];
      const ingredientCost = calculateIngredientCost(row.price, row.quantity, row.unit, ingredient.quantity, ingredient.unit);

      await db.query("INSERT INTO cooking_session_ingredients (cooking_session_id, ingredient_id, quantity, price, unit) VALUES (?, ?, ?, ?, ?)", [sessionId, ingredient.ingredient_id, ingredient.quantity, ingredientCost, ingredient.unit]);
    });

    await Promise.all(insertIngredientsPromises);
    res.status(201).json({ id: sessionId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getCookingSessions(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.cookies.userId;
  const { recipe_id, date } = req.query;

  let query = `
    SELECT cs.id, cs.recipe_id, cs.yield, cs.date, r.name AS recipe_name
    FROM cooking_sessions cs
    JOIN recipes r ON cs.recipe_id = r.id
    WHERE cs.user_id = ?
  `;

  const queryParams = [userId];

  if (recipe_id) {
    query += ' AND cs.recipe_id = ?';
    queryParams.push(recipe_id);
  }

  if (date) {
    query += ' AND DATE(cs.date) = DATE(?)';
    queryParams.push(date);
  }

  query += ' ORDER BY cs.date DESC';

  try {
    const [sessions] = await db.query(query, queryParams);

    const sessionDetailsPromises = sessions.map(async (session: any) => {
      const [ingredients] = await db.query(`
        SELECT 
          csi.quantity, 
          csi.price, 
          i.name,
          csi.unit,
          i.type
        FROM cooking_session_ingredients csi
        JOIN ingredients i ON csi.ingredient_id = i.id
        WHERE csi.cooking_session_id = ?
      `, [session.id]);

      let totalCost = 0;
      ingredients.forEach((ingredient: any) => {
        totalCost += parseFloat(ingredient.price); // Общая стоимость ингредиентов
      });

      return { ...session, ingredients, totalCost };
    });

    const detailedSessions = await Promise.all(sessionDetailsPromises);
    res.json(detailedSessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cooking sessions' });
  }
}
