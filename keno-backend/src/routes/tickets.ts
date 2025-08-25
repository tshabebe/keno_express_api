import { Router } from 'express';
import moment from 'moment';
import { compactNumbers } from '../lib/helper';
import type { Server as SocketIOServer } from 'socket.io';
import Ticket from '../models/ticket';
import User from '../models/user';
import { authRequired } from '../middleware/auth';

const router = Router();

router.get('/tickets', async (_req, res) => {
  const results = await Ticket.find();
  res.json(results);
});

router.post('/tickets', authRequired, async (req, res) => {
  const createdAt = moment().toDate();

  const rawQuery = req.query as Record<string, unknown>;
  const compacted = compactNumbers({ ...rawQuery });
  if (!compacted) return res.json('input not valid');

  const roundIdRaw = String(rawQuery.round_id || '');
  const betAmount = Number((req.body as any)?.bet_amount ?? (rawQuery as any)?.bet_amount ?? 0);
  const userId = (req as any).user?.userId as string | undefined;
  if (!userId) return res.status(401).json({ error: 'unauthorized' });
  if (!(betAmount > 0)) return res.status(400).json({ error: 'invalid bet amount' });

  // deduct bet from user wallet
  const user = await User.findById(userId).lean<{ wallet_balance?: number }>();
  const currentBalance = Number(user?.wallet_balance || 0);
  if (currentBalance < betAmount) return res.status(400).json({ error: 'insufficient balance' });
  await User.updateOne({ _id: userId }, { $inc: { wallet_balance: -betAmount } });

  const ticket = { round_id: roundIdRaw, played_number: compacted.played_number, bet_amount: betAmount, user_id: userId, created_at: createdAt };

  const result = await Ticket.create(ticket);
  try {
    const io = req.app.locals.io as SocketIOServer | undefined;
    io?.to(`lobby:${ticket.round_id || ''}`).emit('ticket:created', { id: String(result._id), ...ticket });
  } catch {}
  res.json(result);
});

export default router;