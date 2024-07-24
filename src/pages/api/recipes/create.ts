import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { check, validationResult } from 'express-validator';
import db from '../../../server/db';

const validateRequest = async (req: NextApiRequest, res: NextApiResponse, validations: any[]) => {
  await Promise.all(validations.map(validation => validation.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'POST':
      await createRecipe(req, res, session.user.id);
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function createRecipe(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const isValid = await validateRequest(req, res, [
    check('name').isString().withMessage('Name must be a string')
  ]);
  if (!isValid) return;

  const { name } = req.body;

  try {
    const [results] = await db.query("INSERT INTO recipes (name, user_id) VALUES (?, ?)", [name, userId]);
    res.status(201).json({ id: results.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
