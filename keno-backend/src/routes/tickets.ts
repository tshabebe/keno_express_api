import { Router } from 'express';
import moment from 'moment';
import { compactNumbers } from '../lib/helper';
import type { Server as SocketIOServer } from 'socket.io';
import Ticket from '../models/ticket';
import { verifyWalletToken } from '../middleware/wallet';
import Session from '../models/session';

const router = Router();

router.get('/tickets', async (_req, res) => {
  const results = await Ticket.find();
  res.json(results);
});

router.post('/tickets', verifyWalletToken, async (req, res) => {
  const createdAt = moment().toDate();

  const rawQuery = req.query as Record<string, unknown>;
  const compacted = compactNumbers({ ...rawQuery });
  if (!compacted) return res.json('input not valid');

  const roundIdRaw = String(rawQuery.round_id || '');
  // enforce current session select phase and round
  const session = await Session.findOne().lean<{ status?: string; current_round_id?: string; phase_ends_at?: Date }>();
  if (!session || session.status !== 'select' || !session.current_round_id) return res.status(400).json({ error: 'not in select phase' });
  if (!roundIdRaw || roundIdRaw !== session.current_round_id) return res.status(400).json({ error: 'invalid round' });
  const betAmount = Number((req.body as any)?.bet_amount ?? (rawQuery as any)?.bet_amount ?? 0);
  const walletUser: any = (req as any).user || {};
  const userId = walletUser.chatId || walletUser.user_id || walletUser.id || walletUser.userId;
  const username = walletUser.username || walletUser.email || walletUser.displayName || 'player';
  const token = (req as any).token as string;
  if (!userId || !token) return res.status(401).json({ error: 'unauthorized' });
  if (!(betAmount > 0)) return res.status(400).json({ error: 'invalid bet amount' });

  // wallet debit
  const WALLET_URL = process.env.WALLET_URL || process.env.walletUrl || '';
  const SHARED_SECRET_BINGO = process.env.SHARED_SECRET_BINGO || process.env.PASS_KEY || '';
  try {
    const debitBody = {
      user_id: userId,
      username,
      transaction_type: 'debit',
      transaction_id: `BET-${Date.now()}`,
      amount: betAmount,
      game: 'Keno',
      round_id: roundIdRaw,
      status: 'pending',
    };
    const resp = await fetch(`${WALLET_URL}/api/wallet/debit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'Pass-Key': SHARED_SECRET_BINGO,
      },
      body: JSON.stringify(debitBody),
    });
    if (!resp.ok) {
      const err = await resp.text();
      return res.status(400).json({ error: 'wallet debit failed', details: err });
    }
  } catch (e: any) {
    return res.status(400).json({ error: 'wallet debit error', details: e?.message || String(e) });
  }

  const ticket = { round_id: roundIdRaw, played_number: compacted.played_number, bet_amount: betAmount, user_id: String(userId), username, user_token: token, created_at: createdAt };

  const result = await Ticket.create(ticket);
  try {
    const io = req.app.locals.io as SocketIOServer | undefined;
    io?.to(`lobby:${ticket.round_id || ''}`).emit('ticket:created', { id: String(result._id), ...ticket });
  } catch {}
  res.json(result);
});

export default router;