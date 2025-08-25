import { Router } from 'express';
import { getDb } from '../lib/db';
import { authRequired } from '../middleware/auth';
import { ObjectId } from 'mongodb';

const router = Router();

router.get('/lobbies', async (_req, res) => {
  const db = await getDb();
  const items = await db.collection('lobbies').find().toArray();
  res.json(items);
});

router.post('/lobbies', authRequired, async (req, res) => {
  const { name, maxPlayers } = req.body || {};
  const db = await getDb();
  const lobby = { name: name || 'Lobby', max_players: maxPlayers || 10, players: [], created_at: new Date(), owner_id: (req as any).user.userId };
  const result = await db.collection('lobbies').insertOne(lobby);
  res.json({ id: result.insertedId, ...lobby });
});

router.post('/lobbies/:id/join', authRequired, async (req, res) => {
  const db = await getDb();
  const id = req.params.id;
  const _id = ObjectId.isValid(id) ? new ObjectId(id) : id as any;
  const lobby = await db.collection('lobbies').findOne({ _id });
  if (!lobby) return res.status(404).json({ error: 'not found' });
  const userId = (req as any).user.userId;
  const players: string[] = (lobby as any).players || [];
  if (players.includes(userId)) return res.json({ ok: true });
  if ((players.length || 0) >= ((lobby as any).max_players || 10)) return res.status(400).json({ error: 'lobby full' });
  await db.collection('lobbies').updateOne({ _id: (lobby as any)._id }, { $addToSet: { players: userId } });
  res.json({ ok: true });
});

router.post('/lobbies/:id/leave', authRequired, async (req, res) => {
  const db = await getDb();
  const id = req.params.id;
  const _id = ObjectId.isValid(id) ? new ObjectId(id) : id as any;
  const userId = (req as any).user.userId;
  await db.collection('lobbies').updateOne({ _id }, { $pull: { players: userId } });
  res.json({ ok: true });
});

export default router;
