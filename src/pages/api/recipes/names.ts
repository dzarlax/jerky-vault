import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import db from '../../../server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Проверяем авторизацию пользователя
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Проверяем метод запроса
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Получаем идентификатор пользователя из сессии
    const userId = session.user.id;

    // Выполняем запрос к базе данных для получения уникальных имен рецептов,
    // фильтруя их по идентификатору пользователя, если необходимо
    const [rows] = await db.query("SELECT DISTINCT name FROM recipes WHERE user_id = ?", [userId]);
    
    res.json(rows.map((row: any) => row.name));
  } catch (err) {
    // Обработка ошибок
    res.status(500).json({ error: 'Failed to fetch recipe names' });
  }
}
