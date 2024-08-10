import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../server/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { RowDataPacket } from 'mysql2';

// Определяем типы для session.user
interface CustomSession {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions) as CustomSession;

  if (!session || !session.user?.id) {
    console.error('Unauthorized access attempt', session);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Старая статистика
    const totalRecipesQuery = 'SELECT COUNT(*) AS totalRecipes FROM recipes WHERE user_id = ?';
    const topRecipesQuery = 'SELECT id, name FROM recipes WHERE user_id = ? LIMIT 5';
    const recipesOverTimeQuery = `
      SELECT COUNT(*) as count
      FROM recipes
      WHERE user_id = ?
    `;

    const [totalRecipesResult] = await db.query<RowDataPacket[]>(totalRecipesQuery, [session.user.id]);
    const [topRecipesResult] = await db.query<RowDataPacket[]>(topRecipesQuery, [session.user.id]);
    const [recipesOverTimeResult] = await db.query<RowDataPacket[]>(recipesOverTimeQuery, [session.user.id]);

    const totalIngredientsQuery = 'SELECT COUNT(*) AS totalIngredients FROM ingredients';
    const typeDistributionQuery = `
      SELECT type, COUNT(*) as count
      FROM ingredients
      GROUP BY type
    `;

    const [totalIngredientsResult] = await db.query<RowDataPacket[]>(totalIngredientsQuery);
    const [typeDistributionResult] = await db.query<RowDataPacket[]>(typeDistributionQuery);

    // Новая статистика
    const totalProductsQuery = 'SELECT COUNT(*) AS totalProducts FROM products';
    const totalOrdersQuery = 'SELECT COUNT(*) AS totalOrders FROM orders';
    const pendingOrdersQuery = `
      SELECT orders.id, orders.status, orders.date, clients.name AS client_name, clients.surname AS client_surname
      FROM orders
      JOIN clients ON orders.client_id = clients.id
      WHERE orders.status != 'Finished'
    `;

    const [totalProductsResult] = await db.query<RowDataPacket[]>(totalProductsQuery);
    const [totalOrdersResult] = await db.query<RowDataPacket[]>(totalOrdersQuery);
    const [pendingOrdersResult] = await db.query<RowDataPacket[]>(pendingOrdersQuery);

    res.status(200).json({
      // Старая статистика
      totalRecipes: totalRecipesResult[0].totalRecipes,
      topRecipes: topRecipesResult,
      recipesOverTime: recipesOverTimeResult.map((row) => ({
        date: row.date,
        count: row.count,
      })),
      totalIngredients: totalIngredientsResult[0].totalIngredients,
      typeDistribution: typeDistributionResult.map((row) => ({
        type: row.type,
        count: row.count,
      })),

      // Новая статистика
      totalProducts: totalProductsResult[0].totalProducts,
      totalOrders: totalOrdersResult[0].totalOrders,
      pendingOrders: pendingOrdersResult,
    });
  } catch (err: any) {
    console.error('Failed to fetch statistics:', err);
    res.status(500).json({ error: err.message });
  }
}
