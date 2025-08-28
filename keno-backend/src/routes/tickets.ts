import { Router } from 'express';
import { } from 'date-fns';
import { ticketBodySchema, ticketQuerySchema } from '../schemas/ticket';
import type { Server as SocketIOServer } from 'socket.io';
import Ticket from '../models/ticket';
import { authRequired } from '../middleware/auth';
import Session from '../models/session';
import User from '../models/user';

const router = Router();

router.get('/tickets', async (_req, res) => {
  const results = await Ticket.find();
  res.json(results);
});

router.post('/tickets', authRequired, async (req, res) => {
  const createdAt = new Date();

  const parseQuery = ticketQuerySchema.safeParse(req.query);
  if (!parseQuery.success) return res.status(400).json({ error: 'input not valid', details: parseQuery.error.flatten() });
  const { round_id: roundIdRaw, played_number } = parseQuery.data;
  const parseBody = ticketBodySchema.safeParse(req.body);
  if (!parseBody.success) return res.status(400).json({ error: 'invalid bet amount', details: parseBody.error.flatten() });
  const betAmount = parseBody.data.bet_amount;
  // enforce current session select phase and round
  const session = await Session.findOne().lean<{ status?: string; current_round_id?: string; phase_ends_at?: Date }>();
  if (!session || session.status !== 'select' || !session.current_round_id) return res.status(400).json({ error: 'not in select phase' });
  if (!roundIdRaw || roundIdRaw !== session.current_round_id) return res.status(400).json({ error: 'invalid round' });
  const authUser: any = (req as any).user || {};
  const userId: string | undefined = authUser.userId;
  if (!userId) return res.status(401).json({ error: 'unauthorized' });

  // Debit from local wallet balance atomically
  const updatedUser = await User.findOneAndUpdate(
    { _id: userId, wallet_balance: { $gte: betAmount } },
    { $inc: { wallet_balance: -betAmount } },
    { new: true }
  );
  if (!updatedUser) return res.status(400).json({ error: 'insufficient balance' });

  const username = updatedUser.display_name || updatedUser.email || 'player';

  const ticket = { round_id: roundIdRaw, played_number, bet_amount: betAmount, user_id: String(userId), username, created_at: createdAt } as const;

  const result = await Ticket.create(ticket);
  try {
    const io = req.app.locals.io as SocketIOServer | undefined;
    io?.to(`lobby:${ticket.round_id || ''}`).emit('ticket:created', { id: String(result._id), ...ticket });
  } catch {}
  res.json(result);
});

export default router;