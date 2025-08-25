import { Router } from 'express';
import moment from 'moment';
import { parseDate } from '../lib/helper';
import Round from '../models/round';

const router = Router();

router.get('/rounds', async (_req, res) => {
  const results = await Round.find();
  res.json(results);
});

router.post('/rounds', async (req, res) => {
  const startsAtRaw = String((req.query as Record<string, unknown>).starts_at || '');
  if (!startsAtRaw) {
    return res.json({ error: 'Invalid date' });
  }
  const startsAt = parseDate(startsAtRaw);
  if (!startsAt) return res.json({ error: 'Invalid date' });
  const endsAt = startsAt.clone().add(15, 'days');

  const created = await Round.create({
    starts_at: startsAt.toDate(),
    ends_at: endsAt.toDate(),
    created_at: moment().toDate()
  });
  res.json(created);
});

router.delete('/rounds/:id', async (_req, res) => {
  res.json('TODO DELETE');
});

export default router;
