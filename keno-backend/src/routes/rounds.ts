import { Router } from 'express';
import moment from 'moment';
import { getDb } from '../lib/db';
import { parseDate } from '../lib/helper';

const router = Router();

router.get('/rounds', async (_req, res) => {
  const db = await getDb();
  const results = await db.collection('rounds').find().toArray();
  res.json(results);
});

router.post('/rounds', async (req, res) => {
  const q: any = req.query; // preserve original behavior of reading from query
  const round: any = { ...q, created_at: moment().toDate() };
  if (!round.starts_at || !moment(round.starts_at).isValid()) {
    return res.json({ error: 'Invalid date' });
  }
  const startsAt = parseDate(String(round.starts_at));
  if (!startsAt) return res.json({ error: 'Invalid date' });
  const endsAt = startsAt.clone().add(15, 'days');
  round.starts_at = startsAt.toDate();
  round.ends_at = endsAt.toDate();

  const db = await getDb();
  const result = await db.collection('rounds').insertOne(round);
  res.json(result);
});

router.delete('/rounds/:id', async (_req, res) => {
  res.json('TODO DELETE');
});

export default router;
