import { Router } from 'express';
import _ from 'lodash';
import moment from 'moment';
import { Types } from 'mongoose';
import { load as loadDrawning } from '../lib/drawning_gateway';
import type { Server as SocketIOServer } from 'socket.io';
import Round from '../models/round';
import Drawning from '../models/drawning';
import Ticket from '../models/ticket';
import User from '../models/user';

const router = Router();

router.post('/drawnings', async (req, res) => {
  const roundIdRaw = String((req.query as Record<string, unknown>).round_id || '');

  let roundId: Types.ObjectId | string = roundIdRaw;
  try {
    roundId = new Types.ObjectId(roundIdRaw);
  } catch {
    roundId = roundIdRaw;
  }

  const round = await Round.findOne({ _id: roundId });
  if (!round) return res.json({ error: 'round not found' });

  let drawn = await Drawning.findOne({ round_id: roundIdRaw }).lean<{ round_id: string; drawn_number: number[]; created_at: Date }>();
  if (!drawn) {
    const doc: { round_id: string; drawn_number: number[]; created_at: Date } = {
      round_id: roundIdRaw,
      drawn_number: loadDrawning(),
      created_at: moment().toDate()
    };
    const created = await Drawning.create(doc);
    drawn = created.toObject();
  }

  const tickets: Array<{ played_number: number[] }> = await Ticket.find({ round_id: roundIdRaw })
    .select('played_number')
    .lean();
  const winnings = tickets.filter((ticket: { played_number: number[] }) => {
    const match = _.intersection(drawn!.drawn_number, ticket.played_number);
    return match.length >= 5;
  });

  // credit winners based on simple payout: bet_amount * matches
  const creditOps = await Promise.all(
    winnings.map(async (t: any) => {
      const hits = _.intersection(drawn!.drawn_number, t.played_number).length;
      const payout = (t.bet_amount || 0) * hits;
      if (payout > 0 && t.user_id) {
        await User.updateOne({ _id: t.user_id }, { $inc: { wallet_balance: payout } });
      }
      return null;
    })
  );
  void creditOps;

  const final = {
    current_timestamp: moment().toDate(),
    drawn,
    winnings,
  };
  try {
    const io = req.app.locals.io as SocketIOServer | undefined;
    io?.to(`lobby:${roundIdRaw}`).emit('draw:completed', final);
  } catch {}
  res.json(final);
});

export default router;
