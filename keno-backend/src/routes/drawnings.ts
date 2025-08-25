import { Router } from 'express';
import _ from 'lodash';
import moment from 'moment';
import { Types } from 'mongoose';
import { load as loadDrawning } from '../lib/drawning_gateway';
import type { Server as SocketIOServer } from 'socket.io';
import Round from '../models/round';
import Drawning from '../models/drawning';
import Ticket from '../models/ticket';

const router = Router();

router.post('/drawnings', async (req, res) => {
  const roundIdRaw = String((req.query as any).round_id || '');

  let roundId: any = roundIdRaw;
  try {
    roundId = new Types.ObjectId(roundIdRaw);
  } catch {
    roundId = roundIdRaw;
  }

  const round = await Round.findOne({ _id: roundId });
  if (!round) return res.json({ error: 'round not found' });

  let drawn = await Drawning.findOne({ round_id: roundIdRaw });
  if (!drawn) {
    const doc: any = { round_id: roundIdRaw, created_at: moment().toDate() };
    doc.drawn_number = loadDrawning();
    drawn = await Drawning.create(doc);
  }

  const tickets = await Ticket.find({ round_id: roundIdRaw }).lean();
  const winnings = tickets.filter((ticket: any) => {
    const match = _.intersection(drawn!.drawn_number, ticket.played_number);
    return match.length >= 5;
  });

  const final = {
    current_timestamp: moment().toDate(),
    drawn,
    winnings,
  };
  try {
    const io: SocketIOServer | undefined = (req.app as any).get('io');
    io?.to(`lobby:${roundIdRaw}`).emit('draw:completed', final);
  } catch {}
  res.json(final);
});

export default router;
