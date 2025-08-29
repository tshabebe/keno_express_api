import { Router } from 'express';
import { addDays } from 'date-fns';
import { parseDate } from '../lib/helper';
import { z } from 'zod';
import Round from '../models/round';
import Session from '../models/session';

const router = Router();

router.get('/rounds', async (_req, res) => {
  const results = await Round.find();
  res.json(results);
});

router.post('/rounds', async (req, res) => {
  const StartsSchema = z.object({ starts_at: z.string().min(1) });
  const parsed = StartsSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid date' });
  const startsAt = parseDate(parsed.data.starts_at);
  if (!startsAt) return res.json({ error: 'Invalid date' });
  const endsAt = addDays(startsAt, 15);

  const created = await Round.create({
    starts_at: startsAt,
    ends_at: endsAt,
    created_at: new Date()
  });
  res.json(created);
});

router.get('/rounds/current', async (_req, res) => {
  const now = new Date();
  const round = await Round.findOne({ starts_at: { $lte: now }, ends_at: { $gte: now } })
    .sort({ starts_at: -1 })
    .lean();
  if (!round) return res.status(404).json({ error: 'no active round' });
  res.json(round);
});

router.get('/session', async (_req, res) => {
  const s = await Session.findOne().lean<{ status?: string; current_round_id?: string; phase_ends_at?: Date }>();
  if (!s) return res.status(404).json({ error: 'no session' });
  res.json({ status: s.status, current_round_id: s.current_round_id, phase_ends_at: s.phase_ends_at });
});

router.delete('/rounds/:id', async (_req, res) => {
  res.json('TODO DELETE');
});

export default router;
