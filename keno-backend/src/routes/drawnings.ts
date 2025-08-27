import { Router } from 'express';
import _ from 'lodash';
import moment from 'moment';
import { Types } from 'mongoose';
import { load as loadDrawning } from '../lib/drawning_gateway';
import type { Server as SocketIOServer } from 'socket.io';
import Round from '../models/round';
import Drawning from '../models/drawning';
import Ticket from '../models/ticket';
import { verifyWalletToken } from '../middleware/wallet';
import Session from '../models/session';

const router = Router();

router.post('/drawnings', verifyWalletToken, async (req, res) => {
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
      created_at: moment().toDate()
    };
    const created = await Drawning.create(doc);
    drawn = created.toObject();
  }

  const tickets: Array<{ played_number: number[]; bet_amount?: number; user_id?: string | null; user_token?: string | null; username?: string | null }> = await Ticket.find({ round_id: roundIdRaw })
    .select('played_number bet_amount user_id user_token username')
    .lean();
  const winnings = tickets.filter((ticket: { played_number: number[] }) => {
    const match = _.intersection(drawn!.drawn_number, ticket.played_number);
    return match.length >= 5;
  });

  // credit winners via wallet service
  const WALLET_URL = process.env.WALLET_URL || process.env.walletUrl || '';
  const SHARED_SECRET_BINGO = process.env.SHARED_SECRET_BINGO || process.env.PASS_KEY || '';
  if (WALLET_URL) {
    await Promise.all(
      winnings.map(async (t: any) => {
        const hits = _.intersection(drawn!.drawn_number, t.played_number).length;
        const payout = (t.bet_amount || 0) * hits;
        if (payout > 0 && t.user_id && t.user_token) {
          const creditBody = {
            user_id: t.user_id,
            username: t.username || 'player',
            transaction_type: 'credit',
            transaction_id: `WIN-${Date.now()}`,
            amount: payout,
            game: 'Keno',
            round_id: roundIdRaw,
            status: 'pending',
          };
          try {
            const resp = await fetch(`${WALLET_URL}/api/wallet/credit`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${t.user_token}`,
                'Pass-Key': SHARED_SECRET_BINGO,
              },
              body: JSON.stringify(creditBody),
            });
            if (!resp.ok) {
              // eslint-disable-next-line no-console
              console.error('wallet credit failed', await resp.text());
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('wallet credit error', e);
          }
        }
      })
    );
  }

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
