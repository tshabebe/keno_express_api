import { Router } from 'express';
import _ from 'lodash';
import { } from 'date-fns';
import { Types } from 'mongoose';
import { load as loadDrawning } from '../lib/drawning_gateway';
import type { Server as SocketIOServer } from 'socket.io';
import Round from '../models/round';
import Drawning from '../models/drawning';
import Ticket from '../models/ticket';
import { authRequired } from '../middleware/auth';
import User from '../models/user';
import Session from '../models/session';

const router = Router();

router.post('/drawnings', authRequired, async (req, res) => {
  const roundIdRaw = String((req.query as Record<string, unknown>).round_id || '');

  let roundId: Types.ObjectId | string = roundIdRaw;
  try {
    roundId = new Types.ObjectId(roundIdRaw);
  } catch {
    roundId = roundIdRaw;
  }

  const round = await Round.findOne({ _id: roundId });
  if (!round) return res.json({ error: 'round not found' });

  // Require draw phase for manual draw trigger
  const s = await Session.findOne().lean<{ status?: string; current_round_id?: string }>();
  if (!s || s.status !== 'draw' || !s.current_round_id || s.current_round_id !== roundIdRaw) {
    return res.status(400).json({ error: 'not in draw phase' });
  }

  let drawn = await Drawning.findOne({ round_id: roundIdRaw }).lean<{ round_id: string; drawn_number: number[]; created_at: Date }>();
  if (!drawn) {
    const doc: { round_id: string; drawn_number: number[]; created_at: Date } = {
      round_id: roundIdRaw,
      drawn_number: loadDrawning(),
      created_at: new Date()
    };
    const created = await Drawning.create(doc);
    drawn = created.toObject();
  }

  const tickets: Array<{ played_number: number[]; bet_amount?: number; user_id?: string | null; username?: string | null }> = await Ticket.find({ round_id: roundIdRaw })
    .select('played_number bet_amount user_id username')
    .lean();
  const winnings = tickets.filter((ticket: { played_number: number[] }) => {
    const match = _.intersection(drawn!.drawn_number, ticket.played_number);
    return match.length >= 5;
  });

  // Credit winners locally by updating user wallet balances
  await Promise.all(
    winnings.map(async (t: any) => {
      const hits = _.intersection(drawn!.drawn_number, t.played_number).length;
      const payout = (t.bet_amount || 0) * hits;
      if (payout > 0 && t.user_id) {
        try {
          const userDoc = await User.findById(t.user_id);
          if (userDoc) {
            userDoc.wallet_balance = Number(userDoc.wallet_balance || 0) + payout;
            await userDoc.save();
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('local credit error', e);
        }
      }
    })
  );

  const final = {
    current_timestamp: new Date(),
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
