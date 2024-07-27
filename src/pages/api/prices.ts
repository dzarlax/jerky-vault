import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import db from '../../server/db';
import { check, validationResult } from 'express-validator';
import { validateRequest } from '../../utils/validateRequest';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'POST':
      await addPrice(req, res, session.user.id);
      break;
    case 'GET':
      await getPrices(req, res, session.user.id);
      break;
    default:
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function addPrice(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const isValid = await validateRequest(req, res, [
    check('ingredient_id').isInt().withMessage('Ingredient ID must be an integer'),
    check('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    check('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be a positive number'),
    check('unit').isString().withMessage('Unit must be a string')
  ]);

  if (!isValid) return;

  const { ingredient_id, price, quantity, unit } = req.body;
  const formattedDate = new Date();

  try {
    await db.query(
      "INSERT INTO prices (ingredient_id, price, quantity, unit, date, user_id) VALUES (?, ?, ?, ?, ?, ?)",
      [ingredient_id, price, quantity, unit, formattedDate, userId]
    );
    res.status(201).json({ message: 'Price added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getPrices(req: NextApiRequest, res: NextApiResponse, userId: string) {
  console.log('Request query:', req.query);
  const { ingredient_id, date, sort_column, sort_direction } = req.query;

  // Список допустимых колонок для сортировки
  const validSortColumns = ['price', 'quantity', 'date', 'ingredient_name', 'ingredient_type', 'unit'];
  const validSortDirections = ['ASC', 'DESC'];

  // Проверка колонок для сортировки
  if (sort_column && !validSortColumns.includes(sort_column as string)) {
    return res.status(400).json({ error: 'Invalid sort column' });
  }

  // Проверка направления сортировки
  if (sort_direction && !validSortDirections.includes((sort_direction as string).toUpperCase())) {
    return res.status(400).json({ error: 'Invalid sort direction' });
  }

  let query = `
    SELECT p.id, p.ingredient_id, p.price, p.quantity, p.unit, p.date, i.name AS ingredient_name, i.type AS ingredient_type
    FROM prices p
    JOIN ingredients i ON p.ingredient_id = i.id
    WHERE p.user_id = ?
  `;

  const queryParams: (string | number)[] = [userId];

  if (ingredient_id) {
    query += ' AND p.ingredient_id = ?';
    queryParams.push(Number(ingredient_id));
  }

  if (date) {
    query += ' AND DATE(p.date) = DATE(?)';
    queryParams.push(date as string);
  }

  if (sort_column && sort_direction) {
    // Динамически добавляем сортировку по колонке
    query += ` ORDER BY ${sort_column} ${sort_direction.toUpperCase()}`;
  } else {
    query += ' ORDER BY p.date DESC';
  }

  try {
    const [rows] = await db.query(query, queryParams);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
}
