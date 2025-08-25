import { Router } from 'express';
import moment from 'moment';
import { compactNumbers } from '../lib/helper';
import type { Server as SocketIOServer } from 'socket.io';
import Ticket from '../models/ticket';

const router = Router();

router.get('/tickets', async (_req, res) => {
  const results = await Ticket.find();
  res.json(results);
});

router.post('/tickets', async (req, res) => {
  const createdAt = moment().toDate();

  const rawQuery = req.query as Record<string, unknown>;
  const compacted = compactNumbers({ ...rawQuery });
  if (!compacted) return res.json('input not valid');

  const roundIdRaw = String(rawQuery.round_id || '');
  const ticket = { round_id: roundIdRaw, played_number: compacted.played_number, created_at: createdAt };

  const result = await Ticket.create(ticket);
  try {
    const io = req.app.locals.io as SocketIOServer | undefined;
    io?.to(`lobby:${ticket.round_id || ''}`).emit('ticket:created', { id: String(result._id), ...ticket });
  } catch {}
  res.json(result);
});

export default router;