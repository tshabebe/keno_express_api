import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import createError from 'http-errors';
import roundsRouter from './routes/rounds';
import ticketsRouter from './routes/tickets';
import drawningsRouter from './routes/drawnings';

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/', roundsRouter);
app.use('/', ticketsRouter);
app.use('/', drawningsRouter);

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

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`listening on ${port}`);
});

export default app;
