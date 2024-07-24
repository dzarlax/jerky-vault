import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../server/db'; // Подключение к базе данных
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const connection = await db;
    const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    await connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    res.status(201).json({ message: 'User registered successfully' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
