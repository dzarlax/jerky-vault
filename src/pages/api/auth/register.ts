import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import db from '../../../server/db';
import { check, validationResult } from 'express-validator';

const validateRequest = async (req: NextApiRequest, res: NextApiResponse, validations: any[]) => {
  await Promise.all(validations.map(validation => validation.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    throw new Error('Validation failed');
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      await registerUser(req, res);
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function registerUser(req: NextApiRequest, res: NextApiResponse) {
  await validateRequest(req, res, [
    check('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    check('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters long')
  ]);

  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [existingUser] = await db.query('SELECT username FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
