import { Router } from 'express';
import { getDb } from '../lib/db';
import { authRequired } from '../middleware/auth';

const router = Router();

router.post('/matchmaking/enqueue', authRequired, async (req, res) => {
  const db = await getDb();
  const userId = (req as any).user.userId;
  await db.collection('matchmaking_queue').updateOne({ user_id: userId }, { $set: { user_id: userId, enqueued_at: new Date() } }, { upsert: true });
  res.json({ ok: true });
});

router.post('/matchmaking/dequeue', authRequired, async (req, res) => {
  const db = await getDb();
  const userId = (req as any).user.userId;
  await db.collection('matchmaking_queue').deleteOne({ user_id: userId });
  res.json({ ok: true });
});

export default router;
