import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import db from '../../../server/db';
import { check, validationResult } from 'express-validator';
import { OkPacket, RowDataPacket } from 'mysql2'; // Импорт типов для работы с базой данных

const validateRequest = async (req: NextApiRequest, res: NextApiResponse, validations: any[]): Promise<boolean> => {
  await Promise.all(validations.map(validation => validation.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      await getPackages(req, res, session.user.id);
      break;
    case 'POST':
      await addPackage(req, res, session.user.id);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getPackages(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM packages WHERE user_id = ?', [userId]);
    res.status(200).json(rows);
  } catch (err: any) {
    console.error('Failed to fetch packages:', err);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
}

async function addPackage(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const isValid = await validateRequest(req, res, [
    check('name').isString().withMessage('Name must be a string'),
  ]);

  if (!isValid) return;

  const { name } = req.body;
  try {
    const [results] = await db.query<OkPacket>('INSERT INTO packages (name, user_id) VALUES (?, ?)', [name, userId]);
    res.status(201).json({ id: results.insertId });
  } catch (err: any) {
    console.error('Failed to add package:', err);
    res.status(500).json({ error: 'Failed to add package' });
  }
}
