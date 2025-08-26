import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const WALLET_URL = process.env.WALLET_URL || process.env.walletUrl || '';
const SHARED_SECRET_BINGO = process.env.SHARED_SECRET_BINGO || process.env.PASS_KEY || '';
const NEXT_GAMES_JWT_SECRET = process.env.NEXT_GAMES_JWT_SECRET || process.env.JWT_SECRET || 'change_me_in_prod';

export async function verifyWalletToken(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded: any = jwt.verify(token, NEXT_GAMES_JWT_SECRET);

    if (!WALLET_URL) {
      // Fallback: if no wallet URL configured, just expose decoded as user
      (req as any).user = decoded;
      (req as any).token = token;
      return next();
    }

    const resp = await fetch(`${WALLET_URL}/api/wallet/get/${encodeURIComponent(decoded.chatId || decoded.userId || '')}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Pass-Key': SHARED_SECRET_BINGO,
      },
    });

    if (!resp.ok) {
      return res.status(resp.status).json({ message: 'Failed to fetch user info from wallet service' });
    }

    const userData = await resp.json();
    (req as any).user = userData;
    (req as any).token = token;
    return next();
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('wallet verify error:', err?.message || err);
    return res.status(400).json({ message: err?.message || 'wallet verification failed' });
  }
}


