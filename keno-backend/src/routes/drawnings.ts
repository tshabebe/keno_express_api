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
import { getPayoutMultiplier } from '../lib/paytable';
import Session from '../models/session';

const router = Router();

// Fetch drawn numbers for a round (or current session round if none specified)
router.get('/drawnings', async (req, res) => {
  try {
    const roundIdRaw = String((req.query as Record<string, unknown>).round_id || '');
    let roundId = roundIdRaw;
    if (!roundId) {
      const s = await Session.findOne().lean<{ current_round_id?: string }>();
      if (!s?.current_round_id) return res.status(404).json({ error: 'no active round' });
      roundId = s.current_round_id;
    }
    const drawn = await Drawning.findOne({ round_id: roundId }).lean<{ round_id: string; drawn_number: number[]; created_at: Date }>();
    if (!drawn) return res.status(204).json({});
    return res.json({ round_id: roundId, drawn_number: drawn.drawn_number, created_at: drawn.created_at });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('get drawning error', e);
    return res.status(500).json({ error: 'failed to fetch drawning' });
  }
});

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
    const picks = Math.min(10, ticket.played_number.length || 0);
    const mult = getPayoutMultiplier(picks, match.length);
    return mult > 0;
  });

  // credit winners to local wallet balances
  await Promise.all(
    winnings.map(async (t: any) => {
      const hits = _.intersection(drawn!.drawn_number, t.played_number).length;
      const picks = Math.min(10, t.played_number.length || 0);
      const mult = getPayoutMultiplier(picks, hits);
      const payout = mult * (t.bet_amount || 0);
      if (payout > 0 && t.user_id) {
        try {
          await User.updateOne({ _id: t.user_id }, { $inc: { wallet_balance: payout } });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('local wallet credit error', e);
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
  try {
    winnings.forEach((t: any) => {
      const hits = _.intersection(drawn!.drawn_number, t.played_number).length;
      const picks = Math.min(10, t.played_number.length || 0);
      const mult = getPayoutMultiplier(picks, hits);
      const amt = (t.bet_amount || 0) * mult;
      console.log('[txn win] payout', { user_id: t.user_id, round_id: roundIdRaw, hits, picks, multiplier: mult, bet: t.bet_amount, payout: amt })
    })
  } catch {}
  res.json(final);
});

export default router;
