import { NextApiRequest, NextApiResponse } from 'next';
import { validationResult } from 'express-validator';

export async function validateRequest(req: NextApiRequest, res: NextApiResponse, validations: any[]): Promise<boolean> {
  await Promise.all(validations.map(validation => validation.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
}
