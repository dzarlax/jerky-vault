import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import db from '../../../server/db';
import { check, validationResult } from 'express-validator'; // Добавьте сюда `validationResult`
import { OkPacket } from 'mysql2';

const validateRequest = async (req: NextApiRequest, res: NextApiResponse, validations: any[]): Promise<boolean> => {
  await Promise.all(validations.map(validation => validation.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
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

  const { id } = req.query;

  switch (req.method) {
    case 'PUT':
      await updateProduct(req, res, session.user.id, id as string);
      break;
    default:
      res.setHeader('Allow', ['PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function updateProduct(req: NextApiRequest, res: NextApiResponse, userId: string, productId: string) {
  console.log('Request body:', req.body);
  const isValid = await validateRequest(req, res, [
    check('name').isString().withMessage('Name must be a string'),
    check('description').isString().withMessage('Description must be a string'),
    check('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    check('cost').isFloat({ gt: 0 }).withMessage('Cost must be a positive number'),
    check('recipeIds').isArray({ min: 1 }).withMessage('Recipe IDs must be an array with at least one recipe'),
    check('packageId').optional({ checkFalsy: true }).isInt({ gt: 0 }).withMessage('Package ID must be a positive integer'),
  ]);

  if (!isValid) return;

  const { name, description, price, cost, image, recipeIds, packageId } = req.body;
  try {
    const [result] = await db.query<OkPacket>(
      'UPDATE products SET name = ?, description = ?, price = ?, cost = ?, image = ? WHERE id = ? AND user_id = ?',
      [name, description, price, cost, image || null, productId, userId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    await db.query<OkPacket>('DELETE FROM product_options WHERE product_id = ?', [productId]);

    const insertQuery = packageId
      ? 'INSERT INTO product_options (product_id, recipe_id, package_id, user_id) VALUES (?, ?, ?, ?)'
      : 'INSERT INTO product_options (product_id, recipe_id, user_id) VALUES (?, ?, ?)';

    const insertPromises = recipeIds.map((recipeId: number) =>
      packageId
        ? db.query<OkPacket>(insertQuery, [productId, recipeId, packageId, userId])
        : db.query<OkPacket>(insertQuery, [productId, recipeId, userId])
    );

    await Promise.all(insertPromises);

    res.status(200).json({ id: productId });
  } catch (err: any) {
    console.error('Failed to update product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
}
