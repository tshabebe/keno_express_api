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
import lobbiesRouter from './routes/lobbies';
import matchmakingRouter from './routes/matchmaking';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { connectDb } from './lib/db';
import Session from './models/session';
import Round from './models/round';
import Drawning from './models/drawning';
import moment from 'moment';
import { load as loadDrawning } from './lib/drawning_gateway';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*'} });
app.locals.io = io;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/', roundsRouter);
app.use('/', ticketsRouter);
app.use('/', drawningsRouter);
app.use('/', usersRouter);
app.use('/', lobbiesRouter);
app.use('/', matchmakingRouter);

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
});

// Global session scheduler
const SELECT_PHASE_SEC = parseInt(process.env.SELECT_PHASE_SEC || '30', 10);
const DRAW_PHASE_SEC = parseInt(process.env.DRAW_PHASE_SEC || '30', 10);

async function ensureSession() {
  let s = await Session.findOne();
  if (!s) {
    s = await Session.create({ status: 'idle' });
  }
  return s;
}

async function createNewRound(): Promise<string> {
  const starts = moment();
  const ends = starts.clone().add(1, 'day');
  const round = await Round.create({ starts_at: starts.toDate(), ends_at: ends.toDate(), created_at: moment().toDate() });
  return String(round._id);
}

async function runDraw(roundIdRaw: string) {
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
  const payload = { current_timestamp: moment().toDate(), drawn, winnings: [] as any[] };
  io.to('lobby:global').emit('draw:completed', payload);
}

setInterval(async () => {
  try {
    const s = await ensureSession();
    const now = moment();

    // count sockets in global room
    const room = io.sockets.adapter.rooms.get('lobby:global');
    const audience = room ? room.size : 0;

    if (s.status === 'idle') {
      if (audience > 0) {
        const roundId = await createNewRound();
        s.status = 'select';
        s.current_round_id = roundId;
        s.phase_ends_at = now.clone().add(SELECT_PHASE_SEC, 'seconds').toDate();
        s.updated_at = new Date();
        await s.save();
        io.to('lobby:global').emit('phase:update', { status: s.status, phaseEndsAt: s.phase_ends_at, roundId });
      }
      return;
    }

    if (s.phase_ends_at && now.isSameOrAfter(moment(s.phase_ends_at))) {
      if (s.status === 'select') {
        // move to draw
        s.status = 'draw';
        s.phase_ends_at = now.clone().add(DRAW_PHASE_SEC, 'seconds').toDate();
        s.updated_at = new Date();
        await s.save();
        io.to('lobby:global').emit('phase:update', { status: s.status, phaseEndsAt: s.phase_ends_at, roundId: s.current_round_id });
        await runDraw(s.current_round_id || '');
      } else if (s.status === 'draw') {
        // start next select phase
        const roundId = await createNewRound();
        s.status = 'select';
        s.current_round_id = roundId;
        s.phase_ends_at = now.clone().add(SELECT_PHASE_SEC, 'seconds').toDate();
        s.updated_at = new Date();
        await s.save();
        io.to('lobby:global').emit('phase:update', { status: s.status, phaseEndsAt: s.phase_ends_at, roundId });
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('scheduler error', err);
  }
}, 1000);

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
(async () => {
  try {
    await connectDb();
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
