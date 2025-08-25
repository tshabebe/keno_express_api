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

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*'} });
app.set('io', io);

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

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(err.status || 500);
  res.json({ message: err.message });
});

io.on('connection', (socket) => {
  // basic join to a lobby room
  socket.on('lobby:join', (lobbyId: string) => {
    socket.join(`lobby:${lobbyId}`);
  });
});

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
