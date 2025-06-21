import { loginUser } from './authService';
import { Request, Response } from 'express';

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);

    if ('error' in result) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};