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
  const q: any = req.query; // original behavior
  const createdAt = moment().toDate();

  const compacted = compactNumbers({ ...q });
  if (!compacted) return res.json('input not valid');

  const ticket: any = { ...compacted, created_at: createdAt };

  const result = await Ticket.create(ticket);
  try {
    const io: SocketIOServer | undefined = (req.app as any).get('io');
    io?.to(`lobby:${ticket.round_id || ''}`).emit('ticket:created', { id: (result as any)._id, ...ticket });
  } catch {}
  res.json(result);
});

export default router;