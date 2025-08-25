import { Router } from 'express';
import { authRequired } from '../middleware/auth';
import MatchmakingQueue from '../models/matchmaking';

const router = Router();

router.post('/matchmaking/enqueue', authRequired, async (req, res) => {
  const userId = (req as any).user.userId;
  await MatchmakingQueue.updateOne({ user_id: userId }, { $set: { user_id: userId, enqueued_at: new Date() } }, { upsert: true });
  res.json({ ok: true });
});

router.post('/matchmaking/dequeue', authRequired, async (req, res) => {
  const userId = (req as any).user.userId;
  await MatchmakingQueue.deleteOne({ user_id: userId });
  res.json({ ok: true });
});

export default router;
