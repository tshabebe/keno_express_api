import { Router } from 'express';
import moment from 'moment';
import { getDb } from '../lib/db';
import { compactNumbers } from '../lib/helper';
import type { Server as SocketIOServer } from 'socket.io';

const router = Router();

router.get('/tickets', async (_req, res) => {
  const db = await getDb();
  const results = await db.collection('tickets').find().toArray();
  res.json(results);
});

router.post('/tickets', async (req, res) => {
  const q: any = req.query; // original behavior
  const createdAt = moment().toDate();

  const compacted = compactNumbers({ ...q });
  if (!compacted) return res.json('input not valid');

  const ticket: any = { ...compacted, created_at: createdAt };

  const db = await getDb();
  const result = await db.collection('tickets').insertOne(ticket);
  try {
    const io: SocketIOServer | undefined = (req.app as any).get('io');
    io?.to(`lobby:${ticket.round_id || ''}`).emit('ticket:created', { id: result.insertedId, ...ticket });
  } catch {}
  res.json(result);
});

export default router;