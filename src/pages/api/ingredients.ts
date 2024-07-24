import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../server/db';
import { check, validationResult } from 'express-validator';

// Вспомогательная функция для проверки ошибок в запросе
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
      await createIngredient(req, res);
      break;
    case 'GET':
      await getIngredients(req, res);
      break;
    default:
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function createIngredient(req: NextApiRequest, res: NextApiResponse) {
  await validateRequest(req, res, [
    check('type').isString().withMessage('Type must be a string'),
    check('name').isString().withMessage('Name must be a string')
  ]);

  const { type, name } = req.body;

  try {
    const [results] = await db.query("INSERT INTO ingredients (type, name) VALUES (?, ?)", [type, name]);
    res.status(201).json({ id: results.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getIngredients(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [rows] = await db.query("SELECT * FROM ingredients");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


// Для обновления и удаления ингредиентов, если потребуется

// async function updateIngredient(req: NextApiRequest, res: NextApiResponse) {
//   await validateRequest(req, res, [
//     check('id').isInt().withMessage('ID must be an integer'),
//     check('type').isString().withMessage('Type must be a string'),
//     check('name').isString().withMessage('Name must be a string')
//   ]);

//   const { id } = req.params;
//   const { type, name } = req.body;

//   try {
//     await db.query("UPDATE ingredients SET type = ?, name = ? WHERE id = ?", [type, name, id]);
//     res.status(200).json({ message: 'Ingredient updated successfully' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }

// async function deleteIngredient(req: NextApiRequest, res: NextApiResponse) {
//   await validateRequest(req, res, [
//     check('id').isInt().withMessage('ID must be an integer')
//   ]);

//   const { id } = req.params;

//   try {
//     await db.query("DELETE FROM ingredients WHERE id = ?", [id]);
//     res.status(200).json({ message: 'Ingredient deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }
