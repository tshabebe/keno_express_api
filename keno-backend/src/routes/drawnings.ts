import { Router } from 'express';
import _ from 'lodash';
import moment from 'moment';
import { ObjectId } from 'mongodb';
import { getDb } from '../lib/db';
import { load as loadDrawning } from '../lib/drawning_gateway';

const router = Router();

router.post('/drawnings', async (req, res) => {
  const db = await getDb();
  const roundIdRaw = String((req.query as any).round_id || '');

  let roundId: any = roundIdRaw;
  try {
    roundId = new ObjectId(roundIdRaw);
  } catch {
    roundId = roundIdRaw;
  }

  const round = await db.collection('rounds').findOne({ _id: roundId });
  if (!round) return res.json({ error: 'round not found' });

  let drawn = await db.collection('drawnings').findOne({ round_id: roundIdRaw });
  if (!drawn) {
    const doc: any = { round_id: roundIdRaw, created_at: moment().toDate() };
    doc.drawn_number = loadDrawning();
    await db.collection('drawnings').insertOne(doc);
    drawn = doc;
  }

  const tickets = await db.collection('tickets').find({ round_id: roundIdRaw }).toArray();
  const winnings = tickets.filter((ticket: any) => {
    const match = _.intersection(drawn!.drawn_number, ticket.played_number);
    return match.length >= 5;
  });

  const final = {
    current_timestamp: moment().toDate(),
    drawn,
    winnings,
  };

  res.json(final);
});

export default router;
