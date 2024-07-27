import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../server/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  console.log("Session:", session);
  if (!session) {
    console.log("Unauthorized access attempt");
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      await getClients(req, res, session.user.id);
      break;
    case 'POST':
      await addClient(req, res, session.user.id);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getClients(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const [rows] = await db.query("SELECT * FROM clients WHERE user_id = ?", [userId]);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Failed to fetch clients:', err);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
}

async function addClient(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { name, surname, telegram, instagram, phone, address, source } = req.body;
  try {
    const [results] = await db.query(
      "INSERT INTO clients (name, surname, telegram, instagram, phone, address, source, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, surname, telegram, instagram, phone, address, source, userId]
    );
    res.status(201).json({ id: results.insertId });
  } catch (err) {
    console.error('Failed to add client:', err);
    res.status(500).json({ error: 'Failed to add client' });
  }
}
