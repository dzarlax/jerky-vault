import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../server/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { RowDataPacket, OkPacket } from 'mysql2'; // Импортируем типы для работы с базой данных

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      await getClient(req, res, session.user.id);
      break;
    case 'PUT':
      await updateClient(req, res, session.user.id);
      break;
    case 'DELETE':
      await deleteClient(req, res, session.user.id);
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function getClient(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { id } = req.query;
  try {
    const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM clients WHERE id = ? AND user_id = ?", [id, userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch client' });
  }
}

async function updateClient(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { id } = req.query;
  const { name, surname, telegram, instagram, phone, address, source } = req.body;
  try {
    const [results] = await db.query<OkPacket>(
      "UPDATE clients SET name = ?, surname = ?, telegram = ?, instagram = ?, phone = ?, address = ?, source = ? WHERE id = ? AND user_id = ?",
      [name, surname, telegram, instagram, phone, address, source, id, userId]
    );
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.status(200).json({ message: 'Client updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update client' });
  }
}

async function deleteClient(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { id } = req.query;
  try {
    const [results] = await db.query<OkPacket>("DELETE FROM clients WHERE id = ? AND user_id = ?", [id, userId]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete client' });
  }
}
