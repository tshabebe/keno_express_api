import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_in_prod';

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      !('userId' in decoded) ||
      typeof (decoded as { userId?: unknown }).userId !== 'string'
    ) {
      return res.status(401).json({ error: 'invalid token' });
    }

    const userId = (decoded as { userId: string }).userId;
    const email = 'email' in decoded && typeof (decoded as { email?: unknown }).email === 'string'
      ? (decoded as { email?: string }).email
      : undefined;

    req.user = { userId, email };
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}
