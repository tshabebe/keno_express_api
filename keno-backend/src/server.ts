import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import createError from 'http-errors';
import roundsRouter from './routes/rounds';
import ticketsRouter from './routes/tickets';
import drawningsRouter from './routes/drawnings';
import usersRouter from './routes/users';
import adminRouter from './routes/admin';
import matchmakingRouter from './routes/matchmaking';
import paymentsRouter from './routes/payments';
import sessionRouter from './routes/session';
import http from 'http';
import crypto from 'crypto';
import { Server as SocketIOServer } from 'socket.io';
import { connectDb } from './lib/db';
import Session from './models/session';
import Round from './models/round';
import Drawning from './models/drawning';
import { } from 'date-fns';
import { addSeconds, now, isSameOrAfter } from './lib/date';
import { load as loadDrawning } from './lib/drawning_gateway';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*'} });
app.locals.io = io;

// Allow all origins while preserving credentials by reflecting the request origin
app.use(cors({
  origin: (_origin, callback) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(morgan('dev'));
// Raw body for webhook signature verification
app.use('/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Disable caching for API responses to avoid 304 interfering with client logic
app.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.use('/', roundsRouter);
app.use('/', ticketsRouter);
app.use('/', drawningsRouter);
app.use('/', usersRouter);
app.use('/', matchmakingRouter);
app.use('/', paymentsRouter);
app.use('/', sessionRouter);
app.use('/', adminRouter);

app.get('/', (_req, res) => {
  res.json({ name: 'Keno API', status: 'ok' });
});

app.use((_req, _res, next) => {
  next(createError(404));
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = typeof err === 'object' && err !== null && 'status' in err && typeof (err as { status?: unknown }).status === 'number'
    ? (err as { status?: number }).status!
    : 500;
  const message = typeof err === 'object' && err !== null && 'message' in err
    ? String((err as { message?: unknown }).message ?? 'Error')
    : 'Internal Server Error';
  res.status(status);
  res.json({ message });
});

io.on('connection', (socket) => {
  // basic join to a lobby room
  socket.on('lobby:join', (lobbyId: string) => {
    socket.join(`lobby:${lobbyId}`);
  });
  // join global keno room by default
  socket.join('lobby:global');
  // user-specific room for payment status and personal events
  socket.on('user:join', (userId: string) => {
    if (typeof userId === 'string' && userId) {
      socket.join(`lobby:user:${userId}`);
    }
  });
});

// Global session scheduler
const SELECT_PHASE_SEC = parseInt(process.env.SELECT_PHASE_SEC || '60', 10);
const DRAW_INTERVAL_MS = parseInt(process.env.DRAW_INTERVAL_MS || '600', 10);
const NUMBERS_PER_DRAW = 20;

async function ensureSession() {
  let s = await Session.findOne();
  if (!s) {
    s = await Session.create({ status: 'idle' });
  }
  return s;
}

async function createNewRound(): Promise<string> {
  const starts = now();
  const ends = new Date(starts.getTime() + 24 * 60 * 60 * 1000);
  const round = await Round.create({ starts_at: starts, ends_at: ends, created_at: now() });
  return String(round._id);
}

async function runDraw(roundIdRaw: string) {
  let drawn = await Drawning.findOne({ round_id: roundIdRaw }).lean<{ round_id: string; drawn_number: number[]; created_at: Date }>();
  if (!drawn) {
    const doc: { round_id: string; drawn_number: number[]; created_at: Date } = {
      round_id: roundIdRaw,
      drawn_number: loadDrawning(),
      created_at: now()
    };
    const created = await Drawning.create(doc);
    drawn = created.toObject();
  }
  const secret = process.env.DRAW_EVENT_SECRET || 'change_me_in_prod';
  const nonce = crypto.randomBytes(16).toString('hex');
  const sign = (msg: string) => crypto.createHmac('sha256', secret).update(msg).digest('hex');

  // Announce draw start
  {
    const ts = Date.now();
    const sig = sign(`${roundIdRaw}.${ts}.${nonce}`);
    io.to(`lobby:${roundIdRaw}`).emit('draw:start', { roundId: roundIdRaw, ts, nonce, sig });
  }

  // Stream numbers one by one
  const intervalMs = DRAW_INTERVAL_MS;
  drawn.drawn_number.forEach((num, idx) => {
    setTimeout(() => {
      const ts = Date.now();
      const seq = idx;
      const sig = sign(`${roundIdRaw}.${seq}.${num}.${ts}.${nonce}`);
      io.to(`lobby:${roundIdRaw}`).emit('draw:number', { roundId: roundIdRaw, seq, number: num, ts, nonce, sig });
      // After last number, emit completed summary for late joiners
      if (idx === drawn!.drawn_number.length - 1) {
        const payload = { current_timestamp: now(), drawn, winnings: [] as any[], ts, nonce, sig: sign(`${roundIdRaw}.completed.${ts}.${nonce}`) };
        io.to(`lobby:${roundIdRaw}`).emit('draw:completed', payload);
      }
    }, idx * intervalMs);
  });
}

setInterval(async () => {
  try {
    const s = await ensureSession();
    const tnow = now();

    // count sockets in global room
    const room = io.sockets.adapter.rooms.get('lobby:global');
    const audience = room ? room.size : 0;

    if (s.status === 'idle') {
      if (audience > 0) {
        const roundId = await createNewRound();
        s.status = 'select';
        s.current_round_id = roundId;
        s.phase_ends_at = addSeconds(tnow, SELECT_PHASE_SEC);
        s.board_cleared_at = undefined;
        s.updated_at = new Date();
        await s.save();
        io.to('lobby:global').emit('phase:update', { status: s.status, phaseEndsAt: s.phase_ends_at, roundId });
      }
      return;
    }

    if (s.phase_ends_at && isSameOrAfter(tnow, new Date(s.phase_ends_at))) {
      if (s.status === 'select') {
        // move to draw exactly when countdown hits 0
        s.status = 'draw';
        // record board cleared time for clients to know when to reset their UI
        s.board_cleared_at = now();
        // draw takes NUMBERS_PER_DRAW * intervalMs; no select countdown during draw
        const drawMs = NUMBERS_PER_DRAW * DRAW_INTERVAL_MS;
        s.phase_ends_at = new Date(tnow.getTime() + drawMs);
        s.updated_at = new Date();
        await s.save();
        io.to('lobby:global').emit('phase:update', { status: s.status, phaseEndsAt: s.phase_ends_at, roundId: s.current_round_id, boardClearedAt: s.board_cleared_at });
        await runDraw(s.current_round_id || '');
      } else if (s.status === 'draw') {
        // start next select phase
        const roundId = await createNewRound();
        s.status = 'select';
        s.current_round_id = roundId;
        s.phase_ends_at = addSeconds(tnow, SELECT_PHASE_SEC);
        s.board_cleared_at = undefined;
        s.updated_at = new Date();
        await s.save();
        io.to('lobby:global').emit('phase:update', { status: s.status, phaseEndsAt: s.phase_ends_at, roundId });
      }
    }

    // Emit periodic phase tick so clients can render server time consistently
    try {
      io.to('lobby:global').emit('phase:tick', {
        status: s.status,
        phaseEndsAt: s.phase_ends_at,
        roundId: s.current_round_id,
        now: tnow,
      });
      if (s.current_round_id) {
        io.to(`lobby:${s.current_round_id}`).emit('phase:tick', {
          status: s.status,
          phaseEndsAt: s.phase_ends_at,
          roundId: s.current_round_id,
          now: tnow,
        });
      }
    } catch {}
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('scheduler error', err);
  }
}, 1000);

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
(async () => {
  try {
    await connectDb();
    // Ensure indexes (handles sparse unique indexes updates)
    await Promise.all([
      import('./models/user').then(m => m.default.syncIndexes?.() || m.default.ensureIndexes?.()),
    ]);
    server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`listening on ${port}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
})();

export default app;
