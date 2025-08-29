import { Router } from 'express';
import Session from '../models/session';

const router = Router();

router.get('/session', async (_req, res) => {
  try {
    const s = await Session.findOne().lean<{
      status?: 'idle' | 'select' | 'draw'
      current_round_id?: string
      phase_ends_at?: Date
      board_cleared_at?: Date
    }>();
    if (!s) return res.status(404).json({ error: 'no session' });
    return res.json({
      status: s.status,
      roundId: s.current_round_id,
      phaseEndsAt: s.phase_ends_at,
      boardClearedAt: s.board_cleared_at,
      now: new Date(),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('session fetch error', e);
    return res.status(500).json({ error: 'failed to fetch session' });
  }
});

export default router;



