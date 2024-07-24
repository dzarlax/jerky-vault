// utils/validateRequest.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { validationResult } from 'express-validator';

export const validateRequest = async (req: NextApiRequest, res: NextApiResponse, validations: any[]) => {
  await Promise.all(validations.map(validation => validation.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    throw new Error('Validation failed');
  }
};
