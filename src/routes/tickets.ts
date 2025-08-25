import { Router } from 'express';
import moment from 'moment';
import { getDb } from '../lib/db';
import { compactNumbers } from '../lib/helper';

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

  const ticket = { ...compacted, created_at: createdAt };

  const db = await getDb();
  const result = await db.collection('tickets').insertOne(ticket);
  res.json(result);
});

export default router;
