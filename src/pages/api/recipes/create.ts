import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
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
  const session = await getServerSession(req, res, authOptions);
  console.log('Session at API level:', session);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'POST':
      console.log('User at API level:', session.user);
      await createRecipe(req, res, session.user.id);
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function createRecipe(req: NextApiRequest, res: NextApiResponse, userId: string) {
  console.log('User ID at createRecipe:', userId);
  const isValid = await validateRequest(req, res, [
    check('name').isString().withMessage('Name must be a string')
  ]);
  if (!isValid) return;

  const { name } = req.body;

  try {
    const [results] = await db.query("INSERT INTO recipes (name, user_id) VALUES (?, ?)", [name, userId]);
    console.log('Insert results:', results);
    res.status(201).json({ id: results.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
