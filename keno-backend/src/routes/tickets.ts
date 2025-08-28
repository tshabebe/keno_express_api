import { Router } from 'express';
import { } from 'date-fns';
import { ticketBodySchema, ticketQuerySchema } from '../schemas/ticket';
import type { Server as SocketIOServer } from 'socket.io';
import Ticket from '../models/ticket';
import { authRequired } from '../middleware/auth';
import User from '../models/user';
import Session from '../models/session';

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
  const userId = String(authUser.userId || '');
  const email = String(authUser.email || '');
  if (!userId) return res.status(401).json({ error: 'unauthorized' });

  // Local balance debit
  const userDoc = await User.findById(userId);
  if (!userDoc) return res.status(404).json({ error: 'user not found' });
  const currentBalance = Number(userDoc.wallet_balance || 0);
  if (currentBalance < betAmount) return res.status(400).json({ error: 'insufficient balance' });
  userDoc.wallet_balance = currentBalance - betAmount;
  await userDoc.save();

  const ticket = { round_id: roundIdRaw, played_number, bet_amount: betAmount, user_id: String(userId), username: userDoc.display_name || email || 'player', created_at: createdAt };

  const result = await Ticket.create(ticket);
  try {
    const io = req.app.locals.io as SocketIOServer | undefined;
    io?.to(`lobby:${ticket.round_id || ''}`).emit('ticket:created', { id: String(result._id), ...ticket });
  } catch {}
  res.json(result);
});

export default router;